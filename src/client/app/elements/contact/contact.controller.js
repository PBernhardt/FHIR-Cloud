(function () {
    'use strict';

    var controllerId = 'contact';

    function contact(common, contactService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getContacts(), getContactTypes()], controllerId).then(function () {
                // nothing yet
            });
        }

        function addToList(form, item) {
            if (form.$valid) {
                contactService.add(item);
                vm.contacts = contactService.getAll();
                vm.contact =  {};
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.contact = item;
        }

        function getContacts() {
            vm.contacts = contactService.getAll();
        }

        function getContactTypes() {
            vm.contactTypes = localValueSets.contactEntityType();
        }

        function removeListItem(item) {
            contactService.remove(item);
            vm.contacts = contactService.getAll();
        }

        function reset(form) {
            vm.contact = {};
            form.$setPristine();
        }
        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.contact = { purpose: { coding: []}};
        vm.contacts = [];
        vm.removeListItem = removeListItem;
        vm.reset = reset;

        activate();
    }
    angular.module('FHIRStarter').controller(controllerId, ['common', 'contactService', 'localValueSets', contact]);

})();
