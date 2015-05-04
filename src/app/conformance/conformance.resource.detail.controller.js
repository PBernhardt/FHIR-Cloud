(function () {
    'use strict';

    var controllerId = 'conformanceResource';

    function rawData($scope, $mdDialog, common, data) {
        function closeDialog() {
            $mdDialog.hide();
        }

        function activate() {
            common.activateController(controllerId).then(function () {
            });
        }

        $scope.data = data;
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$scope', '$mdDialog', 'common', 'data', rawData]);
})();