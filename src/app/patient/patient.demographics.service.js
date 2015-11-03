(function () {
    'use strict';

    var serviceId = 'patientDemographicsService';

    function patientDemographicsService($filter, common) {
        var _birthDate = null;
        var _birthOrder = null;
        var _deceased = false;
        var _deceasedDate = null;
        var _multipleBirth = false;
        var _gender = null;
        var _maritalStatus = undefined;
        var _race = undefined;
        var _religion = undefined;
        var _ethnicity = undefined;
        var _birthPlace = undefined;
        var _mothersMaidenName = undefined;

        function getRace() {
            if (_race !== undefined) {
                _race.text = ($filter)('codeableConcept')(_race);
            }
            return _race;
        }

        function getReligion() {
            if (_religion !== undefined) {
                _religion.text = ($filter)('codeableConcept')(_religion);
            }
            return _religion;
        }

        function getEthnicity() {
            if (_ethnicity !== undefined) {
                _ethnicity.text = ($filter)('codeableConcept')(_ethnicity);
            }
            return _ethnicity;
        }

        function getBirthPlace() {
            if (_birthPlace !== undefined) {
                _birthPlace.text = $filter('singleLineAddress')(_birthPlace);
            }
            return _birthPlace;
        }

        function getMothersMaidenName() {
            return _mothersMaidenName;
        }

        function getBirthDate() {
            if (_birthDate !== undefined && _birthDate !== null) {
                _birthDate.$$display = $filter('date')(_birthDate, 'longDate');
            }
            return _birthDate;
        }

        function getBirthOrder() {
            return _birthOrder;
        }

        function getDeceased() {
            return _deceased;
        }

        function getDeceasedDate() {
            if (_deceasedDate !== undefined && _deceasedDate !== null) {
                _deceasedDate.$$display = $filter('date')(_deceasedDate, 'longDate');
            }
            return _deceasedDate;
        }

        function getGender() {
            return _gender;
        }

        function getMaritalStatus() {
            if (_maritalStatus !== undefined) {
                _maritalStatus.text = ($filter)('codeableConcept')(_maritalStatus);
            }
            return _maritalStatus;
        }

        function getMultipleBirth() {
            return _multipleBirth;
        }

        function init(gender, maritalStatus) {
            _gender = undefined;
            _maritalStatus = undefined;
            if (gender) {
                _gender = gender;
            }
            if (maritalStatus) {
                _maritalStatus = maritalStatus;
            }
        }

        function initBirth(multipleBirth, birthOrder, birthDate) {
            _birthDate = undefined;
            _birthOrder = undefined;
            _multipleBirth = undefined;
            if (birthOrder && birthOrder > 0) {
                _birthOrder = birthOrder;
                _multipleBirth = true;
            } else {
                _multipleBirth = multipleBirth;
            }
            if (birthDate) {
                _birthDate = new Date(birthDate);
            }
        }

        function initDeath(deceased, dateOfDeath) {
            _deceased = undefined;
            if (dateOfDeath) {
                _deceasedDate = new Date(dateOfDeath);
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
                                _birthPlace.text = $filter('singleLineAddress')(_birthPlace);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }

        function setKnownExtensions() {
            var extensions = [];
            if (_race) {
                extensions.push({
                    url: "http://hl7.org/fhir/StructureDefinition/us-core-race",
                    valueCodeableConcept: _race
                });
            }
            if (_religion) {
                extensions.push({
                    url: "http://hl7.org/fhir/StructureDefinition/us-core-religion",
                    valueCodeableConcept: _religion
                });
            }
            if (_ethnicity) {
                extensions.push({
                    url: "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
                    valueCodeableConcept: _ethnicity
                });
            }
            if (_mothersMaidenName) {
                extensions.push({
                    url: "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName",
                    valueString: _mothersMaidenName
                });
            }
            if (_birthPlace) {
                extensions.push({
                    url: "http://hl7.org/fhir/StructureDefinition/birthPlace",
                    valueAddress: _birthPlace
                });
            }
            return extensions;
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
            _multipleBirth = !!(value && (value > 0));
            _birthOrder = value;
        }

        function setDeceased(value) {
            _deceased = value;
        }

        function setDeceasedDate(value) {
            _deceased = common.isUndefinedOrNull(value) === false;
            _deceasedDate = value;
        }

        function setGender(value) {
            _gender = value;
        }

        function setMaritalStatus(value) {
            _maritalStatus = value;
        }

        function setMultipleBirth(value) {
            _multipleBirth = value;
        }

        var service = {
            getBirthDate: getBirthDate,
            setBirthDate: setBirthDate,
            getBirthOrder: getBirthOrder,
            setBirthOrder: setBirthOrder,
            getDeceased: getDeceased,
            getDeceasedDate: getDeceasedDate,
            getGender: getGender,
            setGender: setGender,
            getMaritalStatus: getMaritalStatus,
            setMaritalStatus: setMaritalStatus,
            getMultipleBirth: getMultipleBirth,
            setMultipleBirth: setMultipleBirth,
            init: init,
            initBirth: initBirth,
            initDeath: initDeath,
            setDeceased: setDeceased,
            setDeceasedDate: setDeceasedDate,
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
            setKnownExtensions: setKnownExtensions,
            initializeKnownExtensions: initializeKnownExtensions
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', 'common', patientDemographicsService]);

})();