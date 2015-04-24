(function () {
    'use strict';

    var controllerId = 'diagnosticOrderSearch';

    function diagnosticOrderSearch($location, $mdBottomSheet, $mdSidenav, $scope, common, fhirServers, localValueSets, diagnosticOrderService) {
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
            diagnosticOrderService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    _loadDiagnosticOrderTypes();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/diagnosticOrder/view/' + hash);
            }
        }

        vm.goToDetail = goToDetail;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.diagnosticOrders = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function querySearch(searchText) {
            var deferred = $q.defer();
            diagnosticOrderService.getDiagnosticOrders(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' DiagnosticOrders from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting diagnosticOrders', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }
        vm.querySearch = querySearch;

        function searchDiagnosticOrders(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            diagnosticOrderService.searchDiagnosticOrders(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' DiagnosticOrders from ' + vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error finding diagnosticOrders: ', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function dereferenceLink(url) {
            diagnosticOrderService.getDiagnosticOrdersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.diagnosticOrders) ? data.diagnosticOrders.length : 0) + ' Diagnostic Orders from ' + vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function getDiagnosticOrderReference(input) {
            var deferred = $q.defer();
            diagnosticOrderService.getDiagnosticOrderReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Diagnostic Orders from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting diagnostic orders', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getDiagnosticOrderReference = getDiagnosticOrderReference;

        function goToDiagnosticOrder(diagnosticOrder) {
            if (diagnosticOrder && diagnosticOrder.$$hashKey) {
                $location.path('/diagnosticOrder/view/' + diagnosticOrder.$$hashKey);
            }
        }
        vm.goToDiagnosticOrder = goToDiagnosticOrder;

        function _loadDiagnosticOrderTypes() {
            vm.diagnosticOrderTypes = localValueSets.diagnosticOrderType();
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
                        $location.path('/diagnosticOrder/edit/new');
                        break;
                    case 1:
                        $location.path('/diagnosticOrder/detailed-search');
                        break;
                    case 2:
                        $location.path('/diagnosticOrder');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new diagnostic order', icon: 'order', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Diagnostic Order search options';
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
            if (vm.diagnosticOrderSearch.name) {
                queryParam.param = "name";
                queryParam.value = vm.diagnosticOrderSearch.name;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.diagnosticOrderSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.diagnosticOrderSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.diagnosticOrderSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.diagnosticOrderSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.identifier.system && vm.diagnosticOrderSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.diagnosticOrderSearch.identifier.system.concat("|", vm.diagnosticOrderSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.type) {
                queryParam.param = "type";
                queryParam.value = vm.diagnosticOrderSearch.type;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.diagnosticOrderSearch.partOf) {
                queryParam.param = "partOf";
                queryParam.value = vm.diagnosticOrderSearch.partOf.reference;
                queryParams.push(_.clone(queryParam));
            }
            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            searchDiagnosticOrders(queryString);
        }

        vm.detailSearch = detailSearch;

        vm.activeServer = null;
        vm.isBusy = false;
        vm.diagnosticOrders = [];
        vm.errorOutcome = null;
        vm.diagnosticOrderTypes = null;
        vm.diagnosticOrderSearch = {
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
        vm.title = 'DiagnosticOrders';
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdSidenav', '$scope', 'common', 'fhirServers', 'localValueSets', 'diagnosticOrderService', diagnosticOrderSearch]);
})();
