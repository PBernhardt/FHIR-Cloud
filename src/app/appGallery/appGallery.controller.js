(function () {
    'use strict';

    var controllerId = 'appGallery';

    function appGallery($location, $mdBottomSheet, $routeParams, common, fhirServers, patientService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getPatientContext()],
                controllerId).then(function () {
                    _launchApp();
                });
        }

        function _getPatientContext() {
            var patient = patientService.getPatientContext();
            if (angular.isDefined(patient)) {
                vm.gallery.patient = patient;
            } else {
                logError("You must first select a patient before launching a SMART application");
                $location.path('/patient');
            }
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function _launchApp() {
            if (!angular.isDefined($routeParams.smartApp)) {
                return;
            }
            var appUrl = '';
            switch ($routeParams.smartApp) {
                case 'cardiac-risk':
                    appUrl = "https://fhir-dstu2.smarthealthit.org/apps/cardiac-risk/launch.html?";
                    break;
                case 'growth-chart':
                    appUrl = "https://fhir-dstu2.smarthealthit.org/apps/growth-chart/launch.html?";
                    break;
                case 'bp-centiles':
                    appUrl = "https://fhir-dstu2.smarthealthit.org/apps/bp-centiles/launch.html?";
                    break;
                case 'diabetes-monograph':
                    appUrl = "https://fhir-dstu2.smarthealthit.org/apps/diabetes-monograph/launch.html?";
                    break;
                case 'disease-monograph':
                    appUrl = "https://fhir-dstu2.smarthealthit.org/apps/disease-monograph/launch.html?";
                    break;
                default:
                    logInfo("SMART App not available...");
                    return;
            }
            var fhirServer = encodeURIComponent(vm.activeServer.baseUrl);
            if (angular.isDefined(vm.activeServer.clientId)) {
                vm.smartLaunchUrl = appUrl + 'iss=' + fhirServer + '&patientId=' +  vm.gallery.patient.id;
            } else {
                vm.smartLaunchUrl = appUrl + 'fhirServiceUrl=' + fhirServer + '&patientId=' + vm.gallery.patient.id;
            }
            logInfo("Launching SMART on FHIR application, please wait ...");
        }

        function launch(app) {
            $location.path('/launch/' + app);
        }

        vm.launch = launch;

        function actions($event) {
            $mdBottomSheet.show({
                parent: angular.element(document.getElementById('content')),
                templateUrl: './templates/resourceSheet.html',
                controller: ['$mdBottomSheet', ResourceSheetController],
                controllerAs: "vm",
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.index) {
                    case 0:
                        $location.path('patient/view/current');
                        break;
                    case 1:
                        $location.path('/consultation');
                        break;
                    case 2:
                        $location.path('/lab');
                        break;
                    case 2:
                        $location.path('/patient');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Back to face sheet', icon: 'person', index: 0},
                    {name: 'Vitals', icon: 'vitals', index: 1},
                    {name: 'Lab', icon: 'lab', index: 2},
                    {name: 'Find another patient', icon: 'quickFind', index: 3}
                ];
                this.title = 'Observation options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.activate = activate;
        vm.isBusy = false;
        vm.smartLaunchUrl = '';
        vm.gallery = {patient: undefined};
        vm.smartLaunchUrl = '';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$routeParams', 'common', 'fhirServers', 'patientService', appGallery]);
})
();