(function () {
    'use strict';

    var controllerId = 'operationDefinitionSearch';

    function operationDefinitionSearch($location, $mdSidenav, common, config, fhirServers, operationDefinitionService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            operationDefinitionService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    $mdSidenav('right').close();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/operationDefinition/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.operationDefinitions = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                operationDefinitionService.getOperationDefinitions(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' OperationDefinitions from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            operationDefinitionService.getOperationDefinitionsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.operationDefinitions) ? data.operationDefinitions.length : 0) + ' OperationDefinitions from ' + vm.activeServer.name);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.operationDefinitions = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'OperationDefinitions';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'operationDefinitionService', operationDefinitionSearch]);
})();
