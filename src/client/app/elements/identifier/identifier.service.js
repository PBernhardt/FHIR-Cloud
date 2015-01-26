(function () {
    'use strict';

    var serviceId = 'identifierService';

    function identifierService(common) {
        var identifiers = [];
        var _mode = 'multi';
        var _identifier;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                identifiers[index] = item;
            } else {
                identifiers.push(item);
            }
        }

        function getAll() {
            return _.compact(identifiers);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = identifiers.length; i < len; i++) {
                    if (identifiers[i].$$hashKey === hashKey) {
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
            return _identifier;
        }

        function init(items, mode) {
            _mode = mode ? mode: 'multi';
            if (angular.isArray(items)) {
                identifiers = items;
            } else if (angular.isObject(items)){
                identifiers = [];
                identifiers.push(items);
            }
            else {
                identifiers = [];
                var defaultId = {"use": "usual", "system": "urn:fhir-starter:id", "value": common.generateUUID(), "label": "Auto-generated FHIR Starter identifier"};
                identifiers.push(defaultId);
            }
            _identifier = identifiers[0];
            return identifiers;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            identifiers.splice(index, 1);
        }

        function reset() {
            while (identifiers.length > 0) {
                identifiers.pop();
            }
        }

        function setSingle(item) {
            _identifier = item;
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

    angular.module('FHIRStarter').factory(serviceId, ['common', identifierService]);

})();