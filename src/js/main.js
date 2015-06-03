'use strict';

$(document).ready(function() {
    var users = [];

    var $firstInput = $('input#first');
    $firstInput.bind('keyup', function(value) {
        ui.lookForUser($firstInput);

        search.getUsers(value.target.value, function(user) {
            switch(user) {
                case false: 
                    ui.incorrect($firstInput);

                    users[0] = undefined;
                    break;
                default:
                    ui.correct($firstInput, [user[0].first_name, user[0].last_name].join(' '));

                    users[0] = value.target.value;
            }
            
            if ((users[0] && users[1]) && (users[0] !== users[1])) {
                ui.searchOn();
            } else {
                ui.searchOff();
            }
        }, function() {
            ui.searchOff();
            ui.clean($firstInput);

            users[0] = undefined;
        });
    });

    var $secondInput = $('input#second');
    $secondInput.bind('keyup', function(value) {
        ui.lookForUser($secondInput);
        
        search.getUsers(value.target.value, function(user) {
            switch(user) {
                case false: 
                    ui.incorrect($secondInput);

                    users[1] = undefined;
                    break;
                default:
                    ui.correct($secondInput, [user[0].first_name, user[0].last_name].join(' '));

                    users[1] = value.target.value;
            }

            if ((users[0] && users[1]) && (users[0] !== users[1])) {
                ui.searchOn();
            } else {
                ui.searchOff();
            }
        }, function() {
            ui.searchOff();
            ui.clean($secondInput);

            users[1] = undefined;
        });
    });

    $('input').keyup();

    var minLength = parseInt(httpUtils.hashParam('minLength'));
    if (!minLength) {
        minLength = 4;
        httpUtils.hashParam('minLength', minLength);
    }

    var maxLength = parseInt(httpUtils.hashParam('maxLength'));
    if (!maxLength) {
        maxLength = 4;
        httpUtils.hashParam('maxLength', maxLength);
    }

    var $radio = $('.setting-form label.btn-radio');

    $radio.find('input[data-min-length=' + minLength + ']').click();
    $radio.find('input[data-max-length=' + maxLength + ']').click();

    $radio.bind('change', function(event) {
        var target = $(event.target);

        minLength = parseInt(target.data('min-length')) || minLength;
        maxLength = parseInt(target.data('max-length')) || maxLength;

        if (minLength > 0) {
            httpUtils.hashParam('minLength', minLength);
        }

        if (maxLength > 0) {
            httpUtils.hashParam('maxLength', maxLength);
        }
    });

    $('.search-result-bar label.btn-radio').bind('change', function(event) {
        ui.panel.changePanel($(event.target).data('panel'));
    });

    $('button#search').click(function() {
        var depth = (maxLength + 1) / 2;

        if (users[0] !== users[1]) {
            ui.progress(0);

            search.buildTree({
                name: users[0],
                depth: Math.ceil(depth)
            }, function(tree) {
                ui.progress(30);

                var options = {
                    name: users[1],
                    depth: Math.floor(depth)
                };

                search.findCommonUsers(tree, options, function(users) {
                    ui.progress(80);

                    search.convert(users, {
                        minLength: minLength
                    }, function(data) {
                        ui.progress(90);

                        if (data) {
                            ui.panel.write(data);
                            ui.panel.count(data);
                            ui.panel.draw(data);

                            ui.enableModes();
                        } else {
                            ui.notFound();
                        }

                        ui.progress(100);
                    });
                });
            });
        }
    })
})