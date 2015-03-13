(function () {
    'use strict';

    var controllerId = 'relatedPersonSearch';

    function relatedPersonSearch($location, $mdBottomSheet, common, config, fhirServers, relatedPersonService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var keyCodes = config.keyCodes;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedRelatedpersons()], controllerId)
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

        function _getCachedRelatedpersons() {
            relatedPersonService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' relatedPersons from cache', null, noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goToRelatedperson(relatedPerson) {
            if (relatedPerson && relatedPerson.$$hashKey) {
                $location.path('/relatedPerson/view/' + relatedPerson.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.relatedPersons = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit() {
            if (vm.searchText.length > 0) {
                toggleSpinner(true);
                relatedPersonService.getRelatedpersons(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' relatedPersons from ' + vm.activeServer.name);
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

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        function relatedPersonSearchActionsMenu($event) {
            var menuItems = [
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Search', icon: 'img/search100.svg'},
                {name: 'Clear', icon: 'img/clear5.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Add':
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 'Search':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Clear':
                        relatedPersonService.clearCache();
                        vm.searchText = '';
                        vm.relatedPersons = [];
                        vm.paging = null;
                        $location.path('/relatedPerson');
                        logInfo('Search results cache cleared');
                }
            });
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.keyPress = keyPress;
        vm.goToRelatedperson = goToRelatedperson;
        vm.relatedPersons = [];
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Relatedperson';
        vm.relatedPersonSearchActionsMenu = relatedPersonSearchActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', 'common', 'config', 'fhirServers', 'relatedPersonService', relatedPersonSearch]);
})();
