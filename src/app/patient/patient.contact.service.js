(function () {
    'use strict';

    var serviceId = 'patientContactService';

    function patientContactService(common, patientValueSets) {
        var contacts = [];

        function add(item) {
            if (item) {
                var index = getIndex(item.$$hashKey);
                if (index > -1) {
                    contacts[index] = item;
                } else {
                    var mappedItem = _mapFromViewModel(item);
                    contacts.push(mappedItem);
                }
            }
        }

        function getAll() {
            return contacts;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = contacts.length; i < len; i++) {
                    if (contacts[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                contacts = items;
            } else {
                contacts = [];
            }
        }

        function _mapFromViewModel(item) {
            var mappedItem = {telecom: [], relationship: []};
            if (item) {
                if (item.name) {
                    mappedItem.name = common.makeHumanName(item.name);
                }
                if (item.email) {
                    var email = {value: item.email, use: "work", system: "email"};
                    mappedItem.telecom.push(email);
                }
                if (item.phone) {
                    var phone = {value: item.phone, use: "work", system: "phone"};
                    mappedItem.telecom.push(phone);
                }
                if (item.relationships) {
                    var relationships = patientValueSets.contactRelationship();
                    _.forEach(item.relationships, function (r) {
                        r.system = relationships.system;
                        var mappedRelationship = { coding: [r], text: r.display };
                        mappedItem.relationship.push(mappedRelationship);
                    });
                }
                if (item.gender) {
                    mappedItem.gender = item.gender;
                }
                if (item.address) {
                    mappedItem.address = item.address;
                }
            }
            return mappedItem;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            contacts.splice(index, 1);
        }

        function reset() {
            while (contacts.length > 0) {
                contacts.pop();
            }
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init,
            reset: reset
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'patientValueSets',
        patientContactService]);

})();