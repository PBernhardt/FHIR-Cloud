(function () {
    'use strict';

    var controllerId = 'labDetail';

    function labDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window,
                       common, fhirServers, localValueSets, identifierService, observationService,
                       observationValueSets, practitionerService, careProviderService, patientService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer()],
                controllerId).then(function () {
                    vm.lab.date = new Date();
                    _getPatientContext();

                });
        }

        function _getPatientContext() {
            if (angular.isDefined($routeParams.smartApp)) {
                var appUrl = '';
                switch ($routeParams.smartApp) {
                    case 'cardiac-risk':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/cardiac-risk/launch.html?";
                        break;
                    case 'growth-chart':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/growth-chart/launch.html?";
                        break;
                    default:
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/diabetes-monograph/launch.html?";
                }
                var fhirServer = encodeURIComponent(vm.activeServer.baseUrl);

                // "https://fhir-dstu2.smarthealthit.org/apps/cardiac-risk/launch.html?fhirServiceUrl=https%3A%2F%2Ffhir-open-api-dstu2.smarthealthit.org&patientId=1551992";
                vm.smartLaunchUrl = appUrl + 'fhirServiceUrl=' + fhirServer + '&patientId=' + $routeParams.patientId;

            } else if (angular.isDefined($window.localStorage.patient)) {
                vm.lab.patient = JSON.parse($window.localStorage.patient);
                vm.lab.patient.fullName = $filter('fullName')(vm.lab.patient.name);
                vm.lab.patient.age = common.calculateAge(vm.lab.patient.birthDate);
            } else {
                logError("You must first select a patient before initiating a lab", error);
                $location.path('/patient');
            }
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getPractitionerReference(input) {
            var deferred = $q.defer();
            practitionerService.getPractitionerReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getPractitionerReference = getPractitionerReference;

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
                        $location.path('consultation');
                        break;
                    case 2:
                        $location.path('consultation/smart/cardiac-risk/' + vm.lab.patient.id);
                        break;
                    case 3:
                        $location.path('/patient');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Back to face sheet', icon: 'person', index: 0},
                    {name: 'Consult', icon: 'healing', index: 1},
                    {name: 'Cardiac Risk report', icon: 'cardio', index: 2},
                    {name: 'Find another patient', icon: 'person', index: 3}
                ];
                this.title = 'Lab options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        function updateTriglyceride() {
            /*
             Normal: Less than 150 mg/dL
             Borderline High: 150 - 199 mg/dL
             High: 200 - 499 mg/dL
             Very High: 500 mg/dL or above
             */
            switch (true) {
                case (vm.lab.lipid.triglyceride.value < 150):
                    vm.lab.lipid.triglyceride.interpretationText = "Normal";
                    vm.lab.lipid.triglyceride.color = "green";
                    break;
                case ((vm.lab.lipid.triglyceride.value >= 150) && (vm.lab.lipid.triglyceride.value < 199)):
                    vm.lab.lipid.triglyceride.interpretationText = "Borderline High";
                    vm.lab.lipid.triglyceride.color = "orange";
                    break;
                case ((vm.lab.lipid.triglyceride.value >= 200) && (vm.lab.lipid.triglyceride.value < 499)):
                    vm.lab.lipid.triglyceride.interpretationText = "High";
                    vm.lab.lipid.triglyceride.color = "red";
                    break;
                case (vm.lab.lipid.triglyceride.value >= 500):
                    vm.lab.lipid.triglyceride.interpretationText = "Very High";
                    vm.lab.lipid.triglyceride.color = "purple";
                    break;
                default:
                    vm.lab.lipid.triglyceride.interpretationText = "Indeterminate";
                    vm.lab.lipid.triglyceride.color = "grey";
                    break;
            }
            _calculateTotalCholesterol();
        }

        vm.updateTriglyceride = updateTriglyceride;

        function updateLdlCholesterol() {
            /*
             Less than 100 mg/dL (2.59 mmol/L) — Optimal
             100-129 mg/dL (2.59-3.34 mmol/L) — Near optimal, above optimal
             130-159 mg/dL (3.37-4.12 mmol/L) — Borderline high
             160-189 mg/dL (4.15-4.90 mmol/L) — High
             Greater than 189 mg/dL (4.90 mmol/L) — Very high
             */
            switch (true) {
                case (vm.lab.lipid.ldlCholesterol.value < 100):
                    vm.lab.lipid.ldlCholesterol.interpretationText = "Optimal";
                    vm.lab.lipid.ldlCholesterol.color = "green";
                    break;
                case ((vm.lab.lipid.ldlCholesterol.value >= 100) && (vm.lab.lipid.ldlCholesterol.value < 129)):
                    vm.lab.lipid.ldlCholesterol.interpretationText = "Near Optimal";
                    vm.lab.lipid.ldlCholesterol.color = "blue";
                    break;
                case ((vm.lab.lipid.ldlCholesterol.value >= 130) && (vm.lab.lipid.ldlCholesterol.value < 159)):
                    vm.lab.lipid.ldlCholesterol.interpretationText = "Borderline High";
                    vm.lab.lipid.ldlCholesterol.color = "orange";
                    break;
                case ((vm.lab.lipid.ldlCholesterol.value >= 160) && (vm.lab.lipid.ldlCholesterol.value <= 189)):
                    vm.lab.lipid.ldlCholesterol.interpretationText = "High";
                    vm.lab.lipid.ldlCholesterol.color = "red";
                    break;
                case (vm.lab.lipid.ldlCholesterol.value > 189):
                    vm.lab.lipid.ldlCholesterol.interpretationText = "Very High";
                    vm.lab.lipid.ldlCholesterol.color = "purple";
                    break;
                default:
                    vm.lab.lipid.ldlCholesterol.interpretationText = "Indeterminate";
                    vm.lab.lipid.ldlCholesterol.color = "grey";
                    break;
            }
            _calculateTotalCholesterol();
        }

        vm.updateLdlCholesterol = updateLdlCholesterol;

        function updateHdlCholesterol() {
            /*
             Over 60 - Optimal
             Between 50-60 Borderline optimal
             Under 50 - Low for men
             Under 40 - Low for women
             */
            switch (true) {
                case (vm.lab.lipid.hdlCholesterol.value >= 60):
                    vm.lab.lipid.hdlCholesterol.interpretationText = "Optimal";
                    vm.lab.lipid.hdlCholesterol.color = "green";
                    break;
                case ((vm.lab.lipid.hdlCholesterol.value < 60) && (vm.lab.lipid.hdlCholesterol.value >= 50)):
                    vm.lab.lipid.hdlCholesterol.interpretationText = "Near Optimal";
                    vm.lab.lipid.hdlCholesterol.color = "blue";
                    break;
                case ((vm.lab.lipid.hdlCholesterol.value < 50) && (vm.lab.lipid.hdlCholesterol.value >= 40)):
                    if (vm.lab.patient.gender === 'male') {
                        vm.lab.lipid.hdlCholesterol.interpretationText = "Low";
                        vm.lab.lipid.hdlCholesterol.color = "red";
                    } else {
                        vm.lab.lipid.hdlCholesterol.interpretationText = "Borderline";
                        vm.lab.lipid.hdlCholesterol.color = "orange";
                    }
                    break;
                case (vm.lab.lipid.hdlCholesterol.value < 40):
                    vm.lab.lipid.hdlCholesterol.interpretationText = "Low";
                    vm.lab.lipid.hdlCholesterol.color = "red";
                    break;
                default:
                    vm.lab.lipid.hdlCholesterol.interpretationText = "Indeterminate";
                    vm.lab.lipid.hdlCholesterol.color = "grey";
                    break;
            }
            _calculateTotalCholesterol();
        }

        vm.updateHdlCholesterol = updateHdlCholesterol;

        function _calculateTotalCholesterol() {
            if (angular.isDefined(vm.lab.lipid.hdlCholesterol.value)
                && angular.isDefined(vm.lab.lipid.ldlCholesterol.value)
                && angular.isDefined(vm.lab.lipid.triglyceride.value)) {
                var calculatedValue = (vm.lab.lipid.hdlCholesterol.value + vm.lab.lipid.ldlCholesterol.value)
                + (.2 * vm.lab.lipid.triglyceride.value);
                vm.lab.lipid.cholesterol.value = Math.round(calculatedValue);

                /*
                 Adults:
                 below 200 mg/Dl - desirable
                 200 > 239 - borderline high
                 >= 240 - high risk

                 Children:
                 below 170 mg/Dl - desirable
                 170 > 199 - borderline high
                 >= 200 - high risk

                 */
                if (vm.lab.patient.age < 18) {
                    switch (true) {
                        case (vm.lab.lipid.cholesterol.value < 170):
                            vm.lab.lipid.cholesterol.interpretationText = "Optimal";
                            vm.lab.lipid.cholesterol.color = "green";
                            break;
                        case ((vm.lab.lipid.cholesterol.value >= 170) && (vm.lab.lipid.cholesterol.value < 200)):
                            vm.lab.lipid.cholesterol.interpretationText = "Borderline High";
                            vm.lab.lipid.cholesterol.color = "orange";
                            break;
                        case (vm.lab.lipid.cholesterol.value >= 200):
                            vm.lab.lipid.cholesterol.interpretationText = "High Risk";
                            vm.lab.lipid.cholesterol.color = "red";
                            break;
                        default:
                            vm.lab.lipid.cholesterol.interpretationText = "Indeterminate";
                            vm.lab.lipid.cholesterol.color = "grey";
                            break;
                    }
                } else {
                    switch (true) {
                        case (vm.lab.lipid.cholesterol.value < 200):
                            vm.lab.lipid.cholesterol.interpretationText = "Optimal";
                            vm.lab.lipid.cholesterol.color = "green";
                            break;
                        case ((vm.lab.lipid.cholesterol.value >= 200) && (vm.lab.lipid.cholesterol.value < 240)):
                            vm.lab.lipid.cholesterol.interpretationText = "Borderline High";
                            vm.lab.lipid.cholesterol.color = "orange";
                            break;
                        case (vm.lab.lipid.cholesterol.value >= 240):
                            vm.lab.lipid.cholesterol.interpretationText = "High Risk";
                            vm.lab.lipid.cholesterol.color = "red";
                            break;
                        default:
                            vm.lab.lipid.cholesterol.interpretationText = "Indeterminate";
                            vm.lab.lipid.cholesterol.color = "grey";
                            break;
                    }
                }
            }
        }

        function saveLipid(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var lipidReport = _buildDiagnosticReport(); //TODO: implement Diagnostic Report
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        observationService.addObservation(observations[i])
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                                deferred.reject(error);
                            })
                            .then(function (observationId) {
                                if (angular.isDefined(observationId) && angular.isDefined(lipidReport)) {
                                    var relatedItem = {"type": "has-component"};
                                    relatedItem.target = {"reference": 'Observation/' + observationId};
                                    lipidReport.related.push(relatedItem);
                                    completed = completed + 1;
                                }
                                if (completed === observations.length) {
                                    deferred.resolve(lipidReport);
                                }
                            })
                    }
                }
                return deferred.promise;
            }
            vm.isBusy = true;
            logInfo("Saving lipid results to " + vm.activeServer.name);
            form.$invalid = true;
            var observations = [];
            observations.push(_buildLdlCResult());
            observations.push(_buildHdlCResult());
            observations.push(_buildTriglycerideResult());
            observations.push(_buildTotalCResult());


            savePrimaryObs(observations)
                .then(function () {
                    logInfo("Lipid profile results saved successfully!");
                    //TODO: save diagnostic report
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    vm.isBusy = false;
                    _initializeLipid(form);
                })
        }

        vm.saveLipid = saveLipid;

        function _initializeLipid(form) {
            vm.lab.lipid.hdlCholesterol.value = undefined;
            vm.lab.lipid.ldlCholesterol.value = undefined;
            vm.lab.lipid.triglyceride.value = undefined;
            vm.lab.lipid.cholesterol.value = undefined;
            updateHdlCholesterol();
            updateLdlCholesterol();
            updateTriglyceride();
            form.$setPristine();
        }
        function _buildTriglycerideResult() {
            var triglycerideResult = observationService.initializeNewObservation();
            triglycerideResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "35217-9",
                        "primary": true
                    }
                ],
                "text": "Triglyceride"
            };
            triglycerideResult.valueQuantity = {
                "value": vm.lab.lipid.triglyceride.value,
                "units": "mg/Dl",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            triglycerideResult.referenceRange = [
                {
                    "high": {
                        "value": 200,
                        "units": "mg/Dl",
                        "system": "http://snomed.info/sct",
                        "code": "258797006"
                    }
                }
            ];
            triglycerideResult.status = "final";
            triglycerideResult.reliability = "ok";
            triglycerideResult.subject = {
                "reference": 'Patient/' + vm.lab.patient.id,
                "display": vm.lab.patient.fullName
            };
            triglycerideResult.appliesDateTime = $filter('date')(vm.lab.date, 'yyyy-MM-ddTHH:mm:ss');
            return triglycerideResult;
        }

        function _buildTotalCResult() {
            var cholesterolResult = observationService.initializeNewObservation();
            cholesterolResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "35200-5"
                    }
                ],
                "text": "Cholesterol"
            };
            cholesterolResult.valueQuantity = {
                "value": vm.lab.lipid.cholesterol.value,
                "units": "mg/Dl",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            cholesterolResult.referenceRange = [
                {
                    "high": {
                        "value": (vm.lab.patient.age < 18 ? 200 : 240),
                        "units": "mg/Dl",
                        "system": "http://snomed.info/sct",
                        "code": "258797006"
                    }
                }
            ];
            cholesterolResult.status = "final";
            cholesterolResult.reliability = "ok";
            cholesterolResult.subject = {
                "reference": 'Patient/' + vm.lab.patient.id,
                "display": vm.lab.patient.fullName
            };
            cholesterolResult.appliesDateTime = $filter('date')(vm.lab.date, 'yyyy-MM-ddTHH:mm:ss');
            return cholesterolResult;
        }

        function _buildDiagnosticReport() {
            var diagnosticReport = observationService.initializeNewObservation();

            return diagnosticReport;
        }

        function _buildLdlCResult() {
            var ldlCResult = observationService.initializeNewObservation();
            ldlCResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "13457-7",
                        "primary": true
                    }
                ],
                "text": "Cholesterol in LDL"
            };
            ldlCResult.valueQuantity = {
                "value": vm.lab.lipid.ldlCholesterol.value,
                "units": "mg/Dl",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            ldlCResult.referenceRange = [
                {
                    "high": {
                        "value": 160,
                        "units": "mg/Dl",
                        "system": "http://snomed.info/sct",
                        "code": "258797006"
                    }
                }
            ];
            ldlCResult.status = "final";
            ldlCResult.reliability = "ok";
            ldlCResult.subject = {
                "reference": 'Patient/' + vm.lab.patient.id,
                "display": vm.lab.patient.fullName
            };
            ldlCResult.appliesDateTime = $filter('date')(vm.lab.date, 'yyyy-MM-ddTHH:mm:ss');

            return ldlCResult;
        }

        function _buildHdlCResult() {
            var hdlCResult = observationService.initializeNewObservation();
            hdlCResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "2085-9",
                        "primary": true
                    }
                ],
                "text": "Cholesterol in HDL"
            };
            hdlCResult.valueQuantity = {
                "value": vm.lab.lipid.hdlCholesterol.value,
                "units": "mg/Dl",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            hdlCResult.referenceRange = [
                {
                    "low": {
                        "value": (vm.lab.patient.gender === 'male' ? 50 : 40),
                        "units": "mg/Dl",
                        "system": "http://snomed.info/sct",
                        "code": "258797006"
                    }
                }
            ];
            hdlCResult.status = "final";
            hdlCResult.reliability = "ok";
            hdlCResult.subject = {
                "reference": 'Patient/' + vm.lab.patient.id,
                "display": vm.lab.patient.fullName
            };
            hdlCResult.appliesDateTime = $filter('date')(vm.lab.date, 'yyyy-MM-ddTHH:mm:ss');

            return hdlCResult;
        }

        function _processCreateResponse(results) {
            var deferred = $q.defer();
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Observation saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
                deferred.resolve(undefined);
            } else {
                logInfo("Observation recorded at " + resourceVersionId, null, noToast);
                deferred.resolve($filter('idFromURL')(resourceVersionId));
            }
            return deferred.promise;
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.activate = activate;
        vm.observation = null;
        vm.isBusy = false;
        vm.observation = undefined;
        vm.practitionerSearchText = '';
        vm.selectedPractitioner = null;
        vm.smartLaunchUrl = '';
        vm.smokingStatuses = [];
        vm.bpInterpretations = [];
        vm.bmiInterpretations = [];
        vm.interpretations = [];
        vm.bodyTempFinding = undefined;
        vm.bodyTempMethods = undefined;
        vm.lab = {
            "lipid": {
                "cholesterol": {
                    "value": undefined,
                    "interpretationCode": undefined,
                    "color": "black",
                    "interpretationText": undefined
                },
                "hdlCholesterol": {
                    "value": undefined,
                    "interpretationCode": undefined,
                    "color": "black",
                    "interpretationText": undefined
                },
                "ldlCholesterol": {
                    "value": undefined,
                    "interpretationCode": undefined,
                    "color": "black",
                    "interpretationText": undefined
                },
                "triglyceride": {
                    "value": undefined,
                    "interpretationCode": undefined,
                    "color": "black",
                    "interpretationText": undefined
                }
            }
        };
        vm.lab.patient = undefined;
        vm.smartLaunchUrl = '';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'common', 'fhirServers', 'localValueSets', 'identifierService', 'observationService',
            'observationValueSets', 'practitionerService', 'careProviderService', 'patientService', labDetail]);

})
();