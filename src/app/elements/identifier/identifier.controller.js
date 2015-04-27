(function () {
    'use strict';

    var controllerId = 'identifier';

    function identifier(common, identifierService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([_getIdentifiers(), _getMode()], controllerId)
                .then(function () {
                    if (vm.identifiers.length > 0 && vm.mode === 'single') {
                        vm.identifier = vm.identifiers[0];
                    }
                    vm.identifierTypes = localValueSets.identifierType().concept;
                    vm.identifier.value = _generateIdentifier();
                    vm.identifier.use = "usual";
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                identifierService.add(_.clone(item));
                vm.identifiers = identifierService.getAll();
                vm.identifier = {};
                vm.identifier.value = _generateIdentifier();
                vm.identifier.use = "usual";
                form.$setPristine();
                form.$setUntouched();
            }
        }

        vm.addToList = addToList;

        function _generateIdentifier() {
            return common.generateUUID();
        }


        function _getIdentifiers() {
            vm.identifiers = identifierService.getAll();
        }

        function _getMode() {
            vm.mode = identifierService.getMode();
            return vm.mode;
        }

        function removeListItem(item) {
            identifierService.remove(item);
            vm.identifiers = identifierService.getAll();
        }

        vm.removeListItem = removeListItem;

        function reset(form) {
            vm.identifier = {"use": "usual"};
            form.$setPristine();
        }

        vm.reset = reset;

        vm.identifier = {};
        vm.identifiers = [];
        vm.identifierTypes = [];
        vm.mode = 'multi';

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'identifierService', 'localValueSets', identifier]);

})();
