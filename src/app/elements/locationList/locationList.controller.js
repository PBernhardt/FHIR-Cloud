(function () {
    'use strict';

    var controllerId = 'locationList';

    function locationList($location, $scope, common, config, fhirServers, locationService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing location search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToLocation(location) {
            if (location && location.$$hashKey) {
                $location.path('/location/view/' + location.$$hashKey);
            }
        }
        vm.goToLocation = goToLocation;

        function dereferenceLink(url) {
            vm.isBusy = true;
            locationService.getLocationsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Locations from ' +
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

        $scope.$on(config.events.locationListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Location list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.locations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        vm.activeServer = null;
        vm.locations = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$scope', 'common', 'config', 'fhirServers', 'locationService', locationList]);
})();
