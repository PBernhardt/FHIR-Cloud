(function () {
    'use strict';

    var controllerId = 'practitionerReference';

    function practitionerReference(common, fhirServers, practitionerReferenceService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
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

        function addToList(practitioner) {
            if (practitioner) {
                logInfo("Adding " + practitioner.reference + " to list", null, noToast);
                practitionerReferenceService.add(practitioner);
                vm.practitioners = practitionerReferenceService.getAll();
            }
        }
        vm.addToList = addToList;

        function removeFromList(practitioner) {
            practitionerReferenceService.remove(practitioner);
            vm.practitioners = practitionerReferenceService.getAll();
        }

        vm.removeFromList = removeFromList;


        vm.activeServer = null;
        vm.activate = activate;
        vm.isBusy = false;
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedPractitioner = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'practitionerReferenceService', practitionerReference]);
})();