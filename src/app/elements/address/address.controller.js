(function () {
    'use strict';

    var controllerId = 'address';

    function address(common, addressService) {
        /* jshint validthis:true */
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        function addToList(form, item) {
            if (form.$valid) {
                addressService.add(_.clone(item));
                vm.addresses = addressService.getAll();
                initAddress();
                form.$setPristine();
            }
        }

        vm.addToList = addToList;

        function getAddresses() {
            vm.addresses = addressService.getAll();
        }

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

        function getMode() {
            vm.mode = addressService.getMode();
            return vm.mode;
        }

        function initAddress() {
            if (vm.mode === 'single' && vm.addresses.length > 0) {
                vm.address = vm.addresses[0];
            }
            else {
                vm.address = {};
            }
            return vm.address;
        }

        function removeListItem(item) {
            addressService.remove(item);
            vm.addresses = addressService.getAll();
        }

        vm.removeListItem = removeListItem;

        function reset(form) {
            initAddress();
            form.$setPristine();
        }

        vm.reset = reset;

        function supportHome() {
            vm.showHome = addressService.supportHome();
            return vm.showHome;
        }

        function activate() {
            common.activateController([getAddresses(), getMode(), supportHome(), initAddress()], controllerId)
                .then(function () {
                    if (vm.addresses.length > 0 && vm.mode === 'single') {
                        vm.address = vm.addresses[0];
                    }
                });
        }

        vm.address = undefined;
        vm.addresses = [];
        vm.mode = 'multi';
        vm.searchText = '';
        vm.showHome = true;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'addressService', address]);

})();
