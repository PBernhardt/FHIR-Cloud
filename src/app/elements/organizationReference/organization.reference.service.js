(function () {
    'use strict';

    var serviceId = 'organizationReferenceService';

    function organizationReferenceService($filter, common, fhirClient) {
        var organizationList = [];
        var $q = common.$q;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                organizationList[index] = item;
            } else {
                organizationList.push(item);
            }
        }

        function getAll() {
            return _.compact(organizationList);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = organizationList.length; i < len; i++) {
                    if (organizationList[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function remoteLookup(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Organization?name=' + input + '&_count=10')
                .then(function (results) {
                    var organizations = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Organization') {
                                organizations.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/Organization/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(organizations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function init(items) {
            if (angular.isArray(items)) {
                organizationList = [];
                _.forEach(items, function (item) {
                    if (item) {
                        organizationList.push(item);
                    }
                });
            } else {
                organizationList = [];
            }
            return organizationList;
        }


        function remove(item) {
            var index = getIndex(item.$$hashKey);
            organizationList.splice(index, 1);
            return organizationList;
        }

        function reset() {
            while (organizationList.length > 0) {
                organizationList.pop();
            }
        }


        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            remoteLookup: remoteLookup,
            init: init,
            reset: reset
        };

        return service;

    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', 'common', 'fhirClient', organizationReferenceService]);

})();