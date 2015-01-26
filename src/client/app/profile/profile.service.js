(function () {
    'use strict';

    var serviceId = 'profileService';

    function profileService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localProfiles';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addProfile(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Profile";
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

        function deleteCachedProfile(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedProfiles = searchResults.entry;
                for (var i = 0, len = cachedProfiles.length; i < len; i++) {
                    if (cachedProfiles[i].$$hashKey === hashKey) {
                        cachedProfiles.splice(i, 1);
                        searchResults.entry = cachedProfiles;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Profile not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteProfile(resourceId)
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

        function deleteProfile(resourceId) {
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

        function getCachedProfile(hashKey) {
            function getProfile(searchResults) {
                var cachedProfile;
                var cachedProfiles = searchResults.entry;
                cachedProfile = _.find(cachedProfiles, {'$$hashKey': hashKey});
                if (cachedProfile) {
                    deferred.resolve(cachedProfile);
                } else {
                    deferred.reject('Profile not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getProfile,
                function () {
                    deferred.reject('Profile search results not found in cache.');
                });
            return deferred.promise;
        }

        function getProfile(resourceId) {
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
        function getProfileReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Profile?type=' + input + '&_count=20')
                .then(function (results) {
                    var profiles = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                profiles.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (profiles.length === 0) {
                        profiles.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(profiles);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getProfiles(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Profile?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getProfilesByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "profiles": []};
                    var profiles = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Profile') {
                                    profiles.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (profiles.length === 0) {
                        profiles.push({display: "No matches", reference: ''});
                    }
                    searchResults.profiles = profiles;
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

        function initializeNewProfile() {
            var data = {};
            data.resource = {
                "resourceType": "Profile",
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

        function updateProfile(resourceVersionId, resource) {
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
            addProfile: addProfile,
            clearCache: clearCache,
            deleteCachedProfile: deleteCachedProfile,
            deleteProfile: deleteProfile,
            getCachedProfile: getCachedProfile,
            getCachedSearchResults: getCachedSearchResults,
            getProfile: getProfile,
            getProfiles: getProfiles,
            getProfilesByLink: getProfilesByLink,
            getProfileReference: getProfileReference,
            initializeNewProfile: initializeNewProfile,
            updateProfile: updateProfile
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', profileService]);

})();