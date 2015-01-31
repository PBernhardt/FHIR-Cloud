(function () {
    'use strict';

    var controllerId = 'conformanceDetail';

    function conformanceDetail($location, $mdDialog, $routeParams, common, fhirServers, identifierService, conformanceService, contactPointService) {
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

        function deleteConformance(conformance) {
            function executeDelete() {
                if (conformance && conformance.resourceId && conformance.hashKey) {
                    conformanceService.deleteCachedConformance(conformance.hashKey, conformance.resourceId)
                        .then(function () {
                            logSuccess("Deleted conformance " + conformance.name);
                            $location.path('/conformances');
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

        function edit(conformance) {
            if (conformance && conformance.hashKey) {
                $location.path('/conformance/edit/' + conformance.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedConformance() {
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
                vm.conformance = rawData;
                if (angular.isUndefined(vm.conformance.code)) {
                    vm.conformance.code = {"coding": []};
                }
                vm.title = vm.conformance.name;
                identifierService.init(vm.conformance.identifier);
                contactPointService.init(vm.conformance.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = conformanceService.initializeNewConformance();
                intitializeRelatedData(data);
                vm.title = 'Add New Conformance';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    conformanceService.getCachedConformance($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Conformance/' + $routeParams.id;
                    conformanceService.getConformance(resourceId)
                        .then(intitializeRelatedData, function (error) {
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

        function processResult(results) {
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

        function save() {
            if (vm.conformance.name.length < 5) {
                logError("Conformance Name must be at least 5 characters");
                return;
            }
            var conformance = conformanceService.initializeNewConformance().resource;
            conformance.name = vm.conformance.name;
            conformance.identifier = identifierService.getAll();
            if (vm.isEditing) {
                conformanceService.updateConformance(vm.conformance.resourceId, conformance)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                conformanceService.addConformance(conformance)
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
                getRequestedConformance();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteConformance;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.conformance = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'conformanceDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$routeParams', 'common', 'fhirServers', 'identifierService', 'conformanceService', 'contactPointService', conformanceDetail]);

})();