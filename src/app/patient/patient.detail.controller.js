(function () {
    'use strict';

    var controllerId = 'patientDetail';

    function patientDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService, attachmentService,
                           common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, patientService, contactPointService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;


        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedPatient();
            });
        }

        function calculateAge(birthDate) {
            if (birthDate) {
                var ageDifMs = Date.now() - birthDate.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            } else {
                return undefined;
            }
        }

        function clearErrors() {
            $window.localStorage.errors = JSON.stringify([]);
            loadErrors();
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

        function loadErrors() {
            if ($window.localStorage.errors) {
                vm.errors = JSON.parse($window.localStorage.errors);
            }
        }

        $scope.$on('vitalsUpdateEvent',
            function (event, data) {
                var clone = _.cloneDeep(data);
                var dataEvent = {
                    "profile": clone.group.linkId,
                    "narrative": clone.$$narrative,
                    "date": clone.$$eventDate,
                    "user": clone.$$user,
                    "resourceid": clone.$$resourceId
                };
                vm.dataEvents.push(dataEvent);
                $window.localStorage.dataEvents = JSON.stringify(vm.dataEvents);
                loadErrors();
            }
        );

        function edit(patient) {
            if (patient && patient.hashKey) {
                $location.path('/patient/' + patient.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            vm.loadingOrganizations = true;
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingOrganizations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getEverything() {
            patientService.getPatientEverything(vm.patient.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for patient at " + vm.patient.resourceId, null, noToast);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(common.unexpectedOutcome(error));
                });
        }

        function getRequestedPatient() {
            function initializeAdministrationData(data) {
                vm.patient = data;
                humanNameService.init(vm.patient.name);
                demographicsService.init(vm.patient.gender, vm.patient.maritalStatus, vm.patient.communication);
                demographicsService.initBirth(vm.patient.multipleBirthBoolean, vm.patient.multipleBirthInteger);
                demographicsService.initDeath(vm.patient.deceasedBoolean, vm.patient.deceasedDateTime);
                demographicsService.setBirthDate(vm.patient.birthDate);
                attachmentService.init(vm.patient.photo, "Photos");
                identifierService.init(vm.patient.identifier);
                addressService.init(vm.patient.address, true);
                contactPointService.init(vm.patient.telecom, true, true);
                vm.patient.fullName = humanNameService.getFullName();
                if (vm.patient.managingOrganization && vm.patient.managingOrganization.reference) {
                    var reference = vm.patient.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.patient.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.patient.managingOrganization.display)) {
                        vm.patient.managingOrganization.display = reference;
                    }
                }
                vm.title = getTitle();
                $window.localStorage.patient = JSON.stringify(vm.patient);
            }

            vm.lookupKey = $routeParams.hashKey;
            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.patient) || $window.localStorage.patient === "null") {
                    if (angular.isUndefined($routeParams.id)) {
                        //redirect to search
                        $location.path('/patient');
                    }
                } else {
                    vm.patient = JSON.parse($window.localStorage.patient);
                    vm.patient.hashKey = "current";
                    initializeAdministrationData(vm.patient);
                }
            }
            if (vm.lookupKey === 'new') {
                var data = patientService.initializeNewPatient();
                initializeAdministrationData(data);
                vm.title = 'Add New Patient';
                vm.isEditing = false;
            } else {
                if (vm.lookupKey !== "current") {
                    patientService.getCachedPatient(vm.lookupKey)
                        .then(initializeAdministrationData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        }).then(function () {
                            getEverything(vm.patient.resourceId);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Patient/' + $routeParams.id;
                    patientService.getPatient(resourceId)
                        .then(initializeAdministrationData, function (error) {
                            logError(common.unexpectedOutcome(error));
                        });
                }
            }
        }

        function initStoredVitals() {
            if ($window.localStorage.vitals) {
                if ($window.localStorage.vitals.length > 0) {
                    vm.vitals = JSON.parse($window.localStorage.vitals);
                }
            }
            if ($window.localStorage.allergy) {
                if ($window.localStorage.allergy.length > 0) {
                    vm.history.allergy.list = JSON.parse($window.localStorage.allergy);
                }
            }
            if ($window.localStorage.medication) {
                if ($window.localStorage.medication.length > 0) {
                    vm.history.medication.list = JSON.parse($window.localStorage.medication);
                }
            }
            if ($window.localStorage.condition) {
                if ($window.localStorage.condition.length > 0) {
                    vm.history.condition.list = JSON.parse($window.localStorage.condition);
                }
            }
            if ($window.localStorage.dataEvents) {
                if ($window.localStorage.dataEvents.length > 0) {
                    vm.dataEvents = JSON.parse($window.localStorage.dataEvents);
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.patient) {
                title = 'Edit ' + (vm.patient.fullName || 'Unknown');
            } else {
                title = 'Add New Patient';
            }
            return title;

        }

        function goBack() {
            $location.path('/patients');
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
                vm.title = getTitle();
                $window.localStorage.patient = JSON.stringify(vm.patient);
                common.toggleProgressBar(false);
            }

            var patient = patientService.initializeNewPatient();
            if (humanNameService.getAll().length === 0) {
                logError("Patient must have at least one name.");
                return;
            }
            common.toggleProgressBar(true);
            patient.name = humanNameService.mapFromViewModel();
            patient.photo = attachmentService.getAll();
            patient.birthDate = demographicsService.getBirthDate();
            patient.gender = demographicsService.getGender();
            patient.maritalStatus = demographicsService.getMaritalStatus();
            patient.multipleBirthBoolean = demographicsService.getMultipleBirth();
            patient.multipleBirthInteger = demographicsService.getBirthOrder();
            patient.deceasedBoolean = demographicsService.getDeceased();
            patient.deceasedDateTime = demographicsService.getDeceasedDate();
            patient.communication = demographicsService.getLanguage();
            patient.address = addressService.mapFromViewModel();
            patient.telecom = contactPointService.mapFromViewModel();
            patient.identifier = identifierService.getAll();
            patient.managingOrganization = vm.patient.managingOrganization;

            patient.active = vm.patient.active;
            if (vm.isEditing) {
                patientService.updatePatient(vm.patient.resourceId, patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        common.toggleProgressBar(false);
                    });
            } else {
                patientService.addPatient(patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        common.toggleProgressBar(false);
                    });
            }
        }

        function showAuditData($index, $event) {
            showRawData(vm.history[$index], $event);
        }

        function showClinicalData($index, $event) {
            showRawData(vm.summary[$index], $event);
        }

        function showRawData(item, event) {
            $mdDialog.show({
                optionsOrPresent: {disableParentScroll: false},
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: item
                },
                targetEvent: event
            });
        }

        function patientActionsMenu($event) {
            var menuItems = [
                {name: 'Edit', icon: 'img/account4.svg'},
                {name: 'Locate', icon: 'img/share39.svg'},
                {name: 'Consult', icon: 'img/clipboard99.svg'},
                {name: 'Delete', icon: 'img/rubbish.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Edit':
                        logInfo('TODO: implement Edit');
                        break;
                    case 'Locate':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Consult':
                        logInfo('TODO: implement Consult');
                        break;
                    case 'Delete':
                        deletePatient(vm.patient, $event);
                }
            });
        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        vm.activeServer = null;
        vm.calculateAge = calculateAge;
        vm.clearErrors = clearErrors;
        vm.activate = activate;
        vm.delete = deletePatient;
        vm.dataEvents = [];
        vm.errors = [];
        vm.history = [];
        vm.summary = [];
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        //  vm.history = {"allergy": {"list": []}, "medication": {"list": []}, "condition": {"list": []}};
        vm.vitals = {"allergy": [], "medication": [], "condition": []};
        vm.lookupKey = undefined;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadErrors = loadErrors;
        vm.loadingOrganizations = false;
        vm.patient = undefined;
        vm.save = save;
        vm.title = 'Patient Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;
        vm.patientActionsMenu = patientActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window', 'addressService', 'attachmentService',
            'common', 'demographicsService', 'fhirServers', 'humanNameService', 'identifierService',
            'organizationService', 'patientService', 'contactPointService', patientDetail]);
})();