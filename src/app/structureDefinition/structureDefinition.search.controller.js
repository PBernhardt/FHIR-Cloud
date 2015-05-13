(function () {
    'use strict';

    var controllerId = 'structureDefinitionSearch';

    function structureDefinitionSearch($location, common, config, fhirServers, structureDefinitionService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var noToast = false;

        /* jshint validthis:true */
        var vm = this;

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                });
        }

        function goToStructureDefinition(hash) {
            if (hash) {
                $location.path('/structureDefinition/view/' + hash);
            }
        }

        vm.goToStructureDefinition = goToStructureDefinition;


        function quickSearch(searchText) {
            var deferred = $q.defer();
            vm.noresults = false;
            structureDefinitionService.getStructureDefinitions(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) +
                        ' StructureDefinitions from ' + vm.activeServer.name, null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError("Error returning search results", (angular.isDefined(error.outcome) ? error.outcome : error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        vm.activeServer = null;
        vm.structureDefinitions = [];
        vm.errorOutcome = null;
        vm.selectedStructureDefinition = undefined;
        vm.searchText = '';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', 'common', 'config', 'fhirServers', 'structureDefinitionService', structureDefinitionSearch]);
})();
