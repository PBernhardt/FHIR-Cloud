(function () {
    'use strict';

    var serviceId = 'demographicsService';

    function demographicsService($filter) {
        var _birthDate = null;
        var _gender = null;

        function getBirthDate() {
            if (_birthDate !== undefined && _birthDate !== null) {
                _birthDate.$$display = $filter('date')(_birthDate, 'longDate');
            }
            return _birthDate;
        }

        function getGender() {
            return _gender;
        }

        function init(gender, birthDate) {
            _gender = undefined;
            if (gender) {
                _gender = gender;
            }
            if (birthDate) {
                _birthDate = new Date(birthDate);
            }
        }

        function setBirthDate(value) {
            _birthDate = new Date(value);
        }

        function setGender(value) {
            _gender = value;
        }

        var service = {
            getBirthDate: getBirthDate,
            getGender: getGender,
            init: init,
            setBirthDate: setBirthDate,
            setGender: setGender
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', demographicsService]);

})();