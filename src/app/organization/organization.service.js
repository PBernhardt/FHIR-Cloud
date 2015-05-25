(function () {
    'use strict';

    var serviceId = 'organizationService';

    function organizationService(common, dataCache, fhirClient, fhirServers, store) {
        var dataCacheKey = 'localOrganizations';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function getOrganizationContext() {
            return store.get('organization');
        }

        function setOrganizationContext(value) {
            store.set('organization', value);
        }

        function addOrganization(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Organization";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedOrganization(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedOrganizations = searchResults.entry;
                for (var i = 0, len = cachedOrganizations.length; i < len; i++) {
                    if (cachedOrganizations[i].$$hashKey === hashKey) {
                        cachedOrganizations.splice(i, 1);
                        searchResults.entry = cachedOrganizations;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Organization not found in cache: ' + hashKey, null, noToast);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteOrganization(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteOrganization(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedOrganization(hashKey) {
            function getOrganization(searchResults) {
                var cachedOrganization;
                var cachedOrganizations = searchResults.entry;
                cachedOrganization = _.find(cachedOrganizations, {'$$hashKey': hashKey});
                if (cachedOrganization) {
                    deferred.resolve(cachedOrganization);
                } else {
                    deferred.reject('Organization not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getOrganization,
                function () {
                    deferred.reject('Organization search results not found in cache.');
                });
            return deferred.promise;
        }

        function getOrganization(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getAffiliatedOrganizations(baseUrl, parentId) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Organization?partof=Organization/' + parentId + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getOrganizationReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Organization?name=' + input + '&_count=10')
                .then(function (results) {
                    var organizations = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Organization') {
                                organizations.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/Organization/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(organizations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getOrganizations(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Organization?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchOrganizations(baseUrl, filter) {
            var deferred = $q.defer();

            if (angular.isUndefined(filter)) {
                deferred.reject('Invalid search input');
            }

            fhirClient.getResource(baseUrl + '/Organization?' + filter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getOrganizationsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "organizations": []};
                    var organizations = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Organization') {
                                    organizations.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    searchResults.organizations = organizations;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewOrganization() {
            var data = {};
            data.resource = {
                resourceType: "Organization",
                identifier: [],
                type: {coding: []},
                telecom: [],
                contact: [],
                address: [],
                partOf: null,
                location: [],
                active: true,
                extension: [],
            };
            return data;
        }

        function updateOrganization(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
            if (resource.extension.length === 0) {
                resource.extension = null;
            }
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addOrganization: addOrganization,
            clearCache: clearCache,
            deleteCachedOrganization: deleteCachedOrganization,
            deleteOrganization: deleteOrganization,
            getCachedOrganization: getCachedOrganization,
            getCachedSearchResults: getCachedSearchResults,
            getAffiliatedOrganizations: getAffiliatedOrganizations,
            getOrganization: getOrganization,
            getOrganizations: getOrganizations,
            getOrganizationsByLink: getOrganizationsByLink,
            getOrganizationReference: getOrganizationReference,
            initializeNewOrganization: initializeNewOrganization,
            searchOrganizations: searchOrganizations,
            getOrganizationContext: getOrganizationContext,
            setOrganizationContext:setOrganizationContext,
            updateOrganization: updateOrganization
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', 'store', organizationService]);

})();