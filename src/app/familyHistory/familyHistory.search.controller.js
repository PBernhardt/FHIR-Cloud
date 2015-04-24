(function () {
    'use strict';

    var controllerId = 'familyHistorySearch';

    function familyHistorySearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, familyHistoryService) {
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
                        getOrganizationFamilyHistories($routeParams.orgId);
                        logInfo("Retrieving familyHistories for current organization, please wait...");
                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing familyHistory search', error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationFamilyHistories(orgId) {
            vm.familyHistorySearch.organization = orgId;
            detailSearch();
        }

        function goToFamilyHistory(familyHistory) {
            if (familyHistory && familyHistory.$$hashKey) {
                $location.path('/familyHistory/view/' + familyHistory.$$hashKey);
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
            if (vm.familyHistorySearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.familyHistorySearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.familyHistorySearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.familyHistorySearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.familyHistorySearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.familyHistorySearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.familyHistorySearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.familyHistorySearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.familyHistorySearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.familyHistorySearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.age.start || vm.familyHistorySearch.age.end) {
                if (vm.familyHistorySearch.age.start === vm.familyHistorySearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.familyHistorySearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.familyHistorySearch.age.start === 0 ? vm.familyHistorySearch.age.start : (vm.familyHistorySearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.familyHistorySearch.age.end === 1 ? vm.familyHistorySearch.age.end : (vm.familyHistorySearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.familyHistorySearch.identifier.system && vm.familyHistorySearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.familyHistorySearch.identifier.system.concat("|", vm.familyHistorySearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.familyHistorySearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.familyHistorySearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.familyHistorySearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.familyHistorySearch.language.system.concat("|", vm.familyHistorySearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.familyHistorySearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.familyHistorySearch.ethnicity.code);
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
            familyHistoryService.getFamilyHistoriesByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Family Histories from ' +
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
            familyHistoryService.getFamilyHistories(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Family Histories from ' +
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
            familyHistoryService.searchFamilyHistories(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Family Histories from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting familyHistories', error);
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
            if (vm.familyHistorySearch.age.end === undefined) {
                vm.familyHistorySearch.age.end = vm.familyHistorySearch.age.start;
            }
            if (vm.familyHistorySearch.age.start === undefined) {
                vm.familyHistorySearch.age.start = vm.familyHistorySearch.age.end;
            }
            if (vm.familyHistorySearch.age.start > vm.familyHistorySearch.age.end) {
                vm.familyHistorySearch.age.end = vm.familyHistorySearch.age.start;
            }
        }

        function dobChange() {
            if (vm.familyHistorySearch.dob !== undefined) {
                vm.familyHistorySearch.age.end = vm.familyHistorySearch.age.start = undefined;
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
                        $location.path('/familyHistory/edit/new');
                        break;
                    case 1:
                        $location.path('/familyHistory/detailed-search');
                        break;
                    case 2:
                        $location.path('/familyHistory');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Family History search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new family history', icon: 'family', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Family History search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToFamilyHistory = goToFamilyHistory;
        vm.familyHistories = [];
        vm.selectedFamilyHistory = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Family Histories';
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
        vm.familyHistorySearch = {
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
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'familyHistoryService', familyHistorySearch]);
})();
