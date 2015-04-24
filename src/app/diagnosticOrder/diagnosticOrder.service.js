(function () {
    'use strict';

    var serviceId = 'diagnosticOrderService';

    function diagnosticOrderService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localDiagnosticOrders';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function addDiagnosticOrder(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/DiagnosticOrder";
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

        function deleteCachedDiagnosticOrder(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedDiagnosticOrders = searchResults.entry;
                for (var i = 0, len = cachedDiagnosticOrders.length; i < len; i++) {
                    if (cachedDiagnosticOrders[i].$$hashKey === hashKey) {
                        cachedDiagnosticOrders.splice(i, 1);
                        searchResults.entry = cachedDiagnosticOrders;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('DiagnosticOrder not found in cache: ' + hashKey, null, noToast);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteDiagnosticOrder(resourceId)
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

        function deleteDiagnosticOrder(resourceId) {
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

        function getCachedDiagnosticOrder(hashKey) {
            function getDiagnosticOrder(searchResults) {
                var cachedDiagnosticOrder;
                var cachedDiagnosticOrders = searchResults.entry;
                cachedDiagnosticOrder = _.find(cachedDiagnosticOrders, {'$$hashKey': hashKey});
                if (cachedDiagnosticOrder) {
                    deferred.resolve(cachedDiagnosticOrder);
                } else {
                    deferred.reject('DiagnosticOrder not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getDiagnosticOrder,
                function () {
                    deferred.reject('DiagnosticOrder search results not found in cache.');
                });
            return deferred.promise;
        }

        function getDiagnosticOrder(resourceId) {
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
        function getDiagnosticOrderReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/DiagnosticOrder?name=' + input + '&_count=10')
                .then(function (results) {
                    var diagnosticOrders = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'DiagnosticOrder') {
                                diagnosticOrders.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/DiagnosticOrder/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (diagnosticOrders.length === 0) {
                        diagnosticOrders.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(diagnosticOrders);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getDiagnosticOrders(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/DiagnosticOrder?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchDiagnosticOrders(baseUrl, filter) {
            var deferred = $q.defer();

            if (angular.isUndefined(filter)) {
                deferred.reject('Invalid search input');
            }

            fhirClient.getResource(baseUrl + '/DiagnosticOrder?' + filter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getDiagnosticOrdersByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "diagnosticOrders": []};
                    var diagnosticOrders = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'DiagnosticOrder') {
                                    diagnosticOrders.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (diagnosticOrders.length === 0) {
                        diagnosticOrders.push({display: "No matches", reference: ''});
                    }
                    searchResults.diagnosticOrders = diagnosticOrders;
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

        function initializeNewDiagnosticOrder() {
            var data = {};
            data.resource = {
                "resourceType": "DiagnosticOrder",
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

        function updateDiagnosticOrder(resourceVersionId, resource) {
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
            addDiagnosticOrder: addDiagnosticOrder,
            clearCache: clearCache,
            deleteCachedDiagnosticOrder: deleteCachedDiagnosticOrder,
            deleteDiagnosticOrder: deleteDiagnosticOrder,
            getCachedDiagnosticOrder: getCachedDiagnosticOrder,
            getCachedSearchResults: getCachedSearchResults,
            getDiagnosticOrder: getDiagnosticOrder,
            getDiagnosticOrders: getDiagnosticOrders,
            getDiagnosticOrdersByLink: getDiagnosticOrdersByLink,
            getDiagnosticOrderReference: getDiagnosticOrderReference,
            initializeNewDiagnosticOrder: initializeNewDiagnosticOrder,
            searchDiagnosticOrders: searchDiagnosticOrders,
            updateDiagnosticOrder: updateDiagnosticOrder
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', diagnosticOrderService]);

})();