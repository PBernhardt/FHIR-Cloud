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

    var controllerId = 'qualification';

    angular.module('FHIRStarter').controller(controllerId, ['$scope', 'common', 'fhirServers', 'organizationService', 'qualificationService', 'valuesetService', qualification]);

    function qualification($scope, common, fhirServers, organizationService, qualificationService, valuesetService) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.getOrganizationReference = getOrganizationReference;
        vm.loadingOrganizations = false;
        vm.qualification = null;
        vm.qualifications = [];
        vm.removeListItem = removeListItem;
        vm.reset = reset;

        activate();

        function activate() {
            common.activateController([getQualifications(), getActiveServer()], controllerId)
                .then(function () {
                    getQualificationCodes();
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                if (item.code == false) {
                    logError("Occupation is required");
                } else {
                    var coding = { "coding": [ item.code ], "text": item.code.display };
                    item.code = coding;
                    qualificationService.add(item);
                    vm.qualifications = qualificationService.getAll();
                    vm.qualification = null;
                    form.$setPristine();
                }
            }
        }

        function editListItem(item) {
            vm.qualification = item;
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    return vm.activeServer = server;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            vm.loadingOrganizations = true;
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingOrganizations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(error);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getQualificationCodes() {
            valuesetService.getExpansion( "http://hl7.org/fhir/vs/anzsco-occupations")
                .then(function (expansions) {
                    return vm.occupationCodes = expansions;
                }, function (error) {
                    logError(error);
                });
        }

        function getQualifications() {
            vm.qualifications = qualificationService.getAll();
        }

        function removeListItem(item) {
            qualificationService.remove(item);
            vm.qualifications = qualificationService.getAll();
        }

        function reset(form) {
            vm.qualification = null;
            form.$setPristine();
        }
    }
})();
