(function () {
    'use strict';

    // Must configure the common service and set its 
    // events via the commonConfigProvider

    angular.module('common')
        .factory('progress', ['common', 'commonConfig', progress]);

    function progress(common, commonConfig) {
        var service = {
            progressHide: progressHide,
            progressShow: progressShow
        };

        return service;

        function progressHide() {
            progressToggle(false);
        }

        function progressShow() {
            progressToggle(true);
        }

        function progressToggle(show) {
            common.$broadcast(commonConfig.config.progressToggleEvent, { show: show });
        }
    }
})();