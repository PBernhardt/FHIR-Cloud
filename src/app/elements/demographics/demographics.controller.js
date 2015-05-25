(function () {
    'use strict';

    var controllerId = 'demographics';

    function demographics(common, demographicsService, localValueSets) {
        /*jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([], controllerId).then(function () {
                _initData();
            });
        }

        function loadGenders() {
            return vm.genders = localValueSets.administrativeGender();
        }

        vm.loadGenders = loadGenders;

        function _initData() {
            vm.demographics.birthDate = demographicsService.getBirthDate();
            vm.demographics.gender = demographicsService.getGender();
        }

        function updateBirthDate() {
            demographicsService.setBirthDate(vm.demographics.birthDate);
        }

        vm.updateBirthDate = updateBirthDate;

        function updateGender() {
            demographicsService.setGender(vm.demographics.gender);
        }

        vm.updateGender = updateGender;

        vm.demographics = {
            "birthDate": null,
            "gender": null,
        };
        vm.genders = [];

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'demographicsService', 'localValueSets',
        demographics]);

})();
