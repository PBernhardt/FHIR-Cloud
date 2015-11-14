(function () {
    'use strict';

    var controllerId = 'medicationList';

    function medicationList($location, $mdDialog, $scope, common, config, fhirServers, medicationStatementService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing medication search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToMedication(medication) {
            if (medication && medication.$$hashKey) {
                $location.path('/medication/view/' + medication.$$hashKey);
            }
        }
        vm.goToMedication = goToMedication;

        function dereferenceLink(url) {
            vm.isBusy = true;
            medicationService.getMedicationStatementsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Medications from ' +
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

        $scope.$on(config.events.medicationListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Medication list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.medications = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function showRawData($index, $event) {
            _showRawData(vm.medications[$index], $event);
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
        vm.medications = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$scope', 'common', 'config', 'fhirServers', 'medicationStatementService', medicationList]);
})();
