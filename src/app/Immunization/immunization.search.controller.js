(function () {
    'use strict';

    var controllerId = 'immunizationSearch';

    function immunizationSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, immunizationService) {
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
                        getOrganizationImmunizations($routeParams.orgId);
                        logInfo("Retrieving immunizations for current organization, please wait...");
                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing immunization search', error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationImmunizations(orgId) {
            vm.immunizationSearch.organization = orgId;
            detailSearch();
        }

        function goToImmunization(immunization) {
            if (immunization && immunization.$$hashKey) {
                $location.path('/immunization/view/' + immunization.$$hashKey);
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
            if (vm.immunizationSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.immunizationSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.immunizationSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.immunizationSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.immunizationSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.immunizationSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.immunizationSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.immunizationSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.immunizationSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.immunizationSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.age.start || vm.immunizationSearch.age.end) {
                if (vm.immunizationSearch.age.start === vm.immunizationSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.immunizationSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.immunizationSearch.age.start === 0 ? vm.immunizationSearch.age.start : (vm.immunizationSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.immunizationSearch.age.end === 1 ? vm.immunizationSearch.age.end : (vm.immunizationSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.immunizationSearch.identifier.system && vm.immunizationSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.immunizationSearch.identifier.system.concat("|", vm.immunizationSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.immunizationSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.immunizationSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.immunizationSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.immunizationSearch.language.system.concat("|", vm.immunizationSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.immunizationSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.immunizationSearch.ethnicity.code);
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

            searchImmunizations(queryString);
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            immunizationService.getImmunizationsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Immunizations from ' +
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
            immunizationService.getImmunizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Immunizations from ' +
                    vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting immunizations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchImmunizations(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            immunizationService.searchImmunizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Immunizations from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting immunizations', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.immunizations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function ageRangeChange() {
            if (vm.immunizationSearch.age.end === undefined) {
                vm.immunizationSearch.age.end = vm.immunizationSearch.age.start;
            }
            if (vm.immunizationSearch.age.start === undefined) {
                vm.immunizationSearch.age.start = vm.immunizationSearch.age.end;
            }
            if (vm.immunizationSearch.age.start > vm.immunizationSearch.age.end) {
                vm.immunizationSearch.age.end = vm.immunizationSearch.age.start;
            }
        }

        function dobChange() {
            if (vm.immunizationSearch.dob !== undefined) {
                vm.immunizationSearch.age.end = vm.immunizationSearch.age.start = undefined;
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
                        $location.path('/immunization/edit/new');
                        break;
                    case 1:
                        $location.path('/immunization/detailed-search');
                        break;
                    case 2:
                        $location.path('/immunization');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Immunization search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new immunization', icon: 'immunization', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Immunization search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToImmunization = goToImmunization;
        vm.immunizations = [];
        vm.selectedImmunization = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Immunizations';
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
        vm.immunizationSearch = {
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
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'immunizationService', immunizationSearch]);
})();
