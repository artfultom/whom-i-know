module.exports = function(config) {
    config.set({
        basePath: './',

        files: [
            'src/bower_components/jquery/dist/jquery.js',
            'src/js/definitions.js',
            'src/js/search.js',
            'src/test/*'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Firefox'],

        plugins: [
            'karma-firefox-launcher',
            'karma-jasmine'
        ]
    });
};