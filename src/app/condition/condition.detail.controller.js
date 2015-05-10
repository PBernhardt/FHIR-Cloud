(function () {
    'use strict';

    var controllerId = 'conditionDetail';

    function conditionDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, conditionService, contactPointService, practitionerService, communicationService,
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
                _getRequestedCondition();
            });
        }

        function deleteCondition(condition, event) {
            function executeDelete() {
                if (condition && condition.resourceId && condition.hashKey) {
                    conditionService.deleteCachedCondition(condition.hashKey, condition.resourceId)
                        .then(function () {
                            logInfo("Deleted condition " + condition.fullName);
                            $location.path('/condition');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + condition.fullName + '?')
                .ariaLabel('delete condition')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + condition.fullName);
                });
        }

        function edit(condition) {
            if (condition && condition.hashKey) {
                $location.path('/condition/' + condition.hashKey);
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
            conditionService.getConditionEverything(vm.condition.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for condition at " + vm.condition.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.condition.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for condition " + vm.condition.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedCondition() {
            function initializeAdministrationData(data) {
                vm.condition = data;
                humanNameService.init(vm.condition.name);
                demographicsService.init(vm.condition.gender, vm.condition.maritalStatus, vm.condition.communication);
                demographicsService.initBirth(vm.condition.multipleBirthBoolean, vm.condition.multipleBirthInteger);
                demographicsService.initDeath(vm.condition.deceasedBoolean, vm.condition.deceasedDateTime);
                demographicsService.setBirthDate(vm.condition.birthDate);
                demographicsService.initializeKnownExtensions(vm.condition.extension);
                vm.condition.race = demographicsService.getRace();
                vm.condition.religion = demographicsService.getReligion();
                vm.condition.ethnicity = demographicsService.getEthnicity();
                vm.condition.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.condition.birthPlace = demographicsService.getBirthPlace();
                attachmentService.init(vm.condition.photo, "Photos");
                identifierService.init(vm.condition.identifier, "multi", "condition");
                addressService.init(vm.condition.address, true);
                contactPointService.init(vm.condition.telecom, true, true);
                careProviderService.init(vm.condition.careProvider);
                if (vm.condition.communication) {
                    communicationService.init(vm.condition.communication, "multi");
                }
                vm.condition.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.condition.id)) {
                    vm.condition.resourceId = (vm.activeServer.baseUrl + '/Condition/' + vm.condition.id);
                }
                if (vm.condition.managingOrganization && vm.condition.managingOrganization.reference) {
                    var reference = vm.condition.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.condition.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.condition.managingOrganization.display)) {
                        vm.condition.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.condition = JSON.stringify(vm.condition);
                }
            }

            vm.condition = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.condition) || ($window.localStorage.condition === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/condition');
                    }
                } else {
                    vm.condition = JSON.parse($window.localStorage.condition);
                    vm.condition.hashKey = "current";
                    initializeAdministrationData(vm.condition);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Condition/' + $routeParams.id;
                conditionService.getCondition(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.condition) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = conditionService.initializeNewCondition();
                initializeAdministrationData(data);
                vm.title = 'Add New Condition';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                conditionService.getCachedCondition(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.condition && vm.condition.resourceId) {
                            _getEverything(vm.condition.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve condition lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Condition saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Condition saved at " + resourceVersionId);
                    vm.condition.resourceVersionId = resourceVersionId;
                    vm.condition.resourceId = common.setResourceId(vm.condition.resourceId, resourceVersionId);
                }
                vm.condition.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.condition = JSON.stringify(vm.condition);
                vm.isBusy = false;
            }

            var condition = conditionService.initializeNewCondition();
            if (humanNameService.getAll().length === 0) {
                logError("Condition must have at least one name.");
                return;
            }
            condition.name = humanNameService.mapFromViewModel();
            condition.photo = attachmentService.getAll();

            condition.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            condition.gender = demographicsService.getGender();
            condition.maritalStatus = demographicsService.getMaritalStatus();
            condition.multipleBirthBoolean = demographicsService.getMultipleBirth();
            condition.multipleBirthInteger = demographicsService.getBirthOrder();
            condition.deceasedBoolean = demographicsService.getDeceased();
            condition.deceasedDateTime = demographicsService.getDeceasedDate();
            condition.race = demographicsService.getRace();
            condition.religion = demographicsService.getReligion();
            condition.ethnicity = demographicsService.getEthnicity();
            condition.mothersMaidenName = demographicsService.getMothersMaidenName();
            condition.birthPlace = demographicsService.getBirthPlace();

            condition.address = addressService.mapFromViewModel();
            condition.telecom = contactPointService.mapFromViewModel();
            condition.identifier = identifierService.getAll();
            condition.managingOrganization = vm.condition.managingOrganization;
            condition.communication = communicationService.getAll();
            condition.careProvider = careProviderService.getAll();

            condition.active = vm.condition.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                condition.id = vm.condition.id;
                conditionService.updateCondition(vm.condition.resourceId, condition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                conditionService.addCondition(condition)
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
                        $location.path('/consultation');
                        break;
                    case 1:
                        $location.path('/lab');
                        break;
                    case 2:
                        logInfo("Refreshing condition data from " + vm.activeServer.name);
                        $location.path('/condition/get/' + vm.condition.id);
                        break;
                    case 3:
                        $location.path('/condition');
                        break;
                    case 4:
                        $location.path('/condition/edit/current');
                        break;
                    case 5:
                        $location.path('/condition/edit/new');
                        break;
                    case 6:
                        deleteCondition(vm.condition);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Vitals', icon: 'vitals', index: 0},
                        {name: 'Lab', icon: 'lab', index: 1},
                        {name: 'Refresh data', icon: 'refresh', index: 2},
                        {name: 'Find another condition', icon: 'person', index: 3},
                        {name: 'Edit condition', icon: 'edit', index: 4},
                        {name: 'Add new condition', icon: 'personAdd', index: 5}
                    ];
                } else {
                    this.items = [
                        {name: 'Find another condition', icon: 'person', index: 3},
                    ];
                }
                this.title = 'Condition options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.delete = deleteCondition;
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
        vm.condition = undefined;
        vm.practitionerSearchText = '';
        vm.save = save;
        vm.selectedPractitioner = null;
        vm.title = 'Condition Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'conditionService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', 'config', conditionDetail]);
})();