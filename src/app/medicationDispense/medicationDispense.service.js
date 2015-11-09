(function () {
    'use strict';

    var serviceId = 'medicationDispenseService';

    function medicationDispenseService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets) {
        var dataCacheKey = 'localMedicationDispenses';
        var itemCacheKey = 'contextMedicationDispense';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addMedicationDispense(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/MedicationDispense";
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

        function deleteCachedMedicationDispense(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedMedicationDispenses = searchResults.entry;
                    searchResults.entry = _.remove(cachedMedicationDispenses, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteMedicationDispense(resourceId)
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

        function deleteMedicationDispense(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedMedicationDispense(hashKey) {
            function getMedicationDispense(searchResults) {
                var cachedMedicationDispense;
                var cachedMedicationDispenses = searchResults.entry;
                for (var i = 0, len = cachedMedicationDispenses.length; i < len; i++) {
                    if (cachedMedicationDispenses[i].$$hashKey === hashKey) {
                        cachedMedicationDispense = cachedMedicationDispenses[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedMedicationDispense.resourceId = (baseUrl + cachedMedicationDispense.resourceType + '/' + cachedMedicationDispense.id);
                        cachedMedicationDispense.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedMedicationDispense) {
                    deferred.resolve(cachedMedicationDispense);
                } else {
                    deferred.reject('MedicationDispense not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getMedicationDispense,
                function () {
                    deferred.reject('MedicationDispense search results not found in cache.');
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

        function getMedicationDispense(resourceId) {
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

        function getMedicationDispenseContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getMedicationDispenseReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/MedicationDispense?code=' + input + '&_count=20')
                .then(function (results) {
                    var medicationDispenses = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'MedicationDispense') {
                                    medicationDispenses.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (medicationDispenses.length === 0) {
                        medicationDispenses.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(medicationDispenses);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchMedicationDispenses(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/MedicationDispense?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getMedicationDispenses(baseUrl, searchFilter, patientId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(patientId)) {
                deferred.reject('Invalid search input');
            }


            if (angular.isDefined(patientId)) {
                var patientParam = 'patient=' + patientId;
                if (params.length > 1) {
                    params = params + '&' + patientParam;
                } else {
                    params = patientParam;
                }
            }

            fhirClient.getResource(baseUrl + '/MedicationDispense?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getMedicationDispensesByLink(url) {
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

        function initializeNewMedicationDispense() {
            return {
                "resourceType": "MedicationDispense",
                "code": null, // CodeableConcept

                // value[x]: Actual result. One of these 10:
                "valueQuantity": null,
                "valueCodeableConcept": null,
                "valueString": null,
                "valueRange": null,
                "valueRatio": null,
                "valueSampledData": null,
                "valueAttachment": null,
                "valueTime": null,
                "valueDateTime": null,
                "valuePeriod": null,

                "dataAbsentReason": null, // CodeableConcept
                "interpretation": null, // CodeableConcept
                "comments": null,

                // effective[x]: Physiologically Relevant time/time-period for medicationDispense. One of these 2:
                "effectiveDateTime": null,
                "effectivePeriod": null,

                "issued": null, // instant
                "status": null, // code: registered | preliminary | final | amended

                // bodySite[x]: Observed body part. One of these 2:
                "bodySiteCodeableConcept": null,
                "bodySiteReference": null, // Reference(BodySite),

                "method": null, // CodeableConcept
                "identifier": [{
                    "system": "urn:fhir-cloud:medicationDispense",
                    "value": common.randomHash(),
                    "use": "official",
                    "assigner": {"display": "FHIR Cloud"}
                }],
                "subject": null, // Reference(Patient | Group | Device | Location)
                "specimen": null, // Reference(Specimen)
                "performer": [], // [Reference(Practitioner | Organization | Patient | RelatedPerson)]
                "device": null, // Reference(Device | DeviceMetric)
                "encounter": null, // Reference(Encounter)

                "referenceRange": [
                    //   "low": null, // Quantity
                    //   "high": null, // Quantity
                    //   "meaning": null, // CodeableConcept
                    //   "age": null, // Range, applicable age range, if relevant
                    //   "text": null
                ],

                "related": [
                    //  "type": null, // code:  has-component | has-member | derived-from | sequel-to | replaces | qualified-by | interfered-by
                    //  "target": null // Reference(MedicationDispense)
                ]
            };
        }

        function setMedicationDispenseContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateMedicationDispense(resourceVersionId, resource) {
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

        function seedRandomMedicationDispenses(organizationId, organizationName) {
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
                            "resourceType": "MedicationDispense",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
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
                                    "use": "official",
                                    "label": "Social Security Number",
                                    "assigner": {"display": "Social Security Administration"}
                                },
                                {
                                    "system": "urn:oid:2.16.840.1.113883.15.18",
                                    "value": user.registered,
                                    "use": "official",
                                    "label": organizationName + " master Id",
                                    "assigner": {"display": organizationName}
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

                        mothersMaiden.push([$filter('titleCase')(user.name.last)]);
                        birthPlace.push(resource.address[0].city + ', ' + resource.address[0].state);

                        var timer = $timeout(function () {
                        }, 3000);
                        timer.then(function () {
                            addMedicationDispense(resource).then(function (results) {
                                logInfo("Created medicationDispense " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create medicationDispense " + user.name.first + " " + user.name.last, error, false);
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
                "url": "http://hl7.org/fhir/StructureDefinition/medicationDispense-mothersMaidenName",
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

        function _randomBirthPlace(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/birthPlace",
                "valueAddress": null
            };
            if (array.length > 0) {
                common.shuffle(array);
                extension.valueAddress = {"text": array[0]};
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

        function _randomEthnicity() {
            var ethnicities = localValueSets.ethnicity();
            common.shuffle(ethnicities.concept);
            var ethnicity = ethnicities.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
                "valueCodeableConcept": {"coding": [], "text": ethnicity.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": ethnicities.system,
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
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.performer.length === 0) {
                resource.performer = null;
            }
            if (resource.referenceRange.length === 0) {
                resource.referenceRange = null;
            }
            if (resource.related.length === 0) {
                resource.related = null;
            }
            return $q.when(resource);
        }

        var service = {
            addMedicationDispense: addMedicationDispense,
            clearCache: clearCache,
            deleteCachedMedicationDispense: deleteCachedMedicationDispense,
            deleteMedicationDispense: deleteMedicationDispense,
            getCachedMedicationDispense: getCachedMedicationDispense,
            getCachedSearchResults: getCachedSearchResults,
            getMedicationDispense: getMedicationDispense,
            getMedicationDispenseContext: getMedicationDispenseContext,
            getMedicationDispenseReference: getMedicationDispenseReference,
            getMedicationDispenses: getMedicationDispenses,
            getMedicationDispensesByLink: getMedicationDispensesByLink,
            initializeNewMedicationDispense: initializeNewMedicationDispense,
            setMedicationDispenseContext: setMedicationDispenseContext,
            updateMedicationDispense: updateMedicationDispense,
            seedRandomMedicationDispenses: seedRandomMedicationDispenses,
            searchMedicationDispenses: searchMedicationDispenses
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets',
        medicationDispenseService]);
})();