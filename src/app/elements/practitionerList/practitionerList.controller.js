(function () {
    'use strict';

    var controllerId = 'practitionerList';

    function practitionerList($location, $scope, common, config, fhirServers, practitionerService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing practitioner search', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToPractitioner(id) {
            if (id) {
                $location.path('/practitioner/view/' + id);
            }
        }
        vm.goToPractitioner = goToPractitioner;

        function dereferenceLink(url) {
            vm.isBusy = true;
            practitionerService.getPractitionersByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' +
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

        $scope.$on(config.events.practitionerListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Practitioner list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.practitioners = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        vm.activeServer = null;
        vm.practitioners = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$scope', 'common', 'config', 'fhirServers', 'practitionerService', practitionerList]);
})();
