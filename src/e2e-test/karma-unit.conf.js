module.exports = function (config) {
    config.set({
        files: [
            '../app/lib/angular/angular.js',
            'app/lib/angular-route/angular-route.js',
            'app/lib/angular-mocks/angular-mocks.js',
            'app/lib/angular-material/angular-material.js',
            'app/scripts/homePages.js',
            'app/scripts/app.js',
            '/unit/**/*.js'
        ],
        basePath: '../',
        frameworks: ['jasmine'],
        reporters: ['progress'],
        browsers: ['Chrome'],
        autoWatch: false,
        singleRun: true,
        colors: true
    });
};
