(function () {
    'use strict';

    var serviceId = 'demographicsService';

    function demographicsService($filter) {
        var _birthDate = null;
        var _birthOrder = null;
        var _deceased = false;
        var _deceasedDate = null;
        var _language = [];
        var _multipleBirth = false;
        var _gender = null;
        var _maritalStatus = undefined;
        var _race = undefined;
        var _religion = undefined;
        var _ethnicity = undefined;
        var _birthPlace = undefined;
        var _mothersMaidenName = undefined;

        function getRace() {
            return _race;
        }

        function getReligion() {
            return _religion;
        }

        function getEthnicity() {
            return _ethnicity;
        }

        function getBirthPlace() {
            return _birthPlace;
        }

        function getMothersMaidenName() {
            return _mothersMaidenName;
        }

        function getBirthDate() {
            return _birthDate;
        }

        function getBirthOrder() {
            return _birthOrder;
        }

        function getDeceased() {
            return _deceased;
        }

        function getDeceasedDate() {
            return _deceasedDate;
        }

        function getGender() {
            return _gender;
        }

        function getLanguage() {
            return _language;
        }

        function getMaritalStatus() {
            return _maritalStatus;
        }

        function getMultipleBirth() {
            return _multipleBirth;
        }

        function init(gender, maritalStatus, language) {
            _gender = undefined;
            _maritalStatus = undefined;
            _language = undefined;
            if (gender) {
                _gender = gender;
            }
            if (maritalStatus) {
                _maritalStatus = maritalStatus;
            }
            if (language) {
                _language = language;
            }
        }

        function initBirth(multipleBirth, birthOrder) {
            _birthOrder = undefined;
            _multipleBirth = undefined;
            if (birthOrder) {
                _birthOrder = birthOrder;
                _multipleBirth = true;
            } else {
                _multipleBirth = multipleBirth;
            }
        }

        function initDeath(deceased, dateOfDeath) {
            _deceased = undefined;
            if (dateOfDeath) {
                _deceasedDate = dateOfDeath;
                _deceased = true;
            } else {
                _deceased = deceased;
            }
        }

        function initializeKnownExtensions(extensions) {
            _race = undefined;
            _mothersMaidenName = undefined;
            _religion = undefined;
            _birthPlace = undefined;
            _ethnicity = undefined;
            if (extensions) {
                for (var i = 0, len = extensions.length; i < len; i++) {
                    var ext = extensions[i];
                    if (ext.url) {
                        switch (ext.url) {
                            case "http://hl7.org/fhir/StructureDefinition/us-core-race":
                                _race = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/us-core-religion":
                                _religion = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity":
                                _ethnicity = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName":
                                _mothersMaidenName = ext.valueString;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/birthPlace":
                                _birthPlace = ext.valueAddress;
                                _birthPlace.text = $filter('singleLineAddress')(ext.valueAddress);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }

        function setRace(value) {
            _race = value;
        }

        function setReligion(value) {
            _religion = value;
        }

        function setEthnicity(value) {
            _ethnicity = value;
        }

        function setBirthPlace(value) {
            _birthPlace = value;
        }

        function setMothersMaidenName(value) {
            _mothersMaidenName = value;
        }

        function setBirthDate(value) {
            _birthDate = new Date(value);
        }

        function setBirthOrder(value) {
            _birthOrder = value;
        }

        function setDeceased(value) {
            _deceased = value;
            if (_deceased === false) {
                _deceasedDate = null;
            }
        }

        function setDeceasedDate(value) {
            _deceasedDate = value;
        }

        // only 1 item in array permitted
        function setGender(value) {
            _gender = value;
        }

        function setLanguage(value) {
            _language = value;
        }

        // only 1 item in array permitted
        function setMaritalStatus(value) {
            _maritalStatus.coding = [];
            if (value) {
                if (angular.isObject(value)) {
                    _maritalStatus.coding.push(value);
                } else {
                    _maritalStatus.coding.push(JSON.parse(value));
                }
            }
        }

        function setMultipleBirth(value) {
            _multipleBirth = value;
            if (_multipleBirth === false) {
                _birthOrder = null;
            }
        }

        var service = {
            getBirthDate: getBirthDate,
            getBirthOrder: getBirthOrder,
            getDeceased: getDeceased,
            getDeceasedDate: getDeceasedDate,
            getGender: getGender,
            getLanguage: getLanguage,
            getMaritalStatus: getMaritalStatus,
            getMultipleBirth: getMultipleBirth,
            init: init,
            initBirth: initBirth,
            initDeath: initDeath,
            setBirthDate: setBirthDate,
            setBirthOrder: setBirthOrder,
            setDeceased: setDeceased,
            setDeceasedDate: setDeceasedDate,
            setGender: setGender,
            setLanguage: setLanguage,
            setMaritalStatus: setMaritalStatus,
            setMultipleBirth: setMultipleBirth,
            getRace: getRace,
            setRace: setRace,
            getEthnicity: getEthnicity,
            setEthnicity: setEthnicity,
            getReligion: getReligion,
            setReligion: setReligion,
            getMothersMaidenName: getMothersMaidenName,
            setMothersMaidenName: setMothersMaidenName,
            getBirthPlace: getBirthPlace,
            setBirthPlace: setBirthPlace,
            initializeKnownExtensions: initializeKnownExtensions
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', demographicsService]);

})();