(function () {
    'use strict';

    var controllerId = 'patientList';

    function patientList($location, $scope, common, config, fhirServers, patientService) {
        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error initializing patient search.', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToPatient(patient) {
            if (patient && patient.$$hashKey) {
                $location.path('/patient/view/' + patient.$$hashKey);
            }
        }
        vm.goToPatient = goToPatient;

        function dereferenceLink(url) {
            vm.isBusy = true;
            patientService.getPatientsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
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

        $scope.$on(config.events.patientListChanged,
            function (event, data) {
                _processSearchResults(data);
                logDebug("Patient list updated.");
            }
        );

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.patients = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        vm.activeServer = null;
        vm.patients = [];
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$scope', 'common', 'config', 'fhirServers', 'patientService', patientList]);
})();
