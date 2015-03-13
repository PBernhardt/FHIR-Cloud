(function () {
    'use strict';

    var serviceId = 'relatedPersonService';

    function relatedPersonService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localRelatedPersons';
        var itemCacheKey = 'contextRelatedPerson';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addRelatedperson(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/relatedPerson";
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

        function deleteCachedRelatedperson(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedRelatedpersons = searchResults.entry;
                    searchResults.entry = _.remove(cachedRelatedpersons, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteRelatedperson(resourceId)
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

        function deleteRelatedperson(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedRelatedperson(hashKey) {
            function getRelatedperson(searchResults) {
                var cachedRelatedperson;
                var cachedRelatedpersons = searchResults.entry;
                for (var i = 0, len = cachedRelatedpersons.length; i < len; i++) {
                    if (cachedRelatedpersons[i].$$hashKey === hashKey) {
                        cachedRelatedperson = cachedRelatedpersons[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedRelatedperson.resourceId = (searchResults.base + cachedRelatedperson.resourceType + '/' + cachedRelatedperson.id);
                        cachedRelatedperson.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedRelatedperson) {
                    deferred.resolve(cachedRelatedperson);
                } else {
                    deferred.reject('Relatedperson not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getRelatedperson,
                function () {
                    deferred.reject('Relatedperson search results not found in cache.');
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

        function getRelatedperson(resourceId) {
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

        function getRelatedpersonContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getRelatedpersonReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Relatedperson/?name=' + input + '&_count=20&_summary=true')
                .then(function (results) {
                    var Relatedpersons = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Relatedperson') {
                                    //  var display = com
                                    Relatedpersons.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (Relatedpersons.length === 0) {
                        Relatedpersons.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(Relatedpersons);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getRelatedpersons(baseUrl, nameFilter, organizationId) {
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

            fhirClient.getResource(baseUrl + '/Relatedperson?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedNewRelatedperson() {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me')
                .success(function (data) {
                    var user = data.results[0].user;
                    var resource = {
                        "resourceType": "Relatedperson",
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
                    var randomRelatedperson = {"resource": resource};
                    deferred.resolve(randomRelatedperson.resource);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function initializeRelatedperson() {
            var data = {};
            data.resource = {
                "resourceType": "Relatedperson",
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

        function seedRandomRelatedpersons(resourceId, organizationName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=100')
                .success(function (data) {
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Relatedperson",
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
                            addRelatedperson(resource).then(function (results) {
                                logInfo("Created relatedPerson " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create relatedPerson " + user.name.first + " " + user.name.last, error, false);
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

        function setRelatedpersonContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateRelatedperson(resourceVersionId, resource) {
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
            addRelatedperson: addRelatedperson,
            clearCache: clearCache,
            deleteCachedRelatedperson: deleteCachedRelatedperson,
            deleteRelatedperson: deleteRelatedperson,
            getCachedRelatedperson: getCachedRelatedperson,
            getCachedSearchResults: getCachedSearchResults,
            getRelatedperson: getRelatedperson,
            getRelatedpersonContext: getRelatedpersonContext,
            getRelatedpersonReference: getRelatedpersonReference,
            getRelatedpersons: getRelatedpersons,
            initializeRelatedperson: initializeRelatedperson,
            seedNewRelatedperson: seedNewRelatedperson,
            seedRandomRelatedpersons: seedRandomRelatedpersons,
            setRelatedpersonContext: setRelatedpersonContext,
            updateRelatedperson: updateRelatedperson
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        relatedPersonService]);
})();