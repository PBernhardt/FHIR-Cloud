(function () {
    'use strict';

    /* @ngInject */
    function exception(logger) {
        function catcher(message) {
            return function (reason) {
                logger.error(message, reason);
            };
        }

        var service = {
            catcher: catcher
        };
        return service;
    }

    angular
        .module('blocks.exception')
        .factory('exception', exception);
})();