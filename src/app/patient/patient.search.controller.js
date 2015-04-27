(function () {
    'use strict';

    var controllerId = 'patientSearch';

    function patientSearch($location, $mdBottomSheet, common, fhirServers, localValueSets, patientService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                    _loadLocalLookups();
                }, function (error) {
                    logError('Error initializing patient search', error);
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

        function _loadLocalLookups() {
            vm.ethnicities = localValueSets.ethnicity().concept;
            vm.races = localValueSets.race().concept;
            vm.languages = localValueSets.iso6391Languages();
        }

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.patientSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.patientSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.patientSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.patientSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.patientSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.patientSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.patientSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.patientSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.patientSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.patientSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.age.start || vm.patientSearch.age.end) {
                if (vm.patientSearch.age.start === vm.patientSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.patientSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.patientSearch.age.start === 0 ? vm.patientSearch.age.start : (vm.patientSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.patientSearch.age.end === 1 ? vm.patientSearch.age.end : (vm.patientSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.patientSearch.identifier.system && vm.patientSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.patientSearch.identifier.system.concat("|", vm.patientSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.patientSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.patientSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.patientSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.patientSearch.language.system.concat("|", vm.patientSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.patientSearch.ethnicity.code);
                queryParams.push(_.clone(queryParam));
            }

            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            function formatString(input) {
                var yyyy = input.getFullYear().toString();
                var mm = (input.getMonth() + 1).toString();
                var dd = input.getDate().toString();
                return yyyy.concat('-', mm[1] ? mm : '0' + mm[0]).concat('-', dd[1] ? dd : '0' + dd[0]);
            }

            _searchPatients(queryString);
        }

        vm.detailSearch = detailSearch;

        function quickSearch(searchText) {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
                        vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry);
                }, function (error) {
                    logError('Error getting patients', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function _searchPatients(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            patientService.searchPatients(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
                        vm.activeServer.name, null, noToast);
                    common.changePatientList(data);
                    deferred.resolve();
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting patients', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function ageRangeChange() {
            if (vm.patientSearch.age.end === undefined) {
                vm.patientSearch.age.end = vm.patientSearch.age.start;
            }
            if (vm.patientSearch.age.start === undefined) {
                vm.patientSearch.age.start = vm.patientSearch.age.end;
            }
            if (vm.patientSearch.age.start > vm.patientSearch.age.end) {
                vm.patientSearch.age.end = vm.patientSearch.age.start;
            }
        }

        vm.ageRangeChange = ageRangeChange;

        function dobChange() {
            if (vm.patientSearch.dob !== undefined) {
                vm.patientSearch.age.end = vm.patientSearch.age.start = undefined;
            }
        }

        vm.dobChange = dobChange;

        function actions($event) {
            $mdBottomSheet.show({
                parent: angular.element(document.getElementById('content')),
                templateUrl: './templates/resourceSheet.html',
                controller: ['$mdBottomSheet', ResourceSheetController],
                controllerAs: "vm",
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.index) {
                    case 0:
                        $location.path('/patient/edit/new');
                        break;
                    case 1:
                        $location.path('/patient/detailed-search');
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
                    {name: 'Add new patient', icon: 'personAdd', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Patient search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        vm.activeServer = null;
        vm.patients = [];
        vm.selectedPatient = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Patients';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.races = [];
        vm.ethnicities = [];
        vm.languages = [];
        vm.isBusy = false;
        vm.patientSearch = {
            name: {first: undefined, last: undefined},
            mothersMaidenName: undefined,
            address: {street: undefined, city: undefined, state: undefined, postalCode: undefined},
            telecom: undefined,
            identifier: {system: undefined, value: undefined},
            age: {start: undefined, end: undefined},
            dob: undefined,
            race: undefined,
            gender: undefined,
            ethnicity: undefined,
            language: undefined,
            organization: undefined,
            careProvider: undefined
        };
        vm.selectedTab = 0;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', 'common', 'fhirServers', 'localValueSets', 'patientService', patientSearch]);
})();
