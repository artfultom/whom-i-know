'use strict';

$(document).ready(function() {
    var users = [];

    var firstInput = $('input#first');
    firstInput.bind('keyup', function(value) {
        ui.lookForUser(firstInput);

        search.getUsers(value.target.value, function(user) {
            switch(user) {
                case false: 
                    ui.incorrect(firstInput);

                    users[0] = undefined;
                    break;
                case undefined:
                    ui.clean(firstInput);

                    users[0] = undefined;
                    break;
                default:
                    ui.correct(firstInput);

                    users[0] = value.target.value;
            }

            if ((users[0] && users[1]) && (users[0] !== users[1])) {
                ui.searchOn();
            } else {
                ui.searchOff();
            }
        });
    });

    var secondInput = $('input#second');
    secondInput.bind('keyup', function(value) {
        ui.lookForUser(secondInput);
        
        search.getUsers(value.target.value, function(user) {
            switch(user) {
                case false: 
                    ui.incorrect(secondInput);

                    users[1] = undefined;
                    break;
                case undefined:
                    ui.clean(secondInput);

                    users[1] = undefined;
                    break;
                default:
                    ui.correct(secondInput);

                    users[1] = value.target.value;
            }

            if ((users[0] && users[1]) && (users[0] !== users[1])) {
                ui.searchOn();
            } else {
                ui.searchOff();
            }
        });
    });

    $('input').keyup();

    $('label.btn-radio').bind('change', function(event) {
        ui.panel.changePanel($(event.target).data('panel'));
    });

    $('button#search').click(function() {
        var depth = 3;

        if (users[0] !== users[1]) {
            ui.showProgress();

            search.buildTree({
                name: users[0],
                depth: depth
            }, function(tree) {
                var options = {
                    name: users[1],
                    depth: depth
                };

                search.findCommonUsers(tree, options, function(users) {
                    search.convert(users, function(data) {
                        if (data) {
                            ui.panel.write(data);
                            ui.panel.count(data);
                            ui.panel.draw(data);

                            ui.enableModes();
                        } else {
                            ui.notFound();
                        }

                        ui.hideProgress();
                    });
                });
            });
        }
    })
})