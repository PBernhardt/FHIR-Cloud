(function () {
    'use strict';

    var controllerId = 'mainController';

    function mainController($filter, $mdDialog, $mdSidenav, $location, $rootScope, $scope, $window, common, config,
                            conformanceService, fhirServers, auth, store, jwtHelper, smartAuthorizationService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var _adminPages = [
            {name: 'Encounter', href: 'encounter/view/current'},
            {name: 'Organization', href: 'organization/view/current'},
            {name: 'Patient', href: 'patient/view/current'},
            {name: 'Person', href: 'person/view/current'},
            {name: 'Practitioner', href: 'practitioner/view/current'},
            {name: 'Related Person', href: 'relatedPerson/view/current'}
        ];
        var _conformancePages = [
            {name: 'Conformance Statement', href: 'conformance/view/current'},
            {name: 'Extension Definition', href: 'extensionDefinition'},
            {name: 'Operation Definition', href: 'operationDefinition'},
            {name: 'Structure Definition', href: 'structureDefinition'},
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
     //       {name: 'Clinical', id: 2, pages: _clinicalPages},
            {name: 'Conformance', id: 3, pages: _conformancePages},
    //        {name: 'Documents', id: 4, pages: _documentsPages},
            {name: 'DAF Profiles', id: 5, pages: _dafResources}
        ];
        var noToast = false;

        function _activate() {
            common.activateController([_getFHIRServers(), _getActiveServer()], controllerId)
                .then(function () {
                    //for processing 2nd leg of SMART authorization
                    var authorizeResponse = $location.search();
                    var code = authorizeResponse.code;
                    var state = authorizeResponse.state;
                    if (code && state) {
                        _getAccessToken(code, state);
                    }
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
                targetEvent: ev,
                clickOutsideToClose: true
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
                controller: authenticateController,
                templateUrl: './templates/authenticate.html',
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

        vm.authenticate = authenticate;

        function login() {
            auth.signin({}, function (profile, token) {
                store.set('profile', profile);
                store.set('token', token);
                $location.path('/');
                common.changeUser(profile);
            }, function () {
                // Error callback
            });
        }

        vm.login = login;

        function logout() {
            auth.signout();
            store.remove('profile');
            store.remove('token');
            store.remove('authToken');
            store.remove('smartResponse');
            common.changeUser(null);
            $location.path('/');
        }

        vm.logout = logout;

        function authorize() {
            logInfo("Initiating authorization ...", null, noToast);
            if (angular.isUndefined(vm.activeServer.authorizeUri) || angular.isUndefined(vm.activeServer.tokenUri)) {
                logInfo("Selected server does NOT support OAuth");
            } else {
                logInfo("Auth URI: " + vm.activeServer.authorizeUri, null, noToast);
                logInfo("Token URI: " + vm.activeServer.tokenUri, null, noToast);
                logInfo("Redirect URI: " + vm.activeServer.redirectUri, null, noToast);
                smartAuthorizationService.authorize(vm.activeServer.clientId, vm.activeServer.authorizeUri, vm.activeServer.redirectUri);
            }
        }

        vm.authorize = authorize;

        function _getAccessToken(code, state) {
            smartAuthorizationService.getToken(code, state, vm.activeServer.clientId, vm.activeServer.tokenUri, vm.activeServer.redirectUri)
                .then(function (idToken) {
                    logInfo("Access token acquired from " + vm.activeServer.name);
                    idToken.name = idToken.sub;
                    store.set('profile', idToken);
                    common.changeUser(idToken);
                },
                function (error) {
                    logError(error);
                }
            );
        }

        function authenticateController($scope, $mdDialog) {
            function close() {
                $mdDialog.hide();
            }

            $scope.close = close;

            function authenticate() {
                if (angular.isDefined($scope.user)) {
                    $window.localStorage.user = JSON.stringify($scope.user);
                    common.changeUser($scope.user);
                }
                $mdDialog.hide();
            }

            $scope.authenticate = authenticate;
            if (angular.isDefined($window.localStorage.user)) {
                $scope.user = JSON.parse($window.localStorage.user);
            } else {
                $scope.user = null;
            }

            $scope.activeServer = vm.activeServer;
        }

        $scope.$on(config.events.authenticatedUserChanged,
            function (event, user) {
                if (user === null && vm.user !== null) {
                    logInfo(vm.user.name + " has been logged out");
                }
                vm.user = user;
            }
        );

        $rootScope.$on('$locationChangeStart', function () {
            if (common.isAuthenticated() === false && $location.path().indexOf('home') === -1) {
                if ($location.path() !== "/") {
                    logInfo("You must authenticate to access the application");
                }
                $location.path('/home');
            }
            else if (!auth.isAuthenticated) {
                var token = store.get('token');
                vm.user = store.get('profile');
                if (token) {
                    if (!jwtHelper.isTokenExpired(token)) {
                        auth.authenticate(vm.user, token);
                    } else {
                        // Either show Login page or use the refresh token to get a new idToken
                        logInfo("Authorization token has expired");
                        $location.path('/');
                    }
                }
            }
        });

        function selectServer(fhirServer) {
            $mdSidenav('right').close();
            conformanceService.clearCache();
            conformanceService.getConformanceMetadata(fhirServer.baseUrl)
                .then(function (conformance) {
                    logInfo('Retrieved conformance statement for ' + fhirServer.name, null, noToast);
                    vm.activeServer = fhirServer;
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
                    var url = $location.protocol() + "://" + $location.host();
                    if ($location.port() !== 80 && $location.port() !== 443) {
                        url = url + ":" + $location.port();
                    }
                    vm.activeServer.redirectUri = url;
                    fhirServers.setActiveServer(vm.activeServer);
                    common.changeServer(vm.activeServer);
                    if (angular.isDefined(vm.activeServer.clientId)) {
                        authorize();
                    } else {
                        store.remove('authToken');
                    }
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
        ['$filter', '$mdDialog', '$mdSidenav', '$location', '$rootScope', '$scope', '$window', 'common', 'config',
            'conformanceService', 'fhirServers', 'auth', 'store', 'jwtHelper', 'smartAuthorizationService', mainController]);
})
();
