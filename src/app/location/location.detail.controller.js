(function () {
    'use strict';

    var controllerId = 'locationDetail';

    function locationDetail($filter, $location, $mdBottomSheet, $routeParams, $scope, $window, addressService,
                                $mdDialog, common, config, contactService, fhirServers, identifierService, localValueSets,
                                locationService, contactPointService, sessionService, patientService, personService,
                                practitionerService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
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

        function deleteLocation(location) {
            function executeDelete() {
                if (location && location.resourceId) {
                    locationService.deleteCachedLocation(location.hashKey, location.resourceId)
                        .then(function () {
                            logSuccess("Deleted location " + location.name);
                            $location.path('/location');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            if (angular.isDefined(location) && location.resourceId) {
                var confirm = $mdDialog.confirm().title('Delete ' + location.name + '?').ok('Yes').cancel('No');
                $mdDialog.show(confirm).then(executeDelete);
            } else {
                logInfo("You must first select an location to delete.")
            }
        }

        function edit(location) {
            if (location && location.hashKey) {
                $location.path('/location/edit/' + location.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getLocationReference(input) {
            var deferred = $q.defer();
            locationService.getLocationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Locations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting locations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getLocationTypes() {
            vm.locationTypes = localValueSets.locationType();
        }

        function getRequestedLocation() {
            function initializeRelatedData(data) {
                vm.location = data.resource || data;
                if (angular.isUndefined(vm.location.type)) {
                    vm.location.type = {"coding": []};
                }
                vm.location.resourceId = vm.activeServer.baseUrl + '/Location/' + vm.location.id;
                vm.title = vm.location.name;
                identifierService.init(vm.location.identifier, "multi", "location");
                addressService.init(vm.location.address, false);
                contactService.init(vm.location.contact);
                contactPointService.init(vm.location.telecom, false, false);
                vm.isBusy = false;
                if (vm.lookupKey !== "new") {
                    $window.localStorage.location = JSON.stringify(vm.location);
                    _getAffiliatedPatients();
                    _getAffiliatedPractitioners();
                }

            }

            vm.lookupKey = $routeParams.hashKey;
            vm.isBusy = true;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.location) || ($window.localStorage.location === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/location');
                    }
                } else {
                    vm.location = JSON.parse($window.localStorage.location);
                    vm.location.hashKey = "current";
                    initializeRelatedData(vm.location);
                }
            } else if (vm.lookupKey === 'new') {
                var data = locationService.initializeNewLocation();
                initializeRelatedData(data);
                vm.title = 'Add New Location';
                vm.isEditing = false;
            } else if (angular.isDefined($routeParams.resourceId)) {
                var fullPath = vm.activeServer.baseUrl + '/Location/' + $routeParams.resourceId;
                logInfo("Fetching " + fullPath, null, noToast);
                locationService.getLocation(fullPath)
                    .then(initializeRelatedData).then(function () {
                        var session = sessionService.getSession();
                        session.location = vm.location;
                        sessionService.updateSession(session);
                    }, function (error) {
                        logError($filter('unexpectedOutcome')(error));
                        vm.isBusy = false;
                    });
            } else {
                if (vm.lookupKey) {
                    locationService.getCachedLocation(vm.lookupKey)
                        .then(initializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.location = vm.location;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                            vm.isBusy = false;
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Location/' + $routeParams.id;
                    locationService.getLocation(resourceId)
                        .then(initializeRelatedData, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                            vm.isBusy = false;
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.location) {
                title = vm.title = 'Edit ' + ((vm.location && vm.location.fullName) || '');
            } else {
                title = vm.title = 'Add New Location';
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
                logInfo("Location saved, but location is unavailable. CORS is not implemented correctly at " + vm.activeServer.name);
            } else {
                logInfo("Location saved at " + resourceVersionId);
                vm.location.resourceVersionId = resourceVersionId;
                vm.location.resourceId = common.setResourceId(vm.location.resourceId, resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.location.name.length < 5) {
                logError("Location Name must be at least 5 characters");
                return;
            }
            var location = locationService.initializeNewLocation().resource;
            location.name = vm.location.name;
            location.type = vm.location.type;
            location.address = addressService.mapFromViewModel();
            location.telecom = contactPointService.mapFromViewModel();
            location.contact = contactService.getAll();
            location.partOf = vm.location.partOf;
            location.identifier = identifierService.getAll();
            location.active = vm.location.active;
            if (vm.isEditing) {
                location.id = vm.location.id;
                locationService.updateLocation(vm.location.resourceId, location)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            } else {
                locationService.addLocation(location)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            }
        }

        function _getAffiliatedPractitioners() {
            var deferred = $q.defer();
            practitionerService.getPractitioners(vm.activeServer.baseUrl, undefined, vm.location.id)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' + vm.activeServer.name, null, noToast);
                    common.changePractitionerList(data);
                    deferred.resolve();
                }, function (error) {
                    logError('Error getting Practitioners', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function _getAffiliatedPatients() {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, undefined, vm.location.id)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' + vm.activeServer.name, null, noToast);
                    common.changePatientList(data);
                    deferred.resolve();
                }, function (error) {
                    logError('Error getting Patients', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function showSource($event) {
            _showRawData(vm.location, $event);
        }

        vm.showSource = showSource;

        function _showRawData(item, event) {
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

        function goToPartOf(resourceReference) {
            var id = ($filter)('idFromURL')(resourceReference.reference);
            $location.path('/location/get/' + id);
        }

        vm.goToPartOf = goToPartOf;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function _activate() {
            common.activateController([getActiveServer(), getLocationTypes()], controllerId).then(function () {
                getRequestedLocation();
            });
        }

        function createRandomPatients(event) {
            vm.location.resourceId = vm.activeServer.baseUrl + '/Location/' + vm.location.id;
            logSuccess("Creating random patients for " + vm.location.name);
            patientService.seedRandomPatients(vm.location.id, vm.location.name).then(
                function (result) {
                    logSuccess(result, null, noToast);
                }, function (error) {
                    logError($filter('unexpectedOutcome')(error));
                });
        }

        function createRandomPersons(event) {
            vm.location.resourceId = vm.activeServer.baseUrl + '/Location/' + vm.location.id;
            logSuccess("Creating random patients for " + vm.location.resourceId);
            personService.seedRandomPersons(vm.location.resourceId, vm.location.name).then(
                function (result) {
                    logSuccess(result, null, noToast);
                }, function (error) {
                    logError($filter('unexpectedOutcome')(error));
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
                        $location.path('/location/detailed-search');
                        break;
                    case 2:
                        $location.path('/location');
                        break;
                    case 3:
                        $location.path('/location/edit/current');
                        break;
                    case 4:
                        $location.path('/location/edit/new');
                        break;
                    case 5:
                        deleteLocation(vm.location);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Add random patients', icon: 'groupAdd', index: 0},
                        {name: 'Quick find', icon: 'quickFind', index: 2},
                        {name: 'Edit location', icon: 'edit', index: 3},
                        {name: 'Add new location', icon: 'hospital', index: 4}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 1},
                        {name: 'Quick find', icon: 'quickFind', index: 2}
                    ];
                }
                this.title = 'Location search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.cancel = cancel;
        vm.contactTypes = undefined;
        vm.delete = deleteLocation;
        vm.edit = edit;
        vm.getLocationReference = getLocationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingLocations = false;
        vm.location = undefined;
        vm.locationTypes = undefined;
        vm.save = save;
        vm.searchText = undefined;
        vm.states = undefined;
        vm.title = 'locationDetail';
        vm.createRandomPatients = createRandomPatients;
        vm.createRandomPersons = createRandomPersons;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$routeParams', '$scope', '$window', 'addressService', '$mdDialog',
            'common', 'config', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'locationService',
            'contactPointService', 'sessionService', 'patientService', 'personService', 'practitionerService',
            locationDetail]);

})
();