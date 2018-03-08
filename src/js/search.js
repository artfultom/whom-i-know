'use strict';

var search = function() {
    var usersGetUrl = 'https://api.vk.com/method/users.get?v=fuckvk&uids={0}&fields=sex,bdate,photo_100,education&callback=?';
    var friendsGetUrl = 'https://api.vk.com/method/friends.get?v=fuckvk&user_id={0}&callback=?';

    var newTree = function() {
        return new(function() {
            var indexes = [];
            var nodes = [];

            this.add = function(node) {
                indexes.push(node.name);
                nodes.push(node);

                return this;
            };

            this.search = function(name) {
                var index = indexes.indexOf(name);
                var node = nodes[index];

                if (node && node.name !== name) {
                    console.error('search.newTree.search - Нарушение целостности структуры данных (incorrect index)');
                    return undefined;
                }

                return node;
            };

            this.getTree = function() {
                return nodes;
            };
            this.toString = function() {
                return JSON.stringify(nodes);
            };
            this.getCount = function() {
                return nodes.length;
            };
        });
    };

    return {
        getUsers: function(nicknames, success, error) {
            if (nicknames === '') {
                error();
            } else {
                nicknames = nicknames.toString().split(',').map(function(id) {
                    return id >> 0 || id;
                });

                nicknames = nicknames.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });

                var pieces = nicknames.cutIntoPieces(20);
                var count = pieces.length;
                var users = [];

                pieces.forEach(function(piece) {
                    $.getJSON(usersGetUrl.format(piece), function(result) {
                        if (result.error) {
                            success(false);
                        } else {
                            count -= 1;

                            users = users.concat(result.response);

                            if (count === 0) {
                                success(users);
                            }
                        }
                    });
                });
            }
        },
        getFriends: function(nickname, success, error) {
            $.getJSON(friendsGetUrl.format(nickname), function(result) {
                success(result.response);
            }).fail(function(e) {
                error();

                console.log(e);
            });
        },
        buildTree: function(options, callback) {
            search = this;

            var depth = options.depth;
            var name = options.name;

            if (name === undefined || name === '') {
                console.error('search.buildTree - Пустое имя (options.name)');
                callback();
                return;
            }

            if (depth === undefined || depth <= 0) {
                console.error('search.buildTree - Не задана глубина обхода (options.depth)');
                callback();
                return;
            }

            search.getUsers(name, function(user) {
                var count = 1;
                var rootId = user[0].uid;

                var tree = newTree();
                tree.add({
                    name: rootId,
                    data: {
                        depth: 1
                    }
                });

                if (depth === 1) {
                    callback(tree);
                    return;
                }

                (function getLevel(parents, depthCount) {
                    var thisMoment = arguments;

                    search.getFriends(parents[parents.length - 1], function(result) {
                        if (result) {
                            if (depthCount > 1) {
                                count += result.length;
                            }

                            result.forEach(function(friendId) {
                                tree.add({
                                    name: friendId,
                                    data: {
                                        parents: parents,
                                        depth: (depth - depthCount)
                                    }
                                });

                                if (depthCount > 1) {
                                    getLevel(parents.concat(friendId), depthCount - 1);
                                }
                            });
                        }

                        thisMoment = undefined;
                        count -= 1;

                        if (count === 0) {
                            callback(tree);
                        }
                    }, function() {
                        getLevel.call(undefined, thisMoment);
                        thisMoment = undefined;
                    });
                })([rootId], depth - 1);
            });
        },
        findCommonUsers: function(tree, options, callback) {
            search = this;

            var depth = options.depth;
            var name = options.name;

            if (name === undefined || name === '') {
                console.error('search.findCommonUsers - Пустое имя (options.name)');
                callback();
                return;
            }

            if (depth === undefined || depth <= 0) {
                console.error('search.findCommonUsers - Не задана глубина обхода (options.depth)');
                callback();
                return;
            }

            var resultArray = [];

            search.getUsers(name, function(user) {
                var count = 1;
                var rootId = user[0].uid;

                (function lookLevel(parents, depthCount) {
                    var thisMoment = arguments;

                    search.getFriends(parents[parents.length - 1], function(result) {
                        if (result) {
                            if (depthCount > 2) {
                                count += result.length;
                            };

                            result.forEach(function(friendId) {
                                var commonUser = tree.search(friendId);

                                if (commonUser) {
                                    var range = (commonUser.data.parents || []).concat(commonUser.name).concat(parents.slice().reverse());

                                    resultArray.push(range);
                                }

                                if (depthCount > 2) {
                                    lookLevel(parents.concat(friendId), depthCount - 1);
                                }
                            });
                        }

                        count -= 1;
                        thisMoment = undefined;

                        if (count === 0) {
                            callback(resultArray);
                        }
                    }, function(error) {
                        lookLevel.call(undefined, thisMoment);
                        thisMoment = undefined;
                    });
                })([rootId], depth);
            });
        },
        convert: function(sequences, options, callback) {
            if (sequences === undefined || sequences.length === 0) {
                callback();
                return;
            }

            var minLength = options.minLength;

            sequences = sequences.filter(function(item, index) {
                return (item.length >= minLength);
            });

            sequences = sequences.filter(function(item, index, self) {
                return self.filter(function(item1, index1) {
                    return index > index1 && item.every(function(id, idIndex) {
                        return item[idIndex] === item1[idIndex];
                    });
                }).length === 0;
            });

            sequences = sequences.sort(function(a, b) {
                return a.length - b.length;
            });

            search.getUsers(sequences, function(users) {
                callback({
                    sequences: sequences,
                    users: users
                });
            });
        }
    }
}();