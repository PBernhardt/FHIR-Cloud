(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, common, dataCache) {
        var $q = common.$q;

        function getActiveServer() {
            var activeServer = dataCache.readFromCache('activeServer');
            if (angular.isUndefined(activeServer)) {
                activeServer = $cookieStore.get('activeServer');
            }
            if (angular.isUndefined(activeServer)) {
                getAllServers()
                    .then(function (servers) {
                        activeServer = servers[0];
                        setActiveServer(activeServer);
                    });
            }
            return $q.when(activeServer);
        }

        function setActiveServer(server) {
            dataCache.addToCache('activeServer', server);
            $cookieStore.put('activeServer', server);
        }

        function getAllServers() {
            var deferred = $q.defer();
            try {
                var baseList = [
                    {
                        "id": 0,
                        "name": "Health Directions (open)",
                        "baseUrl": "http://fhir-dev.healthintersections.com.au/open"
                    },
                    {
                        "id": 1,
                        "name": "Health Directions",
                        "baseUrl": "https://fhir-dev.healthintersections.com.au/closed"
                    },
                    {
                        "id": 2,
                        "name": "SMART on FHIR (open)",
                        "baseUrl": "https://fhir-open-api-dstu2.smarthealthit.org"
                    },
                    {
                        "id": 4,
                        "name": "HAPI",
                        "baseUrl": "http://fhirtest.uhn.ca/baseDstu2"
                    },
                    {
                        "id": 5,
                        "name": "RelayHealth",
                        "baseUrl": "https://api.dev.data.relayhealth.com/rhc/fhirservice"
                    },
                    {
                        "id": 6,
                        "name": "HealthConnex",
                        "baseUrl": "http://sqlonfhir.azurewebsites.net/api"
                    },
                    {
                        "id": 7,
                        "name": "Argonaut Reference",
                        "baseUrl": "http://argonaut.healthintersections.com.au/open"
                    }
                ];
                var servers = dataCache.readFromCache('servers');
                if (angular.isUndefined(servers)) {
                    servers = baseList;
                    dataCache.addToCache('servers', servers);
                }
                deferred.resolve(servers);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }

        function getServerById(id) {
            var deferred = $q.defer();
            var server = null;
            getAllServers()
                .then(function (servers) {
                    for (var i = 0, len = servers.length; i < len; i++) {
                        if (servers[i].id === id) {
                            server = servers[i];
                            break;
                        }
                    }
                    return deferred.resolve(server);
                });
            return deferred.promise;
        }

        var service = {
            getAllServers: getAllServers,
            getServerById: getServerById,
            getActiveServer: getActiveServer,
            setActiveServer: setActiveServer
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$cookieStore', 'common', 'dataCache', fhirServers]);

})();