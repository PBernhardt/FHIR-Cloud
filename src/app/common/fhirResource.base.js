(function () {
    'use strict';

    var serviceId = 'fhirResourceBase';

    function fhirResourceBase() {

        function getBase() {
            // DSTU2 1.0.2
            return {
                // from Resource: id, meta, implicitRules, and language
                id: null,
                meta: {
                    versionId : null, // Version specific identifier
                    lastUpdated : null, // When the resource version last changed
                    profile : [], // Profiles this resource claims to conform to
                    security : [], // Security Labels applied to this resource
                    tag : [] // Tags applied to this resource
                },
                implicitRules: null,
                language: null,
                // from DomainResource: text, contained, extension, and modifierExtension
                text: null,
                contained: [],
                extension: [],
                modifierExtension: []
            };
        }

        var service = {
            getBase: getBase
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [fhirResourceBase]);
})();