(function () {
    'use strict';

    var controllerId = 'communication';

    function communication(common, communicationService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function _activate() {
            common.activateController([_getCommunications(), _loadLanguageValues()], controllerId)
                .then(function () {
                    vm.includePreferred = communicationService.includePreferred();
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
            }
        }

        vm.addToList = addToList;

        function _getCommunications() {
            vm.communications = communicationService.getAll();
        }

        function changePreferred(language) {
            communicationService.update(language);
            vm.communications = communicationService.getAll();
        }

        vm.changePreferred = changePreferred;

        function querySearch(query) {
            return query ? vm.languageValues.filter(_createFilterFor(query)) : [];
        }

        vm.querySearch = querySearch;

        function _createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(language) {
                return (angular.lowercase(language.display).indexOf(lowercaseQuery) === 0);
            };
        }

        function _loadLanguageValues() {
            vm.languageValues = localValueSets.iso6391Languages();
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
            if (vm.includePreferred) {
                vm.communication = { "language": {"coding": [], "text": undefined}, "preferred": false };
            } else {
                vm.communication = { "language": {"coding": [], "text": undefined}};
            }

        }

        vm.updateLanguage = updateLanguage;
        vm.includePreferred = true;
        vm.communication = initCommunication();
        vm.communications = [];
        vm.languageSearchText = '';
        vm.languageValues = [];
        vm.selectedLanguage = {};

        _activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'communicationService', 'localValueSets', communication]);

})();
