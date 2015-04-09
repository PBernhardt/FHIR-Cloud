(function () {
    'use strict';

    var controllerId = 'mainController';

    function mainController($mdDialog, $mdSidenav, $location, common, conformanceService, fhirServers) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var _adminPages = [
            {name: 'Organization', href: 'organization'},
            {name: 'Patient', href: 'patient/view/current'},
            {name: 'Practitioner', href: 'practitioner'},
            {name: 'Person', href: 'person'},
            {name: 'Related Person', href: 'relatedPerson'}
        ];
        var _conformancePages = [
            {name: 'Conformance Statement', href: 'conformance'},
            {name: 'Profile', href: 'profile'},
            {name: 'Extension Definition', href: 'extensionDefinition'},
            {name: 'Operation Definition', href: 'operationDefinition'},
            {name: 'Value Set', href: 'valueSet'}
        ];
        var _documentsPages = [
            {name: 'Composition', href: 'composition'},
            {name: 'Document Reference', href: 'documentReference'},
            {name: 'Document Manifest', href: 'documentManifest'}
        ];
        var _dafResources = [
            {name: 'Patient', href: 'daf/patient'},
            {name: 'Allergy Intolerance', href: 'daf/allergyIntolerance'},
            {name: 'Diagnostic Order', href: 'daf/diagnosticOrder'},
            {name: 'Diagnostic Report', href: 'daf/diagnosticReport'},
            {name: 'Encounter', href: 'daf/encounter'},
            {name: 'Family History', href: 'daf/familyHistory'},
            {name: 'Immunization', href: 'daf/immunization'},
            {name: 'Results', href: 'daf/results'},
            {name: 'Medication', href: 'daf/medication'},
            {name: 'Medication Statement', href: 'daf/medicationStatement'},
            {name: 'Medication Administration', href: 'daf/medicationAdministration'},
            {name: 'Condition', href: 'daf/condition'},
            {name: 'Procedure', href: 'daf/procedure'},
            {name: 'Smoking Status', href: 'daf/smokingStatus'},
            {name: 'Vital Signs', href: 'daf/vitalSigns'},
            {name: 'List', href: 'daf/list'}
        ];
        var _sections = [
            {name: 'Administration', id: 1, pages: _adminPages},
       //     {name: 'Conformance', id: 2, pages: _conformancePages},
       //     {name: 'Documents', id: 3, pages: _documentsPages},
            {name: 'DAF Profiles', id: 3, pages: _dafResources}
        ];
        var noToast = false;

        function activate() {
            common.activateController([getFHIRServers(), getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getFHIRServers() {
            fhirServers.getAllServers().then(function (data) {
                vm.FHIRServers = data;
            })
        }

        function toggleMenu() {
            $mdSidenav('left').toggle();
        }

        function toggleServers() {
            $mdSidenav('right').toggle();
        }

        function showAbout(ev) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title('FHIR Cloud')
                    .content('Active Server: ' + vm.activeServer.name)
                    .ariaLabel('About FHIR Cloud')
                    .ok('OK')
                    .targetEvent(ev)
            );
        }

        function authenticate(ev) {
            $mdDialog.show({
                templateUrl: './templates/authenticate.html',
                targetEvent: ev
            })
                .then(function (data) {
                    // what they entered
                }, function () {
                    // login cancelled
                })
        }

        function selectServer(fhirServer) {
            $mdSidenav('right').close();
            conformanceService.clearCache();
            conformanceService.getConformanceMetadata(fhirServer.baseUrl)
                .then(function (conformance) {
                    logInfo('Retrieved conformance statement for ' + fhirServer.name, null, noToast);
                    vm.activeServer = fhirServer;
                    fhirServers.setActiveServer(fhirServer);
                    if (angular.isUndefined(conformance.rest[0].security)) {
                        logInfo("Security information missing - this is an OPEN server", null, noToast);
                    } else if (angular.isArray(conformance.rest[0].security.extension)) {
                        _.forEach(conformance.rest[0].security.extension, function (ex) {
                            if (_.endsWith(ex.url, "#authorize")) {
                                vm.activeServer.authorizeUri = ex.valueUri;
                                logInfo("Authorize URI found: " + vm.activeServer.authorizeUri, null, noToast);
                            }
                            if (_.endsWith(ex.url, "#token")) {
                                vm.activeServer.tokenUri = ex.valueUri;
                                logInfo("Token URI found: " + vm.activeServer.tokenUri, null, noToast);
                            }
                        })
                    }
                }, function (error) {
                    logInfo('Error returning conformance statement for ' + fhirServer.name, error);
                })
            logInfo('Setting server to ' + fhirServer.name + ' ...');
        }

        function isSectionSelected(section) {
            return section === vm.menu.selectedSection;
        }

        function pageSelected(page) {
            vm.menu.selectedPage = page.name;
            $location.path('/' + page.href);
        }

        function toggleSelectSection(section) {
            if (angular.isDefined(vm.menu.selectedSection) && (vm.menu.selectedSection.id === section.id)) {
                vm.menu.selectedSection = undefined;

            } else {
                vm.menu.selectedSection = section;
            }
            vm.menu.selectedPage = undefined;
            vm.menu.selectedSubPage = undefined;
        }

        vm.authenticate = authenticate;
        vm.FHIRServers = [];
        vm.isSectionSelected = isSectionSelected;
        vm.menu = {
            sections: _sections,
            selectedSection: undefined,
            selectedPage: undefined,
            selectedSubPage: undefined
        };
        vm.pageSelected = pageSelected;
        vm.selectServer = selectServer;
        vm.showAbout = showAbout;
        vm.toggleMenu = toggleMenu;
        vm.toggleSelectSection = toggleSelectSection;
        vm.toggleServers = toggleServers;
        vm.activeServer = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$mdDialog', '$mdSidenav', '$location', 'common', 'conformanceService', 'fhirServers', mainController]);

})();
