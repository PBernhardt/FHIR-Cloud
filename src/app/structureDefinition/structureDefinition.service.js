(function () {
    'use strict';

    var serviceId = 'structureDefinitionService';

    function structureDefinitionService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localStructureDefinitions';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addStructureDefinition(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/StructureDefinition";
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

        function deleteCachedStructureDefinition(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedStructureDefinitions = searchResults.entry;
                for (var i = 0, len = cachedStructureDefinitions.length; i < len; i++) {
                    if (cachedStructureDefinitions[i].$$hashKey === hashKey) {
                        cachedStructureDefinitions.splice(i, 1);
                        searchResults.entry = cachedStructureDefinitions;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('StructureDefinition not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteStructureDefinition(resourceId)
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

        function deleteStructureDefinition(resourceId) {
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

        function getCachedStructureDefinition(hashKey) {
            function getStructureDefinition(searchResults) {
                var cachedStructureDefinition;
                var cachedStructureDefinitions = searchResults.entry;
                cachedStructureDefinition = _.find(cachedStructureDefinitions, {'$$hashKey': hashKey});
                if (cachedStructureDefinition) {
                    deferred.resolve(cachedStructureDefinition);
                } else {
                    deferred.reject('StructureDefinition not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getStructureDefinition,
                function () {
                    deferred.reject('StructureDefinition search results not found in cache.');
                });
            return deferred.promise;
        }

        function getStructureDefinition(resourceId) {
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
        function getStructureDefinitionReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/StructureDefinition?type=' + input + '&_count=20')
                .then(function (results) {
                    var structureDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                structureDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (structureDefinitions.length === 0) {
                        structureDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(structureDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getStructureDefinitions(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/StructureDefinition?name=' + encodeURIComponent(nameFilter))
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getStructureDefinitionsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "structureDefinitions": []};
                    var structureDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'StructureDefinition') {
                                    structureDefinitions.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (structureDefinitions.length === 0) {
                        structureDefinitions.push({display: "No matches", reference: ''});
                    }
                    searchResults.structureDefinitions = structureDefinitions;
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

        function initializeNewStructureDefinition() {
            var data = {};
            data.resource = {
                "resourceType": "StructureDefinition",
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

        function updateStructureDefinition(resourceVersionId, resource) {
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
            addStructureDefinition: addStructureDefinition,
            clearCache: clearCache,
            deleteCachedStructureDefinition: deleteCachedStructureDefinition,
            deleteStructureDefinition: deleteStructureDefinition,
            getCachedStructureDefinition: getCachedStructureDefinition,
            getCachedSearchResults: getCachedSearchResults,
            getStructureDefinition: getStructureDefinition,
            getStructureDefinitions: getStructureDefinitions,
            getStructureDefinitionsByLink: getStructureDefinitionsByLink,
            getStructureDefinitionReference: getStructureDefinitionReference,
            initializeNewStructureDefinition: initializeNewStructureDefinition,
            updateStructureDefinition: updateStructureDefinition
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', structureDefinitionService]);

})();