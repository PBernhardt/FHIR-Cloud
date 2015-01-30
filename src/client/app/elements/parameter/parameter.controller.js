(function () {
    'use strict';

    var controllerId = 'parameter';

    function parameter(common, parameterService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getParameters(), getMode()], controllerId)
                .then(function () {
                    if (vm.parameters.length > 0 && vm.mode === 'single') {
                        vm.parameter = vm.parameters[0];
                    }
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                parameterService.add(item);
                vm.parameters = parameterService.getAll();
                vm.parameter = {};
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.parameter = item;
        }

        function generateParameter() {
            return common.generateUUID();
        }

        function getParameters() {
            vm.parameters = parameterService.getAll();
        }

        function getMode() {
            vm.mode = parameterService.getMode();
            return vm.mode;
        }

        function removeListItem(item) {
            parameterService.remove(item);
            vm.parameters = parameterService.getAll();
        }

        function reset(form) {
            vm.parameter = { "use": "usual"};
            form.$setPristine();
        }

        function updateParameter() {
            parameterService.setSingle(vm.parameter);
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.genId = generateParameter;
        vm.parameter = {};
        vm.parameters = [];
        vm.mode = 'multi';
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.updateParameter = updateParameter;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'parameterService', parameter]);

})();
