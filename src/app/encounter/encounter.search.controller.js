(function () {
    'use strict';

    var controllerId = 'encounterSearch';

    function encounterSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, encounterValueSets,
                             encounterService, valueSetService) {
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
                    logError('Error initializing encounter search', error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function goToEncounter(encounter) {
            if (encounter && encounter.$$hashKey) {
                $location.path('/encounter/view/' + encounter.$$hashKey);
            }
        }

        vm.goToEncounter = goToEncounter;

        function _loadLocalLookups() {
            vm.states = encounterValueSets.encounterState();
            vm.types = encounterValueSets.encounterType();
            vm.specialArrangements = encounterValueSets.encounterSpecialArrangement();
            vm.participantTypes = encounterValueSets.encounterParticipantType();
        }

        function expandReason(searchText) {
            var deferred = $q.defer();
            valueSetService.getFilteredExpansion('valueset-encounter-reason', searchText)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError("Error fetching expansion", error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }
        vm.expandReason = expandReason;

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.encounterSearch.status) {
                queryParam.param = "status";
                queryParam.value = vm.encounterSearch.status.code;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.encounterSearch.type) {
                queryParam.param = "type";
                queryParam.value = vm.types.system.concat("|", vm.encounterSearch.type.code);
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

        vm.detailSearch = detailSearch;

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
                .then(_processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function quickSearch(searchText) {
            var deferred = $q.defer();
            encounterService.searchEncounters(vm.activeServer.baseUrl, searchText)
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
                    _processSearchResults(data);
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

        vm.searchEncounters = searchEncounters;

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.encounters = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
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
                        $location.path('/patient/view/current');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Encounter search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Start new encounter', icon: 'encounter', index: 0},
                    {name: 'Back to face sheet', icon: 'person', index: 1},
                ];
                this.title = 'Encounter search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.encounters = [];
        vm.selectedEncounter = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.searchPatientText = '';
        vm.searchCareProviderText = '';
        vm.searchParticipantPractitionerText = '';
        vm.searchLocationText = '';
        vm.searchParticipantRelatedPersonText = '';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.actions = actions;
        vm.isBusy = false;
        vm.encounterSearch = {};
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.selectedTab = 0;
        vm.reasonSearchText = undefined;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'encounterValueSets',
            'encounterService', 'valueSetService', encounterSearch]);
})();
