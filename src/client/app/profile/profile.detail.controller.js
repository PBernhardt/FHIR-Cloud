(function () {
    'use strict';

    var controllerId = 'profileDetail';

    function profileDetail($location, $mdSidenav, $routeParams, $window, addressService, $mdDialog, common, contactService, fhirServers, identifierService, localValueSets, profileService, contactPointService, sessionService, patientService) {
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

        function deleteProfile(profile) {
            function executeDelete() {
                if (profile && profile.resourceId && profile.hashKey) {
                    profileService.deleteCachedProfile(profile.hashKey, profile.resourceId)
                        .then(function () {
                            logSuccess("Deleted profile " + profile.name);
                            $location.path('/profiles');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + profile.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(profile) {
            if (profile && profile.hashKey) {
                $location.path('/profile/edit/' + profile.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getProfileReference(input) {
            var deferred = $q.defer();
            vm.loadingProfiles = true;
            profileService.getProfileReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingProfiles = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingProfiles = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getProfileTypes() {
            vm.profileTypes = localValueSets.profileType();
        }

        function getRequestedProfile() {
            function intitializeRelatedData(data) {
                vm.profile = data.resource;
                if (angular.isUndefined(vm.profile.type)) {
                    vm.profile.type = {"coding": []};
                }
                vm.title = vm.profile.name;
                identifierService.init(vm.profile.identifier);
                addressService.init(vm.profile.address, false);
                contactService.init(vm.profile.contact);
                contactPointService.init(vm.profile.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = profileService.initializeNewProfile();
                intitializeRelatedData(data);
                vm.title = 'Add New Profile';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    profileService.getCachedProfile($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.profile = vm.profile;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Profile/' + $routeParams.id;
                    profileService.getProfile(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.profile) {
                title = vm.title = 'Edit ' + ((vm.profile && vm.profile.fullName) || '');
            } else {
                title = vm.title = 'Add New Profile';
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
                logWarning("Profile saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.profile.resourceId = common.setResourceId(vm.profile.resourceId, resourceVersionId);
                logSuccess("Profile saved at " + resourceVersionId);
            }
            // vm.profile.fullName = profile.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.profile.name.length < 5) {
                logError("Profile Name must be at least 5 characters");
                return;
            }
            var profile = profileService.initializeNewProfile().resource;
            profile.name = vm.profile.name;
            profile.type = vm.profile.type;
            profile.address = addressService.mapFromViewModel();
            profile.telecom = contactPointService.mapFromViewModel();
            profile.contact = contactService.mapFromViewModel();
            profile.partOf = vm.profile.partOf;
            profile.identifier = identifierService.getAll();
            profile.active = vm.profile.active;
            if (vm.isEditing) {
                profileService.updateProfile(vm.profile.resourceId, profile)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                profileService.addProfile(profile)
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
            common.activateController([getActiveServer(), getProfileTypes()], controllerId).then(function () {
                getRequestedProfile();
            });
        }

        function createRandomPatients(event) {
            vm.profile.resourceId = vm.activeServer.baseUrl + '/Profile/' + vm.profile.id;
            logSuccess("Creating random patients for " + vm.profile.resourceId);
            patientService.seedRandomPatients(vm.profile.resourceId, vm.profile.name).then(
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
        vm.delete = deleteProfile;
        vm.edit = edit;
        vm.getProfileReference = getProfileReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingProfiles = false;
        vm.profile = undefined;
        vm.profileTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'profileDetail';
        vm.toggleSideNav = toggleSideNav;
        vm.createRandomPatients = createRandomPatients;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$mdSidenav', '$routeParams', '$window', 'addressService', '$mdDialog', 'common', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'profileService', 'contactPointService', 'sessionService', 'patientService', profileDetail]);

})();