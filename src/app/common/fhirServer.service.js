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
                    {
                        id: 2,
                        name: "RelayHealth (Sandbox 2)",
                        baseUrl: "https://api.stage.data.relayhealth.com/rhc/fhirservice",
                        clientId: "d59a5f56-cb04-4070-8c13-ee6b54e81bde",
                        resourceId: "http://apps.data.mccadevdpat.onmicrosoft.com/rhc/fhirservice/stage",
                        mode: "implicit"
                    },
                    {
                        id: 3,
                        name: "RelayHealth (Sandbox 1)",
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
                        id: 5,
                        name: "Furore Spark",
                        baseUrl: "http://spark.furore.com/fhir"
                    },
                    {
                        id: 6,
                        name: "CareEvolution",
                        baseUrl: "http://fhir2016.careevolution.com/DAF/fhir"
                    },
                    {
                        id: 7,
                        name: "Cerner (Open)",
                        baseUrl: "https://fhir-open.sandboxcernerpowerchart.com/dstu2/d075cf8b-3261-481d-97e5-ba6c48d3b41f"
                    },
                    {
                        id: 8,
                        name: "EPIC (Open)",
                        baseUrl: "https://open-ic.epic.com/Argonaut-Unsecure/API/FHIR/Argonaut"
                    },
                    {
                        id: 10,
                        name: "Transcend Insights",
                        baseUrl: "http://rahulsom.ngrok.com/healthdock/alpine/fhir"
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