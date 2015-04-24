(function () {
    'use strict';

    var controllerId = 'practitionerSearch';

    function practitionerSearch($location, $mdBottomSheet, common, config, fhirServers, practitionerService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedPractitioners()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function _getCachedPractitioners() {
            practitionerService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' practitioners from cache', noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }


        function goToPractitioner(practitioner) {
            if (practitioner && practitioner.$$hashKey) {
                $location.path('/practitionerReference/view/' + practitioner.$$hashKey);
            }
        }

        vm.goToPractitioner = goToPractitioner;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.practitioners = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function dereferenceLink(url) {
            common.toggleProgressBar(true);
            practitionerService.getpractitionersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.practitioners) ? data.practitioners.length : 0) + ' practitioners from ' + vm.activeServer.name, noToast);
                    return data;
                }, function (error) {
                    common.toggleProgressBar(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    common.toggleProgressBar(false);
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function submit() {
            if (vm.searchText.length > 0) {
                common.toggleProgressBar(true);
                practitionerService.getPractitioners(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' practitioners from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error getting practitioners', error, noToast);
                        common.toggleProgressBar(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        common.toggleProgressBar(false);
                    });
            }
        }

        vm.submit = submit;

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
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new practitioner', icon: 'practitioner', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Practitioner search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.practitioners = [];
        vm.practitionersCount = 0;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'practitioners';
        vm.managingOrganization = undefined;
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', 'common', 'config', 'fhirServers', 'practitionerService', practitionerSearch]);
})();
