(function () {
    'use strict';

    var controllerId = 'relatedPersonSearch';

    function relatedPersonSearch($location, $mdBottomSheet, $scope, common, config, fhirServers, localValueSets, relatedPersonService) {
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
                    logError('Error initializing relatedPerson search', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToPerson(relatedPerson) {
            if (relatedPerson && relatedPerson.$$hashKey) {
                $location.path('/relatedPerson/view/' + relatedPerson.$$hashKey);
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
            if (vm.relatedPersonSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.relatedPersonSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.relatedPersonSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.relatedPersonSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.relatedPersonSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.relatedPersonSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.relatedPersonSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.relatedPersonSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.relatedPersonSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.relatedPersonSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.age.start || vm.relatedPersonSearch.age.end) {
                if (vm.relatedPersonSearch.age.start === vm.relatedPersonSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.relatedPersonSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.relatedPersonSearch.age.start === 0 ? vm.relatedPersonSearch.age.start : (vm.relatedPersonSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.relatedPersonSearch.age.end === 1 ? vm.relatedPersonSearch.age.end : (vm.relatedPersonSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.relatedPersonSearch.identifier.system && vm.relatedPersonSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.relatedPersonSearch.identifier.system.concat("|", vm.relatedPersonSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.relatedPersonSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.relatedPersonSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.relatedPersonSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.relatedPersonSearch.language.system.concat("|", vm.relatedPersonSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.relatedPersonSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = vm.relatedPersonSearch.ethnicity.system.concat("|", vm.relatedPersonSearch.ethnicity.code);
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
            relatedPersonService.getPersons(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Persons from ' +
                        vm.activeServer.name, null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    deferred.resolve(data.entry);
                }, function (error) {
                    logError('Error getting relatedPersons', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function _searchPersons(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            relatedPersonService.searchPersons(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Persons from ' +
                        vm.activeServer.name, null, noToast);
                    common.changePersonList(data);
                    deferred.resolve();
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting relatedPersons', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function ageRangeChange() {
            if (vm.relatedPersonSearch.age.end === undefined) {
                vm.relatedPersonSearch.age.end = vm.relatedPersonSearch.age.start;
            }
            if (vm.relatedPersonSearch.age.start === undefined) {
                vm.relatedPersonSearch.age.start = vm.relatedPersonSearch.age.end;
            }
            if (vm.relatedPersonSearch.age.start > vm.relatedPersonSearch.age.end) {
                vm.relatedPersonSearch.age.end = vm.relatedPersonSearch.age.start;
            }
        }

        vm.ageRangeChange = ageRangeChange;

        function dobChange() {
            if (vm.relatedPersonSearch.dob !== undefined) {
                vm.relatedPersonSearch.age.end = vm.relatedPersonSearch.age.start = undefined;
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
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 1:
                        $location.path('/relatedPerson/detailed-search');
                        break;
                    case 2:
                        $location.path('/relatedPerson');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Related Person search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new related person', icon: 'groupAdd', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Related Person search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        vm.activeServer = null;
        vm.relatedPersons = [];
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
        vm.relatedPersonSearch = {
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
        ['$location', '$mdBottomSheet', '$scope', 'common', 'config', 'fhirServers', 'localValueSets', 'relatedPersonService',
            relatedPersonSearch]);
})();
