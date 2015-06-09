(function () {
    'use strict';

    var serviceId = 'communicationService';

    function communicationService() {
        var communications = [];
        var _includePreferred = true;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                communications[index] = item;
            } else {
                communications.push(item);
            }
        }

        /*
        Kinda fugly to accommodate difference in the language is structured
        in patient and practitioner (where patient includes a "preferred property"
         */
        function getAll() {
            var compacted = _.compact(communications);
            if (_includePreferred) {
                return compacted;
            } else {
                var languages = [];
                _.forEach(compacted, function (item) {
                    languages.push(item.language);
                });
                return _.compact(languages);
            }
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = communications.length; i < len; i++) {
                    if (communications[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items, includePreferred) {
            _includePreferred = includePreferred;
            if (angular.isArray(items)) {
                communications = items;
            } else if (angular.isObject(items)) {
                communications = [];
                communications.push(items);
            }
            return communications;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            communications.splice(index, 1);
        }

        function includePreferred() {
            return _includePreferred;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            includePreferred: includePreferred,
            init: init
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [communicationService]);

})();