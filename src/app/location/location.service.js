(function () {
    'use strict';

    var serviceId = 'locationService';

    function locationService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localLocations';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function addLocation(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Location";
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

        function deleteCachedLocation(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedLocations = searchResults.entry;
                for (var i = 0, len = cachedLocations.length; i < len; i++) {
                    if (cachedLocations[i].$$hashKey === hashKey) {
                        cachedLocations.splice(i, 1);
                        searchResults.entry = cachedLocations;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Location not found in cache: ' + hashKey, null, noToast);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteLocation(resourceId)
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

        function deleteLocation(resourceId) {
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

        function getCachedLocation(hashKey) {
            function getLocation(searchResults) {
                var cachedLocation;
                var cachedLocations = searchResults.entry;
                cachedLocation = _.find(cachedLocations, {'$$hashKey': hashKey});
                if (cachedLocation) {
                    deferred.resolve(cachedLocation);
                } else {
                    deferred.reject('Location not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getLocation,
                function () {
                    deferred.reject('Location search results not found in cache.');
                });
            return deferred.promise;
        }

        function getLocation(resourceId) {
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
        function getLocationReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Location?name=' + input + '&_count=10')
                .then(function (results) {
                    var locations = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Location') {
                                locations.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/Location/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (locations.length === 0) {
                        locations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(locations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getLocations(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Location?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchLocations(baseUrl, filter) {
            var deferred = $q.defer();

            if (angular.isUndefined(filter)) {
                deferred.reject('Invalid search input');
            }

            fhirClient.getResource(baseUrl + '/Location?' + filter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getLocationsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "locations": []};
                    var locations = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Location') {
                                    locations.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (locations.length === 0) {
                        locations.push({display: "No matches", reference: ''});
                    }
                    searchResults.locations = locations;
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

        function initializeNewLocation() {
            var data = {};
            data.resource = {
                "resourceType": "Location",
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

        function updateLocation(resourceVersionId, resource) {
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
            addLocation: addLocation,
            clearCache: clearCache,
            deleteCachedLocation: deleteCachedLocation,
            deleteLocation: deleteLocation,
            getCachedLocation: getCachedLocation,
            getCachedSearchResults: getCachedSearchResults,
            getLocation: getLocation,
            getLocations: getLocations,
            getLocationsByLink: getLocationsByLink,
            getLocationReference: getLocationReference,
            initializeNewLocation: initializeNewLocation,
            searchLocations: searchLocations,
            updateLocation: updateLocation
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', locationService]);

})();