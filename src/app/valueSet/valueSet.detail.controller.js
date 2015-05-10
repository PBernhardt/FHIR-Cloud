(function () {
    'use strict';

    var controllerId = 'valueSetDetail';

    function valueSetDetail($location, $routeParams, $window, $mdDialog, common, fhirServers, valueSetService, contactPointService) {
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

        function deleteValueSet(valueSet) {
            function executeDelete() {
                if (valueSet && valueSet.resourceId && valueSet.hashKey) {
                    valueSetService.deleteCachedValueSet(valueSet.hashKey, valueSet.resourceId)
                        .then(function () {
                            logSuccess("Deleted valueSet " + valueSet.name);
                            $location.path('/valueSets');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm().title('Delete ' + valueSet.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(valueSet) {
            if (valueSet && valueSet.hashKey) {
                $location.path('/valueSet/edit/' + valueSet.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function showSource($event) {
            _showRawData(vm.valueSet, $event);
        }

        vm.showSource = showSource;

        function showInclude($event, resource) {
            $mdDialog.show({
                 templateUrl: 'valueSet/include-dialog.html',
                controller: 'valueSetInclude',
                locals: {
                    data: resource
                },
                targetEvent: $event
            });
        }

        vm.showInclude = showInclude;

        function _showRawData(item, event) {
            $mdDialog.show({
                 templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: item
                },
                targetEvent: event
            });
        }

        function getRequestedValueSet() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                vm.json = rawData;
                vm.json.text = {div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.valueSet = rawData;
                contactPointService.init(vm.valueSet.telecom, false, false);
                vm.title = vm.valueSet.name;
                if (angular.isDefined(vm.valueSet.id)) {
                    vm.valueSet.resourceId = (vm.activeServer.baseUrl + '/ValueSet/' + vm.valueSet.id);
                }
                valueSetService.setActiveValueSet(vm.valueSet);
            }

            if ($routeParams.hashKey === 'new') {
                var data = valueSetService.initializeNewValueSet();
                intitializeRelatedData(data);
                vm.title = 'Add New ValueSet';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    valueSetService.getCachedValueSet($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error, null, noToast);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/ValueSet/' + $routeParams.id;
                    valueSetService.getValueSet(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error, null, noToast);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.valueSet) {
                title = vm.title = 'Edit ' + ((vm.valueSet && vm.valueSet.fullName) || '');
            } else {
                title = vm.title = 'Add New ValueSet';
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
                logWarning("ValueSet saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.valueSet.resourceId = common.setResourceId(vm.valueSet.resourceId, resourceVersionId);
                logSuccess("ValueSet saved at " + resourceVersionId);
            }
            // vm.valueSet.fullName = valueSet.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.valueSet.name.length < 5) {
                logError("ValueSet Name must be at least 5 characters");
                return;
            }
            var valueSet = valueSetService.initializeNewValueSet().resource;
            valueSet.name = vm.valueSet.name;
            valueSet.type = vm.valueSet.type;
            valueSet.telecom = contactPointService.mapFromViewModel();
            valueSet.partOf = vm.valueSet.partOf;
            valueSet.active = vm.valueSet.active;
            if (vm.isEditing) {
                valueSetService.updateValueSet(vm.valueSet.resourceId, valueSet)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                valueSetService.addValueSet(valueSet)
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
                getRequestedValueSet();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteValueSet;
        vm.edit = edit;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.valueSet = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'valueSetDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'fhirServers', 'valueSetService', 'contactPointService', valueSetDetail]);

})();