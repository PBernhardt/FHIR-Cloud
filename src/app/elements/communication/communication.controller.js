(function () {
    'use strict';

    var controllerId = 'communication';

    function communication(common, communicationService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getCommunications(), loadLanguageValues()], controllerId)
                .then(function () {
                });
        }

        function addToList(form, item) {
            if (item) {
                vm.communication.language.coding.push(item);
                vm.communication.preferred = false;
                vm.communication.$$hashKey = item.$$hashKey;
                communicationService.add(_.clone(vm.communication));
                vm.communications = communicationService.getAll();
                vm.communication = initCommunication();
                form.$setPristine();
                form.$setUntouched();
            }
        }

        vm.addToList = addToList;

        function getCommunications() {
            return vm.communications = communicationService.getAll();
        }

        function changePreferred(language) {
            communicationService.update(language);
            vm.communications = communicationService.getAll();
        }

        vm.changePreferred = changePreferred;

        function querySearch(query) {
            var results = query ? vm.languageValues.filter(createFilterFor(query)) : [];
            return results;
        }

        vm.querySearch = querySearch;

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(language) {
                return (angular.lowercase(language.display).indexOf(lowercaseQuery) === 0);
            };
        }

        function loadLanguageValues() {
            return vm.languageValues = localValueSets.iso6391Languages();
        }

        function removeFromList(language) {
            communicationService.remove(language);
            vm.communications = communicationService.getAll();
        }

        vm.removeFromList = removeFromList;

        function reset(form) {
            form.$setPristine();
        }

        vm.reset = reset;

        function updateLanguage() {
            communicationService.setSingle(_.clone(vm.language));
        }

        function initCommunication() {
            return vm.communication = { "language": {"coding": [], "text": undefined}, "preferred": false };
        }

        vm.updateLanguage = updateLanguage;
        vm.communication = initCommunication();
        vm.communications = [];
        vm.languageSearchText = '';
        vm.languageValues = [];
        vm.selectedLanguage = {};

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'communicationService', 'localValueSets', communication]);

})();
