(function () {
    'use strict';

    var controllerId = 'conformanceDetail';

    function conformanceDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $scope, common, config, fhirServers, identifierService,
                               conformanceService, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var noToast = false;


        $scope.$on(config.events.serverChanged,
            function (event, server) {
                vm.activeServer = server;
                _getRequestedConformance();
            }
        );

        function _activate() {
            common.activateController([_getActiveServer()], controllerId).then(function () {
                _getRequestedConformance();
            });
        }

        function showResource($event, resource) {
            $mdDialog.show({
                templateUrl: 'conformance/conformance-resource-dialog.html',
                controller: 'conformanceResource',
                clickOutsideToClose: true,
                    locals: {
                    data: resource
                },
                targetEvent: $event
            });
        }

        vm.showResource = showResource;

        function showSource($event) {
            _showRawData(vm.conformance, $event);
        }

        vm.showSource = showSource;

        function _showRawData(item, event) {
            $mdDialog.show({
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                clickOutsideToClose: true,
                    locals: {
                    data: item
                },
                targetEvent: event
            });
        }

        function deleteConformance(conformance) {
            function executeDelete() {
                if (conformance && conformance.resourceId && conformance.hashKey) {
                    conformanceService.deleteCachedConformance(conformance.hashKey, conformance.resourceId)
                        .then(function () {
                            logSuccess("Deleted conformance " + conformance.name);
                            $location.path('/conformance');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm().title('Delete ' + conformance.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        vm.delete = deleteConformance;

        function edit(conformance) {
            if (conformance && conformance.hashKey) {
                $location.path('/conformance/edit/' + conformance.hashKey);
            }
        }

        vm.edit = edit;

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _getRequestedConformance() {
            function _initializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (angular.isDefined(rawData.text)) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative = '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = {div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.conformance = rawData;
                vm.conformance.resourceId = vm.activeServer.baseUrl + "/metadata";
                vm.title = vm.conformance.name;
                identifierService.init(vm.conformance.identifier);
                contactPointService.init(vm.conformance.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = conformanceService.initializeNewConformance();
                _initializeRelatedData(data);
                vm.title = 'Add New Conformance';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    conformanceService.getCachedConformance($routeParams.hashKey)
                        .then(_initializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Conformance/' + $routeParams.id;
                    conformanceService.getConformance(resourceId)
                        .then(_initializeRelatedData, function (error) {
                            logError(error);
                        });
                } else {
                    conformanceService.getCachedConformance(null)
                        .then(_initializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.conformance) {
                title = vm.title = 'Edit ' + ((vm.conformance && vm.conformance.fullName) || '');
            } else {
                title = vm.title = 'Add New Conformance';
            }
            vm.title = title;
            return vm.title;
        }

        vm.getTitle = getTitle;

        function save() {
            function _processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Conformance saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
                } else {
                    vm.conformance.resourceId = common.setResourceId(vm.conformance.resourceId, resourceVersionId);
                    logSuccess("Conformance saved at " + resourceVersionId);
                }
                vm.isEditing = true;
                getTitle();
            }

            if (vm.conformance.name.length < 5) {
                logError("Conformance Name must be at least 5 characters");
                return;
            }
            var conformance = conformanceService.initializeNewConformance().resource;
            conformance.name = vm.conformance.name;
            conformance.identifier = identifierService.getAll();
            if (vm.isEditing) {
                conformanceService.updateConformance(vm.conformance.resourceId, conformance)
                    .then(_processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                conformanceService.addConformance(conformance)
                    .then(_processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        vm.save = save;

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
                        $location.path('/conformance/detailed-search');
                        break;
                    case 1:
                        $location.path('/conformance');
                        break;
                    case 2:
                        $location.path('/conformance/edit/current');
                        break;
                    case 3:
                        $location.path('/conformance/edit/new');
                        break;
                    case 4:
                        deleteConformance(vm.conformance);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Quick find', icon: 'quickFind', index: 1},
                        {name: 'Edit conformance', icon: 'edit', index: 2},
                        {name: 'Add new conformance', icon: 'hospital', index: 3}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 0},
                        {name: 'Quick find', icon: 'quickFind', index: 1}
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
        vm.isSaving = false;
        vm.isEditing = true;
        vm.conformance = undefined;
        vm.title = 'Conformance Statement';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', 'common', 'config', 'fhirServers',
            'identifierService', 'conformanceService', 'contactPointService', conformanceDetail]);
})
();