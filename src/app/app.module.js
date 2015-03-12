(function () {
    'use strict';

    var app = angular.module('FHIRCloud', [
        // Angular modules
        'ngAnimate',        // animations
        'ngMaterial',       // material design
        'ngRoute',         // routing,
        'ngSanitize',
        'ngMessages',
        'ngCookies',
        'common',
        'ui.bootstrap',
        'AdalAngular'
    ]);

    app.config(['$routeProvider', '$mdThemingProvider', '$mdIconProvider',
        function ($routeProvider, $mdThemingProvider, $mdIconProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('light-blue')
                .accentPalette('green');

            $mdIconProvider
                .icon("actions", "./assets/svg/actions.svg", 24)
                .icon("account", "./assets/svg/account.svg", 24)
                .icon("add", "./assets/svg/add.svg", 24)
                .icon("caduceus", "./assets/svg/caduceus.svg", 24)
                .icon("delete", "./assets/svg/delete.svg", 24)
                .icon("edit", "./assets/svg/edit.svg", 24)
                .icon("fire", "./assets/svg/fire.svg", 24)
                .icon("group", "./assets/svg/group.svg", 24)
                .icon("menu", "./assets/svg/menu.svg", 24)
                .icon("organization", "./assets/svg/hospital.svg", 24)
                .icon("practitioner", "./assets/svg/md.svg", 24)
                .icon("save", "./assets/svg/save.svg", 24)
                .icon("search", "./assets/svg/search.svg", 24)
                .icon("settings", "./assets/svg/settings.svg", 24)
                .icon("view", "./assets/svg/visibility.svg", 12);

            $routeProvider.when('/conformance', {
                templateUrl: 'conformance/conformance-search.html'
            }).when('/conformance/view/:hashKey', {
                templateUrl: 'conformance/conformance-view.html'
            }).when('/extensionDefinition', {
                templateUrl: 'extensionDefinition/extensionDefinition-search.html'
            }).when('/extensionDefinition/view/:hashKey', {
                templateUrl: 'extensionDefinition/extensionDefinition-view.html'
            }).when('/extensionDefinition/edit/:hashKey', {
                templateUrl: 'extensionDefinition/extensionDefinition-edit.html'
            }).when('/operationDefinition', {
                templateUrl: 'operationDefinition/operationDefinition-search.html'
            }).when('/operationDefinition/view/:hashKey', {
                templateUrl: 'operationDefinition/operationDefinition-view.html'
            }).when('/operationDefinition/edit/:hashKey', {
                templateUrl: 'operationDefinition/operationDefinition-edit.html'
            }).when('/organization', {
                templateUrl: 'organization/organization-search.html'
            }).when('/organization/view/:hashKey', {
                templateUrl: 'organization/organization-view.html'
            }).when('/organization/edit/:hashKey', {
                templateUrl: 'organization/organization-edit.html'
            }).when('/patients/:orgId', {
                templateUrl: 'patient/patient-search.html'
            }).when('/patient', {
                templateUrl: 'patient/patient-search.html'
            }).when('/patient/view/:hashKey', {
                templateUrl: 'patient/patient-view.html'
            }).when('/patient/edit/:hashKey', {
                templateUrl: 'patient/patient-edit.html'
            }).when('/patient/patient-detailed-search', {
                templateUrl: 'patient/patient-detailed-search.html'
            }).when('/patient/patient-race', {
                templateUrl: 'patient/patient-demographics-query.html'
            }).when('/practitioner', {
                templateUrl: 'practitioner/practitioner-search.html'
            }).when('/person', {
                templateUrl: 'person/person-search.html'
            }).when('/person/view/:hashKey', {
                templateUrl: 'person/person-view.html'
            }).when('/person/edit/:hashKey', {
                templateUrl: 'person/person-edit.html'
            }).when('/profile', {
                templateUrl: 'profile/profile-search.html'
            }).when('/profile/view/:hashKey', {
                templateUrl: 'profile/profile-view.html'
            }).when('/profile/edit/:hashKey', {
                templateUrl: 'profile/profile-edit.html'
            }).when('/healthcareService', {
                templateUrl: 'templates/home.html'
            }).when('/valueSet', {
                templateUrl: 'valueSet/valueSet-search.html'
            }).when('/valueSet/view/:hashKey', {
                templateUrl: 'valueSet/valueSet-view.html'
            }).when('/valueSet/edit/:hashKey', {
                templateUrl: 'valueSet/valueSet-edit.html'
            }).otherwise({
                redirectTo: '/home'
            });
            //   $locationProvider.html5Mode({enabled: true, requireBase: false});
            /*
             adalAuthenticationServiceProvider.init(
             {
             tenant: 'b0a4bfcb-677b-4629-b45d-b7974cf6e563',
             clientId: '2783f45e-3703-451b-bd9e-c6c1ba41c2ff'
             },
             $httpProvider
             );*/
        }]);

    app.controller('HomeCtrl', function ($scope) {
        $scope.welcome_message = "Hello FHIR Cloud user!";
    });

    app.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close();
            $log.debug("close LEFT is done");
        };
    });

    app.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log) {
            $scope.toggleLeft = function () {
                $mdSidenav('left').toggle();
                $log.debug("toggle left is done");
            };
        }
    );

    app.controller('MainCtrl', function ($scope, $mdDialog, $mdSidenav, $mdToast, $filter, $location, $rootScope,  $window, common, config) {
        /*jshint validthis:true */
        var vm = this;
        var events = config.events;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn('MainCtrl', 'error');
        var logInfo = getLogFn('MainCtrl', 'info');

        $scope.isBusy = false;

        var _adminPages = [
            {name: 'Organization', href: 'organization'},
            {name: 'Patient', href: 'patient'},
            {name: 'Practitioner', href: 'practitioner'},
            {name: 'Person', href: 'person'}
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

        $scope.FHIRServers =  [
            {
                "id": 0,
                "name": "Health Directions (open)",
                "baseUrl": "http://fhir-dev.healthintersections.com.au/open",
                "secure": false
            },
            {
                "id": 1,
                "name": "Health Directions (closed)",
                "baseUrl": "https://fhir-dev.healthintersections.com.au/closed",
                "secure": true
            },
            {
                "id": 2,
                "name": "SMART on FHIR",
                "baseUrl": "https://fhir-api-dstu2.smartplatforms.org",
                "secure": true
            },
            {
                "id": 3,
                "name": "Oridashi",
                "baseUrl": "http://md.oridashi.com.au",
                "secure": false
            },
            {
                "id": 4,
                "name": "HAPI",
                "baseUrl": "http://fhirtest.uhn.ca/baseDstu2",
                "secure": false
            },
            {
                "id": 5,
                "name": "RelayHealth",
                "baseUrl": "http://tbd/fhir2",
                "secure": false
            }
        ];

        var _sections = [
            {name: 'Administration', id: 1, pages: _adminPages},
            {name: 'Conformance', id: 2, pages: _conformancePages},
            {name: 'Documents', id: 3, pages: _documentsPages},
            {name: 'DAF Profiles', id: 3, pages: _dafResources}
        ];

        $scope.menu = {
            sections: _sections,
            selectedSection: undefined,
            selectedPage: undefined,
            selectedSubPage: undefined
        };

        $scope.toggleMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.toggleServers = function () {
            $mdSidenav('right').toggle();
        };

        $scope.showAbout = function () {

        };

        $scope.authenticate = function () {

        };

        $scope.selectServer = function (fhirServer) {
            $mdSidenav('right').close();
            logInfo('Setting server to ' + fhirServer.name + ' ...');
        };

        $scope.isSectionSelected = function (section) {
            return section === $scope.menu.selectedSection;
        };

        $scope.pageSelected = function (page) {
            $scope.menu.selectedPage = page.name;
            $location.path('/' + page.href);
        };

        $scope.toggleSelectSection = function (section) {
            if (angular.isDefined($scope.menu.selectedSection) && ($scope.menu.selectedSection.id === section.id)) {
                $scope.menu.selectedSection = undefined;

            } else {
                $scope.menu.selectedSection = section;
            }
            $scope.menu.selectedPage = undefined;
            $scope.menu.selectedSubPage = undefined;
        };

        function toggleProgressBar(on) {
            $scope.isBusy = on;
        }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                toggleProgressBar(true);
            }
        );

        $rootScope.$on('$routeChangeSuccess',
            function (event, current) {
                toggleProgressBar(false);
            }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function (data) {
                // Update ui if necessary
            }
        );

        $rootScope.$on(events.progressToggleEvent,
            function (data) {
                toggleProgressBar(data.show);
            }
        );
    });
})();
