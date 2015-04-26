(function () {
    'use strict';

    var controllerId = 'mainController';

    function mainController($filter, $mdDialog, $mdSidenav, $location, $window, common, conformanceService, fhirServers) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var _adminPages = [
            {name: 'Encounter', href: 'encounter'},
            {name: 'Organization', href: 'organization/view/current'},
            {name: 'Patient', href: 'patient/view/current'},
            {name: 'Person', href: 'person'},
            {name: 'Practitioner', href: 'practitioner'},
            {name: 'Related Person', href: 'relatedPerson'}
        ];
        var _conformancePages = [
            {name: 'Conformance Statement', href: 'conformance'},
            {name: 'Extension Definition', href: 'extensionDefinition'},
            {name: 'Operation Definition', href: 'operationDefinition'},
            {name: 'Profile', href: 'profile'},
            {name: 'Value Set', href: 'valueSet'}
        ];
        var _documentsPages = [
            {name: 'Composition', href: 'composition'},
            {name: 'Document Manifest', href: 'documentManifest'},
            {name: 'Document Reference', href: 'documentReference'}
        ];
        var _clinicalPages = [
            {name: 'Allergy', href: 'allergy'},
            {name: 'Condition', href: 'condition'},
            {name: 'Diagnostic Order', href: 'diagnosticOrder'},
            {name: 'Diagnostic Report', href: 'diagnosticReport'},
            {name: 'Family History', href: 'familyHistory'},
            {name: 'Immunization', href: 'immunization'},
            {name: 'Medication', href: 'medication'},
            {name: 'Medication Statement', href: 'medicationStatement'}
        ];
        var _dafResources = [
            {name: 'Patient', href: 'daf/patient'},
            {name: 'Allergy Intolerance', href: 'daf/allergyIntolerance'},
            {name: 'Diagnostic Order', href: 'daf/organization'},
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
            {name: 'Clinical', id: 2, pages: _clinicalPages},
            {name: 'Conformance', id: 3, pages: _conformancePages},
            {name: 'Documents', id: 4, pages: _documentsPages},
            {name: 'DAF Profiles', id: 5, pages: _dafResources}
        ];
        var noToast = false;

        function _activate() {
            common.activateController([_getFHIRServers(), _getActiveServer()], controllerId)
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

        function _getFHIRServers() {
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
            $mdDialog.show({
                controller: aboutController,
                templateUrl: 'templates/about.html',
                targetEvent: ev
            })
                .then(function() {
                    logInfo("About dialog closed", null, noToast);
                }, function(error) {
                    logError("Error", error, noToast);
                });
        }

        function aboutController($scope, $mdDialog) {
            function close() {
                $mdDialog.hide();
            }
            $scope.close = close;
            $scope.activeServer = vm.activeServer;
            if (angular.isDefined($window.localStorage.patient) && ($window.localStorage.patient !== null)) {
                $scope.patient = JSON.parse($window.localStorage.patient);
                $scope.patient.fullName = $filter('fullName')($scope.patient.name);
            }
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
                    common.changeServer(fhirServer);
                }, function (error) {
                    logError('Error returning conformance statement for ' + fhirServer.name + '. Server ' + vm.activeServer.name + ' abides.', error);
                });
            logInfo('Requesting access to server ' + fhirServer.name + ' ...');
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

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$mdDialog', '$mdSidenav', '$location', '$window', 'common', 'conformanceService', 'fhirServers', mainController]);

})();
