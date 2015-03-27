(function () {
    'use strict';

    var controllerId = 'demographics';

    function demographics(common, config, demographicsService, localValueSets) {
        /*jshint validthis:true */
        var vm = this;
        var keyCodes = config.keyCodes;

        function activate() {
            common.activateController([], controllerId).then(function () {
                initData();
            });
        }

        function addLanguage($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.selectedLanguage = null;
            } else if ($event.keyCode === keyCodes.enter) {
                if (vm.selectedLanguage !== null) {
                    var coding = {"coding": [vm.selectedLanguage], "text": vm.selectedLanguage.display};
                    if (_.first(vm.demographics.language, coding).length === 0) {
                        vm.demographics.language.push(coding);
                    }
                    updateLanguage();
                }
                vm.selectedLanguage = null;
            }
        }

        function loadEthnicities() {
            return vm.ethnicities = localValueSets.ethnicity().concept;
        }
        vm.loadEthnicities = loadEthnicities;

        function loadGenders() {
            return vm.genders = localValueSets.administrativeGender();
        }

        vm.loadGenders = loadGenders;

        function loadLanguages() {
            return vm.languages = localValueSets.iso6391Languages();
        }

        vm.loadLanguages = loadLanguages;

        function loadMaritalStatuses() {
            return vm.maritalStatuses = localValueSets.maritalStatus();
        }

        vm.loadMaritalStatuses = loadMaritalStatuses;

        function loadReligions() {
            return vm.religions = localValueSets.religion().concept;
        }
        vm.loadReligions = loadReligions;

        function loadRaces() {
            return vm.races = localValueSets.race().concept;
        }
        vm.loadRaces = loadRaces;

        function initData() {
            vm.demographics.birthDate = demographicsService.getBirthDate();
            vm.demographics.birthOrder = demographicsService.getBirthOrder();
            vm.demographics.deceased = demographicsService.getDeceased();
            vm.demographics.deceasedDate = demographicsService.getDeceasedDate();
            vm.demographics.gender = demographicsService.getGender();
            vm.demographics.language = demographicsService.getLanguage();
            vm.demographics.maritalStatus = demographicsService.getMaritalStatus();
            vm.demographics.multipleBirth = demographicsService.getMultipleBirth();
            // Known extensions
            vm.demographics.race = null;
            vm.demographics.religion = null;
            vm.demographics.ethnicity = null;
            vm.demographics.mothersMaidenName = null;
            vm.demographics.placeOfBirth = null;
        }

        function removeLanguage(item) {
            _.remove(vm.demographics.language, function (removedItem) {
                return removedItem.$$hashKey === item.$$hashKey;
            });
            updateLanguage();
        }

        function updateBirthDate() {
            demographicsService.setBirthDate(vm.demographics.birthDate);
        }


        function updateBirthOrder() {
            demographicsService.setBirthOrder(vm.demographics.birthOrder);
        }


        function updateDeceased() {
            demographicsService.setDeceased(vm.demographics.deceased);
        }


        function updateDeceasedDate() {
            demographicsService.setDeceasedDate(vm.demographics.deceasedDate);
        }

        function updateGender() {
            demographicsService.setGender(vm.demographics.gender);
        }

        function updateLanguage() {
            demographicsService.setLanguage(vm.demographics.language);
        }


        function updateMaritalStatus() {
            demographicsService.setMaritalStatus(vm.demographics.maritalStatus);
        }

        function updateMultipleBirth() {
            demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        function updateRace() {
            //  demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        function updateReligion() {
            //  demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        function updateEthnicity() {
            //  demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        vm.addLanguage = addLanguage;
        vm.demographics = {
            "birthDate": null,
            "birthOrder": null,
            "deceased": false,
            "deceasedDate": null,
            "gender": null,
            "language": [],
            "maritalStatus": null,
            "multipleBirth": false
        };
        vm.genders = [];
        vm.languages = [];
        vm.maritalStatuses = [];
        vm.religions = [];
        vm.races = [];
        vm.ethnicities = [];
        vm.removeLanguage = removeLanguage;
        vm.selectedLanguage = null;
        vm.updateBirthDate = updateBirthDate;
        vm.updateBirthOrder = updateBirthOrder;
        vm.updateDeceased = updateDeceased;
        vm.updateDeceasedDate = updateDeceasedDate;
        vm.updateGender = updateGender;
        vm.updateLanguage = updateLanguage;
        vm.updateMaritalStatus = updateMaritalStatus;
        vm.updateMultipleBirth = updateMultipleBirth;
        vm.updateRace = updateRace;
        vm.updateReligion = updateReligion;
        vm.updateEthnicity = updateEthnicity;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'demographicsService', 'localValueSets', demographics]);

})();
