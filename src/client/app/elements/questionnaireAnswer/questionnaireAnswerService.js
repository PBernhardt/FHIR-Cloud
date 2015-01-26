/**
 * Copyright 2014 Peter Bernhardt, et. al.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/**
 * Copyright 2014 Peter Bernhardt, et. al.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
(function () {
    'use strict';

    var serviceId = 'questionnaireAnswerService';

    angular.module('FHIRStarter').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', questionnaireAnswerService]);

    function questionnaireAnswerService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localProfiles';
        var linksCacheKey = 'linksProfiles';
        var _patient;
        var $q = common.$q;

        var service = {
            addAnswer: addAnswer,
            getPatientContext: getPatientContext,
            getProfiles: getProfiles,
            getQuestions: getQuestions,
            init: init
        };

        return service;

        function addAnswer(resource) {
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + '/$qa-post';
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function getPatientContext() {
            return _patient;
        }

        function getProfiles() {
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + '/Profile?code=cc';
                    fhirClient.getResource(url)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function getQuestions(profileUrl) {
            var deferred = $q.defer();
                    fhirClient.getResource(profileUrl + '/$questionnaire')
                        .then(function (results) {
                            deferred.resolve(results);
                        },
                        function (outcome) {
                            deferred.reject(outcome);
                        });
            return deferred.promise;
        }

        function init(patient) {
            _patient = patient;
        }
    }
})();