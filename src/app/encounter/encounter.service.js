(function () {
    'use strict';

    var serviceId = 'encounterService';

    function encounterService($filter, $window, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localEncounters';
        var _encounterContext = undefined;
        var $q = common.$q;

        function addEncounter(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Encounter";
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

        function deleteCachedEncounter(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedEncounters = searchResults.entry;
                    searchResults.entry = _.remove(cachedEncounters, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteEncounter(resourceId)
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

        function deleteEncounter(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedEncounter(hashKey) {
            function getEncounter(searchResults) {
                var cachedEncounter;
                var cachedEncounters = searchResults.entry;
                for (var i = 0, len = cachedEncounters.length; i < len; i++) {
                    if (cachedEncounters[i].$$hashKey === hashKey) {
                        cachedEncounter = cachedEncounters[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedEncounter.resourceId = (baseUrl + cachedEncounter.resourceType + '/' + cachedEncounter.id);
                        cachedEncounter.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedEncounter) {
                    setEncounterContext(cachedEncounter);
                    deferred.resolve(cachedEncounter);
                } else if (getEncounterContext() !== undefined) {
                    deferred.resolve(_encounterContext);
                } else {
                    deferred.reject('Encounter not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getEncounter,
                function () {
                    deferred.reject('Encounter search results not found in cache.');
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

        function getEncounter(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    setEncounterContext(data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getEncounterContext() {
            _encounterContext = undefined;
            if ($window.localStorage.encounter && ($window.localStorage.encounter !== null)) {
                _encounterContext = {"resource": JSON.parse($window.localStorage.encounter)};
            }
            return _encounterContext;
        }

        function getEncounterReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Encounter?name=' + input + '&_count=20')
                .then(function (results) {
                    var encounters = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Encounter') {
                                    encounters.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (encounters.length === 0) {
                        encounters.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(encounters);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchEncounters(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Encounter?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getEncountersByLink(url) {
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

        function initializeNewEncounter() {
            return {
                "resourceType": "Encounter",
                "identifier": [],
                "status": null,
                "statusHistory": [
                    {
                        "status": null,
                        "period": null
                    }
                ],
                "class": null,
                "type": [],
                "patient": null,
                "episodeOfCare": null,
                "incomingReferralRequest": [],
                "participant": [
                    {
                        "type": [],
                        "period": null,
                        "individual": null
                    }
                ],
                "fulfills": null,
                "period": null,
                "length": null,
                "reason": [],
                "indication": [],
                "priority": null,
                "hospitalization": {
                    "preAdmissionIdentifier": null,
                    "origin": null,
                    "admitSource": null,
                    "dietPreference": null,
                    "specialCourtesy": [],
                    "specialArrangement": [],
                    "destination": null,
                    "dischargeDisposition": null,
                    "dischargeDiagnosis": null,
                    "reAdmission": false
                },
                "location": [
                    {
                        "location": null,
                        "status": null,
                        "period": null
                    }
                ],
                "serviceProvider": null,
                "partOf": null
            };
        }

        function _prepArrays(resource) {
            if (resource.statusHistory && resource.statusHistory.length === 0) {
                resource.statusHistory = null;
            }
            if (resource.type && resource.type.length === 0) {
                resource.type = null;
            }
            if (resource.incomingReferralRequest && resource.incomingReferralRequest.length === 0) {
                resource.incomingReferralRequest = null;
            }
            if (resource.participant && resource.participant.length === 0) {
                resource.participant = null;
            }
            if (resource.reason.length === 0) {
                resource.reason = null;
            }
            if (resource.indication.length === 0) {
                resource.indication = null;
            }
            if (resource.hospitalization && resource.hospitalization.specialArrangement.length === 0) {
                resource.hospitalization.specialArrangement = null;
            }
            if (resource.hospitalization && resource.hospitalization.specialCourtesy.length === 0) {
                resource.hospitalization.specialCourtesy = null;
            }
            if (resource.location && resource.location.length === 0) {
                resource.location = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            return $q.when(resource);
        }

        function setEncounterContext(data) {
            $window.localStorage.encounter = JSON.stringify(data);
        }

        function updateEncounter(resourceVersionId, resource) {
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

        var service = {
            addEncounter: addEncounter,
            clearCache: clearCache,
            deleteCachedEncounter: deleteCachedEncounter,
            deleteEncounter: deleteEncounter,
            getCachedEncounter: getCachedEncounter,
            getCachedSearchResults: getCachedSearchResults,
            getEncounter: getEncounter,
            getEncounterContext: getEncounterContext,
            getEncounterReference: getEncounterReference,
            getEncountersByLink: getEncountersByLink,
            initializeNewEncounter: initializeNewEncounter,
            setEncounterContext: setEncounterContext,
            updateEncounter: updateEncounter,
            searchEncounters: searchEncounters
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$window', 'common', 'dataCache', 'fhirClient',
        'fhirServers', encounterService]);
})
();