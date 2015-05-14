(function () {
    'use strict';

    var controllerId = 'patientDetail';

    function patientDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, addressService,
                           attachmentService, common, config, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, patientService, contactPointService, practitionerService, communicationService,
                           careProviderService, observationService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
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
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function goToManagingOrganization(resourceReference) {
            var id = ($filter)('idFromURL')(resourceReference.reference);
            $location.path('/organization/get/' + id);
        }

        vm.goToManagingOrganization = goToManagingOrganization;

        function _getEverything() {
            patientService.getPatientEverything(vm.patient.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for patient at " + vm.patient.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.patient.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for patient " + vm.patient.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedPatient() {
            function initializeAdministrationData(data) {
                vm.patient = data;
                humanNameService.init(vm.patient.name);
                demographicsService.init(vm.patient.gender, vm.patient.maritalStatus, vm.patient.communication);
                demographicsService.initBirth(vm.patient.multipleBirthBoolean, vm.patient.multipleBirthInteger);
                demographicsService.initDeath(vm.patient.deceasedBoolean, vm.patient.deceasedDateTime);
                demographicsService.setBirthDate(vm.patient.birthDate);
                demographicsService.initializeKnownExtensions(vm.patient.extension);
                vm.patient.race = demographicsService.getRace();
                vm.patient.religion = demographicsService.getReligion();
                vm.patient.ethnicity = demographicsService.getEthnicity();
                vm.patient.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.patient.birthPlace = demographicsService.getBirthPlace();
                vm.patient.birthDate = demographicsService.getBirthDate();
                attachmentService.init(vm.patient.photo, "Photos");
                identifierService.init(vm.patient.identifier, "multi", "patient");
                addressService.init(vm.patient.address, true);
                contactPointService.init(vm.patient.telecom, true, true);
                careProviderService.init(vm.patient.careProvider);
                if (vm.patient.communication) {
                    communicationService.init(vm.patient.communication, "multi");
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
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Patient/' + $routeParams.id;
                patientService.getPatient(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.patient) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
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
                            _getEverything(vm.patient.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve patient lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Patient saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Patient saved at " + resourceVersionId);
                    vm.patient.resourceVersionId = resourceVersionId;
                    vm.patient.resourceId = common.setResourceId(vm.patient.resourceId, resourceVersionId);
                }
                vm.patient.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                patientService.setPatientContext(vm.patient);
                vm.isBusy = false;
            }

            var patient = patientService.initializeNewPatient();
            if (humanNameService.getAll().length === 0) {
                logError("Patient must have at least one name.");
                return;
            }
            patient.name = humanNameService.mapFromViewModel();
            patient.photo = attachmentService.getAll();

            patient.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            patient.gender = demographicsService.getGender();
            patient.maritalStatus = demographicsService.getMaritalStatus();
            patient.multipleBirthBoolean = demographicsService.getMultipleBirth();
            patient.multipleBirthInteger = demographicsService.getBirthOrder();
            patient.deceasedBoolean = demographicsService.getDeceased();
            patient.deceasedDateTime = demographicsService.getDeceasedDate();
            patient.race = demographicsService.getRace();
            patient.religion = demographicsService.getReligion();
            patient.ethnicity = demographicsService.getEthnicity();
            patient.mothersMaidenName = demographicsService.getMothersMaidenName();
            patient.birthPlace = demographicsService.getBirthPlace();

            patient.address = addressService.mapFromViewModel();
            patient.telecom = contactPointService.mapFromViewModel();
            patient.identifier = identifierService.getAll();
            patient.managingOrganization = vm.patient.managingOrganization;
            patient.communication = communicationService.getAll();
            patient.careProvider = careProviderService.getAll();

            patient.active = vm.patient.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                patient.id = vm.patient.id;
                patientService.updatePatient(vm.patient.resourceId, patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                patientService.addPatient(patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
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
                targetEvent: event
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
                        $location.path('/patient');
                        break;
                    case 3:
                        $location.path('/patient/edit/current');
                        break;
                    case 4:
                        $location.path('/patient/edit/new');
                        break;
                    case 5:
                        $location.path('/patient/detailed-search');
                        break;
                    case 6:
                        deletePatient(vm.patient);
                        break;
                    case 7:
                        $location.path('/smart');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Vitals', icon: 'vitals', index: 0},
                        {name: 'Lab', icon: 'lab', index: 1},
                        {name: 'Find another patient', icon: 'quickFind', index: 2},
                        {name: 'Edit patient', icon: 'edit', index: 3},
                        {name: 'Add new patient', icon: 'personAdd', index: 4},
                        {name: 'SMART App', icon: 'smart', index: 7}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 5},
                        {name: 'Quick find', icon: 'quickFind', index: 2}
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
            'addressService', 'attachmentService', 'common', 'config', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'patientService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', patientDetail]);
})();