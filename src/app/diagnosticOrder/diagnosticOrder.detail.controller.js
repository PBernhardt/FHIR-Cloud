(function () {
    'use strict';

    var controllerId = 'diagnosticOrderDetail';

    function diagnosticOrderDetail($filter, $location, $mdBottomSheet, $routeParams, $scope, $window, addressService,
                                $mdDialog, common, contactService, fhirServers, identifierService, localValueSets,
                                diagnosticOrderService, contactPointService, sessionService, patientService, personService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var $q = common.$q;
        var noToast = false;

        $scope.$on('server.changed',
            function (event, data) {
                vm.activeServer = data.activeServer;
                logInfo("Remote server changed to " + vm.activeServer.name);
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

        function deleteDiagnosticOrder(diagnosticOrder) {
            function executeDelete() {
                if (diagnosticOrder && diagnosticOrder.resourceId) {
                    diagnosticOrderService.deleteCachedDiagnosticOrder(diagnosticOrder.hashKey, diagnosticOrder.resourceId)
                        .then(function () {
                            logSuccess("Deleted diagnosticOrder " + diagnosticOrder.name);
                            $location.path('/diagnosticOrder');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            if (angular.isDefined(diagnosticOrder) && diagnosticOrder.resourceId) {
                var confirm = $mdDialog.confirm().title('Delete ' + diagnosticOrder.name + '?').ok('Yes').cancel('No');
                $mdDialog.show(confirm).then(executeDelete);
            } else {
                logInfo("You must first select an diagnosticOrder to delete.")
            }
        }

        function edit(diagnosticOrder) {
            if (diagnosticOrder && diagnosticOrder.hashKey) {
                $location.path('/diagnosticOrder/edit/' + diagnosticOrder.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getDiagnosticOrderReference(input) {
            var deferred = $q.defer();
            diagnosticOrderService.getDiagnosticOrderReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' DiagnosticOrders from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting diagnosticOrders', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getDiagnosticOrderTypes() {
            vm.diagnosticOrderTypes = localValueSets.diagnosticOrderType();
        }

        function getRequestedDiagnosticOrder() {
            function initializeRelatedData(data) {
                vm.diagnosticOrder = data.resource || data;
                if (angular.isUndefined(vm.diagnosticOrder.type)) {
                    vm.diagnosticOrder.type = {"coding": []};
                }
                vm.diagnosticOrder.resourceId = vm.activeServer.baseUrl + '/DiagnosticOrder/' + vm.diagnosticOrder.id;
                vm.title = vm.diagnosticOrder.name;
                identifierService.init(vm.diagnosticOrder.identifier, "multi", "diagnosticOrder");
                addressService.init(vm.diagnosticOrder.address, false);
                contactService.init(vm.diagnosticOrder.contact);
                contactPointService.init(vm.diagnosticOrder.telecom, false, false);

                if (vm.lookupKey !== "new") {
                    $window.localStorage.diagnosticOrder = JSON.stringify(vm.diagnosticOrder);
                }
            }

            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.diagnosticOrder) || ($window.localStorage.diagnosticOrder === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/diagnosticOrder');
                    }
                } else {
                    vm.diagnosticOrder = JSON.parse($window.localStorage.diagnosticOrder);
                    vm.diagnosticOrder.hashKey = "current";
                    initializeRelatedData(vm.diagnosticOrder);
                }
            } else if (vm.lookupKey === 'new') {
                var data = diagnosticOrderService.initializeNewDiagnosticOrder();
                initializeRelatedData(data);
                vm.title = 'Add New DiagnosticOrder';
                vm.isEditing = false;
            } else if (angular.isDefined($routeParams.resourceId)) {
                var fullPath = vm.activeServer.baseUrl + '/DiagnosticOrder/' + $routeParams.resourceId;
                logInfo("Fetching " + fullPath, null, noToast);
                diagnosticOrderService.getDiagnosticOrder(fullPath)
                    .then(initializeRelatedData).then(function () {
                        var session = sessionService.getSession();
                        session.diagnosticOrder = vm.diagnosticOrder;
                        sessionService.updateSession(session);
                    }, function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            } else {
                if (vm.lookupKey) {
                    diagnosticOrderService.getCachedDiagnosticOrder(vm.lookupKey)
                        .then(initializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.diagnosticOrder = vm.diagnosticOrder;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/DiagnosticOrder/' + $routeParams.id;
                    diagnosticOrderService.getDiagnosticOrder(resourceId)
                        .then(initializeRelatedData, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.diagnosticOrder) {
                title = vm.title = 'Edit ' + ((vm.diagnosticOrder && vm.diagnosticOrder.fullName) || '');
            } else {
                title = vm.title = 'Add New DiagnosticOrder';
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
                logInfo("DiagnosticOrder saved, but location is unavailable. CORS is not implemented correctly at " + vm.activeServer.name);
            } else {
                logInfo("DiagnosticOrder saved at " + resourceVersionId);
                vm.diagnosticOrder.resourceVersionId = resourceVersionId;
                vm.diagnosticOrder.resourceId = common.setResourceId(vm.diagnosticOrder.resourceId, resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.diagnosticOrder.name.length < 5) {
                logError("DiagnosticOrder Name must be at least 5 characters");
                return;
            }
            var diagnosticOrder = diagnosticOrderService.initializeNewDiagnosticOrder().resource;
            diagnosticOrder.name = vm.diagnosticOrder.name;
            diagnosticOrder.type = vm.diagnosticOrder.type;
            diagnosticOrder.address = addressService.mapFromViewModel();
            diagnosticOrder.telecom = contactPointService.mapFromViewModel();
            diagnosticOrder.contact = contactService.mapFromViewModel();
            diagnosticOrder.partOf = vm.diagnosticOrder.partOf;
            diagnosticOrder.identifier = identifierService.getAll();
            diagnosticOrder.active = vm.diagnosticOrder.active;
            if (vm.isEditing) {
                diagnosticOrder.id = vm.diagnosticOrder.id;
                diagnosticOrderService.updateDiagnosticOrder(vm.diagnosticOrder.resourceId, diagnosticOrder)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            } else {
                diagnosticOrderService.addDiagnosticOrder(diagnosticOrder)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
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
            common.activateController([getActiveServer(), getDiagnosticOrderTypes()], controllerId).then(function () {
                getRequestedDiagnosticOrder();
            });
        }

        function createRandomPatients(event) {
            vm.diagnosticOrder.resourceId = vm.activeServer.baseUrl + '/DiagnosticOrder/' + vm.diagnosticOrder.id;
            logSuccess("Creating random patients for " + vm.diagnosticOrder.name);
            patientService.seedRandomPatients(vm.diagnosticOrder.id, vm.diagnosticOrder.name).then(
                function (result) {
                    logSuccess(result, null, noToast);
                }, function (error) {
                    logError($filter('unexpectedOutcome')(error));
                });
        }

        function createRandomPersons(event) {
            vm.diagnosticOrder.resourceId = vm.activeServer.baseUrl + '/DiagnosticOrder/' + vm.diagnosticOrder.id;
            logSuccess("Creating random patients for " + vm.diagnosticOrder.resourceId);
            personService.seedRandomPersons(vm.diagnosticOrder.resourceId, vm.diagnosticOrder.name).then(
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
                        $location.path('/patient/org/' + vm.diagnosticOrder.id);
                        break;
                    case 2:
                        $location.path('/diagnosticOrder/detailed-search');
                        break;
                    case 3:
                        $location.path('/diagnosticOrder');
                        break;
                    case 4:
                        $location.path('/diagnosticOrder/edit/current');
                        break;
                    case 5:
                        $location.path('/diagnosticOrder/edit/new');
                        break;
                    case 6:
                        deleteDiagnosticOrder(vm.diagnosticOrder);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Add random patients', icon: 'groupAdd', index: 0},
                        {name: 'Get patients', icon: 'group', index: 1},
                        {name: 'Quick find', icon: 'quickFind', index: 3},
                        {name: 'Edit diagnosticOrder', icon: 'edit', index: 4},
                        {name: 'Add new diagnosticOrder', icon: 'hospital', index: 5}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 2},
                        {name: 'Quick find', icon: 'quickFind', index: 3}
                    ];
                }
                this.title = 'DiagnosticOrder search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deleteDiagnosticOrder;
        vm.edit = edit;
        vm.getDiagnosticOrderReference = getDiagnosticOrderReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingDiagnosticOrders = false;
        vm.diagnosticOrder = undefined;
        vm.diagnosticOrderTypes = undefined;
        vm.save = save;
        vm.searchText = undefined;
        vm.states = undefined;
        vm.title = 'diagnosticOrderDetail';
        vm.createRandomPatients = createRandomPatients;
        vm.createRandomPersons = createRandomPersons;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$routeParams', '$scope', '$window', 'addressService', '$mdDialog',
            'common', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'diagnosticOrderService',
            'contactPointService', 'sessionService', 'patientService', 'personService', diagnosticOrderDetail]);

})
();