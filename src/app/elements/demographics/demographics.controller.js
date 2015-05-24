(function () {
    'use strict';

    var controllerId = 'demographics';

    function demographics(common, config, demographicsService, localValueSets) {
        /*jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([], controllerId).then(function () {
                initData();
            });
        }

        function loadGenders() {
            return vm.genders = localValueSets.administrativeGender();
        }

        vm.loadGenders = loadGenders;

        function loadLanguages() {
            return vm.languages = localValueSets.iso6391Languages();
        }

        function initData() {
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


        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'demographicsService', 'localValueSets',
        demographics]);

})();
