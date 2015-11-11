(function () {
    'use strict';

    function logger($filter, $log, $mdToast) {

        function getLogFn(moduleId, fnName) {
            fnName = fnName || 'log';
            switch (fnName.toLowerCase()) { // convert aliases
                case 'error':
                    fnName = 'logError';
                    break;
                case 'warning':
                    fnName = 'logWarning';
                    break;
                case 'info':
                    fnName = 'logInfo';
                    break;
                default:
                    fnName = 'logDebug';
            }

            var logFn = service[fnName] || service.log;
            return function (msg, data, showToast) {
                logFn(msg, data, moduleId, (showToast === undefined) ? true : showToast);
            };
        }

        function logInfo(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'info');
        }

        function logWarning(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'warning');
        }

        function logSuccess(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'success');
        }

        function logDebug(message, data, source) {
            logIt(message, data, source, false, 'debug');
        }

        function logError(message, data, source, showToast) {
            function generateUUID() {
                var d = new Date().getTime();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                    function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                    });
            }
            //TODO: uncomment when UI support is restored
/*            var errors;
            if ($window.localStorage.errors) {
                errors = JSON.parse($window.localStorage.errors);
            } else {
                errors = [];
            }
            var localError = {"message": message};
            localError.id = generateUUID();
            errors.push(localError);

            $window.localStorage.errors = JSON.stringify(errors);*/

            logIt(message, data, source, showToast, 'error');
        }

        function logIt(message, data, source, showToast, toastType) {
            var write;
            switch(toastType) {
                case 'error':
                    write = $log.error;
                    break;
                case 'warning':
                    write = $log.warn;
                    break;
                case 'info':
                    write = $log.info;
                    break;
                default:
                    write = $log.log;
            }
            source = source ? '[' + source + '] ' : '';
            write(source, message);
            if (angular.isDefined(data) && data !== null && toastType === 'error') {
                write(source, data);
            }
            if (showToast) {
                if (!angular.isString(message)) {
                    if  (angular.isDefined(message)
                        && angular.isDefined(message.Message)
                        && angular.isString(message.Message)) {
                        message = message.Message;
                    }
                    else {
                        message = "The server responded with an unspecified error."
                    }
                }
                var truncatedMessage = $filter('truncate')(message, 200);
                $mdToast.show($mdToast.simple()
                    .content(truncatedMessage)
                    .position('right bottom')
                    .hideDelay(write === $log.error ? 4000 : 2000));
            }
        }

        var service = {
            getLogFn: getLogFn,
            logInfo: logInfo,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning,
            logDebug: logDebug
        };

        return service;
    }

    angular.module('common')
        .factory('logger', ['$filter', '$log', '$mdToast', logger]);

})();