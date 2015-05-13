if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
} else {
    console.error('String.prototype.format already exists');
}

var httpUtils = {
    getParam: function(paramName) {
        var sPageURL = window.location.hash.substring(1);
        var sURLVariables = sPageURL.split('&');

        var result = sURLVariables
            .filter(function(item) {
                return item.split('=')[0] === paramName;
            })
            .map(function(item) {
                return item.split('=')[1];
            });

        return result.length > 1 ? result : result[0];
    }
};