(function () {
    'use strict';

    var serviceId = 'smartAuthorizationService';

    function smartAuthorizationService($http, $window, common, store) {
        var $q = common.$q;
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var noToast = false;
        var stateKey = "state";

        function authorize(clientId, authorizeUrl, redirectUri) {
            var state = common.randomHash();
            store.set(stateKey, state);
            var queryParams = "?client_id=" + clientId + "&redirect_uri=" + encodeURIComponent(redirectUri) + "&response_type=code&scope=user%2F*.*+openid+profile&state=" + state;
            $window.open(authorizeUrl + queryParams, "_parent");
        }

        function getToken(code, state, clientId, tokenUrl, redirectUri) {
            /*
             grant_type=authorization_code&
             client_id=app-client-id&
             code=123abc&
             redirect_uri=https%3A%2F%2Fapp%2Fafter-auth
             */
            var cachedState = store.get(stateKey);
            store.remove(stateKey);
            if (cachedState !== state) {
                logInfo("'" + cachedState + "' does not equal '" + state + "'", null, noToast);
            } else {
                logInfo("Authorization state check passed for " + state);
            }
            var authParams = {
                grant_type: 'authorization_code',
                client_id: clientId,
                code: code,
                redirect_uri: redirectUri
            };
            var req = {
                method: 'post',
                url: tokenUrl,
                params: authParams
            };
            var deferred = $q.defer();
            $http(req)
                .success(function (data) {
                    store.set("authToken", data.access_token);
                    store.set("smartResponse", data);
                    if (data.id_token) {
                        var profile = jwt_decode(data.id_token);
                    }
                    deferred.resolve(profile);
                })
                .error(function (data, status, headers) {
                    var results = {};
                    results.data = data;
                    results.status = status;
                    results.headers = headers;
                    deferred.resolve(results);
                    var error = {"status": status, "outcome": data};
                    deferred.reject(error);
                });
            return deferred.promise;
        }


        var service = {
            authorize: authorize,
            getToken: getToken
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', '$window', 'common', 'store', smartAuthorizationService]);

})();