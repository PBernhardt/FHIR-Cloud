(function () {
    'use strict';

    var controllerId = 'organizationContact';

    function organizationContact(addressService, common, organizationContactService, organizationValueSets) {
        /* jshint validthis:true */
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        function _activate() {
            common.activateController([_getContacts(), _getContactTypes()], controllerId).then(function () {
                // nothing yet
            });
        }

        function addToList(form, item) {
            if (form.$valid) {
                if (vm.googleAddress) {
                    vm.contact.address = addressService.parseGoogleAddress(vm.googleAddress);
                }
                organizationContactService.add(item);
                vm.contacts = organizationContactService.getAll();
                vm.contact = {};
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
            vm.contacts = organizationContactService.getAll();
        }

        function _getContactTypes() {
            vm.contactTypes = organizationValueSets.contactEntityType();
        }

        function removeListItem(form, item) {
            organizationContactService.remove(item);
            vm.contacts = organizationContactService.getAll();
            form.$setPristine();
        }

        vm.removeListItem = removeListItem;

        vm.contact = {purpose: {coding: []}};
        vm.contacts = [];
        vm.addressSearchText = '';
        vm.googleAddress = null;

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['addressService', 'common', 'organizationContactService',
        'organizationValueSets', organizationContact]);

})();
