(function () {
    'use strict';

    var serviceId = 'encounterLocationService';

    function encounterLocationService(common) {
        var encounterLocations = [];

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                encounterLocations[index] = item;
            } else {
                encounterLocations.push(item);
            }
        }

        function getAll() {
            return _.compact(encounterLocations);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = encounterLocations.length; i < len; i++) {
                    if (encounterLocations[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                encounterLocations = items;
            } else if (angular.isObject(items)) {
                encounterLocations = [];
                encounterLocations.push(items);
            }
            return encounterLocations;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            encounterLocations.splice(index, 1);
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', encounterLocationService]);

})();