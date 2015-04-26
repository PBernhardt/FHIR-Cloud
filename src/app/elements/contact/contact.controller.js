(function () {
    'use strict';

    var controllerId = 'contact';

    function contact(addressService, common, contactService, localValueSets) {
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
                contactService.add(item);
                vm.contacts = contactService.getAll();
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
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getLocation = getLocation;

        function _getContacts() {
            vm.contacts = contactService.getAll();
        }

        function _getContactTypes() {
            vm.contactTypes = localValueSets.contactEntityType();
        }

        function removeListItem(item) {
            contactService.remove(item);
            vm.contacts = contactService.getAll();
        }

        vm.removeListItem = removeListItem;

        vm.contact = {purpose: {coding: []}};
        vm.contacts = [];
        vm.addressSearchText = '';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['addressService', 'common', 'contactService', 'localValueSets', contact]);

})();
