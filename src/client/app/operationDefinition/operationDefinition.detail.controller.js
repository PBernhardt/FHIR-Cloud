(function () {
    'use strict';

    var controllerId = 'operationDefinitionDetail';

    function operationDefinitionDetail($location, $routeParams, $window, $mdDialog, common, contactPointService, fhirServers, operationDefinitionService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteOperationDefinition(operationDefinition) {
            function executeDelete() {
                if (operationDefinition && operationDefinition.resourceId && operationDefinition.hashKey) {
                    operationDefinitionService.deleteCachedOperationDefinition(operationDefinition.hashKey, operationDefinition.resourceId)
                        .then(function () {
                            logSuccess("Deleted operationDefinition " + operationDefinition.name);
                            $location.path('/operationDefinitions');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + operationDefinition.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(operationDefinition) {
            if (operationDefinition && operationDefinition.hashKey) {
                $location.path('/operationDefinition/edit/' + operationDefinition.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

         function getRequestedOperationDefinition() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.operationDefinition = rawData;
                contactPointService.init(vm.operationDefinition.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = operationDefinitionService.initializeNewOperationDefinition();
                intitializeRelatedData(data);
                vm.title = 'Add New OperationDefinition';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    operationDefinitionService.getCachedOperationDefinition($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/OperationDefinition/' + $routeParams.id;
                    operationDefinitionService.getOperationDefinition(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("OperationDefinition saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.operationDefinition.resourceId = common.setResourceId(vm.operationDefinition.resourceId, resourceVersionId);
                logSuccess("OperationDefinition saved at " + resourceVersionId);
            }
            vm.isEditing = true;
        }

        function save() {
            if (vm.operationDefinition.name.length < 5) {
                logError("OperationDefinition Name must be at least 5 characters");
                return;
            }
            var operationDefinition = operationDefinitionService.initializeNewOperationDefinition().resource;
            operationDefinition.name = vm.operationDefinition.name;
            operationDefinition.id = vm.operationDefinition.id;
            operationDefinition.text = vm.operationDefinition.text;
            operationDefinition.title = vm.operationDefinition.title;
            operationDefinition.telecom = contactPointService.mapFromViewModel();
            operationDefinition.status = vm.operationDefinition.status;
            operationDefinition.kind = vm.operationDefinition.kind;
            operationDefinition.instance = vm.operationDefinition.instance;
            operationDefinition.parameter = [];
            if (vm.isEditing) {
                operationDefinitionService.updateOperationDefinition(vm.operationDefinition.resourceId, operationDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                operationDefinitionService.addOperationDefinition(operationDefinition)
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
                getRequestedOperationDefinition();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteOperationDefinition;
        vm.edit = edit;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.operationDefinition = undefined;
        vm.operationDefinitionTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'operationDefinitionDetail';

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'contactPointService', 'fhirServers', 'operationDefinitionService', operationDefinitionDetail]);

})();