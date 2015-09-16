(function () {
    'use strict';

    var serviceId = 'practitionerService';

    function practitionerService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets,
                                 practitionerValueSets, store) {
        var dataCacheKey = 'localPractitioners';
        var itemCacheKey = 'contextPractitioner';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var _practitionerContext = undefined;
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

        function getCachedPractitioner(hashKey) {
            function getPractitioner(searchResults) {
                var cachedPractitioner;
                var cachedPractitioners = searchResults.entry;
                for (var i = 0, len = cachedPractitioners.length; i < len; i++) {
                    if (cachedPractitioners[i].$$hashKey === hashKey) {
                        cachedPractitioner = cachedPractitioners[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedPractitioner.resourceId = (baseUrl + cachedPractitioner.resourceType + '/' + cachedPractitioner.id);
                        cachedPractitioner.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedPractitioner) {
                    deferred.resolve(cachedPractitioner);
                } else if (getPractitionerContext()){
                    deferred.resolve(_practitionerContext);
                } else {
                    deferred.reject('Practitioner not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
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
            _practitionerContext = store.get('practitioner');
            return _practitionerContext;
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

        function searchPractitioners(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Practitioner?' + searchFilter + '&_count=20&_sort:asc=family')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitioners(baseUrl, searchFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Practitioner?' + params + '&_count=20&_sort:asc=family')
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
                resourceType: "Practitioner",
                identifier: [],
                name: null,
                telecom: [],
                address: [],
                gender: null,
                birthDate: null,
                photo: [],
                practitionerRole: [{
                    managingOrganization: null,
                    role: null,
                    specialty: [],
                    period: null,
                    location: [],
                    healthcareService: []
                }],
                qualification: [{
                    identifier: [],
                    code: null,
                    period: null,
                    issuer: null
                }],
                communication: []
            };
        }

        function _prepArrays(resource) {
            if (common.isUndefinedOrNull(resource.address) || resource.address.length === 0) {
                resource.address = null;
            }
            if (common.isUndefinedOrNull(resource.identifier) || resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (common.isUndefinedOrNull(resource.telecom) || resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (common.isUndefinedOrNull(resource.photo) || resource.photo.length === 0) {
                resource.photo = null;
            }
            if (common.isUndefinedOrNull(resource.communication) || resource.communication.length === 0) {
                resource.communication = null;
            }
            if (common.isUndefinedOrNull(resource.qualification) || resource.qualification.length === 0) {
                resource.qualification = null;
            }
            if (common.isUndefinedOrNull(resource.practitionerRole) || resource.practitionerRole.length === 0) {
                resource.practitionerRole = null;
            }
            return $q.when(resource);
        }

        function setPractitionerContext(data) {
            store.set('practitioner', data);
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

        function seedRandomPractitioners(organizationId, organizationName) {
            var deferred = $q.defer();
            var index = 1;
            $http.get('http://api.randomuser.me/?results=25&nat=us')
                .success(function (data) {
                    angular.forEach(data.results, function (result) {
                        var user = result.user;
                        var resource = {
                            resourceType: "Practitioner",
                            name: {
                                family: [$filter('titleCase')(user.name.last)],
                                given: [$filter('titleCase')(user.name.first)],
                                prefix: [$filter('titleCase')(user.name.title)],
                                use: "official"
                            },
                            gender: user.gender,
                            birthDate: _randomBirthDate(),
                            communication: _randomCommunication(index),
                            telecom: [
                                {system: "email", value: user.email, use: "work"},
                                {system: "phone", value: user.cell, use: "mobile"},
                                {system: "phone", value: user.phone, use: "work"}],
                            address: [{
                                line: [$filter('titleCase')(user.location.street)],
                                city: $filter('titleCase')(user.location.city),
                                state: $filter('abbreviateState')(user.location.state),
                                postalCode: user.location.zip,
                                use: "work"
                            }],
                            photo: [{url: user.picture.large}],
                            identifier: [
                                {
                                    system: "urn:oid:2.16.840.1.113883.4.1",
                                    value: user.SSN,
                                    type: {
                                        text: "Social Security number",
                                        coding: [{
                                            code: "SS",
                                            display: "Social Security number",
                                            system: "http://hl7.org/fhir/v2/0203"
                                        }]
                                    },
                                    assigner: {display: "Social Security Administration"}
                                },
                                {
                                    system: "urn:oid:2.16.840.1.113883.15.18",
                                    value: user.registered,
                                    type: {
                                        text: organizationName + " provider number",
                                        coding: [{
                                            system: "http://hl7.org/fhir/v2/0203",
                                            code: "PRN",
                                            display: "Provider number"
                                        }]
                                    },
                                    assigner: {display: organizationName}
                                },
                                {
                                    system: "urn:fhir-cloud:practitioner",
                                    value: common.randomHash(),
                                    type: {
                                        text: organizationName + " identifier"
                                    },
                                    assigner: {display: "FHIR Cloud"}
                                }
                            ],
                            active: true,
                            practitionerRole: _randomRole(organizationName, organizationId, index)
                        };
                        index = index + 1;
                        var timer = $timeout(function () {
                        }, 3000);
                        timer.then(function () {
                            addPractitioner(resource).then(function (results) {
                                logInfo("Created practitioner " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create practitioner " + user.name.first + " " + user.name.last, error, false);
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

        function _randomRole(organizationName, organizationId, index) {
            var practitionerRoles = practitionerValueSets.practitionerRole();
            var practitionerSpecialties = practitionerValueSets.practitionerSpecialty();
            var doctorRole = _.find(practitionerRoles.concept, function (item) {
                return item.code === "doctor"
            });
            var role = undefined;
            if (index % 2 === 0) {
                common.shuffle(practitionerRoles.concept);
                role = {
                    text: practitionerRoles.concept[0].display, coding: [{
                        system: practitionerRoles.system,
                        code: practitionerRoles.concept[0].code,
                        display: practitionerRoles.concept[0].display
                    }]
                };
            } else {
                role = {
                    text: doctorRole.display, coding: [{
                        system: practitionerRoles.system,
                        code: doctorRole.code,
                        display: doctorRole.display
                    }]
                }
            }

            var specialties = [];

            if (role.coding[0].code === "doctor") {
                common.shuffle(practitionerSpecialties.concept);
                var specialty = {
                    text: practitionerSpecialties.concept[0].display,
                    coding: [{
                        system: practitionerSpecialties.system,
                        code: practitionerSpecialties.concept[0].code,
                        display: practitionerSpecialties.concept[0].display
                    }]
                };
                specialties.push(specialty);

                if (angular.isDefined(practitionerSpecialties.concept[0].concept)) {
                    var subSpecialties = practitionerSpecialties.concept[0].concept;
                    common.shuffle(subSpecialties);
                    var subSpecialty = {
                        text: subSpecialties[0].display,
                        coding: [{
                            system: practitionerSpecialties.system,
                            code: subSpecialties[0].code,
                            display: subSpecialties[0].display
                        }]
                    };
                    specialties.push(subSpecialty);

                    if (angular.isDefined(subSpecialties[0].concept)) {
                        var finalSpecialties = subSpecialties[0].concept;
                        common.shuffle(finalSpecialties);
                        var finalSpecialty = {
                            text: finalSpecialties[0].display,
                            coding: [{
                                system: practitionerSpecialties.system,
                                code: finalSpecialties[0].code,
                                display: finalSpecialties[0].display
                            }]
                        };
                        specialties.push(finalSpecialty);
                    }
                }
            }

            return [{
                managingOrganization: {
                    reference: "Organization/" + organizationId,
                    display: organizationName
                },
                role: role,
                specialty: specialties
                //todo Add random location
                // period: null,
                // location: [],
                // healthcareService: []
            }];
        }

        function _randomQualification() {

        }

        function _randomBirthDate() {
            var start = new Date(1940, 1, 1);
            var end = new Date(1987, 1, 1);
            var randomDob = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            return $filter('date')(randomDob, 'yyyy-MM-dd');
        }

        function _randomCommunication(index) {
            var languages = localValueSets.iso6391Languages();
            common.shuffle(languages);
            var english = {text: "English", coding: [{code: "en", display: "English", system: "urn:std:iso:639-1"}]};
            var spanish = {text: "Spanish", coding: [{code: "es", display: "Spanish", system: "urn:std:iso:639-1"}]};
            var communication = [];
            communication.push(english);
            var randomLanguage = {
                text: languages[1].display, coding: [{
                    system: languages[1].system,
                    code: languages[1].code,
                    display: languages[1].display
                }]
            };
            if (randomLanguage.coding[0].code !== "en" && (index % 5 === 0)) {
                communication.push(randomLanguage);
            }
            if (randomLanguage.coding[0].code !== "es" && (index % 3 === 0)) {
                communication.push(spanish);
            }
            return communication;
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
            setPractitionerContext: setPractitionerContext,
            getPractitionerReference: getPractitionerReference,
            getPractitioners: getPractitioners,
            getPractitionersByLink: getPractitionersByLink,
            initializeNewPractitioner: initializeNewPractitioner,
            updatePractitioner: updatePractitioner,
            seedRandomPractitioners: seedRandomPractitioners,
            searchPractitioners: searchPractitioners
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient',
        'fhirServers', 'localValueSets', 'practitionerValueSets', 'store' , practitionerService]);
})
();