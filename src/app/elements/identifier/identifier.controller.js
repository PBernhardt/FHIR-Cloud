(function () {
    'use strict';

    var controllerId = 'identifier';

    function identifier(common, identifierService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getIdentifiers(), getMode()], controllerId)
                .then(function () {
                    if (vm.identifiers.length > 0 && vm.mode === 'single') {
                        vm.identifier = vm.identifiers[0];
                    }
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                identifierService.add(_.clone(item));
                vm.identifiers = identifierService.getAll();
                vm.identifier = {};
                form.$setPristine();
                form.$setUntouched();
            }
        }

        function editListItem(item) {
            vm.identifier = item;
        }

        function generateIdentifier() {
            return common.generateUUID();
        }

        function getIdentifiers() {
            vm.identifiers = identifierService.getAll();
        }

        function getMode() {
            vm.mode = identifierService.getMode();
            return vm.mode;
        }

        function removeListItem(item) {
            identifierService.remove(item);
            vm.identifiers = identifierService.getAll();
        }

        function reset(form) {
            vm.identifier = { "use": "usual"};
            form.$setPristine();
        }

        function updateIdentifier() {
            identifierService.setSingle(_.clone(vm.identifier));
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.genId = generateIdentifier;
        vm.identifier = {};
        vm.identifiers = [];
        vm.mode = 'multi';
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.updateIdentifier = updateIdentifier;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'identifierService', identifier]);

})();
