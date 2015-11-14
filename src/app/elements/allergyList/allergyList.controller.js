(function () {
    'use strict';

    var controllerId = 'allergyList';

    function allergyList($location, $mdDialog, $scope, common, config, fhirServers, allergyIntoleranceService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing allergy search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToAllergy(allergy) {
            if (allergy && allergy.$$hashKey) {
                $location.path('/allergy/view/' + allergy.$$hashKey);
            }
        }
        vm.goToAllergy = goToAllergy;

        function dereferenceLink(url) {
            vm.isBusy = true;
            allergyIntoleranceService.getAllergysByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Allergys from ' +
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

        $scope.$on(config.events.allergyListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Allergy list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.allergys = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function showRawData($index, $event) {
            _showRawData(vm.allergys[$index], $event);
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
        vm.allergys = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$scope', 'common', 'config', 'fhirServers', 'allergyIntoleranceService', allergyList]);
})();
