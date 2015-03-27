(function () {
    'use strict';

    var controllerId = 'humanName';

    function humanName(common, humanNameService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getHumanNames(), getMode(), initName()], controllerId)
                .then(function () {
                    if (vm.humanNames.length > 0 && vm.mode === 'single') {
                        vm.humanName = vm.humanNames[0];
                    } else {
                        vm.humanName = {"use": "usual"};
                    }
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                var name = {
                    "prefix": [],
                    "suffix": [],
                    "given": [],
                    "family": [],
                    "use": item.use,
                    "period": item.period
                }
                if (angular.isDefined(item.prefix)) {
                    name.prefix =  item.prefix.split(' ');
                }
                if (angular.isDefined(item.suffix)) {
                    name.suffix =  item.suffix.split(' ');
                }
                if (angular.isDefined(item.given)) {
                    name.given =  item.given.split(' ');
                }
                if (angular.isDefined(item.family)) {
                    name.family =  item.family.split(' ');
                }
                humanNameService.add(_.clone(name));
                vm.humanNames = humanNameService.getAll();
                initName();
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.humanName = item;
        }

        function getHumanNames() {
            vm.humanNames = humanNameService.getAll();
        }

        function getMode() {
            vm.mode = humanNameService.getMode();
            return vm.mode;
        }

        function initName() {
            if (vm.mode === 'single' && vm.humanNames.length > 0) {
                vm.humanName = vm.humanNames[0];
            } else {
                vm.humanName = {"use": "usual"};
            }
            return vm.humanName;
        }

        function removeListItem(item) {
            vm.humanNames = humanNameService.remove(item);
        }

        function reset(form) {
            initName();
            form.$setPristine();
        }

        function updateName() {
            if (vm.mode === 'single') {
                humanNameService.setSingle(vm.humanName);
            }
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.humanName = {};
        vm.humanNames = [];
        vm.mode = 'multi';
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.updateName = updateName;

        activate();
    }
    angular.module('FHIRCloud').controller(controllerId, ['common', 'humanNameService', humanName]);

})();
