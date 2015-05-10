(function () {
    'use strict';

    var controllerId = 'relatedPersonDetail';

    function relatedPersonDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, relatedPersonService, contactPointService, practitionerService, communicationService,
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
                _getRequestedPerson();
            });
        }

        function deletePerson(relatedPerson, event) {
            function executeDelete() {
                if (relatedPerson && relatedPerson.resourceId && relatedPerson.hashKey) {
                    relatedPersonService.deleteCachedPerson(relatedPerson.hashKey, relatedPerson.resourceId)
                        .then(function () {
                            logInfo("Deleted relatedPerson " + relatedPerson.fullName);
                            $location.path('/relatedPerson');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + relatedPerson.fullName + '?')
                .ariaLabel('delete relatedPerson')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + relatedPerson.fullName);
                });
        }

        vm.delete = deletePerson;

        function edit(relatedPerson) {
            if (relatedPerson && relatedPerson.hashKey) {
                $location.path('/relatedPerson/' + relatedPerson.hashKey);
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
            relatedPersonService.getPersonEverything(vm.relatedPerson.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for relatedPerson at " + vm.relatedPerson.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.relatedPerson.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for relatedPerson " + vm.relatedPerson.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedPerson() {
            function initializeAdministrationData(data) {
                vm.relatedPerson = data;
                humanNameService.init(vm.relatedPerson.name);
                demographicsService.init(vm.relatedPerson.gender, vm.relatedPerson.maritalStatus, vm.relatedPerson.communication);
                demographicsService.initBirth(vm.relatedPerson.multipleBirthBoolean, vm.relatedPerson.multipleBirthInteger);
                demographicsService.initDeath(vm.relatedPerson.deceasedBoolean, vm.relatedPerson.deceasedDateTime);
                demographicsService.setBirthDate(vm.relatedPerson.birthDate);
                demographicsService.initializeKnownExtensions(vm.relatedPerson.extension);
                vm.relatedPerson.race = demographicsService.getRace();
                vm.relatedPerson.religion = demographicsService.getReligion();
                vm.relatedPerson.ethnicity = demographicsService.getEthnicity();
                vm.relatedPerson.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.relatedPerson.birthPlace = demographicsService.getBirthPlace();
                vm.relatedPerson.birthDate = demographicsService.getBirthDate();
                attachmentService.init(vm.relatedPerson.photo, "Photos");
                identifierService.init(vm.relatedPerson.identifier, "multi", "relatedPerson");
                addressService.init(vm.relatedPerson.address, true);
                contactPointService.init(vm.relatedPerson.telecom, true, true);
                careProviderService.init(vm.relatedPerson.careProvider);
                if (vm.relatedPerson.communication) {
                    communicationService.init(vm.relatedPerson.communication, "multi");
                }
                vm.relatedPerson.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.relatedPerson.id)) {
                    vm.relatedPerson.resourceId = (vm.activeServer.baseUrl + '/RelatedPerson/' + vm.relatedPerson.id);
                }
                if (vm.relatedPerson.managingOrganization && vm.relatedPerson.managingOrganization.reference) {
                    var reference = vm.relatedPerson.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.relatedPerson.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.relatedPerson.managingOrganization.display)) {
                        vm.relatedPerson.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.relatedPerson = JSON.stringify(vm.relatedPerson);
                }
            }

            vm.relatedPerson = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.relatedPerson) || ($window.localStorage.relatedPerson === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/relatedPerson');
                    }
                } else {
                    vm.relatedPerson = JSON.parse($window.localStorage.relatedPerson);
                    vm.relatedPerson.hashKey = "current";
                    initializeAdministrationData(vm.relatedPerson);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/RelatedPerson/' + $routeParams.id;
                relatedPersonService.getPerson(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.relatedPerson) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = relatedPersonService.initializeNewPerson();
                initializeAdministrationData(data);
                vm.title = 'Add New Related Person';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                relatedPersonService.getCachedPerson(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.relatedPerson && vm.relatedPerson.resourceId) {
                            _getEverything(vm.relatedPerson.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve relatedPerson lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Related Person saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Related Person saved at " + resourceVersionId);
                    vm.relatedPerson.resourceVersionId = resourceVersionId;
                    vm.relatedPerson.resourceId = common.setResourceId(vm.relatedPerson.resourceId, resourceVersionId);
                }
                vm.relatedPerson.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.relatedPerson = JSON.stringify(vm.relatedPerson);
                vm.isBusy = false;
            }

            var relatedPerson = relatedPersonService.initializeNewPerson();
            if (humanNameService.getAll().length === 0) {
                logError("Related Person must have at least one name.");
                return;
            }
            relatedPerson.name = humanNameService.mapFromViewModel();
            relatedPerson.photo = attachmentService.getAll();

            relatedPerson.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            relatedPerson.gender = demographicsService.getGender();
            relatedPerson.maritalStatus = demographicsService.getMaritalStatus();
            relatedPerson.multipleBirthBoolean = demographicsService.getMultipleBirth();
            relatedPerson.multipleBirthInteger = demographicsService.getBirthOrder();
            relatedPerson.deceasedBoolean = demographicsService.getDeceased();
            relatedPerson.deceasedDateTime = demographicsService.getDeceasedDate();
            relatedPerson.race = demographicsService.getRace();
            relatedPerson.religion = demographicsService.getReligion();
            relatedPerson.ethnicity = demographicsService.getEthnicity();
            relatedPerson.mothersMaidenName = demographicsService.getMothersMaidenName();
            relatedPerson.birthPlace = demographicsService.getBirthPlace();

            relatedPerson.address = addressService.mapFromViewModel();
            relatedPerson.telecom = contactPointService.mapFromViewModel();
            relatedPerson.identifier = identifierService.getAll();
            relatedPerson.managingOrganization = vm.relatedPerson.managingOrganization;
            relatedPerson.communication = communicationService.getAll();
            relatedPerson.careProvider = careProviderService.getAll();

            relatedPerson.active = vm.relatedPerson.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                relatedPerson.id = vm.relatedPerson.id;
                relatedPersonService.updatePerson(vm.relatedPerson.resourceId, relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                relatedPersonService.addPerson(relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            }
        }
        vm.save = save;

        function showSource($event) {
            _showRawData(vm.relatedPerson, $event);
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
                        $location.path('/relatedPerson');
                        break;
                    case 1:
                        $location.path('/relatedPerson/edit/current');
                        break;
                    case 2:
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 3:
                        $location.path('/relatedPerson/detailed-search');
                        break;
                    case 4:
                        deletePerson(vm.relatedPerson);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Find another related person', icon: 'quickFind', index: 0},
                        {name: 'Edit related person', icon: 'edit', index: 1},
                        {name: 'Add new related person', icon: 'groupAdd', index: 2}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 3},
                        {name: 'Quick find', icon: 'quickFind', index: 0}
                    ];
                }
                this.title = 'Related Person options';
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
        vm.relatedPerson = undefined;
        vm.practitionerSearchText = '';
        vm.selectedPractitioner = null;
        vm.title = 'Related Person Detail';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'relatedPersonService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', relatedPersonDetail]);
})();