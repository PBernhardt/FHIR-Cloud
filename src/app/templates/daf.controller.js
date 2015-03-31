(function () {
    'use strict';

    var controllerId = 'dafController';

    function dafController($routeParams, $sce, common) {
        /*jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController(controllerId).then(function () {
                setDAFUrl();
            });
        }

        function setDAFUrl() {
            switch ($routeParams.profile) {
                case 'patient':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/patient-daf.html");
                    break;
                case 'allergyIntolerance':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/allergyintolerance-daf.html");
                    break;
                case 'diagnosticOrder':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/diagnosticorder-daf.html");
                    break;
                case 'diagnosticReport':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/diagnosticreport-daf.html");
                    break;
                case 'encounter':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/encounter-daf.html");
                    break;
                case 'familyHistory':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/familymemberhistory-daf.html");
                    break;
                case 'immunization':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/immunization-daf.html");
                    break;
                case 'results':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/observation-daf-results.html");
                    break;
                case 'medication':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/medication-daf.html");
                    break;
                case 'condition':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/condition-daf.html");
                    break;
                case 'medicationAdministration':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/medicationadministration-daf.html");
                    break;
                case 'medicationStatement':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/medicationstatement-daf.html");
                    break;
                case 'procedure':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/procedure-daf.html");
                    break;
                case 'smokingStatus':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/observation-daf-smokingstatus.html");
                    break;
                case 'vitalSigns':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/observation-daf-vitalsigns.html");
                    break;
                case 'list':
                    vm.dafUrl = $sce.trustAsResourceUrl("http://hl7-fhir.github.io/list-daf.html");
                    break;
                case 'organization':
                    vm.dafUrl = "http://hl7-fhir.github.io/patient-daf-dafpatient.html";
                    break;
                default:
                    vm.dafUrl = "http://hl7-fhir.github.io/patient-daf-dafpatient.html";
            }
        }

        vm.dafUrl = '';
        vm.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$routeParams', '$sce', 'common', dafController]);
})();