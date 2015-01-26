(function () {
    'use strict';

    var serviceId = 'extensionDefinitionService';

    function extensionDefinitionService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localExtensionDefinitions';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addExtensionDefinition(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/ExtensionDefinition";
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

        function deleteCachedExtensionDefinition(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedExtensionDefinitions = searchResults.entry;
                for (var i = 0, len = cachedExtensionDefinitions.length; i < len; i++) {
                    if (cachedExtensionDefinitions[i].$$hashKey === hashKey) {
                        cachedExtensionDefinitions.splice(i, 1);
                        searchResults.entry = cachedExtensionDefinitions;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('ExtensionDefinition not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteExtensionDefinition(resourceId)
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

        function deleteExtensionDefinition(resourceId) {
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

        function getCachedExtensionDefinition(hashKey) {
            function getExtensionDefinition(searchResults) {
                var cachedExtensionDefinition;
                var cachedExtensionDefinitions = searchResults.entry;
                cachedExtensionDefinition = _.find(cachedExtensionDefinitions, {'$$hashKey': hashKey});
                if (cachedExtensionDefinition) {
                    deferred.resolve(cachedExtensionDefinition);
                } else {
                    deferred.reject('ExtensionDefinition not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getExtensionDefinition,
                function () {
                    deferred.reject('ExtensionDefinition search results not found in cache.');
                });
            return deferred.promise;
        }

        function getExtensionDefinition(resourceId) {
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
        function getExtensionDefinitionReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/ExtensionDefinition?name=' + input + '&_count=20')
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
        function getExtensionDefinitions(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/ExtensionDefinition?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getExtensionDefinitionsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "extensionDefinitions": []};
                    var extensionDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'ExtensionDefinition') {
                                    extensionDefinitions.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (extensionDefinitions.length === 0) {
                        extensionDefinitions.push({display: "No matches", reference: ''});
                    }
                    searchResults.extensionDefinitions = extensionDefinitions;
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

        function initializeNewExtensionDefinition() {
            var data = {};
            data.resource = {
                "resourceType": "ExtensionDefinition",
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

        function updateExtensionDefinition(resourceVersionId, resource) {
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
            addExtensionDefinition: addExtensionDefinition,
            clearCache: clearCache,
            deleteCachedExtensionDefinition: deleteCachedExtensionDefinition,
            deleteExtensionDefinition: deleteExtensionDefinition,
            getCachedExtensionDefinition: getCachedExtensionDefinition,
            getCachedSearchResults: getCachedSearchResults,
            getExtensionDefinition: getExtensionDefinition,
            getExtensionDefinitions: getExtensionDefinitions,
            getExtensionDefinitionsByLink: getExtensionDefinitionsByLink,
            getExtensionDefinitionReference: getExtensionDefinitionReference,
            initializeNewExtensionDefinition: initializeNewExtensionDefinition,
            updateExtensionDefinition: updateExtensionDefinition
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', extensionDefinitionService]);

})();