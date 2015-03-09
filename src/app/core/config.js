(function() {
    'use strict';

    var core = angular.module('app.core');

    var config = {
        appErrorPrefix: '[FHIR Cloud Error] ', //Configure the exceptionHandler decorator
        appTitle: 'FHIR Cloud',
        version: '1.0.0'
    };

    core.value('config', config);

    /* @ngInject */
    function configure ($logProvider, $routeProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }


    }

    core.config(configure);
})();