(function () {
    'use strict';

    var serviceId = 'allergyIntoleranceService';

    function allergyIntoleranceService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets) {
        var dataCacheKey = 'localAllergyIntolerances';
        var itemCacheKey = 'contextAllergyIntolerance';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addAllergyIntolerance(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/AllergyIntolerance";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedAllergyIntolerance(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedAllergyIntolerances = searchResults.entry;
                    searchResults.entry = _.remove(cachedAllergyIntolerances, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteAllergyIntolerance(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteAllergyIntolerance(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedAllergyIntolerance(hashKey) {
            function getAllergyIntolerance(searchResults) {
                var cachedAllergyIntolerance;
                var cachedAllergyIntolerances = searchResults.entry;
                for (var i = 0, len = cachedAllergyIntolerances.length; i < len; i++) {
                    if (cachedAllergyIntolerances[i].$$hashKey === hashKey) {
                        cachedAllergyIntolerance = cachedAllergyIntolerances[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedAllergyIntolerance.resourceId = (baseUrl + cachedAllergyIntolerance.resourceType + '/' + cachedAllergyIntolerance.id);
                        cachedAllergyIntolerance.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedAllergyIntolerance) {
                    deferred.resolve(cachedAllergyIntolerance);
                } else {
                    deferred.reject('AllergyIntolerance not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getAllergyIntolerance,
                function () {
                    deferred.reject('AllergyIntolerance search results not found in cache.');
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getAllergyIntolerance(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getAllergyIntoleranceContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getAllergyIntoleranceReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/AllergyIntolerance?name=' + input + '&_count=20')
                .then(function (results) {
                    var familyHistories = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'AllergyIntolerance') {
                                    familyHistories.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (familyHistories.length === 0) {
                        familyHistories.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(familyHistories);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchAllergyIntolerances(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/AllergyIntolerance?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getAllergyIntolerances(baseUrl, searchFilter, patientId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(patientId)) {
                deferred.reject('Invalid search input');
            }


            if (angular.isDefined(patientId)) {
                var patientParam = 'patient=' + patientId;
                if (params.length > 1) {
                    params = params + '&' + patientParam;
                } else {
                    params = patientParam;
                }
            }

            fhirClient.getResource(baseUrl + '/AllergyIntolerance?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getAllergyIntolerancesByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewAllergyIntolerance() {
            return {
                "resourceType": "AllergyIntolerance",
                "identifier": [],
                "patient": null

            };
        }

        function setAllergyIntoleranceContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateAllergyIntolerance(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedRandomAllergyIntolerances(patientId, practitionerId) {

        }

        function _prepArrays(resource) {

            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            return $q.when(resource);
        }

        var service = {
            addAllergyIntolerance: addAllergyIntolerance,
            clearCache: clearCache,
            deleteCachedAllergyIntolerance: deleteCachedAllergyIntolerance,
            deleteAllergyIntolerance: deleteAllergyIntolerance,
            getCachedAllergyIntolerance: getCachedAllergyIntolerance,
            getCachedSearchResults: getCachedSearchResults,
            getAllergyIntolerance: getAllergyIntolerance,
            getAllergyIntoleranceContext: getAllergyIntoleranceContext,
            getAllergyIntoleranceReference: getAllergyIntoleranceReference,
            getAllergyIntolerances: getAllergyIntolerances,
            getAllergyIntolerancesByLink: getAllergyIntolerancesByLink,
            initializeNewAllergyIntolerance: initializeNewAllergyIntolerance,
            setAllergyIntoleranceContext: setAllergyIntoleranceContext,
            updateAllergyIntolerance: updateAllergyIntolerance,
            seedRandomAllergyIntolerances: seedRandomAllergyIntolerances,
            searchAllergyIntolerances: searchAllergyIntolerances
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient',
        'fhirServers', 'localValueSets', allergyIntoleranceService]);
})
();