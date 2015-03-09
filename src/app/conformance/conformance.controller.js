(function () {
    'use strict';

    var controllerId = 'conformance';

    function conformance($location, $mdSidenav, common, config, fhirServers, conformanceService) {
        /* jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function changeFHIRServer(id) {
            if (vm.activeServer && vm.activeServer.id !== id) {
                conformanceService.clearCache();
                fhirServers.getServerById(id).then(function (data) {
                    vm.activeServer = data;
                }).then(_getConformanceStatement);
            }
            $mdSidenav('right').close();
        }

        function _getConformanceStatement() {
            common.toggleProgressBar(true);
            conformanceService.getConformanceMetadata(vm.activeServer.baseUrl).then(
                function (conformanceStatement) {
                    vm.conformance = conformanceStatement;
                    fhirServers.setActiveServer(vm.activeServer);
                    logInfo('Loaded conformance statement for ' + vm.activeServer.name, null, noToast);
                }, function (error) {
                    logError('Failed to retrieve conformance statement for ' + vm.activeServer.name, error);
                }).then(function () {
                    common.toggleProgressBar(false);
                });
        }

        function _getFhirServers() {
            fhirServers.getAllServers().then(function (data) {
                vm.fhirServers = data;
            });
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function activate() {
            common.activateController([_getActiveServer(), _getFhirServers()], controllerId)
                .then(_getConformanceStatement)
                .then(function () {
                    $mdSidenav('right').close();
                });
        }

        vm.activeServer = null;
        vm.conformance = null;
        vm.isBusy = false;
        vm.errorOutcome = null;
        vm.message = '';
        vm.title = 'Conformance Statement';
        vm.fhirServers = null;
        vm.toggleSideNav = toggleSideNav;
        vm.changeFHIRServer = changeFHIRServer;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'conformanceService', conformance]);
})();