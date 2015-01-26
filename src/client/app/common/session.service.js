(function () {
    'use strict';

    var serviceId = 'sessionService';

    function sessionService(dataCache) {

        var dataCacheKey = 'session';

        function updateSession(session) {
            dataCache.addToCache(dataCacheKey, session);
        }

        function getSession() {
            var session = dataCache.readFromCache(dataCacheKey);
            if (session) {
                return session;
            } else {
                return  { "patient": undefined, "organization": undefined, "ihe": undefined, "person": undefined};
            }
        }

        var service = {
            updateSession: updateSession,
            getSession: getSession
        };

        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, ['dataCache', sessionService]);

})();