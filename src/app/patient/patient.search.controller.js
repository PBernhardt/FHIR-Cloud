(function () {
    'use strict';

    var controllerId = 'patientSearch';

    function patientSearch($location, $mdBottomSheet, $routeParams, common, config, fhirServers, localValueSets, patientService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function activate() {
            common.activateController([getActiveServer()], controllerId)
                .then(function () {
                    if ($routeParams.orgId !== null) {
                     //   getOrganizationPatients($routeParams.orgId);
                    } else {

                    }
                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationPatients(orgId) {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, vm.searchText, org)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting patients', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function goToPatient(patient) {
            if (patient && patient.$$hashKey) {
                $location.path('/patient/view/' + patient.$$hashKey);
            }
        }

        function loadEthnicities() {
            return vm.ethnicities = localValueSets.ethnicity().concept;
        }

        function loadRaces() {
            return vm.races = localValueSets.race().concept;
        }

        function detailSearch() {
            vm.isBusy = (!vm.isBusy);
        }

        function querySearch(searchText) {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting patients', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function actions($event) {
            $mdBottomSheet.show({
                parent: angular.element(document.getElementById('content')),
                templateUrl: './templates/resourceSheet.html',
                controller: ['$mdBottomSheet', ResourceSheetController],
                controllerAs: "vm",
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.index)
                {
                    case 0:
                        $location.path('/patient/edit/new');
                        break;
                    case 1:
                        $location.path('/patient/patient-detailed-search');
                        break;
                    case 2:
                        $location.path('/patient');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Patient search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new patient', icon: 'add', index: 0},
                    {name: 'Detailed Search Options', icon: 'group', index: 1},
                    {name: 'Find by Name', icon: 'group', index: 2}
                ];
                this.title = 'Patient search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.goToPatient = goToPatient;
        vm.patients = [];
        vm.selectedPatient = null;
        vm.querySearch = querySearch;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Patients';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.patientDemographicsQuery = {
            name: '',
            gender: '',
            age: null,
            ethnicity: null,
            race: null,
            zipCode: '',
            streetAddress: '',
            telephone: ''
        };
        vm.actions = actions;
        vm.races = [];
        vm.loadRaces = loadRaces;
        vm.ethnicities = [];
        vm.loadEthnicities = loadEthnicities;
        vm.detailSearch = detailSearch;
        vm.isBusy = false;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$routeParams', 'common', 'config', 'fhirServers', 'localValueSets', 'patientService', patientSearch]);
})();
