(function () {
    'use strict';

    var controllerId = 'structureDefinitionDetail';

    function structureDefinitionDetail($location, $routeParams, $window, $mdDialog, common, fhirServers, structureDefinitionService, contactPointService, valueSetService) {
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

        function deleteStructureDefinition(structureDefinition) {
            function executeDelete() {
                if (structureDefinition && structureDefinition.resourceId && structureDefinition.hashKey) {
                    structureDefinitionService.deleteCachedStructureDefinition(structureDefinition.hashKey, structureDefinition.resourceId)
                        .then(function () {
                            logSuccess("Deleted structureDefinition " + structureDefinition.name);
                            $location.path('/structureDefinitions');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + structureDefinition.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(structureDefinition) {
            if (structureDefinition && structureDefinition.hashKey) {
                $location.path('/structureDefinition/edit/' + structureDefinition.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedStructureDefinition() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (rawData.text) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative =  '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = {div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.structureDefinition = rawData;
                if (angular.isUndefined(vm.structureDefinition.type)) {
                    vm.structureDefinition.type = {"coding": []};
                }
                vm.title = vm.structureDefinition.name;
                contactPointService.init(vm.structureDefinition.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = structureDefinitionService.initializeNewStructureDefinition();
                intitializeRelatedData(data);
                vm.title = 'Add New StructureDefinition';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    structureDefinitionService.getCachedStructureDefinition($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/StructureDefinition/' + $routeParams.id;
                    structureDefinitionService.getStructureDefinition(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.structureDefinition) {
                title = vm.title = 'Edit ' + ((vm.structureDefinition && vm.structureDefinition.fullName) || '');
            } else {
                title = vm.title = 'Add New StructureDefinition';
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
                logWarning("StructureDefinition saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.structureDefinition.resourceId = common.setResourceId(vm.structureDefinition.resourceId, resourceVersionId);
                logSuccess("StructureDefinition saved at " + resourceVersionId);
            }
            // vm.structureDefinition.fullName = structureDefinition.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.structureDefinition.name.length < 5) {
                logError("StructureDefinition Name must be at least 5 characters");
                return;
            }
            var structureDefinition = structureDefinitionService.initializeNewStructureDefinition().resource;
            structureDefinition.name = vm.structureDefinition.name;
            structureDefinition.type = vm.structureDefinition.type;
            structureDefinition.telecom = contactPointService.mapFromViewModel();
            structureDefinition.active = vm.structureDefinition.active;
            if (vm.isEditing) {
                structureDefinitionService.updateStructureDefinition(vm.structureDefinition.resourceId, structureDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                structureDefinitionService.addStructureDefinition(structureDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function showFullDescription(element, event) {
            $mdDialog.show({
                 templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: element
                },
                targetEvent: event
            });
        }

        function viewStructureDefinitionDetail(structureDefinition, event) {
            console.log(structureDefinition);
        }

        function viewExtensionDefinition(extensionDefinition, event) {
            console.log(extensionDefinition);
        }

        function viewBoundValueSet(reference, event) {
            $mdDialog.show({
                 templateUrl: 'templates/valueSet-popup.html',
                controller: 'valueSetPopupController',
                locals: {
                    data: reference
                },
                targetEvent: event
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
                getRequestedStructureDefinition();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteStructureDefinition;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.structureDefinition = undefined;
        vm.save = save;
        vm.title = 'structureDefinitionDetail';
        vm.showFullDescription = showFullDescription;
        vm.viewExtensionDefinition = viewExtensionDefinition;
        vm.viewBoundValueSet = viewBoundValueSet;
        vm.viewStructureDefinitionDetail = viewStructureDefinitionDetail;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'fhirServers', 'structureDefinitionService', 'contactPointService', 'valueSetService', structureDefinitionDetail]);

})();