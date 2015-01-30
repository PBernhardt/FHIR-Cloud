(function () {
    'use strict';

    var controllerId = 'address';

    function address(common, config, addressService) {
        /* jshint validthis:true */
        var vm = this;
        var keyCodes = config.keyCodes;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        function addToList(form, item) {
            if (form.$valid) {
                addressService.add(item);
                vm.addresses = addressService.getAll();
                initAddress();
                form.$setPristine();
            }
        }

        function capture($event, form, item) {
            if (form.$valid) {
                if ($event.keyCode === keyCodes.esc) {
                    initAddress();
                } else if ($event.keyCode === keyCodes.enter) {
                    if (vm.mode === 'single') {
                        addressService.add(item);
                    } else {
                        addToList(form, item);
                    }
                }
            }
        }

        function editListItem(item) {
            vm.address = item;
        }

        vm.editListItem = editListItem;

        function getAddresses() {
            vm.addresses = addressService.getAll();
        }

        function getLocation(input) {
            var deferred = $q.defer();
            vm.loadingLocations = true;
            addressService.searchGoogle(input)
                .then(function (data) {
                    vm.loadingLocations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingLocations = false;
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

            } else {
                vm.address = {"use": "work"};
            }
            return vm.address;
        }

        function removeListItem(item) {
            addressService.remove(item);
            vm.addresses = addressService.getAll();
        }


        function reset(form) {
            initAddress();
            form.$setPristine();
        }


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

        vm.address = {};
        vm.addresses = [];
        vm.addToList = addToList;
        vm.capture = capture;
        vm.loadingLocations = false;
        vm.mode = 'multi';
        vm.showHome = true;
        vm.reset = reset;
        vm.removeListItem = removeListItem;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'addressService', address]);

})();
