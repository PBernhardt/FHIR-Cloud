(function () {
    'use strict';

    var serviceId = 'addressService';

    function addressService($filter, $http, common) {
        var $q = common.$q;
        var _mode = 'multi';
        var _filter = 'country:US';
        var addresses = [];
        var home = true;
        var _county = undefined;
        var _countyURL = "http://hl7.org/fhir/StructureDefinition/us-core-county";

        function add(googleAddress) {
            function _parseAddress(item) {
                var address = {};
                var streetNumber;
                var route;
                var streetAddress;
                var county;
                for (var i = 0; i < item.address_components.length; i++) {
                    var types = item.address_components[i].types;
                    if (angular.isDefined(types)) {
                        if (_.indexOf(types, 'administrative_area_level_2') !== -1) {
                            county = item.address_components[i].long_name;
                            _county = county;
                            continue;
                        }
                        if (_.indexOf(types, 'country') !== -1) {
                            address.country = item.address_components[i].short_name;
                            continue;
                        }
                        if (_.indexOf(types, 'administrative_area_level_1') !== -1) {
                            address.state = item.address_components[i].short_name;
                            continue;
                        }

                        if (_.indexOf(types, 'locality') !== -1) {
                            address.city = item.address_components[i].long_name;
                            continue;
                        }
                        if (_.indexOf(types, 'postal_code') !== -1) {
                            address.postalCode = item.address_components[i].long_name;
                            continue;
                        }
                        if (_.indexOf(types, 'street_number') !== -1) {
                            streetNumber = item.address_components[i].long_name;
                            continue;
                        }
                        if (_.indexOf(types, 'route') !== -1) {
                            route = item.address_components[i].long_name;
                            continue;
                        }
                        if (_.indexOf(types, 'street_address') !== -1) {
                            streetAddress = item.address_components[i].long_name;
                        }
                    }
                }

                address.line = [];
                /*
                The street address will either be concat of street_number and route
                or just street_address (Google is fickle this way)
                 */
                if (angular.isDefined(streetAddress)) {
                    address.line.push(streetAddress);
                } else if(angular.isDefined(route)) {
                    streetAddress = route;
                    if (angular.isDefined(streetNumber)) {
                        streetAddress = streetNumber + ' ' + route;
                    }
                    address.line.push(streetAddress);
                }
                var result = {};
                result.$$hashKey = common.randomHash();
                result.address = address;
                result.text = item.formatted_address;
                result.county = county;
                result.use = item.use ? item.use : null;

                var period = undefined;
                if (angular.isDefined(item.period)) {
                    period = {};
                    if (angular.isDefined(item.period.start)) {
                        period.start = $filter('date')(item.period.start, 'yyyy-MM-dd');
                    }
                    if (angular.isDefined(item.period.end)) {
                        period.end = $filter('date')(item.period.end, 'yyyy-MM-dd');
                    }
                }
                result.period = period;

                return result;
            }

            var index = _.indexOf(addresses, googleAddress);

            if (index > -1) {
                addresses[index] = _parseAddress(googleAddress);
            } else {
                addresses.push(_parseAddress(googleAddress));
            }
        }

        function getAll() {
            return _.compact(addresses);
        }

        function getMode() {
            return _mode;
        }

        function init(items, supportHome, mode, filter) {
            _mode = mode ? mode : 'multi';
            home = supportHome;
            if (filter !== undefined) {
                _filter = filter;
            }
            addresses = [];
            if (items && angular.isArray(items)) {
                for (var i = 0, len = items.length; i < len; i++) {
                    var item = {address: items[i]};
                    if (angular.isObject(item.address)) {
                        item.period = item.address.period;
                        item.use = item.address.use;
                        item.text =
                            (angular.isArray(item.address.line) ? item.address.line.join(' ') + ', ' : '') + (item.address.city ? (item.address.city + ', ') : '') + (item.address.state ? (item.address.state + ' ') : '') + (item.address.postalCode ? (item.address.postalCode + ', ') : '') + (item.address.country ? (item.address.country) : '');
                        addresses.push(item);
                    }
                }
            }
        }

        function initializeKnownExtensions(extensions) {
            if (common.isUndefinedOrNull(extensions) === false) {
                for (var i = 0, len = extensions.length; i < len; i++) {
                    var ext = extensions[i];
                    if (ext.url) {
                        switch (ext.url) {
                            case _countyURL:
                                _county = ext.valueString;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }

        function writeKnownExtensions() {
            var extension = [];
            if (common.isUndefinedOrNull(_county) === false) {
                extension.push(
                    {
                        url: _countyURL,
                        valueString: _county
                    });
            }
            return extension;
        }

        function mapFromViewModel() {
            function mapItem(item) {
                var mappedItem = {line: []};
                if (item) {
                    if (item.use) {
                        mappedItem.use = item.use;
                    }
                    if (item.text) {
                        mappedItem.text = item.text;
                    } else {
                        mappedItem.text = ($filter)('singleLineAddress')(item.address);
                    }
                    if (item.period) {
                        mappedItem.period = item.period;
                    }
                    if (item.address) {
                        mappedItem.line = item.address.line;
                        mappedItem.city = item.address.city;
                        mappedItem.state = item.address.state;
                        mappedItem.postalCode = item.address.postalCode;
                        mappedItem.country = item.address.country;
                    }
                }
                return mappedItem;
            }

            var mappedAddresses;
            if (addresses) {
                mappedAddresses = [];
                for (var i = 0, len = addresses.length; i < len; i++) {
                    var mappedItem = mapItem(addresses[i]);
                    mappedAddresses.push(mappedItem);
                }
            }
            return mappedAddresses;
        }

        function remove(item) {
            _.remove(addresses, function (n) {
                return item.$$hashKey === n.$$hashKey;
            });
        }

        function reset() {
            while (addresses.length > 0) {
                addresses.pop();
            }
        }

        /*
        Uses v3 of the Google geocode API
        documentation: https://developers.google.com/maps/documentation/geocoding/#GeocodingRequests
         */
        function searchGoogle(input) {
            var deferred = $q.defer();
            var req = {
                method: 'get',
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                params: {
                    key: 'AIzaSyCtbVf7g-kQmMQjF_kAfGawAZabKcq4rdo',
                    address: input,
                    components: _filter
                },
                headers: {'Authorization': undefined}
            };
            $http(req)
                .success(function (data) {
                    /*                  var addresses = [];
                     if (data.results) {
                     angular.forEach(data.results,
                     function (item) {
                     addresses.push(item);
                     });
                     }*/
                    deferred.resolve(data.results);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function setSingle(item) {
            reset();
            add(item);
        }

        function supportHome() {
            return home;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getMode: getMode,
            init: init,
            initializeKnownExtensions: initializeKnownExtensions,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            searchGoogle: searchGoogle,
            setSingle: setSingle,
            supportHome: supportHome,
            writeKnownExtensions: writeKnownExtensions
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', 'common', addressService]);
})();