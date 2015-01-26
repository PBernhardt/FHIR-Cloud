(function () {
    'use strict';

    var serviceId = 'contactPointService';

    function contactPointService() {
        var contactPoints = [];
        var home = true;
        var mobile = true;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                contactPoints[index] = item;
            } else {
                contactPoints.push(item);
            }
        }

        function getAll() {
            return contactPoints;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = contactPoints.length; i < len; i++) {
                    if (contactPoints[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items, showHome, showMobile) {
            function mapToViewModel(items) {
                var modelView = [];
                var workFiltered = _.filter(items, {"use": "work"});
                var homeFiltered = _.filter(items, {"use": "home"});
                var tempFiltered = _.filter(items, {"use": "temp"});
                var oldFiltered = _.filter(items, {"use": "old"});  // TODO: add period filter
                var mobileFiltered = _.filter(items, {"use": "mobile"});
                var noUseFiltered = _.filter(items, {"use": undefined});

                function buildContactPoint(filteredArray, useName) {
                    var contactPoint;
                    if (filteredArray && filteredArray.length > 0) {
                        contactPoint = {"use": useName};
                        var phone = _.find(filteredArray, {"system": "phone"});
                        if (phone) {
                            contactPoint.phone = phone.value;
                        }
                        var fax = _.find(filteredArray, {"system": "fax"});
                        if (fax) {
                            contactPoint.fax = fax.value;
                        }
                        var email = _.find(filteredArray, {"system": "email"});
                        if (email) {
                            contactPoint.email = email.value;
                        }
                        var url = _.find(filteredArray, {"system": "url"});
                        if (url) {
                            contactPoint.url = url.value;
                        }
                    }
                    if (contactPoint) {
                        modelView.push(contactPoint);
                    }
                }

                // use first found item
                buildContactPoint(workFiltered, "work");
                buildContactPoint(homeFiltered, "home");
                buildContactPoint(tempFiltered, "temp");
                buildContactPoint(oldFiltered, "old");
                buildContactPoint(mobileFiltered, "mobile");
                buildContactPoint(noUseFiltered, undefined);

                return modelView;
            }

            home = showHome;
            mobile = showMobile;
            if (angular.isArray(items)) {
                contactPoints = mapToViewModel(items);
            } else {
                contactPoints = [];
            }
        }

        function mapFromViewModel() {
            function mapItem(item) {
                var mappedItems = [];
                var mappedItem = {};
                if (item) {
                    if (item.phone) {
                        mappedItem = {"system": "phone", "value": item.phone};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.fax) {
                        mappedItem = {"system": "fax", "value": item.fax};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.email) {
                        mappedItem = {"system": "email", "value": item.email};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.email) {
                        mappedItem = {"system": "url", "value": item.url};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                }
                return mappedItems;
            }

            var mappedContactPoints;
            if (contactPoints) {
                mappedContactPoints = [];
                for (var i = 0, len = contactPoints.length; i < len; i++) {
                    var mappedItems = mapItem(contactPoints[i]);
                    for (var j = 0, len2 = mappedItems.length; j < len2; j++) {
                        mappedContactPoints.push(mappedItems[j]);
                    }
                }
            }
            return mappedContactPoints;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            contactPoints.splice(index, 1);
        }

        function reset() {
            while (contactPoints.length > 0) {
                contactPoints.pop();
            }
        }

        function supportHome() {
            return home;
        }

        function supportMobile() {
            return mobile;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            supportHome: supportHome,
            supportMobile: supportMobile
        };
        return service;
    }

    angular.module('FHIRStarter').factory(serviceId, [contactPointService]);
   
})();
