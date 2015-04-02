(function () {
    'use strict';

    var controllerId = 'organizationReference';

    function organizationReference(common, fhirServers, organizationReferenceService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
            });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
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

        function addToList(organization) {
            if (organization) {
                logInfo("Adding " + organization.reference + " to list", null, noToast);
                organizationReferenceService.add(organization);
                vm.organizations = organizationReferenceService.getAll();
            }
        }
        vm.addToList = addToList;

        function removeFromList(organization) {
            organizationReferenceService.remove(organization);
            vm.organizations = organizationReferenceService.getAll();
        }

        vm.removeFromList = removeFromList;


        vm.activeServer = null;
        vm.activate = activate;
        vm.isBusy = false;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.selectedOrganization = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'organizationReferenceService', organizationReference]);
})();