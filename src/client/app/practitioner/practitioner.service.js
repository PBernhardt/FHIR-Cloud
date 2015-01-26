(function () {
    'use strict';

    var serviceId = 'practitionerService';

    function practitionerService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localPractitioners';
        var itemCacheKey = 'contextPractitioner';
        var $q = common.$q;

        function addPractitioner(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Practitioner";
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

        function deleteCachedPractitioner(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPractitioners = searchResults.entry;
                    searchResults.entry = _.remove(cachedPractitioners, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }
            var deferred = $q.defer();
            deletePractitioner(resourceId)
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

        function deletePractitioner(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitionerEverything(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId + '/$everything')
                .then(function (results) {
                    var everything = {"practitioner": null, "summary": [], "history": []};
                    everything.history = _.remove(results.data.entry, function(item) {
                       return (item.resource.resourceType === 'SecurityEvent');
                    });
                    everything.practitioner = _.remove(results.data.entry, function(item) {
                        return (item.resource.resourceType === 'Practitioner');
                    })[0];
                    everything.summary = results.data.entry;
                    deferred.resolve(everything);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPractitioner(hashKey) {
            function getPractitioner(searchResults) {
                var cachedPractitioner;
                var cachedPractitioners = searchResults.entry;
                for (var i = 0, len = cachedPractitioners.length; i < len; i++) {
                    if (cachedPractitioners[i].$$hashKey === hashKey) {
                        cachedPractitioner = cachedPractitioners[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedPractitioner.resourceId = (searchResults.base + cachedPractitioner.resourceType + '/' + cachedPractitioner.id);
                        cachedPractitioner.hashKey = cachedPractitioner.$$hashKey;
                        break;
                    }
                }
                if (cachedPractitioner) {
                    deferred.resolve(cachedPractitioner);
                } else {
                    deferred.reject('Practitioner not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getPractitioner,
                function () {
                    deferred.reject('Practitioner search results not found in cache.');
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

        function getPractitioner(resourceId) {
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

        function getPractitionerContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPractitionerReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Practitioner?name=' + input + '&_count=20')
                .then(function (results) {
                    var practitioners = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Practitioner') {
                                    practitioners.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (practitioners.length === 0) {
                        practitioners.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(practitioners);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitioners(baseUrl, nameFilter) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter)) {
                deferred.reject('Invalid search input');
            }
            var names = nameFilter.split(' ');
            if (names.length === 1) {
                params = 'name=' + names[0];
            } else {
                params = 'given=' + names[0] + '&family=' + names[1];
            }

            fhirClient.getResource(baseUrl + '/Practitioner?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitionersByLink(url) {
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

        function initializeNewPractitioner() {
            return {
                "resourceType": "Practitioner",
                "name": [],
                "gender": undefined,
                "birthDate": null,
                "maritalStatus": undefined,
                //              "multipleBirth": false,
                "telecom": [],
                "address": [],
                "photo": [],
                "communication": [],
                "managingpractitioner": null,
                "contact": [],
                "link": [],
                "active": true
            };
        }

        function setPractitionerContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePractitioner(resourceVersionId, resource) {
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

        function seedRandomPractitioners(resourceId, practitionerName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=10')
                .success(function (data) {
                    var count = 0;
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Practitioner",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
                            "contact": [],
                            "communication": [],
                            "maritalStatus": [],
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": [{"url": user.picture.large}],
                            "identifier": [
                                {"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official", "label":"Social Security Number", "assigner": {"display" : "Social Security Administration"}},
                                {"system": "urn:oid:2.16.840.1.113883.15.18", "value": user.registered, "use": "official", "label": practitionerName + " master Id", "assigner": {"reference": resourceId, "display": practitionerName}}
                            ],
                            "managingpractitioner": { "reference": resourceId, "display": practitionerName },
                            "link": [],
                            "active": true
                        };
                        $timeout(addPractitioner(resource).then(count = count + 1), 2000);

                    });
                    deferred.resolve(count + ' practitioners created for ' + practitionerName);
                })
                .error(function (error) {
                    deferred.reject(error);
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
            if (resource.photo.length === 0) {
                resource.photo = null;
            }
            if (resource.communication.length === 0) {
                resource.communication = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            if (resource.maritalStatus.coding && resource.maritalStatus.coding.length === 0) {
                resource.maritalStatus = null;
            }
            return $q.when(resource);
        }

        var service = {
            addPractitioner: addPractitioner,
            clearCache: clearCache,
            deleteCachedPractitioner: deleteCachedPractitioner,
            deletePractitioner: deletePractitioner,
            getCachedPractitioner: getCachedPractitioner,
            getCachedSearchResults: getCachedSearchResults,
            getPractitioner: getPractitioner,
            getPractitionerContext: getPractitionerContext,
            getPractitionerReference: getPractitionerReference,
            getPractitioners: getPractitioners,
            getPractitionersByLink: getPractitionersByLink,
            getPractitionerEverything: getPractitionerEverything,
            initializeNewPractitioner: initializeNewPractitioner,
            setPractitionerContext: setPractitionerContext,
            updatePractitioner: updatePractitioner,
            seedRandomPractitioners: seedRandomPractitioners
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        practitionerService]);
})();