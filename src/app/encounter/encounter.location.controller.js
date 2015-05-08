(function () {
    'use strict';

    var controllerId = 'encounterLocation';

    function encounterLocation(common, fhirServers, organizationReferenceService, practitionerReferenceService, encounterLocationService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function activate() {
            common.activateController([getActiveServer(), initializeReferences()], controllerId).then(function () {
            });
        }
        vm.activate = activate;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function initializeReferences()
        {
            var encounterLocations = encounterLocationService.getAll();
            for (var i = 0, len = encounterLocations.length; i < len; i++) {
                var item = encounterLocations[i];
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
                encounterLocationService.add(organization);
            }
        }

        vm.addToOrganizationList = addToOrganizationList;

        function removeFromOrganizationList(organization) {
            organizationReferenceService.remove(organization);
            vm.organizations = organizationReferenceService.getAll();
            encounterLocationService.remove(organization);
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
                encounterLocationService.add(practitioner);
            }
        }

        vm.addToPractitionerList = addToPractitionerList;

        function removeFromPractitionerList(practitioner) {
            practitionerReferenceService.remove(practitioner);
            vm.practitioners = practitionerReferenceService.getAll();
            encounterLocationService.remove(practitioner);
        }

        vm.removeFromPractitionerList = removeFromPractitionerList;

        vm.activeServer = null;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedOrganization = null;
        vm.selectedPractitioner = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'organizationReferenceService', 'practitionerReferenceService', 'encounterLocationService', encounterLocation]);
})();