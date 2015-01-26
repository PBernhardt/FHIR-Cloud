(function () {
    'use strict';

    function logger($log, $mdToast) {
        function error(message, data, title) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .hideDelay(0));
            $log.error('Error: ' + message, data);
        }

        function info(message, data, title) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .hideDelay(0));
            $log.info('Info: ' + message, data);
        }

        function success(message, data, title) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .hideDelay(0));
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .hideDelay(0));
            $log.warn('Warning: ' + message, data);
        }

        var service = {
            showToasts: true,

            error: error,
            info: info,
            success: success,
            warning: warning,

            // straight to console; bypass toastr
            log: $log.log
        };

        return service;
    }

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    logger.$inject = ['$log', '$mdToast'];
}());