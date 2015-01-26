(function () {
    'use strict';

    var serviceId = 'dataCache';

    function dataCache($cacheFactory) {

        var fhirCache = $cacheFactory('fhirCache', {capacity: 20});

        function addToCache(key, value) {
            fhirCache.put(key, value);
        }

        function getCacheStats() {
            return fhirCache.info();
        }

        function getItemFromCache(hash, key) {
            var foundItem;
            if (hash && key) {
                var items = readFromCache(key);
                if (items) {
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (items[i].$$hashKey === hash) {
                            foundItem = items[i];
                            break;
                        }
                    }
                }
            }
            return foundItem;
        }

        function readFromCache(key) {
            return fhirCache.get(key);
        }

        var service = {
            addToCache: addToCache,
            readFromCache: readFromCache,
            getCacheStats: getCacheStats,
            getItemFromCache: getItemFromCache
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['$cacheFactory', dataCache]);

})();
