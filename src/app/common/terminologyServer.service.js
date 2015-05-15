(function () {
    'use strict';

    var serviceId = 'terminologyServers';

    function terminologyServers($cookieStore, common, dataCache, store) {
        var $q = common.$q;
        var activeServerKey = "terminologyServer";
        var serversKey = "terminologyServers";

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
                        "id": 1,
                        "name": "Health Directions",
                        "baseUrl": "http://fhir-dev.healthintersections.com.au/open",
                        "secure": false
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

    angular.module('FHIRCloud').factory(serviceId, ['$cookieStore', 'common', 'dataCache', 'store', terminologyServers]);

})();