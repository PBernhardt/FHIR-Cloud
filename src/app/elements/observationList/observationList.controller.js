(function () {
    'use strict';

    var controllerId = 'observationList';

    function observationList($location, $mdDialog, $scope, common, config, fhirServers, observationService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing observation search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToObservation(observation) {
            if (observation && observation.$$hashKey) {
                $location.path('/observation/view/' + observation.$$hashKey);
            }
        }
        vm.goToObservation = goToObservation;

        function dereferenceLink(url) {
            vm.isBusy = true;
            observationService.getObservationsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Observations from ' +
                        vm.activeServer.name + '.');
                    return data;
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                })
                .then(_processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }
        vm.dereferenceLink = dereferenceLink;

        $scope.$on(config.events.observationListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Observation list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.observations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function showRawData($index, $event) {
            _showRawData(vm.observations[$index], $event);
        }

        vm.showRawData = showRawData;

        function _showRawData(item, event) {
            $mdDialog.show({
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: item
                },
                targetEvent: event,
                clickOutsideToClose: true
            });
        }

        vm.activeServer = null;
        vm.observations = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$scope', 'common', 'config', 'fhirServers', 'observationService', observationList]);
})();
