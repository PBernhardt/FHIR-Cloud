(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, common, dataCache) {
        var $q = common.$q;

        function getActiveServer() {
            var activeServer = dataCache.readFromCache('activeServer');
            if (angular.isUndefined(activeServer)) {
                activeServer = $cookieStore.get('server');
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
            dataCache.addToCache('server', server);
            $cookieStore.put('server', server);
        }

        function getAllServers() {
            var deferred = $q.defer();
            try {
                var baseList = [
                    {
                        "id": 0,
                        "name": "Health Directions DSTU2 (open)",
                        "baseUrl": "http://fhir-dev.healthintersections.com.au/open",
                        "secure": false
                    },
                    {
                        "id": 1,
                        "name": "Health Directions DSTU2 (closed)",
                        "baseUrl": "https://fhir-dev.healthintersections.com.au/closed",
                        "secure": true
                    },
                    {
                        "id": 2,
                        "name": "SMART on FHIR DSTU2",
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
                        "name": "HAPI DSTU2",
                        "baseUrl": "http://fhirtest.uhn.ca/baseDstu2",
                        "secure": false
                    },
                    {
                        "id": 5,
                        "name": "Aegis DSTU2",
                        "baseUrl": "http://wildfhir.aegis.net/fhir2",
                        "secure": false
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