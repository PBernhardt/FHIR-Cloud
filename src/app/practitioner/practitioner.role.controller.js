(function () {
    'use strict';

    var controllerId = 'practitionerRole';

    function practitionerRole($filter, $location, $scope, $mdDialog, common, data) {
        function closeDialog() {
            $mdDialog.hide();
        }

        function activate() {
            common.activateController(controllerId).then(function () {
            });
        }

        function goToManagingOrganization(resourceReference) {
            $mdDialog.hide();
            var id = ($filter)('idFromURL')(resourceReference.reference);
            $location.path('/organization/get/' + id);
        }

        $scope.goToManagingOrganization = goToManagingOrganization;

        $scope.data = data;
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$scope', '$mdDialog', 'common', 'data', practitionerRole]);
})();