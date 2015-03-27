(function () {
    'use strict';

    var serviceId = 'humanNameService';

    function humanNameService($filter) {
        var humanNames = [];
        var _mode = 'multi';

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                humanNames[index] = item;
            } else {
                item.text = $filter('fullName')(item);
                humanNames.push(item);
            }
        }

        function getAll() {
            return _.compact(humanNames);
        }

        function getFullName() {
            var fullName = 'Unspecified Name';
            if (humanNames.length > 0) {
                fullName = humanNames[0].given + ' ' + humanNames[0].family;
            }
            return fullName;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = humanNames.length; i < len; i++) {
                    if (humanNames[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function init(items, mode) {
            _mode = mode ? mode : 'multi';
            if (angular.isArray(items)) {
                humanNames = [];
                _.forEach(items, function (item) {
                    if ((angular.isUndefined(item) || item === null) === false) {
                        var humanName = {};
                        if (angular.isArray(item.given)) {
                            humanName.given = item.given;
                        }
                        if (angular.isArray(item.family)) {
                            humanName.family = item.family;
                        }
                        if (angular.isArray(item.prefix)) {
                            humanName.prefix = item.prefix;
                        }
                        if (angular.isArray(item.suffix)) {
                            humanName.suffix = item.suffix;
                        }
                        humanName.text = item.text || $filter('fullName')(item);
                        humanName.period = item.period;
                        humanName.use = item.use;
                        humanNames.push(humanName);
                    }
                });
            } else {
                humanNames = [];
            }
            return humanNames;
        }

        function mapFromViewModel() {
            var model = [];
            _.forEach(humanNames, function (item) {
                var mappedItem = {};
                mappedItem.given = item.given;
                mappedItem.family = item.family;
                mappedItem.prefix = item.prefix;
                mappedItem.suffix = item.suffix;
                mappedItem.text = item.text;
                mappedItem.period = item.period;
                mappedItem.use = item.use;
                model.push(mappedItem);
            });
            return model;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            humanNames.splice(index, 1);
            return humanNames;
        }

        function reset() {
            while (humanNames.length > 0) {
                humanNames.pop();
            }
        }

        function setSingle(item) {
            reset();
            add(item);
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getFullName: getFullName,
            getMode: getMode,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            setSingle: setSingle
        };

        return service;

    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', humanNameService]);

})();