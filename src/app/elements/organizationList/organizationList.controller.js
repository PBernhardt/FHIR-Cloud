(function () {
    'use strict';

    var controllerId = 'organizationList';

    function organizationList($location, $scope, common, config, fhirServers, organizationService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing organization search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToOrganization(organization) {
            if (organization && organization.$$hashKey) {
                $location.path('/organization/view/' + organization.$$hashKey);
            }
        }
        vm.goToOrganization = goToOrganization;

        function dereferenceLink(url) {
            vm.isBusy = true;
            organizationService.getOrganizationsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from ' +
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

        $scope.$on(config.events.organizationListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Organization list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.organizations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        vm.activeServer = null;
        vm.organizations = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$scope', 'common', 'config', 'fhirServers', 'organizationService', organizationList]);
})();
