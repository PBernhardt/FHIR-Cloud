(function () {
    'use strict';

    var controllerId = 'organizationSearch';

    function organizationSearch($location, $mdBottomSheet, $mdSidenav, common, fhirServers, organizationService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;
        var $q = common.$q;

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            organizationService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    $mdSidenav('right').close();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/organization/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.organizations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function querySearch(searchText) {
            var deferred = $q.defer();
            organizationService.getOrganizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting organizations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            organizationService.getOrganizationsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.organizations) ? data.organizations.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
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
                        $location.path('/organization/edit/new');
                        break;
                    case 1:
                        $location.path('/organization/organization-detailed-search');
                        break;
                    case 2:
                        $location.path('/organization');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new organization', icon: 'add', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'hospital', index: 2}
                ];
                this.title = 'Organization search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.isBusy = false;
        vm.organizations = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.querySearch = querySearch;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Organizations';
        vm.dereferenceLink = dereferenceLink;
        vm.goToDetail = goToDetail;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdSidenav', 'common', 'fhirServers', 'organizationService', organizationSearch]);
})();
