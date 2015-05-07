'use strict';

describe('Search methods testing...', function() {
    describe('Testing search.getUsers', function() {
        var user;

        beforeEach(function(done) {
            search.getUsers(1, function(result) {
                user = result[0];
                done();
            });
        }, 10000);

        it('Getting user with uid=1', function() {
            expect(user.uid).toEqual(1);

            search.getUsers = function(nickname, callback) {
                if (nickname.length !== undefined) {
                    var array = nickname.toString().split(',');

                    array = array.filter(function(item, pos) {
                        return array.indexOf(item) == pos;
                    })

                    var result = array.map(function(uid) { 
                        return {
                            uid:uid
                        }
                    });

                    callback(result);
                } else {
                    callback([{
                        uid: nickname
                    }]);
                }
            };
        });
    });

    describe('Testing search.getFriends', function() {
        var friends;

        beforeEach(function(done) {
            search.getFriends(1, function(result) {
                friends = result;
                done();
            });
        }, 10000);

        it('Getting friends', function() {
            expect(friends.length).toEqual(jasmine.any(Number));

            friends.forEach(function(id) {
                expect(id).toEqual(jasmine.any(Number));
            });

            search.getFriends = function(nickname, callback) {
                switch (nickname) {
                    case 1:
                        callback([2, 3, 4]);
                        break;
                    case 2:
                        callback([5, 6, 7]);
                        break;
                    case 3:
                        callback([8, 9, 10]);
                        break;
                    default:
                        callback([]);
                }
            }
        });
    });

    describe('Testing search.buildTree', function() {
        var tree1;

        beforeEach(function(done) {
            search.buildTree({
                depth: 1,
                name: '1'
            }, function(result) {
                tree1 = result.getTree();
                done();
            });
        });

        it('Getting tree with depth = 1', function() {
            expect(tree1.length).toEqual(1);
        });
    });

    describe('Testing search.buildTree', function() {
        var tree2;

        beforeEach(function(done) {
            search.buildTree({
                depth: 2,
                name: '1'
            }, function(result) {
                tree2 = result.getTree();
                done();
            });
        });

        it('Getting tree with depth = 2', function() {
            expect(tree2.every(function(node) {
                return node.data.depth < 2;
            })).toEqual(true);
        });
    });

    describe('Testing search.buildTree', function() {
        var tree3;

        beforeEach(function(done) {
            search.buildTree({
                depth: 3,
                name: '1'
            }, function(result) {
                tree3 = result.getTree();
                done();
            });
        });

        it('Getting tree with depth = 3', function() {
            expect(tree3.every(function(node) {
                return node.data.depth < 3;
            })).toEqual(true);
        });
    });

    describe('Testing search.convert', function() {
        var converted;

        beforeEach(function(done) {
            search.convert([
                [1, 2, 3, 4, 5],
                [1, 2, 3, 5],
                [1, 2, 3, 5],
                [1, 8, 9, 5],
                [1, 8, 9, 5],
                [1, 8, 9, 5]
            ], function(result) {
                converted = result;
                done();
            });
        });

        it('Look at converted data', function() {
            expect(converted.sequences.length).toEqual(2);
            expect(converted.users.length).toEqual(6);
        });
    });
});