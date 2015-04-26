(function () {
    'use strict';

    var controllerId = 'practitionerList';

    function practitionerList($location, $scope, common, config, fhirServers, practitionerService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

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

        function goToPractitioner(practitioner) {
            if (practitioner && practitioner.$$hashKey) {
                $location.path('/practitioner/view/' + practitioner.$$hashKey);
            }
        }
        vm.goToPractitioner = goToPractitioner;

        function dereferenceLink(url) {
            vm.isBusy = true;
            practitionerService.getPractitionersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' +
                        vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    vm.isBusy = false;
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
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
                logInfo("Practitioner list updated", null, noToast);
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
