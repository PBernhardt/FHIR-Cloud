(function () {
    'use strict';

    var controllerId = 'contactPoint';

    function contactPoint(common, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getContactPoints(), supportHome(), supportMobile()], controllerId).then(function () {
                vm.contactPoint = { "use": "work"};
            });
        }

        function addToList(form, item) {
            if (form.$valid) {
                contactPointService.add(item);
                vm.contactPoints = contactPointService.getAll();
                vm.contactPoint = {};
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.contactPoint = item;
        }

        function getContactPoints() {
            vm.contactPoints = contactPointService.getAll();
        }

        function removeListItem(item) {
            contactPointService.remove(item);
            vm.contactPoints = contactPointService.getAll();
        }

        function reset(form) {
            form.$setPristine();
            vm.contactPoint = { "use": "work"};
        }

        function supportHome() {
            vm.showHome = contactPointService.supportHome();
            return vm.showHome;
        }

        function supportMobile() {
            vm.showMobile = contactPointService.supportMobile();
            return vm.showMobile;
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.contactPoint = { purpose: { coding: []}};
        vm.contactPoints = [];
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.showHome = true;
        vm.showMobile = true;

        activate();
    }

    angular.module('FHIRStarter').controller(controllerId, ['common', 'contactPointService', contactPoint]);

})();
