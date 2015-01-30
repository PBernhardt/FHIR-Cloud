(function () {
    'use strict';

    var controllerId = 'person.detail';

    function personDetail($location, $routeParams, $window, addressService, $mdDialog, common, fhirServers, identifierService, personService, contactPointService, attachmentService, humanNameService) {
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

        function deletePerson(person) {
            function confirmDelete() {
                if (person && person.resourceId && person.hashKey) {
                    personService.deleteCachedPerson(person.hashKey, person.resourceId)
                        .then(function () {
                            logSuccess("Deleted person " + person.name);
                            $location.path('/persons');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + person.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(confirmDelete);
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
            vm.loadingpersons = true;
            personService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingpersons = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingpersons = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getRequestedPerson() {
            function intitializeRelatedData(data) {
                vm.person = data.resource;
                attachmentService.init(vm.person.photo, 'Photo');
                humanNameService.init(vm.person.name);
                identifierService.init(vm.person.identifier);
                addressService.init(vm.person.address, true);
                contactPointService.init(vm.person.telecom, true, true);
            }

            if ($routeParams.hashKey === 'new') {
                vm.person = null;
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
                logSuccess("Person saved at " + resourceVersionId, true);
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
            person.active = vm.person.active;
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
        vm.loadingpersons = false;
        vm.person = undefined;
        vm.personTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'Person Detail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', 'addressService', '$mdDialog', 'common', 'fhirServers', 'identifierService', 'personService', 'contactPointService', 'attachmentService', 'humanNameService', personDetail]);

})();