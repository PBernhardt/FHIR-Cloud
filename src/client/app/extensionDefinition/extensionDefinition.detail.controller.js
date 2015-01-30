(function () {
    'use strict';

    var controllerId = 'extensionDefinitionDetail';

    function extensionDefinitionDetail($location, $mdDialog, $routeParams, common, fhirServers, identifierService, extensionDefinitionService, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var noToast = false;

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteExtensionDefinition(extensionDefinition) {
            function executeDelete() {
                if (extensionDefinition && extensionDefinition.resourceId && extensionDefinition.hashKey) {
                    extensionDefinitionService.deleteCachedExtensionDefinition(extensionDefinition.hashKey, extensionDefinition.resourceId)
                        .then(function () {
                            logSuccess("Deleted extensionDefinition " + extensionDefinition.name);
                            $location.path('/extensionDefinitions');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + extensionDefinition.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(extensionDefinition) {
            if (extensionDefinition && extensionDefinition.hashKey) {
                $location.path('/extensionDefinition/edit/' + extensionDefinition.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedExtensionDefinition() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (angular.isDefined(rawData.text)) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative = '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.extensionDefinition = rawData;
                if (angular.isUndefined(vm.extensionDefinition.code)) {
                    vm.extensionDefinition.code = {"coding": []};
                }
                vm.title = vm.extensionDefinition.name;
                identifierService.init(vm.extensionDefinition.identifier);
                contactPointService.init(vm.extensionDefinition.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = extensionDefinitionService.initializeNewExtensionDefinition();
                intitializeRelatedData(data);
                vm.title = 'Add New ExtensionDefinition';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    extensionDefinitionService.getCachedExtensionDefinition($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/ExtensionDefinition/' + $routeParams.id;
                    extensionDefinitionService.getExtensionDefinition(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.extensionDefinition) {
                title = vm.title = 'Edit ' + ((vm.extensionDefinition && vm.extensionDefinition.fullName) || '');
            } else {
                title = vm.title = 'Add New ExtensionDefinition';
            }
            vm.title = title;
            return vm.title;
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("ExtensionDefinition saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
            } else {
                vm.extensionDefinition.resourceId = common.setResourceId(vm.extensionDefinition.resourceId, resourceVersionId);
                logSuccess("ExtensionDefinition saved at " + resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.extensionDefinition.name.length < 5) {
                logError("ExtensionDefinition Name must be at least 5 characters");
                return;
            }
            var extensionDefinition = extensionDefinitionService.initializeNewExtensionDefinition().resource;
            extensionDefinition.name = vm.extensionDefinition.name;
            extensionDefinition.identifier = identifierService.getAll();
            if (vm.isEditing) {
                extensionDefinitionService.updateExtensionDefinition(vm.extensionDefinition.resourceId, extensionDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                extensionDefinitionService.addExtensionDefinition(extensionDefinition)
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
                getRequestedExtensionDefinition();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteExtensionDefinition;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.extensionDefinition = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'extensionDefinitionDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$routeParams', 'common', 'fhirServers', 'identifierService', 'extensionDefinitionService', 'contactPointService', extensionDefinitionDetail]);

})();