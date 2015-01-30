(function () {
    'use strict';

    var serviceId = 'demographicsService';

    function demographicsService() {
        var _birthDate = null;
        var _birthOrder = null;
        var _deceased = false;
        var _deceasedDate = null;
        var _language = [];
        var _multipleBirth = false;
        var _gender = null;
        var _maritalStatus = {"coding": []};

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
            if (birthOrder) {
                _birthOrder = birthOrder;
                _multipleBirth = true;
            } else {
                _multipleBirth = multipleBirth;
            }
        }

        function initDeath(deceased, dateOfDeath) {
            if (dateOfDeath) {
                _deceasedDate = dateOfDeath;
                _deceased = true;
            } else {
                _deceased = deceased;
            }
        }

        function setBirthDate(value) {
            _birthDate = value;
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
            setMultipleBirth: setMultipleBirth
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [demographicsService]);

})();