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
            return vm.ethnicities = localValueSets.ethnicity();
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
            return vm.religions = localValueSets.religion();
        }

        vm.loadReligions = loadReligions;

        function loadRaces() {
            return vm.races = localValueSets.race();
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
            vm.demographics.race = demographicsService.getRace();
            vm.demographics.religion = demographicsService.getReligion();
            vm.demographics.ethnicity = demographicsService.getEthnicity();
            vm.demographics.mothersMaidenName = demographicsService.getMothersMaidenName();
            vm.demographics.placeOfBirth = demographicsService.getBirthPlace();

            loadMaritalStatuses();
            loadRaces();
            loadEthnicities();
            loadReligions();
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

        function updateMaritalStatus(maritalStatusCoding) {
            var codeableConcept = {
                "text": maritalStatusCoding.display,
                "coding": [{
                    "system": maritalStatusCoding.system,
                    "code": maritalStatusCoding.code,
                    "display": maritalStatusCoding.display
                }]
            };
            demographicsService.setMaritalStatus(codeableConcept);
        }

        function updateMultipleBirth() {
            demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        function updateRace(raceCoding) {
            var codeableConcept = {
                "text": raceCoding.display,
                "coding": [{
                    "system": vm.races.system,
                    "code": raceCoding.code,
                    "display": raceCoding.display
                }]
            };
            demographicsService.setRace(codeableConcept);
        }

        function updateReligion(religionCoding) {
            var codeableConcept = {
                "text": religionCoding.display,
                "coding": [{
                    "system": vm.religions.system,
                    "code": religionCoding.code,
                    "display": religionCoding.display
                }]
            };
            demographicsService.setReligion(codeableConcept);
        }

        function updateEthnicity(ethnicityCoding) {
            var codeableConcept = {
                "text": ethnicityCoding.display,
                "coding": [{
                    "system": vm.ethnicities.system,
                    "code": ethnicityCoding.code,
                    "display": ethnicityCoding.display
                }]
            };
            demographicsService.setEthnicity(codeableConcept);
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
        vm.maritalStatuses = [];
        vm.religions = [];
        vm.races = null;
        vm.ethnicityCoding = null;
        vm.raceCoding = null;
        vm.religionCoding = null;
        vm.raceCoding = null;
        vm.maritalStatusCoding = null;
        vm.ethnicities = [];
        vm.updateBirthDate = updateBirthDate;
        vm.updateBirthOrder = updateBirthOrder;
        vm.updateDeceased = updateDeceased;
        vm.updateDeceasedDate = updateDeceasedDate;
        vm.updateGender = updateGender;
        vm.updateMaritalStatus = updateMaritalStatus;
        vm.updateMultipleBirth = updateMultipleBirth;
        vm.updateRace = updateRace;
        vm.updateReligion = updateReligion;
        vm.updateEthnicity = updateEthnicity;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'demographicsService', 'localValueSets', demographics]);

})();
