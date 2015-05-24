(function () {
    'use strict';

    var controllerId = 'practitionerDetail';

    function practitionerDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, addressService,
                                attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                                organizationService, practitionerService, contactPointService, patientService, communicationService,
                                config) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var $q = common.$q;
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId).then(function () {
                _getRequestedPractitioner();
            });
        }

        function showRole($event, role) {
            $mdDialog.show({
                templateUrl: 'practitioner/practitioner-role-dialog.html',
                controller: 'practitionerRole',
                controllerAs: 'vm',
                clickOutsideToClose: true,
                locals: {
                    data: role
                },
                targetEvent: $event
            });
        }

        vm.showRole = showRole;

        function showSource($event) {
            _showRawData(vm.practitioner, $event);
        }

        vm.showSource = showSource;

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

        function _getAffiliatedPatients() {
            var deferred = $q.defer();
            patientService.getPatientsByCareProvider(vm.activeServer.baseUrl, vm.practitioner.id)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) +
                        ' Patients from ' + vm.activeServer.name + '.');
                    common.changePatientList(data);
                    deferred.resolve();
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                    deferred.resolve();
                });
            return deferred.promise;
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

        function _getRequestedPractitioner() {
            function initializeAdministrationData(data) {
                vm.practitioner = data;
                humanNameService.init([vm.practitioner.name], 'single');
                demographicsService.init(vm.practitioner.gender, vm.practitioner.birthDate);
                attachmentService.init(vm.practitioner.photo, "Photos");
                identifierService.init(vm.practitioner.identifier, "multi", "practitioner");
                addressService.init(vm.practitioner.address, true);
                contactPointService.init(vm.practitioner.telecom, true, true);
                if (vm.practitioner.communication) {
                    communicationService.init(vm.practitioner.communication, "multi");
                }
                vm.practitioner.$$fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.practitioner.id)) {
                    vm.practitioner.resourceId = (vm.activeServer.baseUrl + '/Practitioner/' + vm.practitioner.id);
                }
                if (vm.lookupKey !== "new") {
                    practitionerService.setPractitionerContext(vm.practitioner);
                    _getAffiliatedPatients();
                }
            }

            vm.practitioner = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                vm.practitioner = practitionerService.getPractitionerContext();
                if (common.isUndefinedOrNull(vm.practitioner) && angular.isUndefined($routeParams.id)) {
                    $location.path('/practitioner');
                } else {
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
                            _getAffiliatedPatients();
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
                            _getAffiliatedPatients();
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
                practitionerService.setPractitionerContext(vm.practitioner);
                vm.isBusy = false;
            }

            var practitioner = practitionerService.initializeNewPractitioner();
            if (humanNameService.getAll().length === 0) {
                logError("Practitioner must have a name.");
                return;
            }
            practitioner.name = humanNameService.mapFromViewModel();
            practitioner.photo = attachmentService.getAll();
            practitioner.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            practitioner.gender = demographicsService.getGender();
            practitioner.address = addressService.mapFromViewModel();
            practitioner.telecom = contactPointService.mapFromViewModel();
            practitioner.identifier = identifierService.getAll();
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

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', 'addressService',
            'attachmentService', 'common', 'demographicsService', 'fhirServers', 'humanNameService',
            'identifierService', 'organizationService', 'practitionerService', 'contactPointService',
            'patientService', 'communicationService', 'config', practitionerDetail]);
})();