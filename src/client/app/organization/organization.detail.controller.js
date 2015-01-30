(function () {
    'use strict';

    var controllerId = 'organizationDetail';

    function organizationDetail($location, $mdSidenav, $routeParams, $window, addressService, $mdDialog, common, contactService, fhirServers, identifierService, localValueSets, organizationService, contactPointService, sessionService, patientService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

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
                if (organization && organization.resourceId && organization.hashKey) {
                    organizationService.deleteCachedOrganization(organization.hashKey, organization.resourceId)
                        .then(function () {
                            logSuccess("Deleted organization " + organization.name);
                            $location.path('/organizations');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + organization.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

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

        function getOrganizationTypes() {
            vm.organizationTypes = localValueSets.organizationType();
        }

        function getRequestedOrganization() {
            function intitializeRelatedData(data) {
                vm.organization = data.resource;
                if (angular.isUndefined(vm.organization.type)) {
                    vm.organization.type = {"coding": []};
                }
                vm.title = vm.organization.name;
                identifierService.init(vm.organization.identifier);
                addressService.init(vm.organization.address, false);
                contactService.init(vm.organization.contact);
                contactPointService.init(vm.organization.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = organizationService.initializeNewOrganization();
                intitializeRelatedData(data);
                vm.title = 'Add New Organization';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    organizationService.getCachedOrganization($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.organization = vm.organization;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Organization/' + $routeParams.id;
                    organizationService.getOrganization(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
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
                logWarning("Organization saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.organization.resourceId = common.setResourceId(vm.organization.resourceId, resourceVersionId);
                logSuccess("Organization saved at " + resourceVersionId);
            }
            // vm.organization.fullName = organization.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.organization.name.length < 5) {
                logError("Organization Name must be at least 5 characters");
                return;
            }
            var organization = organizationService.initializeNewOrganization().resource;
            organization.name = vm.organization.name;
            organization.type = vm.organization.type;
            organization.address = addressService.mapFromViewModel();
            organization.telecom = contactPointService.mapFromViewModel();
            organization.contact = contactService.mapFromViewModel();
            organization.partOf = vm.organization.partOf;
            organization.identifier = identifierService.getAll();
            organization.active = vm.organization.active;
            if (vm.isEditing) {
                organizationService.updateOrganization(vm.organization.resourceId, organization)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                organizationService.addOrganization(organization)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function activate() {
            common.activateController([getActiveServer(), getOrganizationTypes()], controllerId).then(function () {
                getRequestedOrganization();
            });
        }

        function createRandomPatients(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logSuccess("Creating random patients for " + vm.organization.resourceId);
            patientService.seedRandomPatients(vm.organization.resourceId, vm.organization.name).then(
                function (result) {
                    logSuccess(result);
                }, function (error) {
                    logError(error);
                });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deleteOrganization;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.organization = undefined;
        vm.organizationTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'organizationDetail';
        vm.toggleSideNav = toggleSideNav;
        vm.createRandomPatients = createRandomPatients;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', '$routeParams', '$window', 'addressService', '$mdDialog', 'common', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'organizationService', 'contactPointService', 'sessionService', 'patientService', organizationDetail]);

})();