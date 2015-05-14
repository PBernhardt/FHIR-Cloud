(function () {
    'use strict';

    var controllerId = 'rawDataController';

    function rawData($anchorScroll, $location, $scope, $mdDialog, common, data) {
        function closeDialog() {
            $mdDialog.hide();
        }

        function activate() {
            common.activateController(controllerId).then(function () {
                $anchorScroll('top');
            });
        }

        $scope.data = angular.toJson(data, true);
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$anchorScroll', '$location', '$scope', '$mdDialog', 'common', 'data', rawData]);
})();