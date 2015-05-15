(function () {
    'use strict';

    var controllerId = 'valueSetPopupController';

    function valueSetPopupController($scope, $mdDialog, common, config, data, fhirServers, valueSetService) {
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var noToast = false;

        function closeDialog() {
            $mdDialog.hide();
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    $scope.activeServer = server;
                    return $scope.activeServer;
                });
        }

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getValueSet($scope.data);
            });
        }

        function getValueSet(identifier) {
            valueSetService.getValueSets($scope.activeServer.baseUrl, undefined, identifier)
                .then(function (bundle) {
                    $scope.options = undefined;
                    $scope.valueSet = bundle.entry[0].resource;
                    if (angular.isDefined($scope.valueSet.define)) {
                        logInfo("Value set defines its own concepts", null, noToast);
                        $scope.system =  $scope.valueSet.define.system;
                        $scope.options = $scope.valueSet.define.concept;
                        $scope.valueSet.selectedCode = $scope.options[0];
                        selectionChanged();
                    }
                    else if (angular.isDefined($scope.valueSet.compose) && angular.isArray($scope.valueSet.compose.include)) {
                        logInfo("Value set includes concepts", null, noToast);
                        $scope.system = $scope.valueSet.compose.include[0].system;
                        $scope.options = $scope.valueSet.compose.include[0].concept;
                        $scope.valueSet.selectedCode = $scope.options[0];
                        selectionChanged();
                    }
                }, function (error) {
                    logError('Error returning value set', error);
                })
        }

        function expandValueSet(searchText) {
            var deferred = $q.defer();
            $scope.fetchingExpansion = true;
            valueSetService.getFilteredExpansion($scope.valueSet.id, searchText)
                .then(function (data) {
                    $scope.fetchingExpansion = false;
                    deferred.resolve(data);
                }, function (error) {
                    $scope.fetchingExpansion = false;
                    logError(error, null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function selectionChanged() {
            if ($scope.valueSet.selectedCode.system === undefined) {
                $scope.valueSet.selectedCode.system = $scope.system;
            }
        }

        $scope.data = data;
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;
        $scope.expandValueSet = expandValueSet;
        $scope.selectionChanged = selectionChanged;
        $scope.fetchingExpansion = false;
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$scope', '$mdDialog', 'common', 'config', 'data', 'fhirServers', 'valueSetService', valueSetPopupController]);
})();