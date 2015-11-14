(function () {
    'use strict';

    var controllerId = 'patientDetail';

    function patientDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, addressService,
                           attachmentService, common, config, patientDemographicsService, fhirServers, humanNameService,
                           identifierService, organizationService, patientService, contactPointService,
                           communicationService, patientCareProviderService, observationService, patientContactService,
                           medicationStatementService, conditionService, procedureService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var $q = common.$q;
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId).then(function () {
                _getRequestedPatient();
            });
        }

        function deletePatient(patient, event) {
            function executeDelete() {
                if (patient && patient.resourceId && patient.hashKey) {
                    patientService.deleteCachedPatient(patient.hashKey, patient.resourceId)
                        .then(function () {
                            logInfo("Deleted patient " + patient.fullName);
                            $location.path('/patient');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + patient.fullName + '?')
                .ariaLabel('delete patient')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + patient.fullName);
                });
        }

        vm.delete = deletePatient;

        function edit(patient) {
            if (patient && patient.hashKey) {
                $location.path('/patient/' + patient.hashKey);
            }
        }

        vm.edit = edit;

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function _getEverything(patientId) {
            patientService.getPatientEverything(patientId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logSuccess("Retrieved everything for patient " + patientId + ".");
                }, function (error) {
                    logWarning(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getObservations(patientId) {
            var deferred = $q.defer();
            observationService.getObservations(vm.activeServer.baseUrl, null, patientId)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) +
                        ' Observations from ' + vm.activeServer.name + '.');
                    common.changeObservationList(data);
                    deferred.resolve();
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error, noToast);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function _getMedicationStatements(patientId) {
            medicationStatementService.getMedicationStatements(vm.activeServer.baseUrl, null, patientId)
                .then(function (data) {
                    vm.medications = data.entry;
                    logSuccess("Retrieved medication statements for patient " + patientId, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logWarning(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getConditions(patientId) {
            conditionService.getConditions(vm.activeServer.baseUrl, null, patientId)
                .then(function (data) {
                    vm.conditions = data.entry;
                    logSuccess("Retrieved conditions for patient " + patientId, null, noToast);
                }, function (error) {
                    logWarning(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getProcedures(patientId) {
            procedureService.getProcedures(vm.activeServer.baseUrl, null, patientId)
                .then(function (data) {
                    vm.procedures = data.entry;
                    logSuccess("Retrieved procedures for patient " + patientId, null, noToast);
                }, function (error) {
                    logWarning(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedPatient() {
            function initializeAdministrationData(data) {
                vm.patient = data;
                humanNameService.init(vm.patient.name);
                patientDemographicsService.init(vm.patient.gender, vm.patient.maritalStatus);
                patientDemographicsService.initBirth(vm.patient.multipleBirthBoolean, vm.patient.multipleBirthInteger, vm.patient.birthDate);
                patientDemographicsService.initDeath(vm.patient.deceasedBoolean, vm.patient.deceasedDateTime);
                patientDemographicsService.initializeKnownExtensions(vm.patient.extension);
                vm.patient.race = patientDemographicsService.getRace();
                vm.patient.religion = patientDemographicsService.getReligion();
                vm.patient.ethnicity = patientDemographicsService.getEthnicity();
                vm.patient.mothersMaidenName = patientDemographicsService.getMothersMaidenName();
                vm.patient.birthPlace = patientDemographicsService.getBirthPlace();
                vm.patient.birthDate = patientDemographicsService.getBirthDate();
                vm.patient.deceasedDate = patientDemographicsService.getDeceasedDate();
                attachmentService.init(vm.patient.photo, "Photos");
                identifierService.init(vm.patient.identifier, "multi", "patient");
                addressService.init(vm.patient.address, true);
                contactPointService.init(vm.patient.telecom, true, true);
                patientCareProviderService.init(vm.patient.careProvider);
                patientCareProviderService.setManagingOrganization(vm.patient.managingOrganization);
                patientContactService.init(vm.patient.contact);
                if (vm.patient.communication) {
                    communicationService.init(vm.patient.communication, true);
                }
                vm.patient.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.patient.id)) {
                    vm.patient.resourceId = (vm.activeServer.baseUrl + '/Patient/' + vm.patient.id);
                }
                if (vm.patient.managingOrganization && vm.patient.managingOrganization.reference) {
                    var reference = vm.patient.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.patient.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.patient.managingOrganization.display)) {
                        vm.patient.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    patientService.setPatientContext(vm.patient);
                }
            }

            vm.patient = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                vm.patient = patientService.getPatientContext();
                if (common.isUndefinedOrNull(vm.patient) && angular.isUndefined($routeParams.id)) {
                    $location.path('/patient');
                } else {
                    vm.patient.hashKey = "current";
                    initializeAdministrationData(vm.patient);
                    _getClinicalData(vm.patient.id);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Patient/' + $routeParams.id;
                patientService.getPatient(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.patient) {
                            _getClinicalData(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = patientService.initializeNewPatient();
                initializeAdministrationData(data);
                vm.title = 'Add New Patient';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                patientService.getCachedPatient(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.patient && vm.patient.resourceId) {
                            _getClinicalData(vm.patient.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve patient lookup");
            }
        }

        function _getClinicalData(patientId)  {
        //    _getEverything(patientId);
            _getObservations(patientId);
            _getMedicationStatements(patientId);
            _getConditions(patientId);
            _getProcedures(patientId);
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Patient saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Patient saved at " + resourceVersionId + ".");
                    vm.patient.resourceVersionId = resourceVersionId;
                    vm.patient.resourceId = common.setResourceId(vm.patient.resourceId, resourceVersionId);
                }
                vm.patient.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                patientService.setPatientContext(vm.patient);
            }

            var patient = patientService.initializeNewPatient();
            if (humanNameService.getAll().length === 0) {
                logError("Patient must have at least one name.");
                return;
            }
            patient.name = humanNameService.mapFromViewModel();
            patient.photo = attachmentService.getAll();
            patient.birthDate = $filter('dateString')(patientDemographicsService.getBirthDate());
            patient.gender = patientDemographicsService.getGender();
            patient.maritalStatus = patientDemographicsService.getMaritalStatus();
            var birthOrder = patientDemographicsService.getBirthOrder();
            if (!(common.isUndefinedOrNull(birthOrder)) && birthOrder > 0) {
                patient.multipleBirthInteger = birthOrder;
            } else {
                patient.multipleBirthBoolean = patientDemographicsService.getMultipleBirth();
            }
            var deceasedDate = patientDemographicsService.getDeceasedDate();
            if (common.isUndefinedOrNull(deceasedDate) === false) {
                patient.deceasedDateTime = $filter('dateString')(deceasedDate);
            } else {
                patient.deceasedBoolean = patientDemographicsService.getDeceased();
            }
            patient.extension = patientDemographicsService.setKnownExtensions();
            patient.address = addressService.mapFromViewModel();
            patient.telecom = contactPointService.mapFromViewModel();
            patient.identifier = identifierService.getAll();
            patient.managingOrganization = patientCareProviderService.getManagingOrganization();
            patient.communication = communicationService.getAll();
            patient.careProvider = patientCareProviderService.getAll();
            patient.contact = patientContactService.getAll();
            patient.active = vm.patient.active;

            vm.isBusy = true;
            if (vm.isEditing) {
                patient.id = vm.patient.id;
                patientService.updatePatient(vm.patient.resourceId, patient)
                    .then(function (result) {
                        processResult(result);
                        patientService.setPatientContext(patient);
                    },
                    function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    })
                    .then(vm.isBusy = false);
            } else {
                patientService.addPatient(patient)
                    .then(function (result) {
                        processResult(result);
                        patientService.setPatientContext(patient);
                    },
                    function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    })
                    .then(vm.isBusy = false);
            }
        }

        vm.save = save;

        function showSource($event) {
            _showRawData(vm.patient, $event);
        }

        vm.showSource = showSource;

        function showAuditData($index, $event) {
            _showRawData(vm.history[$index], $event);
        }

        vm.showAuditData = showAuditData;

        function showClinicalData($index, $event) {
            _showRawData(vm.summary[$index], $event);
        }

        vm.showClinicalData = showClinicalData;

        function _showRawData(item, event) {
            $mdDialog.show({
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: item
                },
                targetEvent: event,
                clickOutsideToClose: true
            });
        }

        function canDelete() {
            return !vm.isEditing;
        }

        $scope.$on(config.events.serverChanged,
            function (event, server) {
                vm.activeServer = server;
            }
        );

        function canSave() {
            return !vm.isSaving;
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function actions($event) {
            $mdBottomSheet.show({
                parent: angular.element(document.getElementById('content')),
                templateUrl: './templates/resourceSheet.html',
                controller: ['$mdBottomSheet', ResourceSheetController],
                controllerAs: "vm",
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.index) {
                    case 0:
                        $location.path('/consultation');
                        break;
                    case 1:
                        $location.path('/lab');
                        break;
                    case 2:
                        $location.path('/smart');
                        break;
                    case 3:
                        $location.path('/patient');
                        break;
                    case 4:
                        $location.path('/patient/edit/current');
                        break;
                    case 5:
                        $location.path('/patient/edit/new');
                        break;
                    case 6:
                        $location.path('/patient/detailed-search');
                        break;
                    case 7:
                        deletePatient(vm.patient);
                        break;

                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Vitals', icon: 'vitals', index: 0},
                        {name: 'Lab', icon: 'lab', index: 1},
                        {name: 'SMART App', icon: 'smart', index: 2},
                        {name: 'Find another patient', icon: 'quickFind', index: 3},
                        {name: 'Edit patient', icon: 'edit', index: 4},
                        {name: 'Add new patient', icon: 'personAdd', index: 5},
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 6},
                        {name: 'Quick find', icon: 'quickFind', index: 3}
                    ];
                }
                this.title = 'Patient options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        vm.activeServer = null;
        vm.dataEvents = [];
        vm.errors = [];
        vm.history = [];
        vm.isBusy = false;
        vm.summary = [];
        vm.lookupKey = undefined;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.patient = undefined;
        vm.practitionerSearchText = '';
        vm.selectedPractitioner = null;
        vm.title = 'Patient Detail';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope',
            'addressService', 'attachmentService', 'common', 'config', 'patientDemographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'patientService', 'contactPointService',
            'communicationService', 'patientCareProviderService', 'observationService', 'patientContactService',
            'medicationStatementService', 'conditionService', 'procedureService', patientDetail]);
})();