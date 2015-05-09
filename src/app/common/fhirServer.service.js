(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, $window, common, dataCache) {
        var $q = common.$q;

        function getActiveServer() {
            var activeServer = dataCache.readFromCache('activeServer');
            if (angular.isUndefined(activeServer)) {
                activeServer = $cookieStore.get('activeServer');
            }
            if (angular.isUndefined(activeServer)) {
                if (angular.isDefined($window.localStorage.activeServer) && ($window.localStorage.activeServer !== null)) {
                    activeServer = JSON.parse($window.localStorage.activeServer);
                }
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
            $window.localStorage.activeServer = JSON.stringify(server);
        }

        function getAllServers() {
            var deferred = $q.defer();
            try {
                var baseList = [
                    {
                        "id": 0,
                        "name": "SMART",
                        "baseUrl": "https://fhir-api-dstu2.smarthealthit.org",
                        "secure": true
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
                        "baseUrl": "https://api.dev.data.relayhealth.com/rhc/fhirservice",
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
                        "name": "Argonaut Reference",
                        "baseUrl": "http://argonaut.healthintersections.com.au",
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

    angular.module('FHIRCloud').factory(serviceId, ['$cookieStore', '$window', 'common', 'dataCache', fhirServers]);

})();