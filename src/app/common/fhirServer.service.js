(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, common, dataCache, store) {
        var $q = common.$q;
        var activeServerKey = "activeServer";
        var serversKey = "servers";

        function getActiveServer() {
            var activeServer = store.get(activeServerKey);
            if (angular.isUndefined(activeServer)) {
                activeServer = $cookieStore.get(activeServerKey);
            }
            if (angular.isUndefined(activeServer)) {
                activeServer = store.get(activeServerKey);
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
            $cookieStore.put(activeServerKey, server);
            store.set(activeServerKey, server)
        }

        function getAllServers() {
            var deferred = $q.defer();
            try {
                var baseList = [
                    {
                        "id": 0,
                        "name": "SMART",
                        "baseUrl": "https://fhir-api-dstu2.smarthealthit.org",
                        "secure": true,
                        "clientId": "c1be9476-39f4-4bc4-a6ce-85306034571f"
                    },
                    {
                        "id": 1,
                        "name": "HAPI",
                        "baseUrl": "https://fhirtest.uhn.ca/baseDstu2",
                        "secure": true
                    },
                    {
                        "id": 2,
                        "name": "RelayHealth",
                        "baseUrl": "https://api.stage.data.relayhealth.com/rhc/fhirservice",
                        "secure": true
                    },
                    {
                        "id": 3,
                        "name": "Health Directions",
                        "baseUrl": "http://fhir-dev.healthintersections.com.au/open",
                        "secure": false
                    },
                    {
                        "id": 4,
                        "name": "Furore Spark",
                        "baseUrl": "http://spark-dstu2.furore.com/fhir",
                        "secure": false
                    },
                    {
                        "id": 5,
                        "name": "Aegis",
                        "baseUrl": "http://wildfhir.aegis.net/fhir2",
                        "secure": false
                    },
                    {
                        "id": 7,
                        "name": "HealthConnex",
                        "baseUrl": "https://sqlonfhir.azurewebsites.net/api",
                        "secure": true
                    },

                    {
                        "id": 8,
                        "name": "EPIC",
                        "baseUrl": "http://open.epic.com/Clinical/FHIR",
                        "secure": false
                    },
                    {
                        "id": 9,
                        "name": "Cerner",
                        "baseUrl": "https://fhir.sandboxcernerpowerchart.com/fhir/open/d075cf8b-3261-481d-97e5-ba6c48d3b41f",
                        "secure": true
                    }


                ];
                var servers = dataCache.readFromCache(serversKey);
                if (angular.isUndefined(servers)) {
                    servers = baseList;
                    dataCache.addToCache(serversKey, servers);
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

    angular.module('FHIRCloud').factory(serviceId, ['$cookieStore', 'common', 'dataCache', 'store', fhirServers]);

})();