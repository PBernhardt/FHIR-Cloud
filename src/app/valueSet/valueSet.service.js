(function () {
    'use strict';

    var serviceId = 'valueSetService';

    function valueSetService(common, dataCache, terminologyClient, terminologyServers) {
        var dataCacheKey = 'localValueSets';
        var activeValueSetKey = 'activeValueSet';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addValueSet(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            terminologyServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/ValueSet";
                    terminologyClient.addResource(url, resource)
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

        function deleteCachedValueSet(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedValueSets = searchResults.entry;
                for (var i = 0, len = cachedValueSets.length; i < len; i++) {
                    if (cachedValueSets[i].$$hashKey === hashKey) {
                        cachedValueSets.splice(i, 1);
                        searchResults.entry = cachedValueSets;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('ValueSet not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteValueSet(resourceId)
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

        function deleteValueSet(resourceId) {
            var deferred = $q.defer();
            terminologyClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function setActiveValueSet(item) {
            dataCache.addToCache(activeValueSetKey, item);
        }

        function getActiveValueSet() {
            return dataCache.readFromCache(activeValueSetKey);
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

        function getCachedValueSet(hashKey) {
            function getValueSet(searchResults) {
                var cachedValueSet;
                var cachedValueSets = searchResults.entry;
                cachedValueSet = _.find(cachedValueSets, {'$$hashKey': hashKey});
                if (cachedValueSet) {
                    deferred.resolve(cachedValueSet);
                } else {
                    deferred.reject('ValueSet not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getValueSet,
                function () {
                    deferred.reject('ValueSet search results not found in cache.');
                });
            return deferred.promise;
        }

        function getValueSet(resourceId) {
            var deferred = $q.defer();
            terminologyClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    results.resource = results.data;
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getValueSetReference(input) {
            var deferred = $q.defer();
            terminologyServers.getActiveServer()
                .then(function (server) {
                    terminologyClient.getResource(server.baseUrl + '/ValueSet?name=' + input + '&_count=20')
                        .then(function (results) {
                            var valueSets = [];
                            if (results.data.entry) {
                                angular.forEach(results.data.entry,
                                    function (item) {
                                        valueSets.push({display: item.resource.name, reference: item.resource.id});
                                    });
                            }
                            if (valueSets.length === 0) {
                                valueSets.push({display: "No matches", reference: ''});
                            }
                            deferred.resolve(valueSets);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });

            return deferred.promise;
        }

        function getValueSets(nameFilter, identifier) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter) && angular.isUndefined(identifier)) {
                deferred.reject('Invalid search input');
            }
            if (angular.isDefined(nameFilter) && nameFilter.length > 1) {
                params = 'name=' + nameFilter;
            }
            if (angular.isDefined(identifier)) {
                var identifierParam = 'identifier=' + identifier;
                if (params.length > 1) {
                    params = params + '&' + identifierParam;
                } else {
                    params = identifierParam;
                }
            }
            terminologyServers.getActiveServer()
                .then(function (server) {
                    terminologyClient.getResource(server.baseUrl + '/ValueSet?' + params + '&_count=20')
                        .then(function (results) {
                            dataCache.addToCache(dataCacheKey, results.data);
                            deferred.resolve(results.data);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });

            return deferred.promise;
        }

        function getValueSetsByLink(url) {
            var deferred = $q.defer();
            terminologyClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });

            return deferred.promise;
        }

        function initializeNewValueSet() {
            var data = {};
            data.resource = {
                "resourceType": "ValueSet",
                "active": true
            };
            return data;
        }

        /*
         Example usage: http://fhir-dev.healthintersections.com.au/open/ValueSet/$expand?identifier=http://hl7.org/fhir/vs/condition-code&filter=xxx
         */
        function getFilteredExpansion(id, filter) {
            var deferred = $q.defer();
            terminologyServers.getActiveServer()
                .then(function (server) {
                    terminologyClient.getResource(server.baseUrl + '/ValueSet/' + id + '/$expand?filter=' + filter + '&_count=10')
                        .then(function (results) {
                            if (results.data && results.data.expansion && angular.isArray(results.data.expansion.contains)) {
                                deferred.resolve(results.data.expansion.contains);
                            } else {
                                deferred.reject("Response did not include expected expansion");
                            }
                        });
                });
            return deferred.promise;
        }

        function getValueSetSummary() {
            var deferred = $q.defer();

            terminologyServers.getActiveServer()
                .then(function (server) {
                    terminologyClient.getResource(server.baseUrl + '/ValueSet?_summary=true')
                        .then(function (results) {
                            dataCache.addToCache(dataCacheKey, results.data);
                            deferred.resolve(results.data);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });

            return deferred.promise;
        }

        function updateValueSet(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            terminologyClient.updateResource(resourceVersionId, resource)
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
            addValueSet: addValueSet,
            clearCache: clearCache,
            deleteCachedValueSet: deleteCachedValueSet,
            deleteValueSet: deleteValueSet,
            getActiveValueSet: getActiveValueSet,
            getFilteredExpansion: getFilteredExpansion,
            getCachedValueSet: getCachedValueSet,
            getCachedSearchResults: getCachedSearchResults,
            getValueSet: getValueSet,
            getValueSets: getValueSets,
            getValueSetsByLink: getValueSetsByLink,
            getValueSetReference: getValueSetReference,
            getValueSetSummary: getValueSetSummary,
            setActiveValueSet: setActiveValueSet,
            initializeNewValueSet: initializeNewValueSet,
            updateValueSet: updateValueSet
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'terminologyClient', 'terminologyServers', valueSetService]);

})();