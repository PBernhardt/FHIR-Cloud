(function () {
    'use strict';

    var controllerId = 'conditionList';

    function conditionList($location, $mdDialog, $scope, common, config, fhirServers, conditionService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing condition search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToCondition(condition) {
            if (condition && condition.$$hashKey) {
                $location.path('/condition/view/' + condition.$$hashKey);
            }
        }
        vm.goToCondition = goToCondition;

        function dereferenceLink(url) {
            vm.isBusy = true;
            conditionService.getConditionsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Conditions from ' +
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

        $scope.$on(config.events.conditionListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Condition list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.conditions = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function showRawData($index, $event) {
            _showRawData(vm.conditions[$index], $event);
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
        vm.conditions = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$scope', 'common', 'config', 'fhirServers', 'conditionService', conditionList]);
})();
