﻿(function () {
    'use strict';

    var controllerId = 'organizationSearch';

    function organizationSearch($location, $mdBottomSheet, $scope, common, config, fhirServers, organizationValueSets,
                                organizationService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var noToast = false;
        var $q = common.$q;


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
            organizationService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    _loadOrganizationTypes();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/organization/view/' + hash);
            }
        }

        vm.goToDetail = goToDetail;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.organizations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            organizationService.getOrganizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from '
                        + vm.activeServer.name + '.');
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    deferred.resolve([]);
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchOrganizations(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            organizationService.searchOrganizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from ' +
                        vm.activeServer.name + '.');
                    processSearchResults(data);
                    vm.selectedTab = 1;
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    deferred.resolve();
                })
                .then(vm.isBusy = false);
            return deferred.promise;
        }

        function dereferenceLink(url) {
            organizationService.getOrganizationsByLink(url)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data.organizations) ? data.organizations.length : 0) +
                        ' Organizations from ' + vm.activeServer.name + '.');
                    return data;
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults);
        }

        vm.dereferenceLink = dereferenceLink;

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logDebug('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Organizations from ' +
                        vm.activeServer.name + '.');
                    deferred.resolve(data || []);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), error, noToast);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function goToOrganization(organization) {
            if (organization && organization.resource.id) {
                $location.path('/organization/view/' + organization.resource.id);
            }
        }

        vm.goToOrganization = goToOrganization;

        function _loadOrganizationTypes() {
            vm.organizationTypes = organizationValueSets.organizationType();
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
                        $location.path('/organization/detailed-search');
                        break;
                    case 2:
                        $location.path('/organization');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new organization', icon: 'hospital', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Organization search options';
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
            if (vm.organizationSearch.name) {
                queryParam.param = "name";
                queryParam.value = vm.organizationSearch.name;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.organizationSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.organizationSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.organizationSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.organizationSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.identifier.system && vm.organizationSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.organizationSearch.identifier.system.concat("|", vm.organizationSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.type) {
                queryParam.param = "type";
                queryParam.value = vm.organizationSearch.type;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.partOf) {
                queryParam.param = "partOf";
                queryParam.value = vm.organizationSearch.partOf.reference;
                queryParams.push(_.clone(queryParam));
            }
            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            searchOrganizations(queryString);
        }

        vm.detailSearch = detailSearch;

        vm.activeServer = null;
        vm.isBusy = false;
        vm.organizations = [];
        vm.errorOutcome = null;
        vm.organizationTypes = null;
        vm.organizationSearch = {
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
        vm.title = 'Organizations';
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$scope', 'common', 'config', 'fhirServers', 'organizationValueSets',
            'organizationService', organizationSearch]);
})();
