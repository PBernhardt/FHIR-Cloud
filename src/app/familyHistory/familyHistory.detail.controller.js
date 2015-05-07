(function () {
    'use strict';

    var controllerId = 'familyHistoryDetail';

    function familyHistoryDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, familyHistoryService, contactPointService, practitionerService, communicationService,
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
                _getRequestedFamilyHistory();
            });
        }

        function deleteFamilyHistory(familyHistory, event) {
            function executeDelete() {
                if (familyHistory && familyHistory.resourceId && familyHistory.hashKey) {
                    familyHistoryService.deleteCachedFamilyHistory(familyHistory.hashKey, familyHistory.resourceId)
                        .then(function () {
                            logInfo("Deleted familyHistory " + familyHistory.fullName);
                            $location.path('/familyHistory');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + familyHistory.fullName + '?')
                .ariaLabel('delete familyHistory')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + familyHistory.fullName);
                });
        }

        function edit(familyHistory) {
            if (familyHistory && familyHistory.hashKey) {
                $location.path('/familyHistory/' + familyHistory.hashKey);
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
            familyHistoryService.getFamilyHistoryEverything(vm.familyHistory.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for familyHistory at " + vm.familyHistory.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.familyHistory.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for familyHistory " + vm.familyHistory.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedFamilyHistory() {
            function initializeAdministrationData(data) {
                vm.familyHistory = data;
                humanNameService.init(vm.familyHistory.name);
                demographicsService.init(vm.familyHistory.gender, vm.familyHistory.maritalStatus, vm.familyHistory.communication);
                demographicsService.initBirth(vm.familyHistory.multipleBirthBoolean, vm.familyHistory.multipleBirthInteger);
                demographicsService.initDeath(vm.familyHistory.deceasedBoolean, vm.familyHistory.deceasedDateTime);
                demographicsService.setBirthDate(vm.familyHistory.birthDate);
                demographicsService.initializeKnownExtensions(vm.familyHistory.extension);
                vm.familyHistory.race = demographicsService.getRace();
                vm.familyHistory.religion = demographicsService.getReligion();
                vm.familyHistory.ethnicity = demographicsService.getEthnicity();
                vm.familyHistory.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.familyHistory.birthPlace = demographicsService.getBirthPlace();
                attachmentService.init(vm.familyHistory.photo, "Photos");
                identifierService.init(vm.familyHistory.identifier, "multi", "familyHistory");
                addressService.init(vm.familyHistory.address, true);
                contactPointService.init(vm.familyHistory.telecom, true, true);
                careProviderService.init(vm.familyHistory.careProvider);
                if (vm.familyHistory.communication) {
                    communicationService.init(vm.familyHistory.communication, "multi");
                }
                vm.familyHistory.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.familyHistory.id)) {
                    vm.familyHistory.resourceId = (vm.activeServer.baseUrl + '/Family History/' + vm.familyHistory.id);
                }
                if (vm.familyHistory.managingOrganization && vm.familyHistory.managingOrganization.reference) {
                    var reference = vm.familyHistory.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.familyHistory.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.familyHistory.managingOrganization.display)) {
                        vm.familyHistory.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.familyHistory = JSON.stringify(vm.familyHistory);
                }
            }

            vm.familyHistory = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.familyHistory) || ($window.localStorage.familyHistory === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/familyHistory');
                    }
                } else {
                    vm.familyHistory = JSON.parse($window.localStorage.familyHistory);
                    vm.familyHistory.hashKey = "current";
                    initializeAdministrationData(vm.familyHistory);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/FamilyHistory/' + $routeParams.id;
                familyHistoryService.getFamilyHistory(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.familyHistory) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = familyHistoryService.initializeNewFamilyHistory();
                initializeAdministrationData(data);
                vm.title = 'Add New Family History';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                familyHistoryService.getCachedFamilyHistory(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.familyHistory && vm.familyHistory.resourceId) {
                            _getEverything(vm.familyHistory.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve familyHistory lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Family History saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Family History saved at " + resourceVersionId);
                    vm.familyHistory.resourceVersionId = resourceVersionId;
                    vm.familyHistory.resourceId = common.setResourceId(vm.familyHistory.resourceId, resourceVersionId);
                }
                vm.familyHistory.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.familyHistory = JSON.stringify(vm.familyHistory);
                vm.isBusy = false;
            }

            var familyHistory = familyHistoryService.initializeNewFamilyHistory();
            if (humanNameService.getAll().length === 0) {
                logError("Family History must have at least one name.");
                return;
            }
            familyHistory.name = humanNameService.mapFromViewModel();
            familyHistory.photo = attachmentService.getAll();

            familyHistory.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            familyHistory.gender = demographicsService.getGender();
            familyHistory.maritalStatus = demographicsService.getMaritalStatus();
            familyHistory.multipleBirthBoolean = demographicsService.getMultipleBirth();
            familyHistory.multipleBirthInteger = demographicsService.getBirthOrder();
            familyHistory.deceasedBoolean = demographicsService.getDeceased();
            familyHistory.deceasedDateTime = demographicsService.getDeceasedDate();
            familyHistory.race = demographicsService.getRace();
            familyHistory.religion = demographicsService.getReligion();
            familyHistory.ethnicity = demographicsService.getEthnicity();
            familyHistory.mothersMaidenName = demographicsService.getMothersMaidenName();
            familyHistory.birthPlace = demographicsService.getBirthPlace();

            familyHistory.address = addressService.mapFromViewModel();
            familyHistory.telecom = contactPointService.mapFromViewModel();
            familyHistory.identifier = identifierService.getAll();
            familyHistory.managingOrganization = vm.familyHistory.managingOrganization;
            familyHistory.communication = communicationService.getAll();
            familyHistory.careProvider = careProviderService.getAll();

            familyHistory.active = vm.familyHistory.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                familyHistory.id = vm.familyHistory.id;
                familyHistoryService.updateFamilyHistory(vm.familyHistory.resourceId, familyHistory)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                familyHistoryService.addFamilyHistory(familyHistory)
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
                        $location.path('/familyHistory');
                        break;
                    case 1:
                        $location.path('/familyHistory/edit/current');
                        break;
                    case 2:
                        $location.path('/familyHistory/edit/new');
                        break;
                    case 3:
                        deleteFamilyHistory(vm.familyHistory);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Find another family history', icon: 'family', index: 0},
                        {name: 'Edit family history', icon: 'edit', index: 1},
                        {name: 'Add new family history', icon: 'groupAdd', index: 2}
                    ];
                } else {
                    this.items = [
                        {name: 'Find another family history', icon: 'family', index: 0},
                    ];
                }
                this.title = 'Family History options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.delete = deleteFamilyHistory;
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
        vm.familyHistory = undefined;
        vm.practitionerSearchText = '';
        vm.save = save;
        vm.selectedPractitioner = null;
        vm.title = 'Family History Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'familyHistoryService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', 'config', familyHistoryDetail]);
})();