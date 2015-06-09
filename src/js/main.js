'use strict';

$(document).ready(function() {
    var initOptions = {};

    var minLength = httpUtils.hashParam('minLength') >> 0;
    if (!minLength) {
        minLength = 3;
        httpUtils.hashParam('minLength', minLength);
    }

    var maxLength = httpUtils.hashParam('maxLength') >> 0;
    if (!maxLength) {
        maxLength = 4;
        httpUtils.hashParam('maxLength', maxLength);
    }

    ui.init({
        min: minLength, 
        max: maxLength
    });

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

    $('div.slider#length').change(function(event, value) {
        minLength = value[0] >> 0;
        maxLength = value[1] >> 0;

        httpUtils.hashParam('minLength', minLength);
        httpUtils.hashParam('maxLength', maxLength);
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