(function () {
    'use strict';

    var serviceId = 'patientService';

    function patientService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets) {
        var dataCacheKey = 'localPatients';
        var itemCacheKey = 'contextPatient';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addPatient(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Patient";
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

        function deleteCachedPatient(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPatients = searchResults.entry;
                    searchResults.entry = _.remove(cachedPatients, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deletePatient(resourceId)
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

        function deletePatient(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatientEverything(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId + '/$everything')
                .then(function (results) {
                    var everything = {"patient": null, "summary": [], "history": []};
                    everything.history = _.remove(results.data.entry, function (item) {
                        return (item.resource.resourceType === 'AuditEvent');
                    });
                    everything.patient = _.remove(results.data.entry, function (item) {
                        return (item.resource.resourceType === 'Patient');
                    })[0];
                    everything.summary = results.data.entry;
                    deferred.resolve(everything);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPatient(hashKey) {
            function getPatient(searchResults) {
                var cachedPatient;
                var cachedPatients = searchResults.entry;
                for (var i = 0, len = cachedPatients.length; i < len; i++) {
                    if (cachedPatients[i].$$hashKey === hashKey) {
                        cachedPatient = cachedPatients[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedPatient.resourceId = (baseUrl + cachedPatient.resourceType + '/' + cachedPatient.id);
                        cachedPatient.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedPatient) {
                    deferred.resolve(cachedPatient);
                } else {
                    deferred.reject('Patient not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getPatient,
                function () {
                    deferred.reject('Patient search results not found in cache.');
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

        function getPatient(resourceId) {
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

        function getPatientContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPatientReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Patient?name=' + input + '&_count=20')
                .then(function (results) {
                    var patients = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Patient') {
                                    patients.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (patients.length === 0) {
                        patients.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(patients);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchPatients(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Patient?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatients(baseUrl, searchFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(searchFilter) && searchFilter.length > 1) {
                var names = searchFilter.split(' ');
                if (names.length === 1) {
                    params = 'name=' + names[0];
                } else {
                    params = 'given=' + names[0] + '&family=' + names[1];
                }
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Patient?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatientsByLink(url) {
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

        function initializeNewPatient() {
            return {
                "resourceType": "Patient",
                "name": [],
                "identifier": [],
                "gender": undefined,
                "birthDate": undefined,
                "maritalStatus": undefined,
                "multipleBirth": false,
                "telecom": [],
                "address": [],
                "photo": [],
                "communication": [],
                "managingOrganization": null,
                "careProvider": [],
                "contact": [],
                "link": [],
                "extension": []
            };
        }

        function setPatientContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePatient(resourceVersionId, resource) {
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

        function seedRandomPatients(organizationId, organizationName) {
            var deferred = $q.defer();
            var birthPlace = [];
            var mothersMaiden = [];
            $http.get('http://api.randomuser.me/?results=25&nat=us')
                .success(function (data) {
                    angular.forEach(data.results, function (result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Patient",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": _randomBirthDate(),
                            "contact": [],
                            "communication": _randomCommunication(),
                            "maritalStatus": _randomMaritalStatus(),
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
                                {
                                    "system": "urn:oid:2.16.840.1.113883.4.1",
                                    "value": user.SSN,
                                    "use": "secondary",
                                    "assigner": {"display": "Social Security Administration"}
                                },
                                {
                                    "system": "urn:oid:2.16.840.1.113883.15.18",
                                    "value": user.registered,
                                    "use": "official",
                                    "assigner": {"display": organizationName}
                                },
                                {
                                    "system": "urn:fhir-cloud:patient",
                                    "value": common.randomHash(),
                                    "use": "secondary",
                                    "assigner": {"display": "FHIR Cloud"}
                                }
                            ],
                            "managingOrganization": {
                                "reference": "Organization/" + organizationId,
                                "display": organizationName
                            },
                            "link": [],
                            "active": true,
                            "extension": []
                        };
                        resource.extension.push(_randomRace());
                        resource.extension.push(_randomEthnicity());
                        resource.extension.push(_randomReligion());
                        resource.extension.push(_randomMothersMaiden(mothersMaiden));
                        resource.extension.push(_randomBirthPlace(birthPlace));

                        mothersMaiden.push($filter('titleCase')(user.name.last));
                        birthPlace.push(resource.address[0].city + ', ' + $filter('abbreviateState')(user.location.state));

                        var timer = $timeout(function () {
                        }, 3000);
                        timer.then(function () {
                            addPatient(resource).then(function (results) {
                                logInfo("Created patient " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create patient " + user.name.first + " " + user.name.last, error, false);
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

        function _randomMothersMaiden(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName",
                "valueString": ''
            };
            if (array.length > 0) {
                common.shuffle(array);
                extension.valueString = array[0];
            } else {
                extension.valueString = "Gibson";
            }
            return extension;
        }

        function _randomBirthDate() {
            var start = new Date(1945, 1, 1);
            var end = new Date(1995, 12, 31);
            var randomDob = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            return $filter('date')(randomDob, 'yyyy-MM-dd');
        }

        function _randomBirthPlace(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/birthPlace",
                "valueAddress": null
            };
            if (array.length > 0) {
                common.shuffle(array);
                var parts = array[0].split(",");
                extension.valueAddress = {"text": array[0], "city": parts[0], "state": parts[1], "country": "USA"};
            } else {
                extension.valueAddress = {"text": "New York, NY", "city": "New York", "state": "NY", "country": "USA"};
            }
            return extension;
        }

        function _randomRace() {
            var races = localValueSets.race();
            common.shuffle(races.concept);
            var race = races.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
                "valueCodeableConcept": {"coding": [], "text": race.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": races.system,
                "code": race.code,
                "display": race.display
            });
            return extension;
        }

        var allEthnicities = [];
        var ethnicitySystem = '';

        function _randomEthnicity() {
            function prepEthnicities() {
                var ethnicities = localValueSets.ethnicity();
                ethnicitySystem = ethnicities.system;
                for (var i = 0, main = ethnicities.concept.length; i < main; i++) {
                    var mainConcept = ethnicities.concept[i];
                    allEthnicities.push(mainConcept);
                    if (angular.isDefined(mainConcept.concept) && angular.isArray(mainConcept.concept)) {
                        for (var j = 0, group = mainConcept.concept.length; j < group; j++) {
                            var groupConcept = mainConcept.concept[j];
                            allEthnicities.push(groupConcept);
                            if (angular.isDefined(groupConcept.concept) && angular.isArray(groupConcept.concept)) {
                                for (var k = 0, leaf = groupConcept.concept.length; k < leaf; k++) {
                                    var leafConcept = groupConcept.concept[k];
                                    allEthnicities.push(leafConcept);
                                }
                            }
                        }
                    }

                }
            }

            if (allEthnicities.length === 0) {
                prepEthnicities();
            }
            common.shuffle(allEthnicities);
            var ethnicity = allEthnicities[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
                "valueCodeableConcept": {"coding": [], "text": ethnicity.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": ethnicitySystem,
                "code": ethnicity.code,
                "display": ethnicity.display
            });
            return extension;
        }

        function _randomReligion() {
            var religions = localValueSets.religion();
            common.shuffle(religions.concept);
            var religion = religions.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-religion",
                "valueCodeableConcept": {"coding": [], "text": religion.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": religions.system,
                "code": religion.code,
                "display": religion.display
            });
            return extension;
        }

        function _randomCommunication() {
            var languages = localValueSets.iso6391Languages();
            common.shuffle(languages);

            var communication = [];
            var primaryLanguage = {"language": {"text": languages[1].display, "coding": []}, "preferred": true};
            primaryLanguage.language.coding.push({
                "system": languages[1].system,
                "code": languages[1].code,
                "display": languages[1].display
            });
            communication.push(primaryLanguage);
            return communication;
        }

        function _randomMaritalStatus() {
            var maritalStatuses = localValueSets.maritalStatus();
            common.shuffle(maritalStatuses);
            var maritalStatus = maritalStatuses[1];
            var concept = {
                "coding": [], "text": maritalStatus.display
            };
            concept.coding.push({
                "system": maritalStatus.system,
                "code": maritalStatus.code,
                "display": maritalStatus.display
            });
            return concept;
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
            if (angular.isDefined(resource.maritalStatus)) {
                if (angular.isUndefined(resource.maritalStatus.coding) || resource.maritalStatus.coding.length === 0) {
                    resource.maritalStatus = null;
                }
            }
            return $q.when(resource);
        }

        var service = {
            addPatient: addPatient,
            clearCache: clearCache,
            deleteCachedPatient: deleteCachedPatient,
            deletePatient: deletePatient,
            getCachedPatient: getCachedPatient,
            getCachedSearchResults: getCachedSearchResults,
            getPatient: getPatient,
            getPatientContext: getPatientContext,
            getPatientReference: getPatientReference,
            getPatients: getPatients,
            getPatientsByLink: getPatientsByLink,
            getPatientEverything: getPatientEverything,
            initializeNewPatient: initializeNewPatient,
            setPatientContext: setPatientContext,
            updatePatient: updatePatient,
            seedRandomPatients: seedRandomPatients,
            searchPatients: searchPatients
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets',
        patientService]);
})
();