(function () {
    'use strict';

    var app = angular.module('FHIRStarter', [
        // Angular modules
        'ngAnimate',        // animations
        'ngMaterial',       // material design
        'ngRoute' ,         // routing,
        'ngSanitize'
    ]);

    app.config(['$routeProvider', '$locationProvider',
        function ($routeProvider, $locationProvider) {
            $routeProvider.when('/home', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).when('/organization', {
                templateUrl: 'organization/organizations.html',
                controller: 'HomeCtrl'
            }).when('/patient', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).when('/practitioner', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).when('/person', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).when('/healthcareService', {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }).otherwise({
                redirectTo: '/home'
            });
            //   $locationProvider.html5Mode({enabled: true, requireBase: false});
        }]);

    app.controller('HomeCtrl', function ($scope) {
        $scope.welcome_message = "Hello FHIR Starter user!";
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

    app.controller('MainCtrl', function ($scope, $mdDialog) {
        var _servers = [
            {
                "id": 1,
                "name": "Furore Spark",
                "baseUrl": "http://spark.furore.com/fhir"
            },
            {
                "id": 2,
                "name": "HAPI",
                "baseUrl": "http://fhirtest.uhn.ca/base"
            },
            {
                "id": 3,
                "name": "Health Intersections",
                "baseUrl": "http://fhir.healthintersections.com.au/open"
            },
            {
                "id": 4,
                "name": "Oridashi",
                "baseUrl": "http://demo.oridashi.com.au:8190"
            },
            {
                "id": 5,
                "name": "Orion Health Blaze",
                "baseUrl": "https://fhir.orionhealth.com/blaze/fhir"
            },
            {
                "id": 6,
                "name": "SMART",
                "baseUrl": "https://fhir-open-api.smartplatforms.org"

            }
        ];

        var _adminPages = [
            {name: 'Organization', href: 'organization'},
            {name: 'Patient', href: 'patient'},
            {name: 'Practitioner', href: 'practitioner'},
            {name: 'Person', href: 'person'},
            {name: 'Healthcare Service', href: 'healthcareService'}
        ];

        var _sections = [
            {
                name: 'FHIR Servers', id: 1, pages: _servers
            },
            {
                name: 'Organizations', id: 2, pages: _servers
            },
            {
                name: 'Administration', id: 3, pages: _adminPages
            }
        ];

        $scope.menu = { sections: _sections, selectedSection: undefined, currentPage: undefined };

        $scope.isSectionSelected = function (section) {
            return section === $scope.menu.selectedSection;
        };


        $scope.toggleSelectSection = function (section) {
            if (angular.isDefined($scope.menu.selectedSection) && ($scope.menu.selectedSection.id === section.id)) {
                $scope.menu.selectedSection = undefined;
            } else {
                $scope.menu.selectedSection = section;
            }
        };
    });

})();
