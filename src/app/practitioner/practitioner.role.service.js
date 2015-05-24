(function () {
    'use strict';

    var serviceId = 'practitionerRoleService';

    function practitionerRoleService(common) {
        var careProviders = [];

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                careProviders[index] = item;
            } else {
                careProviders.push(item);
            }
        }

        function getAll() {
            return _.compact(careProviders);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = careProviders.length; i < len; i++) {
                    if (careProviders[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                careProviders = items;
            } else if (angular.isObject(items)) {
                careProviders = [];
                careProviders.push(items);
            }
            return careProviders;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            careProviders.splice(index, 1);
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', practitionerRoleService]);

})();