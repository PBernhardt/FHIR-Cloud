(function () {
    'use strict';

    var controllerId = 'locationSearch';

    function locationSearch($location, $mdBottomSheet, $scope, common, config, fhirServers, localValueSets, locationService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;
        var $q = common.$q;

        /* jshint validthis:true */
        var vm = this;

        $scope.$on(config.events.serverChanged,
            function (event, server) {
                vm.activeServer = server;
            }
        );

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            locationService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    _loadLocationTypes();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/location/view/' + hash);
            }
        }

        vm.goToDetail = goToDetail;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.locations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            vm.noresults = false;
            locationService.getLocations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Locations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                }, function (error) {
                    logError('Error getting locations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }
        vm.quickSearch = quickSearch;

        function searchLocations(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            locationService.searchLocations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Locations from ' + vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error finding locations: ', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function dereferenceLink(url) {
            locationService.getLocationsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.locations) ? data.locations.length : 0) + ' Locations from ' + vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function getLocationReference(input) {
            var deferred = $q.defer();
            locationService.getLocationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Locations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting locations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getLocationReference = getLocationReference;

        function goToLocation(location) {
            if (location && location.$$hashKey) {
                $location.path('/location/view/' + location.$$hashKey);
            }
        }
        vm.goToLocation = goToLocation;

        function _loadLocationTypes() {
            vm.locationTypes = localValueSets.locationType();
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
                        $location.path('/location/edit/new');
                        break;
                    case 1:
                        $location.path('/location/detailed-search');
                        break;
                    case 2:
                        $location.path('/location');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new location', icon: 'hospital', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Location search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.locationSearch.name) {
                queryParam.param = "name";
                queryParam.value = vm.locationSearch.name;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.locationSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.locationSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.locationSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.locationSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.identifier.system && vm.locationSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.locationSearch.identifier.system.concat("|", vm.locationSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.type) {
                queryParam.param = "type";
                queryParam.value = vm.locationSearch.type;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.locationSearch.partOf) {
                queryParam.param = "partOf";
                queryParam.value = vm.locationSearch.partOf.reference;
                queryParams.push(_.clone(queryParam));
            }
            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            searchLocations(queryString);
        }

        vm.detailSearch = detailSearch;

        vm.activeServer = null;
        vm.isBusy = false;
        vm.locations = [];
        vm.errorOutcome = null;
        vm.locationTypes = null;
        vm.locationSearch = {
            name: undefined,
            address: {street: undefined, city: undefined, state: undefined, postalCode: undefined},
            identifier: {system: undefined, value: undefined},
            type: undefined,
            partOf: undefined
        };
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Locations';
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$scope', 'common', 'config', 'fhirServers', 'localValueSets',
            'locationService', locationSearch]);
})();
