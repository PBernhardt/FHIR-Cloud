(function () {
    'use strict';

    var controllerId = 'immunizationDetail';

    function immunizationDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, immunizationService, contactPointService, practitionerService, communicationService,
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
                _getRequestedImmunization();
            });
        }

        function deleteImmunization(immunization, event) {
            function executeDelete() {
                if (immunization && immunization.resourceId && immunization.hashKey) {
                    immunizationService.deleteCachedImmunization(immunization.hashKey, immunization.resourceId)
                        .then(function () {
                            logInfo("Deleted immunization " + immunization.fullName);
                            $location.path('/immunization');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + immunization.fullName + '?')
                .ariaLabel('delete immunization')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + immunization.fullName);
                });
        }

        function edit(immunization) {
            if (immunization && immunization.hashKey) {
                $location.path('/immunization/' + immunization.hashKey);
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
            immunizationService.getImmunizationEverything(vm.immunization.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for immunization at " + vm.immunization.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.immunization.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for immunization " + vm.immunization.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedImmunization() {
            function initializeAdministrationData(data) {
                vm.immunization = data;
                humanNameService.init(vm.immunization.name);
                demographicsService.init(vm.immunization.gender, vm.immunization.maritalStatus, vm.immunization.communication);
                demographicsService.initBirth(vm.immunization.multipleBirthBoolean, vm.immunization.multipleBirthInteger);
                demographicsService.initDeath(vm.immunization.deceasedBoolean, vm.immunization.deceasedDateTime);
                demographicsService.setBirthDate(vm.immunization.birthDate);
                demographicsService.initializeKnownExtensions(vm.immunization.extension);
                vm.immunization.race = demographicsService.getRace();
                vm.immunization.religion = demographicsService.getReligion();
                vm.immunization.ethnicity = demographicsService.getEthnicity();
                vm.immunization.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.immunization.birthPlace = demographicsService.getBirthPlace();
                attachmentService.init(vm.immunization.photo, "Photos");
                identifierService.init(vm.immunization.identifier, "multi", "immunization");
                addressService.init(vm.immunization.address, true);
                contactPointService.init(vm.immunization.telecom, true, true);
                careProviderService.init(vm.immunization.careProvider);
                if (vm.immunization.communication) {
                    communicationService.init(vm.immunization.communication, "multi");
                }
                vm.immunization.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.immunization.id)) {
                    vm.immunization.resourceId = (vm.activeServer.baseUrl + '/Immunization/' + vm.immunization.id);
                }
                if (vm.immunization.managingOrganization && vm.immunization.managingOrganization.reference) {
                    var reference = vm.immunization.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.immunization.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.immunization.managingOrganization.display)) {
                        vm.immunization.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.immunization = JSON.stringify(vm.immunization);
                }
            }

            vm.immunization = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.immunization) || ($window.localStorage.immunization === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/immunization');
                    }
                } else {
                    vm.immunization = JSON.parse($window.localStorage.immunization);
                    vm.immunization.hashKey = "current";
                    initializeAdministrationData(vm.immunization);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Immunization/' + $routeParams.id;
                immunizationService.getImmunization(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.immunization) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = immunizationService.initializeNewImmunization();
                initializeAdministrationData(data);
                vm.title = 'Add New Immunization';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                immunizationService.getCachedImmunization(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.immunization && vm.immunization.resourceId) {
                            _getEverything(vm.immunization.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve immunization lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Immunization saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Immunization saved at " + resourceVersionId);
                    vm.immunization.resourceVersionId = resourceVersionId;
                    vm.immunization.resourceId = common.setResourceId(vm.immunization.resourceId, resourceVersionId);
                }
                vm.immunization.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.immunization = JSON.stringify(vm.immunization);
                vm.isBusy = false;
            }

            var immunization = immunizationService.initializeNewImmunization();
            if (humanNameService.getAll().length === 0) {
                logError("Immunization must have at least one name.");
                return;
            }
            immunization.name = humanNameService.mapFromViewModel();
            immunization.photo = attachmentService.getAll();

            immunization.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            immunization.gender = demographicsService.getGender();
            immunization.maritalStatus = demographicsService.getMaritalStatus();
            immunization.multipleBirthBoolean = demographicsService.getMultipleBirth();
            immunization.multipleBirthInteger = demographicsService.getBirthOrder();
            immunization.deceasedBoolean = demographicsService.getDeceased();
            immunization.deceasedDateTime = demographicsService.getDeceasedDate();
            immunization.race = demographicsService.getRace();
            immunization.religion = demographicsService.getReligion();
            immunization.ethnicity = demographicsService.getEthnicity();
            immunization.mothersMaidenName = demographicsService.getMothersMaidenName();
            immunization.birthPlace = demographicsService.getBirthPlace();

            immunization.address = addressService.mapFromViewModel();
            immunization.telecom = contactPointService.mapFromViewModel();
            immunization.identifier = identifierService.getAll();
            immunization.managingOrganization = vm.immunization.managingOrganization;
            immunization.communication = communicationService.getAll();
            immunization.careProvider = careProviderService.getAll();

            immunization.active = vm.immunization.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                immunization.id = vm.immunization.id;
                immunizationService.updateImmunization(vm.immunization.resourceId, immunization)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                immunizationService.addImmunization(immunization)
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
                        $location.path('/immunization');
                        break;
                    case 1:
                        $location.path('/immunization/edit/current');
                        break;
                    case 2:
                        $location.path('/immunization/edit/new');
                        break;
                    case 3:
                        deleteImmunization(vm.immunization);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Find another immunization', icon: 'search', index: 0},
                        {name: 'Edit immunization', icon: 'edit', index: 1},
                        {name: 'Add new immunization', icon: 'immunization', index: 2}
                    ];
                } else {
                    this.items = [
                        {name: 'Find another immunization', icon: 'search', index: 0},
                    ];
                }
                this.title = 'Immunization options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.delete = deleteImmunization;
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
        vm.immunization = undefined;
        vm.practitionerSearchText = '';
        vm.save = save;
        vm.selectedPractitioner = null;
        vm.title = 'Immunization Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'immunizationService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', 'config', immunizationDetail]);
})();