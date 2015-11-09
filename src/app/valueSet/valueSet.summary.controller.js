(function () {
    'use strict';

    var controllerId = 'valueSetSummary';

    function valueSetSummary($location, $scope, $routeParams, common, config, fhirServers, valueSetService) {
        /*jshint validthis:true */
        var vm = this;
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;
        var $q = common.$q;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                    if ($routeParams.hashKey == 'refresh') {
                        return _summary();
                    }
                }, function (error) {
                    logError('Error initializing valueSet search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToValueSet(id) {
            if (id) {
                $location.path('/valueSet/view/' + id);
            }
        }
        vm.goToValueSet = goToValueSet;

        function dereferenceLink(url) {
            var deferred = $q.defer();
            vm.isBusy = true;
            valueSetService.getValueSetsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' ValueSets from ' +
                        vm.activeServer.name + '.');
                    common.changeValueSetList(data);
                    deferred.resolve();
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                })
                .then(_processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }
        vm.dereferenceLink = dereferenceLink;

        $scope.$on(config.events.valueSetListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("ValueSet list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.valueSets = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function _summary() {
            var deferred = $q.defer();
            vm.noresults = false;
            valueSetService.getValueSetSummary()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' ValueSets', null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    common.changeValueSetList(data);
                    deferred.resolve();
                }, function (error) {
                    logError('Error getting value sets', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.activeServer = null;
        vm.valueSets = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$scope', '$routeParams', 'common', 'config', 'fhirServers', 'valueSetService', valueSetSummary]);
})();
