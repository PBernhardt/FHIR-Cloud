(function () {
    'use strict';

    var controllerId = 'organizationDetail';

    function organizationDetail($filter, $location, $mdBottomSheet, $routeParams, $scope, $window, addressService,
                                $mdDialog, common, config, contactService, fhirServers, identifierService, localValueSets,
                                organizationService, contactPointService, sessionService, patientService, personService,
                                practitionerService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var $q = common.$q;
        var noToast = false;

        $scope.$on(config.events.serverChanged,
            function (event, server) {
                vm.activeServer = server;
            }
        );

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteOrganization(organization) {
            function executeDelete() {
                if (organization && organization.resourceId) {
                    organizationService.deleteCachedOrganization(organization.hashKey, organization.resourceId)
                        .then(function () {
                            logDebug("Deleted organization " + organization.name);
                            $location.path('/organization');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error), error);
                        }
                    );
                }
            }

            if (angular.isDefined(organization) && organization.resourceId) {
                var confirm = $mdDialog.confirm().title('Delete ' + organization.name + '?').ok('Yes').cancel('No');
                $mdDialog.show(confirm).then(executeDelete);
            } else {
                logWarning("You must first select an organization to delete.")
            }
        }

        function edit(organization) {
            if (organization && organization.hashKey) {
                $location.path('/organization/edit/' + organization.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data) ? data.length : 0) +
                        ' Organizations from ' + vm.activeServer.name + '.');
                    deferred.resolve(data || []);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error, noToast);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function getOrganizationTypes() {
            vm.organizationTypes = localValueSets.organizationType();
        }

        function getRequestedOrganization() {
            function initializeRelatedData(data) {
                vm.organization = data.resource || data;
                if (angular.isUndefined(vm.organization.type)) {
                    vm.organization.type = {"coding": []};
                }
                vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
                vm.title = vm.organization.name;
                identifierService.init(vm.organization.identifier, "multi", "organization");
                addressService.init(vm.organization.address, false);
                addressService.initializeKnownExtensions(vm.extension);
                contactService.init(vm.organization.contact);
                contactPointService.init(vm.organization.telecom, false, false);
                vm.isBusy = false;
                if (vm.lookupKey !== "new") {
                    $window.localStorage.organization = JSON.stringify(vm.organization);
                    _getAffiliatedPatients();
                    _getAffiliatedPractitioners();
                    _getAffiliatedPersons();
                }

            }

            vm.lookupKey = $routeParams.hashKey;
            vm.isBusy = true;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.organization) || ($window.localStorage.organization === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/organization');
                    }
                } else {
                    vm.organization = JSON.parse($window.localStorage.organization);
                    vm.organization.hashKey = "current";
                    initializeRelatedData(vm.organization);
                }
            } else if (vm.lookupKey === 'new') {
                var data = organizationService.initializeNewOrganization();
                initializeRelatedData(data);
                vm.title = 'Add New Organization';
                vm.isEditing = false;
            } else if (angular.isDefined($routeParams.resourceId)) {
                var fullPath = vm.activeServer.baseUrl + '/Organization/' + $routeParams.resourceId;
                logDebug("Fetching " + fullPath, null, noToast);
                organizationService.getOrganization(fullPath)
                    .then(initializeRelatedData).then(function () {
                        var session = sessionService.getSession();
                        session.organization = vm.organization;
                        sessionService.updateSession(session);
                    }, function (error) {
                        logError(common.unexpectedOutcome(error), error);
                        vm.isBusy = false;
                    });
            } else {
                if (vm.lookupKey) {
                    organizationService.getCachedOrganization(vm.lookupKey)
                        .then(initializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.organization = vm.organization;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError(common.unexpectedOutcome(error), error);
                            vm.isBusy = false;
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Organization/' + $routeParams.id;
                    organizationService.getOrganization(resourceId)
                        .then(initializeRelatedData, function (error) {
                            logError(common.unexpectedOutcome(error), error);
                            vm.isBusy = false;
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.organization) {
                title = vm.title = 'Edit ' + ((vm.organization && vm.organization.fullName) || '');
            } else {
                title = vm.title = 'Add New Organization';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Organization saved, but location is unavailable. CORS is not implemented correctly at " + vm.activeServer.name);
            } else {
                logInfo('Organization saved at ' + resourceVersionId + '.');
                vm.organization.resourceVersionId = resourceVersionId;
                vm.organization.resourceId = common.setResourceId(vm.organization.resourceId, resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.organization.name.length < 5) {
                logWarning("Organization Name must be at least 5 characters");
                return;
            }
            var organization = organizationService.initializeNewOrganization().resource;
            organization.name = vm.organization.name;
            organization.type = vm.organization.type;
            organization.address = addressService.mapFromViewModel();
            organization.extension = addressService.writeKnownExtensions();
            organization.telecom = contactPointService.mapFromViewModel();
            organization.contact = contactService.getAll();
            organization.partOf = vm.organization.partOf;
            organization.identifier = identifierService.getAll();
            organization.active = vm.organization.active;
            if (vm.isEditing) {
                organization.id = vm.organization.id;
                organizationService.updateOrganization(vm.organization.resourceId, organization)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    });
            } else {
                organizationService.addOrganization(organization)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error), error);
                    });
            }
        }

        function _getAffiliatedPractitioners() {
            var deferred = $q.defer();
            practitionerService.getPractitioners(vm.activeServer.baseUrl, undefined, vm.organization.id)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) +
                        ' Practitioners from ' + vm.activeServer.name + '.');
                    common.changePractitionerList(data);
                    deferred.resolve();
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function _getAffiliatedPatients() {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, undefined, vm.organization.id)
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

        function _getAffiliatedPersons() {
            var deferred = $q.defer();
            personService.getPersons(vm.activeServer.baseUrl, undefined, vm.organization.id)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) +
                        ' Persons from ' + vm.activeServer.name + '.');
                    common.changePersonList(data);
                    deferred.resolve();
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function showSource($event) {
            _showRawData(vm.organization, $event);
        }

        vm.showSource = showSource;

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

        function goToPartOf(resourceReference) {
            var id = ($filter)('idFromURL')(resourceReference.reference);
            $location.path('/organization/get/' + id);
        }

        vm.goToPartOf = goToPartOf;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function _activate() {
            common.activateController([getActiveServer(), getOrganizationTypes()], controllerId).then(function () {
                getRequestedOrganization();
            });
        }

        function createRandomPatients(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logDebug('Creating random patients for ' + vm.organization.resourceId + '.');
            patientService.seedRandomPatients(vm.organization.id, vm.organization.name).then(
                function (result) {
                    logDebug(result, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                });
        }

        function createRandomPractitioners(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logDebug('Creating random practitioners for ' + vm.organization.resourceId + '.');
            practitionerService.seedRandomPractitioners(vm.organization.id, vm.organization.name).then(
                function (result) {
                    logDebug(result, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                });
        }

        function createRandomPersons(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logDebug('Creating random persons for ' + vm.organization.resourceId + '.');
            personService.seedRandomPersons(vm.organization.resourceId, vm.organization.name).then(
                function (result) {
                    logDebug(result, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error);
                });
        }

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
                        createRandomPatients();
                        break;
                    case 1:
                        $location.path('/organization/detailed-search');
                        break;
                    case 2:
                        $location.path('/organization');
                        break;
                    case 3:
                        $location.path('/organization/edit/current');
                        break;
                    case 4:
                        $location.path('/organization/edit/new');
                        break;
                    case 5:
                        deleteOrganization(vm.organization);
                        break;
                    case 6:
                        createRandomPractitioners();
                        break;
                    case 7:
                        createRandomPersons();
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Add random patients', icon: 'patient', index: 0},
                        {name: 'Add random practitioners', icon: 'doctor', index: 6},
                        {name: 'Add random persons', icon: 'person', index: 7},
                        {name: 'Quick find', icon: 'quickFind', index: 2},
                        {name: 'Edit organization', icon: 'edit', index: 3},
                        {name: 'Add new organization', icon: 'hospital', index: 4}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 1},
                        {name: 'Quick find', icon: 'quickFind', index: 2}
                    ];
                }
                this.title = 'Organization search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.cancel = cancel;
        vm.contactTypes = undefined;
        vm.delete = deleteOrganization;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.organization = undefined;
        vm.organizationTypes = undefined;
        vm.save = save;
        vm.searchText = undefined;
        vm.states = undefined;
        vm.title = 'organizationDetail';
        vm.createRandomPatients = createRandomPatients;
        vm.createRandomPersons = createRandomPersons;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$routeParams', '$scope', '$window', 'addressService', '$mdDialog',
            'common', 'config', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'organizationService',
            'contactPointService', 'sessionService', 'patientService', 'personService', 'practitionerService',
            organizationDetail]);

})
();