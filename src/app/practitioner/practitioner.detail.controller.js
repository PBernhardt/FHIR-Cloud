(function () {
    'use strict';

    var controllerId = 'practitionerDetail';

    function practitionerDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, practitionerService, contactPointService, patientService, communicationService,
                           careProviderService, observationService, config) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer()], controllerId).then(function () {
                _getRequestedPractitioner();
            });
        }

        function deletePractitioner(practitioner, event) {
            function executeDelete() {
                if (practitioner && practitioner.resourceId && practitioner.hashKey) {
                    practitionerService.deleteCachedPractitioner(practitioner.hashKey, practitioner.resourceId)
                        .then(function () {
                            logInfo("Deleted practitioner " + practitioner.fullName);
                            $location.path('/practitioner');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + practitioner.fullName + '?')
                .ariaLabel('delete practitioner')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + practitioner.fullName);
                });
        }

        function edit(practitioner) {
            if (practitioner && practitioner.hashKey) {
                $location.path('/practitioner/' + practitioner.hashKey);
            }
        }

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

        function _getEverything() {
            practitionerService.getPractitionerEverything(vm.practitioner.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for practitioner at " + vm.practitioner.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.practitioner.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for practitioner " + vm.practitioner.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedPractitioner() {
            function initializeAdministrationData(data) {
                vm.practitioner = data;
                humanNameService.init(vm.practitioner.name);
                demographicsService.init(vm.practitioner.gender, vm.practitioner.maritalStatus, vm.practitioner.communication);
                demographicsService.initBirth(vm.practitioner.multipleBirthBoolean, vm.practitioner.multipleBirthInteger);
                demographicsService.initDeath(vm.practitioner.deceasedBoolean, vm.practitioner.deceasedDateTime);
                demographicsService.setBirthDate(vm.practitioner.birthDate);
                demographicsService.initializeKnownExtensions(vm.practitioner.extension);
                vm.practitioner.race = demographicsService.getRace();
                vm.practitioner.religion = demographicsService.getReligion();
                vm.practitioner.ethnicity = demographicsService.getEthnicity();
                vm.practitioner.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.practitioner.birthPlace = demographicsService.getBirthPlace();
                attachmentService.init(vm.practitioner.photo, "Photos");
                identifierService.init(vm.practitioner.identifier, "multi", "practitioner");
                addressService.init(vm.practitioner.address, true);
                contactPointService.init(vm.practitioner.telecom, true, true);
                careProviderService.init(vm.practitioner.careProvider);
                if (vm.practitioner.communication) {
                    communicationService.init(vm.practitioner.communication, "multi");
                }
                vm.practitioner.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.practitioner.id)) {
                    vm.practitioner.resourceId = (vm.activeServer.baseUrl + '/Practitioner/' + vm.practitioner.id);
                }
                if (vm.practitioner.managingOrganization && vm.practitioner.managingOrganization.reference) {
                    var reference = vm.practitioner.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.practitioner.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.practitioner.managingOrganization.display)) {
                        vm.practitioner.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.practitioner = JSON.stringify(vm.practitioner);
                }
            }

            vm.practitioner = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.practitioner) || ($window.localStorage.practitioner === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/practitioner');
                    }
                } else {
                    vm.practitioner = JSON.parse($window.localStorage.practitioner);
                    vm.practitioner.hashKey = "current";
                    initializeAdministrationData(vm.practitioner);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Practitioner/' + $routeParams.id;
                practitionerService.getPractitioner(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.practitioner) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = practitionerService.initializeNewPractitioner();
                initializeAdministrationData(data);
                vm.title = 'Add New Practitioner';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                practitionerService.getCachedPractitioner(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.practitioner && vm.practitioner.resourceId) {
                            _getEverything(vm.practitioner.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve practitioner lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Practitioner saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Practitioner saved at " + resourceVersionId);
                    vm.practitioner.resourceVersionId = resourceVersionId;
                    vm.practitioner.resourceId = common.setResourceId(vm.practitioner.resourceId, resourceVersionId);
                }
                vm.practitioner.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.practitioner = JSON.stringify(vm.practitioner);
                vm.isBusy = false;
            }

            var practitioner = practitionerService.initializeNewPractitioner();
            if (humanNameService.getAll().length === 0) {
                logError("Practitioner must have at least one name.");
                return;
            }
            practitioner.name = humanNameService.mapFromViewModel();
            practitioner.photo = attachmentService.getAll();

            practitioner.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            practitioner.gender = demographicsService.getGender();
            practitioner.maritalStatus = demographicsService.getMaritalStatus();
            practitioner.multipleBirthBoolean = demographicsService.getMultipleBirth();
            practitioner.multipleBirthInteger = demographicsService.getBirthOrder();
            practitioner.deceasedBoolean = demographicsService.getDeceased();
            practitioner.deceasedDateTime = demographicsService.getDeceasedDate();
            practitioner.race = demographicsService.getRace();
            practitioner.religion = demographicsService.getReligion();
            practitioner.ethnicity = demographicsService.getEthnicity();
            practitioner.mothersMaidenName = demographicsService.getMothersMaidenName();
            practitioner.birthPlace = demographicsService.getBirthPlace();

            practitioner.address = addressService.mapFromViewModel();
            practitioner.telecom = contactPointService.mapFromViewModel();
            practitioner.identifier = identifierService.getAll();
            practitioner.managingOrganization = vm.practitioner.managingOrganization;
            practitioner.communication = communicationService.getAll();
            practitioner.careProvider = careProviderService.getAll();

            practitioner.active = vm.practitioner.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                practitioner.id = vm.practitioner.id;
                practitionerService.updatePractitioner(vm.practitioner.resourceId, practitioner)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                practitionerService.addPractitioner(practitioner)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
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

        function canDelete() {
            return !vm.isEditing;
        }

        $scope.$on('server.changed',
            function (event, data) {
                vm.activeServer = data.activeServer;
                logInfo("Remote server changed to " + vm.activeServer.name);
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
                        $location.path('/practitioner');
                        break;
                    case 1:
                        $location.path('/practitioner/edit/current');
                        break;
                    case 2:
                        $location.path('/practitioner/edit/new');
                        break;
                    case 3:
                        $location.path('/practitioner/detailed-search');
                        break;
                    case 4:
                        deletePractitioner(vm.practitioner);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Find another practitioner', icon: 'search', index: 0},
                        {name: 'Edit practitioner', icon: 'edit', index: 1},
                        {name: 'Add new practitioner', icon: 'doctor', index: 2}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 3},
                        {name: 'Quick find', icon: 'quickFind', index: 0}
                    ];
                }
                this.title = 'Practitioner options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.delete = deletePractitioner;
        vm.dataEvents = [];
        vm.errors = [];
        vm.history = [];
        vm.isBusy = false;
        vm.summary = [];
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.lookupKey = undefined;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.practitioner = undefined;
        vm.practitionerSearchText = '';
        vm.save = save;
        vm.selectedPractitioner = null;
        vm.title = 'Practitioner Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'practitionerService', 'contactPointService',
            'patientService', 'communicationService', 'careProviderService', 'observationService', 'config', practitionerDetail]);
})();