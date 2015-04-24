(function () {
    'use strict';

    var controllerId = 'encounterSearch';

    function encounterSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, encounterService) {
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
                        getOrganizationEncounters($routeParams.orgId);
                        logInfo("Retrieving encounters for current organization, please wait...");
                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing encounter search', error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationEncounters(orgId) {
            vm.encounterSearch.organization = orgId;
            detailSearch();
        }

        function goToEncounter(encounter) {
            if (encounter && encounter.$$hashKey) {
                $location.path('/encounter/view/' + encounter.$$hashKey);
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
            if (vm.encounterSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.encounterSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.encounterSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.encounterSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.encounterSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.encounterSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.encounterSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.encounterSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.encounterSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.encounterSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.age.start || vm.encounterSearch.age.end) {
                if (vm.encounterSearch.age.start === vm.encounterSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.encounterSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.encounterSearch.age.start === 0 ? vm.encounterSearch.age.start : (vm.encounterSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.encounterSearch.age.end === 1 ? vm.encounterSearch.age.end : (vm.encounterSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.encounterSearch.identifier.system && vm.encounterSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.encounterSearch.identifier.system.concat("|", vm.encounterSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.encounterSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.encounterSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.encounterSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.encounterSearch.language.system.concat("|", vm.encounterSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.encounterSearch.ethnicity.code);
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

            searchEncounters(queryString);
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            encounterService.getEncountersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Encounters from ' +
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
            encounterService.getEncounters(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Encounters from ' +
                    vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting encounters', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchEncounters(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            encounterService.searchEncounters(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Encounters from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting encounters', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.encounters = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function ageRangeChange() {
            if (vm.encounterSearch.age.end === undefined) {
                vm.encounterSearch.age.end = vm.encounterSearch.age.start;
            }
            if (vm.encounterSearch.age.start === undefined) {
                vm.encounterSearch.age.start = vm.encounterSearch.age.end;
            }
            if (vm.encounterSearch.age.start > vm.encounterSearch.age.end) {
                vm.encounterSearch.age.end = vm.encounterSearch.age.start;
            }
        }

        function dobChange() {
            if (vm.encounterSearch.dob !== undefined) {
                vm.encounterSearch.age.end = vm.encounterSearch.age.start = undefined;
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
                        $location.path('/encounter/edit/new');
                        break;
                    case 1:
                        $location.path('/encounter/detailed-search');
                        break;
                    case 2:
                        $location.path('/encounter');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Encounter search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Start new encounter', icon: 'encounter', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Encounter search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToEncounter = goToEncounter;
        vm.encounters = [];
        vm.selectedEncounter = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Encounters';
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
        vm.encounterSearch = {
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
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'encounterService', encounterSearch]);
})();
