(function () {
    'use strict';

    var controllerId = 'valueSetExpandController';

    function valueSetExpandController(common, fhirServers, valueSetService) {
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logError = common.logger.getLogFn(controllerId, 'error');
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
            common.activateController([_getActiveServer()], controllerId).then(function () {
            });
        }

        function expandValueSet(searchText) {
            var deferred = $q.defer();
            var vs = valueSetService.getActiveValueSet();
            valueSetService.getFilteredExpansion(vm.activeServer.baseUrl, vs.id, searchText)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError("Error fetching expansion", error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }
        vm.expandValueSet = expandValueSet;

        function setConcept(concept) {
            vm.concept = concept;
        }
        vm.setConcept = setConcept;

        vm.concept = undefined;
        vm.selectedConcept = undefined;
        vm.searchText = undefined;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'valueSetService', valueSetExpandController]);
})();