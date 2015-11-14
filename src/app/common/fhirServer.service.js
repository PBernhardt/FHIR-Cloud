(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, common, dataCache, store) {
        var $q = common.$q;
        var activeServerKey = "activeServer";
        var serversKey = "servers";

        function getActiveServer() {
            var activeServer = store.get(activeServerKey);
            if (common.isUndefinedOrNull(activeServer)) {
                activeServer = $cookieStore.get(activeServerKey);
            }
            if (common.isUndefinedOrNull(activeServer)) {
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
                        id: 0,
                        name: "SMART",
                        baseUrl: "https://fhir-api-dstu2.smarthealthit.org",
                        clientId: "1a5e6061-f60e-425e-a0fa-933448d97814",
                        mode: "authCode"
                    },
                    {
                        id: 1,
                        name: "HAPI (Open)",
                        baseUrl: "http://fhirtest.uhn.ca/baseDstu2"
                    },
/*                   {
                        id: 2,
                        name: "RelayHealth (Stage)",
                        baseUrl: "https://api.stage.data.relayhealth.com/rhc/fhirservice",
                        clientId: "d59a5f56-cb04-4070-8c13-ee6b54e81bde",
                        resourceId: "http://apps.data.mccadevdpat.onmicrosoft.com/rhc/fhirservice/stage",
                        mode: "implicit"
                    },*/
                    {
                        id: 3,
                        name: "RelayHealth",
                        baseUrl: "https://api.dev.data.relayhealth.com/rhc/fhirservice",
                        clientId: "d59a5f56-cb04-4070-8c13-ee6b54e81bde",
                        resourceId: "http://apps.data.mccadevdpat.onmicrosoft.com/rhc/fhirservice/dev",
                        mode: "implicit"
                    },
                    {
                        id: 4,
                        name: "Health Directions (Open)",
                        baseUrl: "http://fhir2.healthintersections.com.au/open"
                    },
                    {
                        id: 7,
                        name: "HealthConnex",
                        baseUrl: "http://sqlonfhir.azurewebsites.net/fhir"
                    },
                    {
                        id: 5,
                        name: "Furore Spark",
                        baseUrl: "http://spark.furore.com/fhir"
                    },
                        /*
                    {
                        id: 6,
                        name: "Aegis",
                        baseUrl: "http://wildfhir.aegis.net/fhir2"
                    },

                    {
                        id: 8,
                        name: "EPIC",
                        baseUrl: "https://open-ic.epic.com/Argonaut/api/FHIR/Argonaut",
                        clientId: "",
                        mode: "authCode"
                    },
                    {
                        id: 9,
                        name: "Cerner",
                        baseUrl: "https://fhir.sandboxcernerpowerchart.com/may2015/d075cf8b-3261-481d-97e5-ba6c48d3b41f",
                        clientId: "",
                        mode: "authCode"
                    },
                    {
                        id: 10,
                        name: "Cerner (Open)",
                        baseUrl: "https://fhir-open.sandboxcernerpowerchart.com/may2015/d075cf8b-3261-481d-97e5-ba6c48d3b41f"
                    },
                    {
                        id: 11,
                        name: "Argonaut Reference",
                        baseUrl: "https://argonaut.healthintersections.com.au/closed",
                        clientId: "c1be9476-39f4-4bc4-a6ce-85306034571f",
                        mode: "authCode"
                    },
                    {
                        id: 12,
                        name: "Allscripts",
                        baseUrl: "https://cloud.allscriptsunity.com/FHIR",
                        clientId: "6D1A05FF-4DA7-46CA-8E60-2DCD38A183B2",
                        mode: "authCode"
                    },
                    {
                        id: 13,
                        name: "MEDITECH",
                        baseUrl: "http://direct.meditech.com/FHIR/api2"
                    },*/
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