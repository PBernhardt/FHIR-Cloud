(function () {
    'use strict';

    var controllerId = 'relatedPersonDetail';

    function relatedPersonDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $window, addressService, common, fhirServers, identifierService, relatedPersonService, contactPointService, attachmentService, humanNameService, organizationService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
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

        function deleteRelatedperson(relatedPerson) {
            function executeDelete() {
                if (relatedPerson && relatedPerson.resourceId && relatedPerson.hashKey) {
                    relatedPersonService.deleteCachedRelatedperson(relatedPerson.hashKey, relatedPerson.resourceId)
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

        function edit(relatedPerson) {
            if (relatedPerson && relatedPerson.hashKey) {
                $location.path('/relatedPerson/edit/' + relatedPerson.hashKey);
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

        function getRequestedRelatedperson() {
            function intitializeRelatedData(data) {
                vm.relatedPerson = data;
                attachmentService.init([vm.relatedPerson.photo], 'Photo');
                humanNameService.init(vm.relatedPerson.name);
                identifierService.init(vm.relatedPerson.identifier);
                addressService.init(vm.relatedPerson.address, true);
                contactPointService.init(vm.relatedPerson.telecom, true, true);
                vm.relatedPerson.fullName = humanNameService.getFullName();
            }

            if ($routeParams.hashKey === 'new') {
                vm.relatedPerson = null;
                attachmentService.reset();
                humanNameService.reset();
                identifierService.reset();
                addressService.reset();
                contactPointService.reset();
                relatedPersonService.seedNewRelatedperson()
                    .then(intitializeRelatedData)
                    .then(function () {
                        vm.title = 'Add New relatedPerson';
                        vm.isEditing = false;
                    }, function (error) {
                        logError(error);
                    });
            } else {
                if ($routeParams.hashKey) {
                    relatedPersonService.getCachedRelatedperson($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Relatedperson/' + $routeParams.id;
                    relatedPersonService.getRelatedperson(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.relatedPerson) {
                title = vm.title = 'Edit ' + ((vm.relatedPerson && vm.relatedPerson.fullName) || '');
            } else {
                title = vm.title = 'Add New relatedPerson';
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
                logWarning("Relatedperson saved, but location is unavailable. CORS not implemented correctly at remote host.", true);
            } else {
                vm.relatedPerson.resourceId = common.setResourceId(vm.relatedPerson.resourceId, resourceVersionId);
                logInfo("Relatedperson saved at " + resourceVersionId, true);
            }
            vm.relatedPerson.fullName = vm.relatedPerson.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            var relatedPerson = relatedPersonService.initializeRelatedperson().resource;
            relatedPerson.name = humanNameService.mapFromViewModel();
            relatedPerson.photo = attachmentService.getAll()[0];
            relatedPerson.address = addressService.mapFromViewModel();
            relatedPerson.telecom = contactPointService.mapFromViewModel();
            relatedPerson.identifier = identifierService.getAll();
            relatedPerson.gender = vm.relatedPerson.gender;
            relatedPerson.birthDate = vm.relatedPerson.birthDate;
            relatedPerson.link = vm.relatedPerson.link;
            relatedPerson.managingOrganization = vm.relatedPerson.managingOrganization;
            if (vm.isEditing) {
                relatedPersonService.updateRelatedperson(vm.relatedPerson.resourceId, relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                relatedPersonService.addRelatedperson(relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function relatedPersonActionsMenu($event) {
            var menuItems = [
                {name: 'Edit', icon: 'img/account4.svg'},
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Locate', icon: 'img/share39.svg'},
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
                        $location.path('/relatedPerson/edit/' + vm.relatedPerson.$$hashKey);
                        break;
                    case 'Add':
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 'Locate':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Delete':
                        deleteRelatedperson(vm.relatedPerson, $event);
                }
            });
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });


        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedRelatedperson();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deleteRelatedperson;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.relatedPerson = undefined;
        vm.relatedPersonTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'Relatedperson Detail';
        vm.relatedPersonActionsMenu = relatedPersonActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$window', 'addressService', 'common', 'fhirServers', 'identifierService', 'relatedPersonService', 'contactPointService', 'attachmentService', 'humanNameService', 'organizationService', relatedPersonDetail]);

})();