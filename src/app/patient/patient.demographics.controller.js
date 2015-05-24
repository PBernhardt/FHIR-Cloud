(function () {
    'use strict';

    var controllerId = 'patientDemographics';

    function patientDemographics(common, config, patientDemographicsService, localValueSets) {
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
                    if (_.first(vm.patientDemographics.language, coding).length === 0) {
                        vm.patientDemographics.language.push(coding);
                    }
                    //  updateLanguage();
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
            vm.patientDemographics.birthDate = patientDemographicsService.getBirthDate();
            vm.patientDemographics.birthOrder = patientDemographicsService.getBirthOrder();
            vm.patientDemographics.deceased = patientDemographicsService.getDeceased();
            vm.patientDemographics.deceasedDate = patientDemographicsService.getDeceasedDate();
            vm.patientDemographics.gender = patientDemographicsService.getGender();
            vm.patientDemographics.language = patientDemographicsService.getLanguage();
            vm.patientDemographics.maritalStatus = patientDemographicsService.getMaritalStatus();
            vm.patientDemographics.multipleBirth = patientDemographicsService.getMultipleBirth();
            // Known extensions
            vm.patientDemographics.race = patientDemographicsService.getRace();
            vm.patientDemographics.religion = patientDemographicsService.getReligion();
            vm.patientDemographics.ethnicity = patientDemographicsService.getEthnicity();
            vm.patientDemographics.mothersMaidenName = patientDemographicsService.getMothersMaidenName();
            vm.patientDemographics.placeOfBirth = patientDemographicsService.getBirthPlace();

            loadMaritalStatuses();
            loadRaces();
            loadEthnicities();
            loadReligions();
        }

        function updateBirthDate() {
            patientDemographicsService.setBirthDate(vm.patientDemographics.birthDate);
        }


        function updateBirthOrder() {
            patientDemographicsService.setBirthOrder(vm.patientDemographics.birthOrder);
        }


        function updateDeceased() {
            patientDemographicsService.setDeceased(vm.patientDemographics.deceased);
        }


        function updateDeceasedDate() {
            patientDemographicsService.setDeceasedDate(vm.patientDemographics.deceasedDate);
        }

        function updateGender() {
            patientDemographicsService.setGender(vm.patientDemographics.gender);
        }

        function updateMaritalStatus(maritalStatusCoding) {
            if (maritalStatusCoding !== undefined) {
                var codeableConcept = {
                    "text": maritalStatusCoding.display,
                    "coding": [{
                        "system": maritalStatusCoding.system,
                        "code": maritalStatusCoding.code,
                        "display": maritalStatusCoding.display
                    }]
                };
                patientDemographicsService.setMaritalStatus(codeableConcept);
            }
        }

        function updateMultipleBirth() {
            patientDemographicsService.setMultipleBirth(vm.patientDemographics.multipleBirth);
        }

        function updateRace(raceCoding) {
            if (raceCoding !== undefined) {
                var codeableConcept = {
                    "text": raceCoding.display,
                    "coding": [{
                        "system": vm.races.system,
                        "code": raceCoding.code,
                        "display": raceCoding.display
                    }]
                };
                patientDemographicsService.setRace(codeableConcept);
            }
        }

        function updateReligion(religionCoding) {
            if (religionCoding !== undefined) {
                var codeableConcept = {
                    "text": religionCoding.display,
                    "coding": [{
                        "system": vm.religions.system,
                        "code": religionCoding.code,
                        "display": religionCoding.display
                    }]
                };
                patientDemographicsService.setReligion(codeableConcept);
            }
        }

        function updateEthnicity(ethnicityCoding) {
            if (ethnicityCoding !== undefined) {
                var codeableConcept = {
                    "text": ethnicityCoding.display,
                    "coding": [{
                        "system": ethnicityCoding.system,
                        "code": ethnicityCoding.code,
                        "display": ethnicityCoding.display
                    }]
                };
                patientDemographicsService.setEthnicity(codeableConcept);
            }
        }

        vm.addLanguage = addLanguage;
        vm.patientDemographics = {
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

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'patientDemographicsService', 'localValueSets', patientDemographics]);

})();
