(function () {
    'use strict';

    var controllerId = 'practitionerSearch';

    function practitionerSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, practitionerService) {
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
                        getOrganizationPractitioners($routeParams.orgId);
                        logInfo("Retrieving practitioners for current organization, please wait...");
                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing practitioner search', error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationPractitioners(orgId) {
            vm.practitionerSearch.organization = orgId;
            detailSearch();
        }

        function goToPractitioner(practitioner) {
            if (practitioner && practitioner.$$hashKey) {
                $location.path('/practitioner/view/' + practitioner.$$hashKey);
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
            if (vm.practitionerSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.practitionerSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.practitionerSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.practitionerSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.practitionerSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.practitionerSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.practitionerSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.practitionerSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.practitionerSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.practitionerSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.age.start || vm.practitionerSearch.age.end) {
                if (vm.practitionerSearch.age.start === vm.practitionerSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.practitionerSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.practitionerSearch.age.start === 0 ? vm.practitionerSearch.age.start : (vm.practitionerSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.practitionerSearch.age.end === 1 ? vm.practitionerSearch.age.end : (vm.practitionerSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.practitionerSearch.identifier.system && vm.practitionerSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.practitionerSearch.identifier.system.concat("|", vm.practitionerSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.practitionerSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.practitionerSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.practitionerSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.practitionerSearch.language.system.concat("|", vm.practitionerSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.practitionerSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.practitionerSearch.ethnicity.code);
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

            searchPractitioners(queryString);
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            practitionerService.getPractitionersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' +
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
            practitionerService.getPractitioners(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' +
                    vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting practitioners', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchPractitioners(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            practitionerService.searchPractitioners(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Practitioners from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting practitioners', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.practitioners = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function ageRangeChange() {
            if (vm.practitionerSearch.age.end === undefined) {
                vm.practitionerSearch.age.end = vm.practitionerSearch.age.start;
            }
            if (vm.practitionerSearch.age.start === undefined) {
                vm.practitionerSearch.age.start = vm.practitionerSearch.age.end;
            }
            if (vm.practitionerSearch.age.start > vm.practitionerSearch.age.end) {
                vm.practitionerSearch.age.end = vm.practitionerSearch.age.start;
            }
        }

        function dobChange() {
            if (vm.practitionerSearch.dob !== undefined) {
                vm.practitionerSearch.age.end = vm.practitionerSearch.age.start = undefined;
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
                        $location.path('/practitioner/edit/new');
                        break;
                    case 1:
                        $location.path('/practitioner/detailed-search');
                        break;
                    case 2:
                        $location.path('/practitioner');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Practitioner search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new practitioner', icon: 'doctor', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Practitioner search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToPractitioner = goToPractitioner;
        vm.practitioners = [];
        vm.selectedPractitioner = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Practitioners';
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
        vm.practitionerSearch = {
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
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'practitionerService', practitionerSearch]);
})();
