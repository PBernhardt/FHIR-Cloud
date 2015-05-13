(function () {
    'use strict';

    var serviceId = 'conformanceService';

    function conformanceService($http, $window, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localConformances';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function getConformanceMetadata(baseUrl) {
            var deferred = $q.defer();

            var cachedData = dataCache.readFromCache(dataCacheKey);
            if (cachedData) {
                deferred.resolve(cachedData);
            } else {
                fhirClient.getResource(baseUrl + '/metadata')
                    .then(function (results) {
                        dataCache.addToCache(dataCacheKey, results.data);
                        $window.localStorage.conformance = JSON.stringify(results.data);
                        deferred.resolve(results.data);
                    }, function (outcome) {
                        deferred.reject(outcome);
                    });
            }
            return deferred.promise;
        }

        function addConformance(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Conformance";
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

        function deleteCachedConformance(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedConformances = searchResults.entry;
                for (var i = 0, len = cachedConformances.length; i < len; i++) {
                    if (cachedConformances[i].$$hashKey === hashKey) {
                        cachedConformances.splice(i, 1);
                        searchResults.entry = cachedConformances;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Conformance not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteConformance(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteConformance(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.resolve(undefined);
            }
            return deferred.promise;
        }

        function getCachedConformance(hashKey) {
            function getConformance(searchResults) {
                var cachedConformance;
                var cachedConformanceStatements;
                if (angular.isDefined(searchResults) && angular.isDefined(searchResults.entry)) {
                    cachedConformanceStatements = searchResults.entry;
                    cachedConformance = _.find(cachedConformanceStatements, {'$$hashKey': hashKey});
                }
                if (cachedConformance) {
                    deferred.resolve(cachedConformance);
                } else if ($window.localStorage.conformance && $window.localStorage.conformance !== null) {
                    cachedConformance = {"resource": JSON.parse($window.localStorage.conformance)};
                    deferred.resolve(cachedConformance);
                } else {
                    deferred.reject('Conformance not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getConformance);
            return deferred.promise;
        }

        function getConformance(resourceId) {
            var deferred = $q.defer();
            var req = {
                method: 'get',
                url: resourceId,
                headers: {'Authorization': undefined}
            };
            $http(req)
                .success(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    $window.localStorage.conformance = JSON.stringify(results.data);
                    deferred.resolve(results.data);
                })
                .error(function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getConformanceReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Conformance?name=' + input + '&_count=20')
                .then(function (results) {
                    var extensionDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                extensionDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (extensionDefinitions.length === 0) {
                        extensionDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(extensionDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getConformances(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Conformance?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    $window.localStorage.conformanceStatements = JSON.stringify(results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getConformancesByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    $window.localStorage.conformance = JSON.stringify(results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewConformance() {
            var data = {};
            data.resource = {
                "resourceType": "Conformance",
                "active": true
            };
            return data;
        }

        function updateConformance(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }


        var service = {
            addConformance: addConformance,
            clearCache: clearCache,
            deleteCachedConformance: deleteCachedConformance,
            deleteConformance: deleteConformance,
            getCachedConformance: getCachedConformance,
            getCachedSearchResults: getCachedSearchResults,
            getConformance: getConformance,
            getConformanceMetadata: getConformanceMetadata,
            getConformances: getConformances,
            getConformancesByLink: getConformancesByLink,
            getConformanceReference: getConformanceReference,
            initializeNewConformance: initializeNewConformance,
            updateConformance: updateConformance
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', '$window', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        conformanceService]);
})();