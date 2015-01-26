(function () {
    'use strict';

    var controllerId = 'patientSearch';

    function patientSearch($location, $mdSidenav, common, config, fhirServers, patientService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var keyCodes = config.keyCodes;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedPatients()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function _getCachedPatients() {
            patientService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from cache', null, noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goToPatient(patient) {
            if (patient && patient.$$hashKey) {
                $location.path('/patient/view/' + patient.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.patients = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function dereferenceLink(url) {
            common.toggleProgressBar(true);
            patientService.getPatientsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.patients) ? data.patients.length : 0) + ' patients from ' + vm.activeServer.name, noToast);
                    return data;
                }, function (error) {
                    common.toggleProgressBar(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    common.toggleProgressBar(false);
                });
        }

        function submit() {
            if (vm.searchText.length > 0) {
                common.toggleProgressBar(true);
                patientService.getPatients(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error getting patients', error, noToast);
                        common.toggleProgressBar(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        common.toggleProgressBar(false);
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

        vm.activeServer = null;
        vm.keyPress = keyPress;
        vm.goToPatient = goToPatient;
        vm.patients = [];
        vm.patientsCount = 0;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Patients';
        vm.managingOrganization = undefined;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'patientService', patientSearch]);
})();
