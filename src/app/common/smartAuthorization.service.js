(function () {
    'use strict';

    var serviceId = 'smartAuthorizationService';

    function smartAuthorizationService($http, common, store) {
        var $q = common.$q;

        function authorize(authorizeUrl, redirectUri) {
            var deferred = $q.defer();
            // smart authorization query parametrs
            /*
             response_type=code&
             client_id=app-client-id&
             redirect_uri=https%3A%2F%2Fapp%2Fafter-auth&
             scope=launch:xyz123+patient%2FObservation.read+patient%2FPatient.read&
             state=98wrghuwuogerg97
             */
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
                    'Access-Control-Allow-Origin': '*'
                }
            };

            $http(req)
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

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', 'store', smartAuthorizationService]);

})();