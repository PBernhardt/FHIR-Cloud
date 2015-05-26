(function () {
    'use strict';

    var controllerId = 'patientCareProvider';

    function patientCareProvider($filter, common, fhirServers, organizationReferenceService, practitionerService,
                                 patientCareProviderService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function _activate() {
            common.activateController([_getActiveServer(), _initializeReferences()], controllerId)
                .then(function () {
                    if (common.isUndefinedOrNull(vm.managingOrganization) === false) {
                        _getAffiliatedDoctors(vm.managingOrganization);
                    }
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function _initializeReferences() {
            vm.selectedPractitioners = patientCareProviderService.getAll();
            vm.managingOrganization = patientCareProviderService.getManagingOrganization();
        }

        function selectedOrganizationChanged(org) {
            patientCareProviderService.setManagingOrganization(org);
            _getAffiliatedDoctors(org);
        }

        vm.selectedOrganizationChanged = selectedOrganizationChanged;

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function _getAffiliatedDoctors(org) {
            if (org && org.reference) {
                var deferred = $q.defer();
                var queryString = 'role=doctor&organization=' + org.reference;
                practitionerService.searchPractitioners(vm.activeServer.baseUrl, queryString)
                    .then(function (data) {
                        _processSearchResults(data);
                        deferred.resolve();
                    }, function (error) {
                        logError(common.unexpectedOutcome(error), error);
                        deferred.resolve();
                    });
                return deferred.promise;
            }
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            practitionerService.getPractitionersByLink(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                })
                .then(_processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function _processSearchResults(searchResults) {
            if (searchResults) {
                vm.practitioners = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function _setResourceReference(item) {
            var resourceReference = {display: undefined, reference: undefined};
            if (item.resourceType === "Organization") {
                resourceReference.display = item.name;
                resourceReference.reference = "Organization/" + item.id;
            } else if (item.resourceType === "Practitioner") {
                resourceReference.display = $filter('fullName')(item.name);
                resourceReference.reference = "Practitioner/" + item.id;
            }
            return resourceReference;
        }

        function toggle(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            else {
                var reference = _setResourceReference(item)
                list.push(reference);
                patientCareProviderService.add(item);
            }
        }

        vm.toggle = toggle;

        function exists(item, list) {
            return list.indexOf(item) > -1;
        }

        vm.exists = exists;

        function removeSelectedPractitioner(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            patientCareProviderService.init(list);
        }

        vm.removeSelectedPractitioner = removeSelectedPractitioner;

        vm.activeServer = null;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedOrganization = null;
        vm.selectedPractitioner = null;
        vm.selectedPractitioners = [];
        vm.managingOrganization = null;
        vm.isBusy = false;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', 'common', 'fhirServers', 'organizationReferenceService', 'practitionerService',
            'patientCareProviderService', patientCareProvider]);
})();