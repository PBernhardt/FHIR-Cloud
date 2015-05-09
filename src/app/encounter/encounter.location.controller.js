(function () {
    'use strict';

    var controllerId = 'encounterLocation';

    function encounterLocation(common, fhirServers, encounterValueSets, locationService, encounterLocationService) {

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

        function _initializeReferences() {
            vm.encounterLocations = encounterLocationService.getAll();
            vm.locationStatuses = encounterValueSets.encounterLocationStatus();
        }

        function getLocationReference(input) {
            var deferred = $q.defer();
            locationService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getLocationReference = getLocationReference;

        function addToList(form, location) {
            encounterLocationService.add(location);
            vm.encounterLocations = encounterLocationService.getAll();
            form.$setPristine();
        }

        vm.addToList = addToList;

        function removeFromList(location) {
            encounterLocationService.remove(location);
            vm.encounterLocations = encounterLocationService.getAll();
        }

        vm.removeFromList = removeFromList;

        vm.activeServer = null;
        vm.encounterLocations = [];
        vm.locationSearchText = '';
        vm.selectedEncounterLocation = null;
        vm.encounterLocale = {
            "location": null,
            "status": null,
            "period": null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'encounterValueSets', 'locationService', 'encounterLocationService', encounterLocation]);
})();