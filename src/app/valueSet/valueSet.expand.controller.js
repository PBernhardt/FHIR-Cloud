(function () {
    'use strict';

    var controllerId = 'valueSetExpandController';

    function valueSetExpandController(common, valueSetService) {
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var noToast = false;
        /* jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([], controllerId).then(function () {
            });
        }

        function expandValueSet(searchText) {
            var deferred = $q.defer();
            var vs = valueSetService.getActiveValueSet();
            valueSetService.getFilteredExpansion(vs.id, searchText)
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
        ['common', 'valueSetService', valueSetExpandController]);
})();