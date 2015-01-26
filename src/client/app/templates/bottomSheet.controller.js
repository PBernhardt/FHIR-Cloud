(function () {
    'use strict';

    var controllerId = 'bottomSheetController';

    function bottomSheet($scope, $mdBottomSheet, common, items) {
        function listItemClick($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        }

        function activate() {
            common.activateController(controllerId).then(function () {
            });
        }

        $scope.items = items;
        $scope.listItemClick = listItemClick;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$scope', '$mdBottomSheet', 'common', 'items', bottomSheet]);
})();