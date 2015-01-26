(function () {
    'use strict';

    var controllerId = 'personSearch';

    function personSearch($location, $mdSidenav, common, config, fhirServers, personService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var keyCodes = config.keyCodes;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedPersons()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error activating controller', error, noToast);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _getCachedPersons() {
            personService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' persons from cache', null, noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goToPerson(person) {
            if (person && person.$$hashKey) {
                $location.path('/person/view/' + person.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.persons = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit() {
            if (vm.searchText.length > 0) {
                toggleSpinner(true);
                personService.getPersons(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' persons from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error: ' + error);
                        toggleSpinner(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
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
        vm.keyPress = keyPress;
        vm.goToPerson = goToPerson;
        vm.persons = [];
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Person';
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'personService', personSearch]);
})();
