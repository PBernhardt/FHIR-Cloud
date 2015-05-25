(function () {
    'use strict';

    var controllerId = 'patientContact';

    function patientContact(addressService, common, patientContactService, patientValueSets) {
        /* jshint validthis:true */
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logDebug = common.logger.getLogFn(controllerId, 'debug');
        var $q = common.$q;

        function _activate() {
            common.activateController([_getContacts(), _loadContactRelationships()], controllerId).then(function () {
                // nothing yet
            });
        }

        function toggle(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            else {
                list.push(item);
            }
        }

        vm.toggle = toggle;

        function exists(item, list) {
            return list.indexOf(item) > -1;
        }

        vm.exists = exists;

        function addToList(form, item) {
            if (form.$valid) {
                if (vm.googleAddress) {
                    vm.contact.address = addressService.parseGoogleAddress(vm.googleAddress);
                }
                patientContactService.add(item);
                vm.contacts = patientContactService.getAll();
                vm.googleAddress = '';
                vm.contact.name = undefined;
                vm.contact.gender = undefined;
                vm.contact.email = undefined;
                vm.contact.relationships.length = 0;
                // leaving phone and address as these are often re-used
                form.$setPristine();
            }
        }

        vm.addToList = addToList;

        function getLocation(input) {
            var deferred = $q.defer();
            addressService.searchGoogle(input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(error);
                    deferred.resolve();
                });
            return deferred.promise;
        }

        vm.getLocation = getLocation;

        function _getContacts() {
            vm.contacts = patientContactService.getAll();
        }

        function _loadContactRelationships() {
            vm.contactRelationships = patientValueSets.contactRelationship();
        }

        function removeListItem(form, item) {
            patientContactService.remove(item);
            vm.contacts = patientContactService.getAll();
            form.$setPristine();
        }

        vm.removeListItem = removeListItem;

        vm.contact = {relationships: []};
        vm.contactRelationships = {};
        vm.contacts = [];
        vm.addressSearchText = '';
        vm.googleAddress = null;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['addressService', 'common', 'patientContactService',
        'patientValueSets', patientContact]);

})();
