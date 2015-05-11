(function () {
    'use strict';

    var controllerId = 'smartAuthorization';

    function smartAuthorization($filter, $mdDialog, $mdSidenav, $location, $rootScope, $routeParams, $scope, $window, common, config,
                            conformanceService, fhirServers, auth, store, jwtHelper, smartAuthorizationService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;

        function _activate() {
            common.activateController([_getFHIRServers(), _getActiveServer()], controllerId)
                .then(function () {
                    _getAuthorizationResult();
                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function _getAuthorizationResult() {
            logInfo("Current params: " + $route.current.params, null, noToast);
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

        function authorize() {
            logInfo("Initiating authorization ...", null, noToast);
            if (angular.isUndefined(vm.activeServer.authorizeUri) || angular.isUndefined(vm.activeServer.tokenUri)) {
                logInfo("Selected server does NOT support OAuth");
            } else {
                logInfo("Auth URI: " + vm.activeServer.authorizeUri, null, noToast);
                logInfo("Token URI: " + vm.activeServer.tokenUri, null, noToast);
                var url = $location.url();
                var absoluteUrl = $location.absUrl();
                var redirectUri = absoluteUrl.replace(url, "/auth");
                redirectUri = redirectUri.replace("#", "");
                logInfo("RedirectUri: " + redirectUri, null, noToast);

                smartAuthorizationService.authorize(vm.activeServer.authorizeUri, redirectUri);
            }

        }

        vm.authorize = authorize;

        $scope.$on(config.events.authenticatedUserChanged,
            function (event, user) {
                if (user === null && vm.user !== null) {
                    logInfo(vm.user.name + " has been logged out");
                }
                vm.user = user;
            }
        );

        $rootScope.$on('$locationChangeStart', function () {
            if (!auth.isAuthenticated) {
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

        vm.activeServer = null;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$mdDialog', '$mdSidenav', '$location', '$rootScope', '$routeParams', '$scope', '$window', 'common', 'config',
            'conformanceService', 'fhirServers', 'auth', 'store', 'jwtHelper', 'smartAuthorizationService', smartAuthorization]);
})
();
