(function () {
    'use strict';

    var serviceId = 'fhirClient';

    function fhirClient($http, common, store) {
        var $q = common.$q;

        function addResource(baseUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            var req = {
                method: 'post',
                url: baseUrl,
                data: fhirResource,
                timeout: 7000
            };
            var token = store.get('authToken');
            if (!common.isUndefinedOrNull(token)) {
                req.headers = {Authorization: 'Bearer ' + token};
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
                    var error = {"status": status, "outcome": data};
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function deleteResource(resourceUrl) {
            var deferred = $q.defer();
            var req = {
                method: 'delete',
                url: resourceUrl,
                timeout: 7000
            };
            var token = store.get('authToken');
            if (!common.isUndefinedOrNull(token)) {
                req.headers = {Authorization: 'Bearer ' + token};
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
                        var error = {"status": status, "outcome": data};
                        deferred.reject(error);
                    }
                });
            return deferred.promise;
        }

        function getResource(resourceUrl) {
            var deferred = $q.defer();
            var timeout = $q.defer();
            var timedOut = false;

            setTimeout(function () {
                timedOut = true;
                timeout.resolve();
            }, (7000));

            var req = {
                method: 'get',
                url: resourceUrl,
                timeout: timeout.promise
            };

            var token = store.get('authToken');
            if (!common.isUndefinedOrNull(token) && resourceUrl.indexOf('metadata') === -1) {
                req.headers = {Authorization: 'Bearer ' + token};
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
                    if (timedOut) {
                        deferred.reject({
                            status: "Unknown",
                            outcome: {
                                issue: [{
                                    severity: 'fatal',
                                    details: 'Request cancelled - server did not respond within 7 seconds.'
                                }]
                            }
                        });
                    } else {
                        deferred.reject({status: status, outcome: data});
                    }
                });

            return deferred.promise;
        }

        function updateResource(resourceUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            var req = {
                method: 'put',
                url: resourceUrl,
                data: fhirResource,
                timeout: 7000
            };
            var token = store.get('authToken');
            if (!common.isUndefinedOrNull(token)) {
                req.headers = {Authorization: 'Bearer ' + token};
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
                    var error = {"status": status, "outcome": data};
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

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', 'store', fhirClient]);


})();