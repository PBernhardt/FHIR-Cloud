(function () {
    'use strict';

    var controllerId = 'practitionerRole';

    function practitionerRole($filter, $location, $mdDialog, common, data, fhirServers,
                              organizationReferenceService, practitionerReferenceService, practitionerRoleService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function _activate() {
            common.activateController([_getActiveServer(), _initializeReferences()], controllerId).then(function () {
            });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToManagingOrganization(resourceReference) {
            $mdDialog.hide();
            var id = ($filter)('idFromURL')(resourceReference.reference);
            $location.path('/organization/get/' + id);
        }

        vm.goToManagingOrganization = goToManagingOrganization;

        function closeDialog() {
            $mdDialog.hide();
        }

        vm.closeDialog = closeDialog;

        function _initializeReferences() {
            var practitionerRoles = practitionerRoleService.getAll();
            for (var i = 0, len = practitionerRoles.length; i < len; i++) {
                var item = practitionerRoles[i];
                if (item.reference.indexOf('Practitioner/') !== -1) {
                    practitionerReferenceService.add(item);
                } else {
                    organizationReferenceService.add(item);
                }
            }
            vm.practitioners = practitionerReferenceService.getAll();
            vm.organizations = organizationReferenceService.getAll();
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function addToOrganizationList(organization) {
            if (organization) {
                organizationReferenceService.add(organization);
                vm.organizations = organizationReferenceService.getAll();
                practitionerRoleService.add(organization);
            }
        }

        vm.addToOrganizationList = addToOrganizationList;

        function removeFromOrganizationList(organization) {
            organizationReferenceService.remove(organization);
            vm.organizations = organizationReferenceService.getAll();
            practitionerRoleService.remove(organization);
        }

        vm.removeFromOrganizationList = removeFromOrganizationList;

        function getPractitionerReference(input) {
            var deferred = $q.defer();
            practitionerReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getPractitionerReference = getPractitionerReference;

        function addToPractitionerList(practitioner) {
            if (practitioner) {
                practitionerReferenceService.add(practitioner);
                vm.practitioners = practitionerReferenceService.getAll();
                practitionerRoleService.add(practitioner);
            }
        }

        vm.addToPractitionerList = addToPractitionerList;

        function removeFromPractitionerList(practitioner) {
            practitionerReferenceService.remove(practitioner);
            vm.practitioners = practitionerReferenceService.getAll();
            practitionerRoleService.remove(practitioner);
        }

        vm.removeFromPractitionerList = removeFromPractitionerList;

        vm.activeServer = null;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedOrganization = null;
        vm.selectedPractitioner = null;
        vm.data = data;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdDialog', 'common', 'data', 'fhirServers',
            'organizationReferenceService', 'practitionerReferenceService', 'practitionerRoleService', practitionerRole]);
})();