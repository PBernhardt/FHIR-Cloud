(function () {
    'use strict';

    var serviceId = 'parameterService';

    function parameterService(common) {
        var parameters = [];
        var _mode = 'multi';
        var _parameter;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                parameters[index] = item;
            } else {
                parameters.push(item);
            }
        }

        function getAll() {
            return _.compact(parameters);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = parameters.length; i < len; i++) {
                    if (parameters[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function getSingle() {
            return _parameter;
        }

        function init(items, mode) {
            _mode = mode ? mode: 'multi';
            if (angular.isArray(items)) {
                parameters = items;
            } else if (angular.isObject(items)){
                parameters = [];
                parameters.push(items);
            }
            else {
                parameters = [];
                var defaultId = {"use": "usual", "system": "urn:fhir-starter:id", "value": common.generateUUID(), "label": "Auto-generated FHIR Cloud parameter"};
                parameters.push(defaultId);
            }
            _parameter = parameters[0];
            return parameters;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            parameters.splice(index, 1);
        }

        function reset() {
            while (parameters.length > 0) {
                parameters.pop();
            }
        }

        function setSingle(item) {
            _parameter = item;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getMode: getMode,
            getSingle: getSingle,
            init: init,
            reset: reset,
            setSingle: setSingle
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', parameterService]);

})();