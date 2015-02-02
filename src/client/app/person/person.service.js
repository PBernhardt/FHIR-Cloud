(function () {
    'use strict';

    var serviceId = 'personService';

    function personService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localPersons';
        var itemCacheKey = 'contextPerson';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addPerson(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Person";
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

        function deleteCachedPerson(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPersons = searchResults.entry;
                    searchResults.entry = _.remove(cachedPersons, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deletePerson(resourceId)
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

        function deletePerson(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPerson(hashKey) {
            function getPerson(searchResults) {
                var cachedPerson;
                var cachedPersons = searchResults.entry;
                for (var i = 0, len = cachedPersons.length; i < len; i++) {
                    if (cachedPersons[i].$$hashKey === hashKey) {
                        cachedPerson = cachedPersons[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedPerson.resourceId = (searchResults.base + cachedPerson.resourceType + '/' + cachedPerson.id);
                        cachedPerson.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedPerson) {
                    deferred.resolve(cachedPerson);
                } else {
                    deferred.reject('Person not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getPerson,
                function () {
                    deferred.reject('Person search results not found in cache.');
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

        function getPerson(resourceId) {
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

        function getPersonContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPersonReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Person/?name=' + input + '&_count=20&_summary=true')
                .then(function (results) {
                    var Persons = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Person') {
                                    //  var display = com
                                    Persons.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (Persons.length === 0) {
                        Persons.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(Persons);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPersons(baseUrl, nameFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(nameFilter) && nameFilter.length > 1) {
                var names = nameFilter.split(' ');
                if (names.length === 1) {
                    params = 'name=' + names[0];
                } else {
                    params = 'given=' + names[0] + '&family=' + names[1];
                }
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization:Organization=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Person?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedNewPerson() {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me')
                .success(function (data) {
                    var user = data.results[0].user;
                    var resource = {
                        "resourceType": "Person",
                        "name": [{
                            "family": [$filter('titleCase')(user.name.last)],
                            "given": [$filter('titleCase')(user.name.first)],
                            "prefix": [$filter('titleCase')(user.name.title)],
                            "use": "usual"
                        }],
                        "gender": user.gender,
                        "birthDate": new Date(parseInt(user.dob)),
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
                        "photo": {"url": user.picture.large},
                        "identifier": [{"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official"}],
                        "managingOrganization": null,
                        "link": [],
                        "active": true
                    };
                    var randomPerson = {"resource": resource};
                    deferred.resolve(randomPerson.resource);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function initializePerson() {
            var data = {};
            data.resource = {
                "resourceType": "Person",
                "name": [],
                "gender": undefined,
                "birthDate": undefined,
                "telecom": [],
                "address": [],
                "photo": undefined,
                "identifier": [],
                "managingOrganization": undefined,
                "link": [],
                "active": true
            };
            return data;
        }

        function seedRandomPersons(resourceId, organizationName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=100')
                .success(function (data) {
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Person",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
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
                            "photo": {"url": user.picture.large},
                            "identifier": [
                                {"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official", "label":"Social Security Number", "assigner": {"display" : "Social Security Administration"}},
                                {"system": "urn:oid:2.16.840.1.113883.15.34", "value": user.registered, "use": "official", "label": organizationName + " master Id", "assigner": {"reference": resourceId, "display": organizationName}}
                            ],
                            "managingOrganization": { "reference": resourceId, "display": organizationName },
                            "link": [],
                            "active": true
                        };
                        var timer = $timeout(function () {}, 5000);
                        timer.then(function () {
                            addPerson(resource).then(function (results) {
                                logInfo("Created person " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create person " + user.name.first + " " + user.name.last, error, false);
                            })
                        })
                    });
                    deferred.resolve();
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function setPersonContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePerson(resourceVersionId, resource) {
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

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            return $q.when(resource);
        }


        var service = {
            addPerson: addPerson,
            clearCache: clearCache,
            deleteCachedPerson: deleteCachedPerson,
            deletePerson: deletePerson,
            getCachedPerson: getCachedPerson,
            getCachedSearchResults: getCachedSearchResults,
            getPerson: getPerson,
            getPersonContext: getPersonContext,
            getPersonReference: getPersonReference,
            getPersons: getPersons,
            initializePerson: initializePerson,
            seedNewPerson: seedNewPerson,
            seedRandomPersons: seedRandomPersons,
            setPersonContext: setPersonContext,
            updatePerson: updatePerson
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        personService]);
})();