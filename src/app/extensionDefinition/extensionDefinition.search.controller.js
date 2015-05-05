(function () {
    'use strict';

    var controllerId = 'extensionDefinitionSearch';

    function extensionDefinitionSearch($location, common, fhirServers, extensionDefinitionService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');

        /* jshint validthis:true */
        var vm = this;

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _getCachedSearchResults() {
            extensionDefinitionService.getCachedSearchResults()
                .then(_processSearchResults);
        }

        function _activate() {
            common.activateController([_getActiveServer(), _getCachedSearchResults()], controllerId)
                .then(function () {
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/extensionDefinition/view/' + hash);
            }
        }

        vm.goToDetail = goToDetail;

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.extensionDefinitions = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            vm.noresults = false;
            extensionDefinitionService.getExtensionDefinitions(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' extension definitions from ' +
                        vm.activeServer.name, null, noToast);
                    vm.noresults = (angular.isUndefined(data.entry) || angular.isArray(data.entry) === false || data.entry.length === 0);
                    deferred.resolve(data.entry);
                }, function (error) {
                    logError('Error getting extension definitions', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function dereferenceLink(url) {
            vm.isBusy = true;
            extensionDefinitionService.getExtensionDefinitionsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.extensionDefinitions) ? data.extensionDefinitions.length : 0) +
                        ' ExtensionDefinitions from ' + vm.activeServer.name);
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
        
        vm.activeServer = null;
        vm.isBusy = false;
        vm.extensionDefinitions = [];
        vm.errorOutcome = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'ExtensionDefinitions';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', 'common', 'fhirServers', 'extensionDefinitionService', extensionDefinitionSearch]);
})();
