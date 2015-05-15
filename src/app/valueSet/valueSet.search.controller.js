﻿(function () {
    'use strict';

    var controllerId = 'valueSetSearch';

    function valueSetSearch($location, common, valueSetService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var noToast = false;

        /* jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([], controllerId)
                .then(function () {
                });
        }

        function goToDetail(valueSet) {
            if (valueSet) {
                $location.path('/valueSet/view/' + valueSet.$$hashKey);
            }
        }

        vm.goToDetail = goToDetail;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.valueSets = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            vm.noresults = false;
            valueSetService.getValueSets(searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' ValueSets', null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    deferred.resolve(data.entry);
                }, function (error) {
                    logError('Error getting value sets', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function dereferenceLink(url) {
            toggleSpinner(true);
            valueSetService.getValueSetsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.valueSets) ? data.valueSets.length : 0) + ' ValueSets', null, noToast);
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

        vm.dereferenceLink = dereferenceLink;

        function toggleSpinner(on) {
            vm.isBusy = on;
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
                        $location.path('/valueSet/edit/new');
                        break;
                    case 1:
                        $location.path('/valueSet/detailed-search');
                        break;
                    case 2:
                        $location.path('/valueSet');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Patient search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new value set', icon: 'terminology', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'quickFind', index: 2}
                ];
                this.title = 'Value Set search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        vm.isBusy = false;
        vm.valueSets = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'ValueSets';
        vm.selectedValueSet = null;
        vm.noresults = undefined;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', 'common', 'valueSetService', valueSetSearch]);
})();
