(function () {
    'use strict';

    var controllerId = 'personSearch';

    function personSearch($location, $mdBottomSheet, $scope, common, config, fhirServers, localValueSets, personService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        $scope.$on(config.events.serverChanged,
            function (event, server) {
                vm.activeServer = server;
            }
        );

        function _activate() {
            common.activateController([_getActiveServer()], controllerId)
                .then(function () {
                    _loadLocalLookups();
                }, function (error) {
                    logError('Error initializing person search', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToPerson(person) {
            if (person && person.$$hashKey) {
                $location.path('/person/view/' + person.$$hashKey);
            }
        }

        vm.goToPerson = goToPerson;

        function _loadLocalLookups() {
            vm.ethnicities = localValueSets.ethnicity();
            vm.races = localValueSets.race().concept;
            vm.languages = localValueSets.iso6391Languages();
        }

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.personSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.personSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.personSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.personSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.personSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.personSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.personSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.personSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.personSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.personSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.age.start || vm.personSearch.age.end) {
                if (vm.personSearch.age.start === vm.personSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.personSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.personSearch.age.start === 0 ? vm.personSearch.age.start : (vm.personSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.personSearch.age.end === 1 ? vm.personSearch.age.end : (vm.personSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.personSearch.identifier.system && vm.personSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.personSearch.identifier.system.concat("|", vm.personSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.personSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.personSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.personSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.personSearch.language.system.concat("|", vm.personSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.personSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = vm.personSearch.ethnicity.system.concat("|", vm.personSearch.ethnicity.code);
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

            _searchPersons(queryString);
        }

        vm.detailSearch = detailSearch;

        function quickSearch(searchText) {
            var deferred = $q.defer();
            vm.noresults = false;
            personService.getPersons(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Persons from ' +
                        vm.activeServer.name, null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    deferred.resolve(data.entry);
                }, function (error) {
                    logError('Error getting persons', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function _searchPersons(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            personService.searchPersons(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Persons from ' +
                        vm.activeServer.name, null, noToast);
                    common.changePersonList(data);
                    deferred.resolve();
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting persons', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function ageRangeChange() {
            if (vm.personSearch.age.end === undefined) {
                vm.personSearch.age.end = vm.personSearch.age.start;
            }
            if (vm.personSearch.age.start === undefined) {
                vm.personSearch.age.start = vm.personSearch.age.end;
            }
            if (vm.personSearch.age.start > vm.personSearch.age.end) {
                vm.personSearch.age.end = vm.personSearch.age.start;
            }
        }

        vm.ageRangeChange = ageRangeChange;

        function dobChange() {
            if (vm.personSearch.dob !== undefined) {
                vm.personSearch.age.end = vm.personSearch.age.start = undefined;
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
                        $location.path('/person/edit/new');
                        break;
                    case 1:
                        $location.path('/person/detailed-search');
                        break;
                    case 2:
                        $location.path('/person');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Person search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new person', icon: 'personAdd', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Person search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        vm.activeServer = null;
        vm.persons = [];
        vm.selectedPerson = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Persons';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.races = [];
        vm.ethnicities = [];
        vm.languages = [];
        vm.isBusy = false;
        vm.personSearch = {
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
        ['$location', '$mdBottomSheet', '$scope', 'common', 'config', 'fhirServers', 'localValueSets', 'personService',
            personSearch]);
})();
