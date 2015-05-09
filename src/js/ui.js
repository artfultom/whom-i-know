'use strict';

var ui = function() {
    return {
        showProgress: function() {
            var bar = $('div.search-result-bar');
            if (bar.length === 0) {
                return false;
            }

            bar.addClass('progress-mode');

            return true;
        },
        enableModes: function() {
            var bar = $('div.search-result-bar');
            if (bar.length === 0) {
                return false;
            }

            bar.removeClass('progress-mode');

            var buttons = $('div.search-result-bar label.btn');
            if (buttons.length === 0) {
                return false;
            }

            buttons.removeClass('disabled');

            return true;
        },
        searchOn: function() {
            var button = $('button#modal');
            if (button.length === 0) {
                return false;
            }

            button.removeAttr('disabled');

            return true;
        },
        searchOff: function() {
            var button = $('button#modal');
            if (button.length === 0) {
                return false;
            }

            button.attr('disabled','disabled');

            return true;
        },
        clean: function($input) {
            var container = $input.closest('div.has-feedback');
            if (container.length === 0) {
                return false;
            }

            container.removeClass('has-success');
            container.removeClass('has-error');

            var icon = container.find('span.glyphicon');
            if (icon.length === 0) {
                return false;
            }

            icon.removeClass('glyphicon-ok');
            icon.removeClass('glyphicon-remove');
            icon.removeClass('glyphicon-refresh');

            return true;
        },
        correct: function($input) {
            var container = $input.closest('div.has-feedback');
            if (container.length === 0) {
                return false;
            }

            container.addClass('has-success');
            container.removeClass('has-error');

            var icon = container.find('span.glyphicon');
            if (icon.length === 0) {
                return false;
            }

            icon.addClass('glyphicon-ok');
            icon.removeClass('glyphicon-remove');
            icon.removeClass('glyphicon-refresh');

            return true;
        },
        incorrect: function($input) {
            var container = $input.closest('div.has-feedback');
            if (container.length === 0) {
                return false;
            }

            container.addClass('has-error');
            container.removeClass('has-success');

            var icon = container.find('span.glyphicon');
            if (icon.length === 0) {
                return false;
            }

            icon.addClass('glyphicon-remove');
            icon.removeClass('glyphicon-ok');
            icon.removeClass('glyphicon-refresh');

            return true;
        },
        lookForUser: function($input) {
            var container = $input.closest('div.has-feedback');
            if (container.length === 0) {
                return false;
            }

            container.removeClass('has-success');
            container.removeClass('has-error');

            var icon = container.find('span.glyphicon');
            if (icon.length === 0) {
                return false;
            }

            icon.addClass('glyphicon-refresh');
            icon.removeClass('glyphicon-ok');
            icon.removeClass('glyphicon-remove');

            return true;
        },
        panel: {
            changePanel: function(panelName) {
                var panel = $('div.result-panels div.result-panel#' + panelName);
                if (panel.length === 0) {
                    return false;
                }

                $('div.result-panels div.result-panel').removeClass('active');
                panel.addClass('active');

                return true;
            },
            count: function(data) {
                // TODO undefined - больше глубины
                var count = data.sequences[0] ? data.sequences[0].length : undefined

                var span = $('div.result-panels div.result-panel span.count-icon');
                if (span.length === 0) {
                    return false;
                }

                span.show();
                span.text(count);

                return true;
            },
            write: function(data) {
                var group = $('div.result-panels div.result-panel ul.list-group');
                if (group.length === 0) {
                    return false;
                }

                group.find('li.list-group-item').remove();

                data.sequences.forEach(function(row) {
                    row = row.map(function(id) {
                        return data.users.filter(function(item) {
                            return item.uid === id
                        })[0];
                    });

                    var li = $('<li class="list-group-item">');

                    row.forEach(function(user) {
                        li.append('<a target="_blank" href="http://vk.com/id' + user.uid + '">' + [user.first_name, user.last_name].join(' ') + '</a>')
                    });

                    group.append(li);
                });

                return true;
            },
            draw: function(data) {
                $('div.result-panels div.result-panel#draw svg').remove();

                var pairs = [];

                data.sequences.forEach(function(item) {
                    item.reduce(function(a, b) {
                        pairs.push([a, b]);

                        return b;
                    });
                });

                pairs = pairs.filter(function(item, index) {
                    return pairs.filter(function(item1, index1) {
                        return index > index1 && (item[0] === item1[0] && item[1] === item1[1]);
                    }).length === 0;
                });

                var links = pairs.map(function(pair) {
                    return {
                        source: pair[0],
                        target: pair[1]
                    }
                });

                var nodes = {};

                links.forEach(function(link) {
                    var sourceUser = data.users.filter(function(item) {
                        return item.uid === link.source
                    })[0];

                    link.source = nodes[link.source] || (nodes[link.source] = {
                        name: link.source,
                        label: [sourceUser.first_name, sourceUser.last_name].join(' ')
                    });

                    var targetUser = data.users.filter(function(item) {
                        return item.uid === link.target
                    })[0];

                    link.target = nodes[link.target] || (nodes[link.target] = {
                        name: link.target,
                        label: [targetUser.first_name, targetUser.last_name].join(' ')
                    });
                });

                var width = 600, height = 400;

                var force = d3.layout.force()
                    .nodes(d3.values(nodes))
                    .links(links)
                    .size([width, height])
                    .linkDistance(150)
                    .charge(-100)
                    .on('tick', function() {
                        path.attr('d', function(d) {
                            return 'M' + d.source.x + ',' + d.source.y + ' ' + d.target.x + ',' + d.target.y;
                        });

                        circle.attr('transform', function(d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        });

                        text.attr('transform', function(d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        });
                    }).start();

                var svg = d3.select('div.result-panels div.result-panel#draw').append('svg')
                    .attr('width', width)
                    .attr('height', height);

                svg.append('defs').selectAll('marker')
                    .data(['suit', 'licensing', 'resolved'])
                    .enter().append('marker')
                    .attr('id', function(d) {
                        return d;
                    })
                    .attr('viewBox', '0 -5 10 10')
                    .attr('refX', 15)
                    .attr('refY', -1.5)
                    .attr('markerWidth', 8)
                    .attr('markerHeight', 8)
                    .attr('orient', 'auto')
                    .append('path')
                    .attr('d', 'M0,-5L10,0L0,5');

                var path = svg.append('g').selectAll('path')
                    .data(force.links())
                    .enter().append('path')
                    .attr('class', function(d) {
                        return 'link';
                    });

                var circle = svg.append('g').selectAll('circle')
                    .data(force.nodes())
                    .enter().append('circle')
                    .attr('r', 8)
                   .call(force.drag);

                var text = svg.append('g').selectAll('text')
                    .data(force.nodes())
                    .enter().append('text')
                    .attr('x', 12)
                    .attr('y', 3)
                    .text(function(d) {
                        return d.label;
                    });
            }
        }
    }
}();