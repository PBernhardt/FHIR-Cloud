(function () {
    'use strict';

    var serviceId = 'procedureService';

    function procedureService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets, fhirResourceBase) {
        var dataCacheKey = 'localProcedures';
        var itemCacheKey = 'contextProcedure';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addProcedure(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Procedure";
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

        function deleteCachedProcedure(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedProcedures = searchResults.entry;
                    searchResults.entry = _.remove(cachedProcedures, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteProcedure(resourceId)
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

        function deleteProcedure(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedProcedure(hashKey) {
            function getProcedure(searchResults) {
                var cachedProcedure;
                var cachedProcedures = searchResults.entry;
                for (var i = 0, len = cachedProcedures.length; i < len; i++) {
                    if (cachedProcedures[i].$$hashKey === hashKey) {
                        cachedProcedure = cachedProcedures[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedProcedure.resourceId = (baseUrl + cachedProcedure.resourceType + '/' + cachedProcedure.id);
                        cachedProcedure.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedProcedure) {
                    deferred.resolve(cachedProcedure);
                } else {
                    deferred.reject('Procedure not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getProcedure,
                function () {
                    deferred.reject('Procedure search results not found in cache.');
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

        function getProcedure(resourceId) {
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

        function getProcedureContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getProcedureReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Procedure?code=' + input + '&_count=20')
                .then(function (results) {
                    var procedures = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Procedure') {
                                    procedures.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (procedures.length === 0) {
                        procedures.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(procedures);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchProcedures(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Procedure?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getProcedures(baseUrl, searchFilter, patientId) {
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

            fhirClient.getResource(baseUrl + '/Procedure?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getProceduresByLink(url) {
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

        function initializeNewProcedure() {

            var procedure = fhirResourceBase.getBase();

            // DSTU2 1.0.2
            procedure.resourceType = "Procedure";
                procedure.id = null;
                procedure.identifier = []; // External identifier
                procedure.patient = null; // R!  Who is/was taking  the medication


            return procedure;
        }

        function setProcedureContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateProcedure(resourceVersionId, resource) {
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

        function seedRandomProcedures(patientId, patientName) {

        }

        function _prepArrays(resource) {
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.performer.length === 0) {
                resource.performer = null;
            }
            if (resource.referenceRange.length === 0) {
                resource.referenceRange = null;
            }
            if (resource.related.length === 0) {
                resource.related = null;
            }
            return $q.when(resource);
        }

        var service = {
            addProcedure: addProcedure,
            clearCache: clearCache,
            deleteCachedProcedure: deleteCachedProcedure,
            deleteProcedure: deleteProcedure,
            getCachedProcedure: getCachedProcedure,
            getCachedSearchResults: getCachedSearchResults,
            getProcedure: getProcedure,
            getProcedureContext: getProcedureContext,
            getProcedureReference: getProcedureReference,
            getProcedures: getProcedures,
            getProceduresByLink: getProceduresByLink,
            initializeNewProcedure: initializeNewProcedure,
            setProcedureContext: setProcedureContext,
            updateProcedure: updateProcedure,
            seedRandomProcedures: seedRandomProcedures,
            searchProcedures: searchProcedures
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets', 'fhirResourceBase',
        procedureService]);
})();