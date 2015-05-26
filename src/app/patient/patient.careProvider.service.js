(function () {
    'use strict';

    var serviceId = 'patientCareProviderService';

    function patientCareProviderService() {
        var careProviders = [];
        var _managingOrganization;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                careProviders[index] = resourceReference;
            } else {
                careProviders.push(resourceReference);
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

        function getManagingOrganization() {
            return _managingOrganization;
        }

        function setManagingOrganization(org) {
            _managingOrganization = org;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getManagingOrganization: getManagingOrganization,
            setManagingOrganization: setManagingOrganization,
            init: init
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [patientCareProviderService]);

})();