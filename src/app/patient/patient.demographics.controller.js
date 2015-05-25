(function () {
    'use strict';

    var controllerId = 'patientDemographics';

    function patientDemographics(common, config, patientDemographicsService, localValueSets) {
        /*jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([_initData()], controllerId)
                .then(function () {
                })
        }

        function _loadValueSets() {
            vm.ethnicities = localValueSets.ethnicity();
            vm.genders = localValueSets.administrativeGender();
            vm.maritalStatuses = localValueSets.maritalStatus();
            vm.religions = localValueSets.religion();
            vm.races = localValueSets.race();
        }

        function _initData() {
            vm.patientDemographics.birthDate = patientDemographicsService.getBirthDate();
            vm.patientDemographics.birthOrder = patientDemographicsService.getBirthOrder();
            vm.patientDemographics.deceased = patientDemographicsService.getDeceased();
            vm.patientDemographics.deceasedDate = patientDemographicsService.getDeceasedDate();
            vm.patientDemographics.gender = patientDemographicsService.getGender();
            vm.patientDemographics.maritalStatus = patientDemographicsService.getMaritalStatus();
            vm.patientDemographics.multipleBirth = patientDemographicsService.getMultipleBirth();
            // Known extensions
            vm.patientDemographics.race = patientDemographicsService.getRace();
            vm.patientDemographics.religion = patientDemographicsService.getReligion();
            vm.patientDemographics.ethnicity = patientDemographicsService.getEthnicity();
            vm.patientDemographics.mothersMaidenName = patientDemographicsService.getMothersMaidenName();
            vm.patientDemographics.placeOfBirth = patientDemographicsService.getBirthPlace();

            _loadValueSets();
        }

        function updateBirthDate() {
            patientDemographicsService.setBirthDate(vm.patientDemographics.birthDate);
        }

        vm.updateBirthDate = updateBirthDate;

        function updateBirthOrder() {
            patientDemographicsService.setBirthOrder(vm.patientDemographics.birthOrder);
        }

        vm.updateBirthOrder = updateBirthOrder;

        function updateDeceased() {
            patientDemographicsService.setDeceased(vm.patientDemographics.deceased);
        }

        vm.updateDeceased = updateDeceased;

        function updateDeceasedDate() {
            patientDemographicsService.setDeceasedDate(vm.patientDemographics.deceasedDate);
        }

        vm.updateDeceasedDate = updateDeceasedDate;

        function updateGender() {
            patientDemographicsService.setGender(vm.patientDemographics.gender);
        }

        vm.updateGender = updateGender;

        function updateMaritalStatus() {
            if (vm.maritalStatusCoding !== undefined) {
                var codeableConcept = {
                    text: vm.maritalStatusCoding.display,
                    coding: [{
                        system: vm.maritalStatusCoding.system,
                        code: vm.maritalStatusCoding.code,
                        display: vm.maritalStatusCoding.display
                    }]
                };
                patientDemographicsService.setMaritalStatus(codeableConcept);
            }
        }

        vm.updateMaritalStatus = updateMaritalStatus;

        function updateMultipleBirth() {
            patientDemographicsService.setMultipleBirth(vm.patientDemographics.multipleBirth);
        }

        vm.updateMultipleBirth = updateMultipleBirth;

        function updateRace() {
            if (vm.raceCoding !== undefined) {
                var codeableConcept = {
                    text: vm.raceCoding.display,
                    coding: [{
                        system: vm.races.system,
                        code: vm.raceCoding.code,
                        display: vm.raceCoding.display
                    }]
                };
                patientDemographicsService.setRace(codeableConcept);
            }
        }

        vm.updateRace = updateRace;

        function updateReligion() {
            if (vm.religionCoding !== undefined) {
                var codeableConcept = {
                    text: vm.religionCoding .display,
                    coding: [{
                        system: vm.religions.system,
                        code: vm.religionCoding.code,
                        display: vm.religionCoding.display
                    }]
                };
                patientDemographicsService.setReligion(codeableConcept);
            }
        }

        vm.updateReligion = updateReligion;

        function updateEthnicity() {
            if (vm.ethnicityCoding !== undefined) {
                var codeableConcept = {
                    text: vm.ethnicityCoding.display,
                    coding: [{
                        system: vm.ethnicityCoding.system,
                        code: vm.ethnicityCoding.code,
                        display: vm.ethnicityCoding.display
                    }]
                };
                patientDemographicsService.setEthnicity(codeableConcept);
            }
        }

        vm.updateEthnicity = updateEthnicity;

        function updateBirthPlace() {
            patientDemographicsService.setBirthPlace(vm.patientDemographics.placeOfBirth.text);
        }
        vm.updateBirthPlace = updateBirthPlace;

        function updateMothersMaidenName() {
             patientDemographicsService.setMothersMaidenName(vm.patientDemographics.mothersMaidenName);
        }
        vm.updateMothersMaidenName = updateMothersMaidenName;

        vm.patientDemographics = {
            birthDate: null,
            birthOrder: null,
            deceased: false,
            deceasedDate: null,
            gender: null,
            maritalStatus: null,
            mothersMaidenName: null,
            multipleBirth: false,
            placeOfBirth: {text: null}
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

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'patientDemographicsService',
        'localValueSets', patientDemographics]);

})();
