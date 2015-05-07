(function () {
    'use strict';

    var controllerId = 'conditionSearch';

    function conditionSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, conditionService) {
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
                    if (angular.isDefined($routeParams.orgId)) {

                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing condition search', error);
                });
        }

        function getActiveServer() {
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
            if (vm.conditionSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.conditionSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.conditionSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.conditionSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.conditionSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.conditionSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.conditionSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.conditionSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.conditionSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.conditionSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.age.start || vm.conditionSearch.age.end) {
                if (vm.conditionSearch.age.start === vm.conditionSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.conditionSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.conditionSearch.age.start === 0 ? vm.conditionSearch.age.start : (vm.conditionSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.conditionSearch.age.end === 1 ? vm.conditionSearch.age.end : (vm.conditionSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.conditionSearch.identifier.system && vm.conditionSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.conditionSearch.identifier.system.concat("|", vm.conditionSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.conditionSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.conditionSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.conditionSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.conditionSearch.language.system.concat("|", vm.conditionSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.conditionSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.conditionSearch.ethnicity.code);
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

            searchFamilyHistories(queryString);
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            conditionService.getFamilyHistoriesByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' conditions from ' +
                    vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    vm.isBusy = false;
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            conditionService.getFamilyHistories(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' conditions from ' +
                    vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting familyHistories', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchFamilyHistories(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            conditionService.searchFamilyHistories(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' s from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting conditions', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.familyHistories = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function ageRangeChange() {
            if (vm.conditionSearch.age.end === undefined) {
                vm.conditionSearch.age.end = vm.conditionSearch.age.start;
            }
            if (vm.conditionSearch.age.start === undefined) {
                vm.conditionSearch.age.start = vm.conditionSearch.age.end;
            }
            if (vm.conditionSearch.age.start > vm.conditionSearch.age.end) {
                vm.conditionSearch.age.end = vm.conditionSearch.age.start;
            }
        }

        function dobChange() {
            if (vm.conditionSearch.dob !== undefined) {
                vm.conditionSearch.age.end = vm.conditionSearch.age.start = undefined;
            }
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
                switch (clickedItem.index) {
                    case 0:
                        $location.path('/condition/edit/new');
                        break;
                    case 1:
                        $location.path('/condition/detailed-search');
                        break;
                    case 2:
                        $location.path('/condition');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Condition search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new family history', icon: 'family', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Condition search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToCondition = goToCondition;
        vm.familyHistories = [];
        vm.selectedCondition = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Conditions';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.actions = actions;
        vm.races = [];
        vm.ethnicities = [];
        vm.languages = [];
        vm.detailSearch = detailSearch;
        vm.isBusy = false;
        vm.ageRangeChange = ageRangeChange;
        vm.dobChange = dobChange;
        vm.conditionSearch = {
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
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.selectedTab = 0;
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'conditionService', conditionSearch]);
})();
