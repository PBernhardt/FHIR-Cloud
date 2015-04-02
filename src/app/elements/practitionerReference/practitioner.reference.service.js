(function () {
    'use strict';

    var serviceId = 'practitionerReferenceService';

    function practitionerReferenceService($filter, common, fhirClient) {
        var practitionerList = [];
        var $q = common.$q;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                practitionerList[index] = item;
            } else {
                practitionerList.push(item);
            }
        }

        function getAll() {
            return _.compact(practitionerList);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = practitionerList.length; i < len; i++) {
                    if (practitionerList[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function remoteLookup(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Practitioner?name=' + input + '&_count=10')
                .then(function (results) {
                    var practitioners = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Practitioner') {
                                practitioners.push({
                                    display: $filter('fullName')(item.resource.name),
                                    reference: baseUrl + '/Practitioner/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (practitioners.length === 0) {
                        practitioners.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(practitioners);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function init(items) {
            if (angular.isArray(items)) {
                practitionerList = [];
                _.forEach(items, function (item) {
                    if (item) {
                        practitionerList.push(item);
                    }
                });
            } else {
                practitionerList = [];
            }
            return practitionerList;
        }


        function remove(item) {
            var index = getIndex(item.$$hashKey);
            practitionerList.splice(index, 1);
            return practitionerList;
        }

        function reset() {
            while (practitionerList.length > 0) {
                practitionerList.pop();
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

    angular.module('FHIRCloud').factory(serviceId, ['$filter', 'common', 'fhirClient', practitionerReferenceService]);

})();