(function () {
    'use strict';

    var serviceId = 'smartAuthorizationService';

    function smartAuthorizationService($http, $window, common, store) {
        var $q = common.$q;

        function authorize(authorizeUrl, redirectUri) {
           // var deferred = $q.defer();
            // smart authorization query parameters
            var state = common.randomHash();
            store.set("state", state);
            var authParams = {
                response_type: 'code',
                client_id: 'fhir-cloud',
                redirect_uri: redirectUri,
                scope: 'user/*.*',
                state: state
            };
            var req = {
                method: 'get',
                url: authorizeUrl,
                params: authParams,
                headers: {
                    'Access-Control-Request-Headers': 'Location'
                }
            };

            var queryParams = "?client_id=c1be9476-39f4-4bc4-a6ce-85306034571f&redirect_uri=" + encodeURIComponent(redirectUri) + "&response_type=code&scope=user%2F*.*&state=" + state;

            $window.open(authorizeUrl + queryParams, "_parent");
        }

        function deleteResource(resourceUrl) {
            var deferred = $q.defer();
            $http.delete(resourceUrl)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status, headers) {
                    if (status === 410) {
                        // already deleted
                        var results = {};
                        results.data = data;
                        results.status = status;
                        results.headers = headers;
                        deferred.resolve(results);
                    } else {
                        var error = {"status": status, "outcome": data};
                        deferred.reject(error);
                    }
                });
            return deferred.promise;
        }

        function getResource(resourceUrl) {
            var deferred = $q.defer();
            $http.get(resourceUrl)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status) {
                    var error = {"status": status, "outcome": data};
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function updateResource(resourceUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            $http.put(resourceUrl, fhirResource)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status) {
                    var error = {"status": status, "outcome": data};
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        var service = {
            deleteResource: deleteResource,
            getResource: getResource,
            authorize: authorize,
            updateResource: updateResource
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', '$window', 'common', 'store', smartAuthorizationService]);

})();