(function () {
    'use strict';

    var serviceId = 'addressService';

    function addressService($http, common) {
        var $q = common.$q;
        var _mode = 'multi';
        var _filter = 'country:US';
        var addresses = [];
        var home = true;
        var _county = undefined;
        var _countyURL = "http://hl7.org/fhir/StructureDefinition/us-core-county";

        function add(item) {
            // Optimized for complete US addresses
            function _parseAddress(components, formattedAddress) {
                var address = {};
                address.line = [];
                var county;
                for (var i = 0; i < components.length; i++) {
                    var types = components[i].types;
                    if (angular.isDefined(types)) {
                        if (_.indexOf(types, 'administrative_area_level_2') !== -1) {
                            county = components[i].long_name;
                            _county = county;
                            break;
                        }
                    }
                }

                if (formattedAddress) {
                    var parts = formattedAddress.split(", ");
                    address.line.push(parts[0]);
                    address.city = parts[1];
                    var stateAndZip = parts[2].split(" ");
                    address.state = stateAndZip[0];
                    address.postalCode = stateAndZip[1];
                    address.country = parts[3];
                }
                address.$$hashKey = common.randomHash();
                address.address = address;
                address.county = county;
                return address;
            }

            var index = _.indexOf(addresses, item);

            if (index > -1) {
                addresses[index] = _parseAddress(item.address_components, item.formatted_address);
            } else {
                addresses.push(_parseAddress(item.address_components, item.formatted_address));
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
                    var item = {"address": items[i]};
                    if (angular.isObject(item.address)) {
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
                var mappedItem = {"line": []};
                if (item) {
                    if (item.use) {
                        mappedItem.use = item.use;
                    }
                    if (item.text) {
                        mappedItem.text = item.text;
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

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', addressService]);
})();