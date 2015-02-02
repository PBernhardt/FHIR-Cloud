(function () {
    'use strict';

    var controllerId = 'personDetail';

    function personDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $window, addressService, common, fhirServers, identifierService, personService, contactPointService, attachmentService, humanNameService, organizationService) {
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

        function deletePerson(person) {
            function executeDelete() {
                if (person && person.resourceId && person.hashKey) {
                    personService.deleteCachedPerson(person.hashKey, person.resourceId)
                        .then(function () {
                            logInfo("Deleted person " + person.fullName);
                            $location.path('/person');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + person.fullName + '?')
                .ariaLabel('delete person')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + person.fullName);
                });
        }

        function edit(person) {
            if (person && person.hashKey) {
                $location.path('/person/edit/' + person.hashKey);
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

        function getRequestedPerson() {
            function intitializeRelatedData(data) {
                vm.person = data;
                attachmentService.init([vm.person.photo], 'Photo');
                humanNameService.init(vm.person.name);
                identifierService.init(vm.person.identifier);
                addressService.init(vm.person.address, true);
                contactPointService.init(vm.person.telecom, true, true);
                vm.person.fullName = humanNameService.getFullName();
            }

            if ($routeParams.hashKey === 'new') {
                vm.person = null;
                attachmentService.reset();
                humanNameService.reset();
                identifierService.reset();
                addressService.reset();
                contactPointService.reset();
                personService.seedNewPerson()
                    .then(intitializeRelatedData)
                    .then(function () {
                        vm.title = 'Add New person';
                        vm.isEditing = false;
                    }, function (error) {
                        logError(error);
                    });
            } else {
                if ($routeParams.hashKey) {
                    personService.getCachedPerson($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Person/' + $routeParams.id;
                    personService.getPerson(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.person) {
                title = vm.title = 'Edit ' + ((vm.person && vm.person.fullName) || '');
            } else {
                title = vm.title = 'Add New person';
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
                logWarning("Person saved, but location is unavailable. CORS not implemented correctly at remote host.", true);
            } else {
                vm.person.resourceId = common.setResourceId(vm.person.resourceId, resourceVersionId);
                logInfo("Person saved at " + resourceVersionId, true);
            }
            vm.person.fullName = vm.person.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            var person = personService.initializePerson().resource;
            person.name = humanNameService.mapFromViewModel();
            person.photo = attachmentService.getAll()[0];
            person.address = addressService.mapFromViewModel();
            person.telecom = contactPointService.mapFromViewModel();
            person.identifier = identifierService.getAll();
            person.gender = vm.person.gender;
            person.birthDate = vm.person.birthDate;
            person.link = vm.person.link;
            person.managingOrganization = vm.person.managingOrganization;
            if (vm.isEditing) {
                personService.updatePerson(vm.person.resourceId, person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                personService.addPerson(person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function personActionsMenu($event) {
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
                        $location.path('/person/edit/' + vm.person.$$hashKey);
                        break;
                    case 'Add':
                        $location.path('/person/edit/new');
                        break;
                    case 'Locate':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Delete':
                        deletePerson(vm.person, $event);
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
                getRequestedPerson();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deletePerson;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.person = undefined;
        vm.personTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'Person Detail';
        vm.personActionsMenu = personActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$window', 'addressService', 'common', 'fhirServers', 'identifierService', 'personService', 'contactPointService', 'attachmentService', 'humanNameService', 'organizationService', personDetail]);

})();