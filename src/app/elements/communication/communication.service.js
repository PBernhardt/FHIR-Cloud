(function () {
    'use strict';

    var serviceId = 'communicationService';

    function communicationService(common) {
        var communications = [];
        var _mode = 'multi';
        var _communication = { "language": null, "preferred": false };

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                communications[index] = item;
            } else {
                communications.push(item);
            }
        }

        function getAll() {
            return _.compact(communications);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = communications.length; i < len; i++) {
                    if (communications[i].$$hashKey === hashKey) {
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
            return _communication;
        }

        function init(items, mode) {
            _mode = mode ? mode : 'multi';
            if (angular.isArray(items)) {
                communications = items;
            } else if (angular.isObject(items)) {
                communications = [];
                communications.push(items);
            }
            _communication = communications[0];
            return communications;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            communications.splice(index, 1);
        }

        function update(item) {
            if (angular.isUndefined(item.$$hashKey) === false) {
                for (var i = 0, len = communications.length; i < len; i++) {
                    if (communications[i].$$hashKey === item.$$hashKey) {
                        communications[i] = item;
                    } else if (item.preferred == true) {
                        communications[i].preferred = false;
                    }
                }
            }
        }

        function reset() {
            while (communications.length > 0) {
                communications.pop();
            }
        }

        function setSingle(item) {
            _communication = item;
        }

        var service = {
            add: add,
            remove: remove,
            update: update,
            getAll: getAll,
            getMode: getMode,
            getSingle: getSingle,
            init: init,
            reset: reset,
            setSingle: setSingle
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', communicationService]);

})();