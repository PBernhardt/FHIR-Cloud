(function () {
    'use strict';

    var serviceId = 'medicationStatementService';

    function medicationStatementService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets, fhirResourceBase) {
        var dataCacheKey = 'localMedicationStatements';
        var itemCacheKey = 'contextMedicationStatement';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addMedicationStatement(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/MedicationStatement";
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

        function deleteCachedMedicationStatement(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedMedicationStatements = searchResults.entry;
                    searchResults.entry = _.remove(cachedMedicationStatements, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteMedicationStatement(resourceId)
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

        function deleteMedicationStatement(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedMedicationStatement(hashKey) {
            function getMedicationStatement(searchResults) {
                var cachedMedicationStatement;
                var cachedMedicationStatements = searchResults.entry;
                for (var i = 0, len = cachedMedicationStatements.length; i < len; i++) {
                    if (cachedMedicationStatements[i].$$hashKey === hashKey) {
                        cachedMedicationStatement = cachedMedicationStatements[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedMedicationStatement.resourceId = (baseUrl + cachedMedicationStatement.resourceType + '/' + cachedMedicationStatement.id);
                        cachedMedicationStatement.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedMedicationStatement) {
                    deferred.resolve(cachedMedicationStatement);
                } else {
                    deferred.reject('MedicationStatement not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getMedicationStatement,
                function () {
                    deferred.reject('MedicationStatement search results not found in cache.');
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

        function getMedicationStatement(resourceId) {
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

        function getMedicationStatementContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getMedicationStatementReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/MedicationStatement?code=' + input + '&_count=20')
                .then(function (results) {
                    var medicationStatements = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'MedicationStatement') {
                                    medicationStatements.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (medicationStatements.length === 0) {
                        medicationStatements.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(medicationStatements);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchMedicationStatements(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/MedicationStatement?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getMedicationStatements(baseUrl, searchFilter, patientId) {
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

            fhirClient.getResource(baseUrl + '/MedicationStatement?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getMedicationStatementsByLink(url) {
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

        function initializeNewMedicationStatement() {

            var medicationStatement = fhirResourceBase.getBase();

            // DSTU2 1.0.2
            medicationStatement.resourceType = "MedicationStatement";
                medicationStatement.id = null;
                medicationStatement.identifier = []; // External identifier
                medicationStatement.patient = null; // R!  Who is/was taking  the medication
                medicationStatement.informationSource =  null;  //
                medicationStatement.dateAsserted = null; // When the statement was asserted?
                medicationStatement.status = "active"; // R!  active | completed | entered-in-error | intended
                medicationStatement.wasNotTaken = false; // True if medication is/was not being taken
                medicationStatement.reasonNotTaken = []; // C? True if asserting medication was not given
                // reasonForUse[x]: . "reasonForUseCodeableConcept": {}, or  "reasonForUseReference": {},
                // effective[x]: "effectiveDateTime": "" or "effectivePeriod": {},
                medicationStatement.note = null; // Further information about the statement
                medicationStatement.supportingInformation = []; // Additional supporting information
                // medication[x]: What medication was taken.  "medicationCodeableConcept": {} or "medicationReference": {},
                medicationStatement.dosage = [{ // Details of how medication was taken
                    text: null, // Reported dosage information
                    timing: null, // When/how often was medication taken
                    // Take "as needed" (for x).  "asNeededBoolean"  or "asNeededCodeableConcept": {},
                    // site[x]: Where (on body) medication is/was administered. One of these 2:
                    siteCodeableConcept: null,
                    siteReference: null,
                    route: null, // How the medication entered the body
                    method: null, // Technique used to administer medication
                    // quantity[x]: Amount administered in one dose.  "quantityQuantity": {}, or "quantityRange": {},
                    // rate[x]: Dose quantity per unit of time. One of these 2:
                    rateRatio: null,
                    rateRange: null,
                    maxDosePerPeriod: null // Maximum dose that was consumed per unit of time
                }];

            return medicationStatement;
        }

        function setMedicationStatementContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateMedicationStatement(resourceVersionId, resource) {
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

        function seedRandomMedicationStatements(patientId, patientName) {

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
            addMedicationStatement: addMedicationStatement,
            clearCache: clearCache,
            deleteCachedMedicationStatement: deleteCachedMedicationStatement,
            deleteMedicationStatement: deleteMedicationStatement,
            getCachedMedicationStatement: getCachedMedicationStatement,
            getCachedSearchResults: getCachedSearchResults,
            getMedicationStatement: getMedicationStatement,
            getMedicationStatementContext: getMedicationStatementContext,
            getMedicationStatementReference: getMedicationStatementReference,
            getMedicationStatements: getMedicationStatements,
            getMedicationStatementsByLink: getMedicationStatementsByLink,
            initializeNewMedicationStatement: initializeNewMedicationStatement,
            setMedicationStatementContext: setMedicationStatementContext,
            updateMedicationStatement: updateMedicationStatement,
            seedRandomMedicationStatements: seedRandomMedicationStatements,
            searchMedicationStatements: searchMedicationStatements
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets', 'fhirResourceBase',
        medicationStatementService]);
})();