(function () {
    'use strict';

    var serviceId = 'terminologyClient';

    function terminologyClient($http, common, store) {
        var $q = common.$q;
        var tokenKey = 'terminologyAuthToken';

        function addResource(baseUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            var req = {
                method: 'post',
                url: baseUrl,
                data: fhirResource
            };
            var token = store.get(tokenKey);
            if (!common.isUndefinedOrNull(token)) {
                req.headers = { Authorization: 'Bearer ' + token };
            }
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
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function deleteResource(resourceUrl) {
            var deferred = $q.defer();
            var req = {
                method: 'delete',
                url: resourceUrl
            };
            var token = store.get(tokenKey);
            if (!common.isUndefinedOrNull(token)) {
                req.headers = { Authorization: 'Bearer ' + token };
            }
            $http(req)
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
                        var error = { "status": status, "outcome": data };
                        deferred.reject(error);
                    }
                });
            return deferred.promise;
        }

        function getResource(resourceUrl) {
            var deferred = $q.defer();
            var req = {
                method: 'get',
                url: resourceUrl
            };
            var token = store.get(tokenKey);
            if (!common.isUndefinedOrNull(token) && resourceUrl.indexOf('metadata') === -1) {
                req.headers = { Authorization: 'Bearer ' + token };
            }
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
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function updateResource(resourceUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            var req = {
                method: 'put',
                url: resourceUrl,
                data: fhirResource
            };
            var token = store.get(tokenKey);
            if (!common.isUndefinedOrNull(token)) {
                req.headers = { Authorization: 'Bearer ' + token };
            }
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
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        var service = {
            deleteResource: deleteResource,
            getResource: getResource,
            addResource: addResource,
            updateResource: updateResource
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', 'store', terminologyClient]);


})();