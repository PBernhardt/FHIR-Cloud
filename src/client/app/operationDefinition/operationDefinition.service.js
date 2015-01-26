(function () {
    'use strict';

    var serviceId = 'operationDefinitionService';

    function operationDefinitionService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localOperationDefinitions';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addOperationDefinition(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/OperationDefinition";
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

        function deleteCachedOperationDefinition(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedOperationDefinitions = searchResults.entry;
                for (var i = 0, len = cachedOperationDefinitions.length; i < len; i++) {
                    if (cachedOperationDefinitions[i].$$hashKey === hashKey) {
                        cachedOperationDefinitions.splice(i, 1);
                        searchResults.entry = cachedOperationDefinitions;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('OperationDefinition not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteOperationDefinition(resourceId)
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

        function deleteOperationDefinition(resourceId) {
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
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedOperationDefinition(hashKey) {
            function getOperationDefinition(searchResults) {
                var cachedOperationDefinition;
                var cachedOperationDefinitions = searchResults.entry;
                cachedOperationDefinition = _.find(cachedOperationDefinitions, {'$$hashKey': hashKey});
                if (cachedOperationDefinition) {
                    deferred.resolve(cachedOperationDefinition);
                } else {
                    deferred.reject('OperationDefinition not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getOperationDefinition,
                function () {
                    deferred.reject('OperationDefinition search results not found in cache.');
                });
            return deferred.promise;
        }

        function getOperationDefinition(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getOperationDefinitionReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/OperationDefinition?name=' + input + '&_count=20')
                .then(function (results) {
                    var operationDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                operationDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (operationDefinitions.length === 0) {
                        operationDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(operationDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getOperationDefinitions(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/OperationDefinition?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getOperationDefinitionsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "operationDefinitions": []};
                    var operationDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'OperationDefinition') {
                                    operationDefinitions.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (operationDefinitions.length === 0) {
                        operationDefinitions.push({display: "No matches", reference: ''});
                    }
                    searchResults.operationDefinitions = operationDefinitions;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewOperationDefinition() {
            var data = {};
            data.resource = {
                "resourceType": "OperationDefinition",
                "identifier": [],
                "type": {"coding": []},
                "telecom": [],
                "contact": [],
                "address": [],
                "partOf": null,
                "location": [],
                "active": true
            };
            return data;
        }

        function updateOperationDefinition(resourceVersionId, resource) {
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
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
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
            addOperationDefinition: addOperationDefinition,
            clearCache: clearCache,
            deleteCachedOperationDefinition: deleteCachedOperationDefinition,
            deleteOperationDefinition: deleteOperationDefinition,
            getCachedOperationDefinition: getCachedOperationDefinition,
            getCachedSearchResults: getCachedSearchResults,
            getOperationDefinition: getOperationDefinition,
            getOperationDefinitions: getOperationDefinitions,
            getOperationDefinitionsByLink: getOperationDefinitionsByLink,
            getOperationDefinitionReference: getOperationDefinitionReference,
            initializeNewOperationDefinition: initializeNewOperationDefinition,
            updateOperationDefinition: updateOperationDefinition
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', operationDefinitionService]);

})();