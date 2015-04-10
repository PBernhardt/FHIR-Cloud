(function () {
    'use strict';

    var controllerId = 'consultationDetail';

    function consultationDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window,
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
            common.activateController([_getActiveServer(), _loadSmokingStatuses(), _loadInterpretations(),
                    _loadBPInterpretations(), _loadBMIRange(), _loadBodyTempMethods()],
                controllerId).then(function () {
                    vm.vitals.date = new Date();
                    _getPatientContext();

                });
        }

        function _initializeBP() {
            vm.vitals.date = new Date();
            vm.vitals.bp.diastolic = 0;
            vm.vitals.bp.systolic = 0;
            vm.vitals.bp.interpretationCode = undefined;
            vm.vitals.bp.interpretationText = "Enter new reading";
        }

        function _initializeBMI() {
            vm.vitals.bmi.height = undefined;
            vm.vitals.bmi.weight = undefined;
            vm.vitals.bmi.interpretationCode = undefined;
            vm.vitals.bmi.interpretationText = "Enter new reading";
        }

        function calculateBMI() {
            if (vm.vitals.bmi.height && vm.vitals.bmi.weight && vm.vitals.bmi.height > 0 && vm.vitals.bmi.weight > 0) {
                var _height = (vm.vitals.bmi.height / 39.3700787);
                var _weight = (vm.vitals.bmi.weight / 2.20462);
                vm.vitals.bmi.calculated = (Math.floor((_weight / Math.pow(_height, 2)) * 100) / 100);
            }

            switch (true) {
                case (vm.vitals.bmi.calculated <= 18.5):
                    vm.vitals.bmi.interpretationText = "Underweight";
                    vm.vitals.bmi.color = "blue";
                    break;
                case ((vm.vitals.bmi.calculated >= 30) && (vm.vitals.bmi.calculated < 40)):
                    vm.vitals.bmi.interpretationText = "Obese";
                    vm.vitals.bmi.color = "red";
                    break;
                case (vm.vitals.bmi.calculated >= 40):
                    vm.vitals.bmi.interpretationText = "Severely Obese";
                    vm.vitals.bmi.color = "purple";
                    break;
                case ((vm.vitals.bmi.calculated > 18.5) && (vm.vitals.bmi.calculated < 25)):
                    vm.vitals.bmi.interpretationText = "Healthy weight";
                    vm.vitals.bmi.color = "green";
                    break;
                case ((vm.vitals.bmi.calculated >= 25) && (vm.vitals.bmi.calculated < 30)):
                    vm.vitals.bmi.interpretationText = "Overweight";
                    vm.vitals.bmi.color = "orange";
                    break;
                default:
                    vm.vitals.bmi.interpretationText = "";
                    vm.vitals.bmi.color = "grey";
                    break;
            }
        }

        vm.calculateBMI = calculateBMI;

        function _calculateAge(birthDate) {
            if (birthDate) {
                var dob = birthDate;
                if (angular.isDate(dob) === false) {
                    dob = new Date(birthDate);
                }
                var ageDifMs = Date.now() - dob.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            } else {
                return "unknown";
            }
        }

        function _loadSmokingStatuses() {
            return vm.smokingStatuses = observationValueSets.smokingStatus();
        }

        function _loadBMIRange() {
            return vm.bmiInterpretations = observationValueSets.bmiRange();
        }

        function _loadBPInterpretations() {
            return vm.bpInterpretations = observationValueSets.bpInterpretation();
        }

        function _loadBodyTempMethods() {
            vm.bodyTempMethods = observationValueSets.bodyTempMethods();
            vm.bodyTempFinding = observationValueSets.bodyTempFindings();
        }

        function _loadInterpretations() {
            return vm.interpretations = observationValueSets.interpretation();
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
                vm.consultation.patient = JSON.parse($window.localStorage.patient);
                vm.consultation.patient.fullName = $filter('fullName')(vm.consultation.patient.name);
                vm.consultation.patient.age = _calculateAge(vm.consultation.patient.birthDate);
            } else {
                logError("You must first select a patient before initiating a consultation", error);
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
                        $location.path('consultation/smart/cardiac-risk/' + vm.consultation.patient.id);
                        break;
                    case 2:
                        logInfo("Add a condition coming soon...");
                        break;
                    case 3:
                        logInfo("Add a medication coming soon...");
                        break;
                    case 4:
                        logInfo("Add an allergy coming soon...");
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Back to face sheet', icon: 'person', index: 0},
                    {name: 'Cardiac Risk', icon: 'cardio', index: 1},
                    {name: 'Add a condition', icon: 'rx', index: 2},
                    {name: 'Add a medication', icon: 'rx', index: 3},
                    {name: 'Add an allergy', icon: 'rx', index: 4}
                ];
                this.title = 'Observation options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        function updateBP() {
            var s = vm.vitals.bp.systolic;
            if (vm.vitals.bp.diastolic < 60 || s <= 90) {
                vm.vitals.bp.interpretationText = "Low reading";
                vm.vitals.bp.color = "blue";
            } else if (vm.vitals.bp.diastolic > 90 || s >= 140) {
                vm.vitals.bp.interpretationText = "High reading";
                vm.vitals.bp.color = "red";
            } else if (vm.vitals.bp.diastolic >= 60 && vm.vitals.bp.diastolic <= 80) {
                switch (true) {
                    case (s <= 120):
                        vm.vitals.bp.interpretationText = "Reading is ideal and healthy";
                        vm.vitals.bp.color = "green";
                        break;
                    case (s <= 140):
                        vm.vitals.bp.interpretationText = "A little higher than it should be";
                        vm.vitals.bp.color = "orange";
                        break;
                    default:
                        vm.vitals.bp.interpretationText = "Inconclusive";
                        vm.vitals.bp.color = "grey";
                        break;
                }
            } else if (vm.vitals.bp.diastolic > 80 && vm.vitals.bp.diastolic <= 90) {
                switch (true) {
                    case (s <= 140):
                        vm.vitals.bp.interpretationText = "A little higher than it should be";
                        vm.vitals.bp.color = "orange";
                        break;
                    default:
                        vm.vitals.bp.interpretationText = "Inconclusive";
                        vm.vitals.bp.color = "grey";
                        break;
                }

            }
        }

        vm.updateBP = updateBP;

        function updateTemperature() {
            switch (true) {
                case (vm.vitals.temperature.value < 95.0):
                    vm.vitals.temperature.interpretationText = "Hypothermia";
                    vm.vitals.temperature.color = "blue";
                    break;
                case ((vm.vitals.temperature.value >= 95.0) && (vm.vitals.temperature.value < 97.7)):
                    vm.vitals.temperature.interpretationText = "Below normal";
                    vm.vitals.temperature.color = "orange";
                    break;
                case ((vm.vitals.temperature.value >= 97.7) && (vm.vitals.temperature.value <= 99.5)):
                    vm.vitals.temperature.interpretationText = "Normal";
                    vm.vitals.temperature.color = "green";
                    break;
                case ((vm.vitals.temperature.value > 99.5) && (vm.vitals.temperature.value <= 100.9)):
                    vm.vitals.temperature.interpretationText = "Fever";
                    vm.vitals.temperature.color = "red";
                    break;
                case (vm.vitals.temperature.value > 100.9):
                    vm.vitals.temperature.interpretationText = "Hyperpyrexia";
                    vm.vitals.temperature.color = "purple";
                    break;
                default:
                    vm.vitals.temperature.interpretationText = "Indeterminate";
                    vm.vitals.temperature.color = "grey";
                    break;
            }
        }

        vm.updateTemperature = updateTemperature;

        function updatePulse() {
            switch (true) {
                case (vm.vitals.hr.pulse < 60):
                    vm.vitals.hr.interpretationText = "Heart rate is below normal";
                    vm.vitals.hr.color = "blue";
                    break;
                case (vm.vitals.hr.pulse > 100):
                    vm.vitals.hr.interpretationText = "Heart rate is above normal";
                    vm.vitals.hr.color = "red";
                    break;
                case (vm.vitals.hr.pulse <= 100 && vm.vitals.hr.pulse >= 60):
                    vm.vitals.hr.interpretationText = "Normal heart rate";
                    vm.vitals.hr.color = "green";
                    break;
                default:
                    vm.vitals.hr.interpretationText = "Indeterminate";
                    vm.vitals.hr.color = "grey";
            }
        }

        vm.updatePulse = updatePulse;

        function updateRespiration() {
            //TODO: normalize for age
            switch (true) {
                case (vm.vitals.respiration.rate < 12):
                    vm.vitals.respiration.interpretationText = "Respiration is lower than normal";
                    vm.vitals.respiration.color = "blue";
                    break;
                case (vm.vitals.respiration.rate > 16):
                    vm.vitals.respiration.interpretationText = "Respiration is higher than normal";
                    vm.vitals.respiration.color = "red";
                    break;
                case (vm.vitals.respiration.rate >= 12 && vm.vitals.respiration.rate <= 16):
                    vm.vitals.respiration.interpretationText = "Respiration is normal";
                    vm.vitals.respiration.color = "green";
                    break;
                default:
                    vm.vitals.respiration.interpretationText = "Indeterminate";
                    vm.vitals.respiration.color = "grey";
            }
        }

        vm.updateRespiration = updateRespiration;

        function saveBloodPressure(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var interpretationObs = _buildBPInterpretation();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                                vm.isBusy = false;
                                deferred.reject(error);
                            })
                            .then(function (observationId) {
                                if (angular.isDefined(observationId) && angular.isDefined(interpretationObs)) {
                                    var relatedItem = {"type": "has-component"};
                                    relatedItem.target = {"reference": 'Observation/' + observationId};
                                    interpretationObs.related.push(relatedItem);
                                    completed = completed + 1;
                                }
                                if (completed === observations.length) {
                                    deferred.resolve(interpretationObs);
                                }
                            })
                    }
                }
                return deferred.promise;
            }

            logInfo("Saving blood pressure readings to " + vm.activeServer.name);
            var observations = [];
            observations.push(_buildDiastolic());
            observations.push(_buildSystolic());

            savePrimaryObs(observations)
                .then(function (interpretationObs) {
                    //TODO: if either sys/dia failed, compensate transaction
                    if (angular.isDefined(interpretationObs)) {
                        observationService.addObservation(interpretationObs)
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                            })
                    }
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    _initializeBP();
                    form.$setPristine();
                })
        }

        vm.saveBloodPressure = saveBloodPressure;

        function savePulseAndRespiration(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var interpretationObs = _buildBPInterpretation();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(_processCreateResponse(),
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                                vm.isBusy = false;
                                deferred.reject(error);
                            })
                            .then(function (observationId) {
                                if (angular.isDefined(observationId) && angular.isDefined(interpretationObs)) {
                                    var relatedItem = {"type": "has-component"};
                                    relatedItem.target = {"reference": 'Observation/' + observationId};
                                    interpretationObs.related.push(relatedItem);
                                    completed = completed + 1;
                                }
                                if (completed === observations.length) {
                                    deferred.resolve(interpretationObs);
                                }
                            })
                    }
                }
                return deferred.promise;
            }

            logInfo("Saving heart and respiration results to " + vm.activeServer.name);
            var observations = [];
            observations.push(_buildHeartRate());
            observations.push(_buildRespiration());

            savePrimaryObs(observations)
                .then(function (interpretationObs) {
                    //TODO: if either sys/dia failed, compensate transaction
                    if (angular.isDefined(interpretationObs)) {
                        observationService.addObservation(interpretationObs)
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                            })
                    }
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    _initializeBP();
                    form.$setPristine();
                })
        }

        vm.savePulseAndRespiration = savePulseAndRespiration;

        function saveBMI(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var bmiObservation = _buildBMIObs();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                                vm.isBusy = false;
                                deferred.reject(error);
                            })
                            .then(function (observationId) {
                                if (angular.isDefined(observationId) && angular.isDefined(bmiObservation)) {
                                    var relatedItem = {"type": "has-component"};
                                    relatedItem.target = {"reference": 'Observation/' + observationId};
                                    bmiObservation.related.push(relatedItem);
                                    completed = completed + 1;
                                }
                                if (completed === observations.length) {
                                    deferred.resolve(bmiObservation);
                                }
                            })
                    }
                }
                return deferred.promise;
            }

            logInfo("Saving height, weight and BMI to " + vm.activeServer.name);
            var observations = [];
            observations.push(_buildHeightObs());
            observations.push(_buildWeightObs());

            savePrimaryObs(observations)
                .then(function (bmiObs) {
                    if (angular.isDefined(bmiObs)) {
                        observationService.addObservation(bmiObs)
                            .then(_processCreateResponse,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                            })
                    }
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    _initializeBMI();
                    form.$setPristine();
                })
        }

        vm.saveBMI = saveBMI;

        function saveOther(form) {
            if (angular.isDefined(vm.vitals.temperature.value)) {
                var tempObservation = _buildBodyTemp();
                logInfo("Saving body temperature to " + vm.activeServer.name);
                observationService.addObservation(tempObservation)
                    .then(_processCreateResponse,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        _initializeBMI();
                        form.$setPristine();
                    })
            }
        }

        vm.saveOther = saveOther;

        function saveSmokingStatus(form) {
            var smokingObservation = _buildSmokingStatus();
            logInfo("Saving smoking status to " + vm.activeServer.name);
            observationService.addObservation(smokingObservation)
                .then(_processCreateResponse,
                function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    _initializeBMI();
                    form.$setPristine();
                })
        }

        vm.saveSmokingStatus = saveSmokingStatus;

        function _buildSmokingStatus() {
            var smokingStatusObs = observationService.initializeNewObservation();
            smokingStatusObs.code = {
                "coding": [],
                "text": "Smoking status"
            };
            var coding = angular.fromJson(vm.vitals.smokingStatus);
            coding.system = vm.smokingStatuses.system;
            smokingStatusObs.code.coding.push(coding);
            smokingStatusObs.status = "final";
            smokingStatusObs.reliability = "ok";
            smokingStatusObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            smokingStatusObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return smokingStatusObs;
        }

        function _buildHeartRate() {
            var systolicObs = observationService.initializeNewObservation();
            systolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "",
                    "display": ""
                }, {
                    "system": "http://loinc.org",
                    "code": "8867-4",
                    "display": "Heart rate"
                }],
                "text": "Heart rate"
            };
            systolicObs.valueQuantity = {
                "value": vm.vitals.bp.systolic,
                "units": "mm[Hg]"
            };
            systolicObs.status = "final";
            systolicObs.reliability = "ok";
            systolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            systolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return systolicObs;
        }

        function _buildRespiration() {
            var systolicObs = observationService.initializeNewObservation();
            systolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "86290005",
                    "display": "Respiratory rate"
                }, {
                    "system": "http://loinc.org",
                    "code": "9279-1",
                    "display": "Respiratory rate"
                }],
                "text": "Respiratory rate"
            };
            systolicObs.valueQuantity = {
                "value": vm.vitals.respiration.rate,
                "units": "breaths/min",
                "code": "258984001",
                "system": "http://snomed.info/sct"
            };
            systolicObs.status = "final";
            systolicObs.reliability = "ok";
            systolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };

            systolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return systolicObs;
        }

        function _buildBodyTemp() {
            var bodyTempObs = observationService.initializeNewObservation();
            bodyTempObs.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "8310-5",
                        "display": "Body temperature",
                        "primary": true
                    },
                    {
                        "system": "http://snomed.info/sct",
                        "code": "386725007",
                        "display": "Body temperature",
                        "primary": false
                    }
                ],
                "text": "Body temperature"
            }
            if (angular.isDefined(vm.vitals.temperature.method)) {
                bodyTempObs.method = {
                    "coding": []
                };
                var methodCoding = angular.fromJson(vm.vitals.temperature.method);
                methodCoding.system = vm.bodyTempMethods.system;
                methodCoding.primary = true;
                bodyTempObs.method.coding.push(methodCoding);
            }
            if (angular.isDefined(vm.vitals.temperature.interpretationCode)) {
                bodyTempObs.interpretation = {
                    "coding": []
                };
                var findingCoding = angular.fromJson(vm.vitals.temperature.interpretationCode);
                findingCoding.system = vm.bodyTempFinding.system;
                findingCoding.primary = true;
                bodyTempObs.interpretation.coding.push(findingCoding);
            }

            bodyTempObs.valueQuantity = {
                "value": vm.vitals.temperature.value,
                "units": "F",
                "code": "258712004",
                "system": "http://snomed.info/sct"
            };
            bodyTempObs.status = "final";
            bodyTempObs.reliability = "ok";
            bodyTempObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            bodyTempObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return bodyTempObs;
        }

        function _buildSystolic() {
            var systolicObs = observationService.initializeNewObservation();
            systolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "271649006",
                    "display": "Systolic blood pressure"
                }, {
                    "system": "http://loinc.org",
                    "code": "8480-6",
                    "display": "Systolic blood pressure"
                }],
                "text": "Systolic blood pressure"
            };
            systolicObs.valueQuantity = {
                "value": vm.vitals.bp.systolic,
                "units": "mm[Hg]"
            };
            systolicObs.status = "final";
            systolicObs.reliability = "ok";
            systolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            systolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return systolicObs;
        }

        function _buildDiastolic() {
            var diastolicObs = observationService.initializeNewObservation();
            diastolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "271650006",
                    "display": "Diastolic blood pressure"
                }, {
                    "system": "http://loinc.org",
                    "code": "8462-4",
                    "display": "Diastolic blood pressure"
                }],
                "text": "Diastolic blood pressure"
            };
            diastolicObs.valueQuantity = {
                "value": vm.vitals.bp.diastolic,
                "units": "mm[Hg]"
            };
            diastolicObs.status = "final";
            diastolicObs.reliability = "ok";
            diastolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            diastolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return diastolicObs;
        }

        function _buildBPInterpretation() {
            if (vm.vitals.bp.interpretationCode) {
                var bpInterpretationObs = observationService.initializeNewObservation();
                bpInterpretationObs.code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "55284-4",
                            "display": "Blood pressure systolic & diastolic"
                        }], "text": "Blood pressure systolic & diastolic"
                };
                bpInterpretationObs.interpretation = {
                    "coding": [],
                    "text": vm.vitals.bp.interpretationText
                };
                var coding = angular.fromJson(vm.vitals.bp.interpretationCode);
                coding.system = vm.interpretations.system;
                bpInterpretationObs.interpretation.coding.push(coding);
                bpInterpretationObs.status = "final";
                bpInterpretationObs.reliability = "ok";
                bpInterpretationObs.subject = {
                    "reference": 'Patient/' + vm.consultation.patient.id,
                    "display": vm.consultation.patient.fullName
                };
                bpInterpretationObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');

                return bpInterpretationObs;
            } else {
                return undefined;
            }
        }

        function _buildBMIObs() {
            var bmiObs = observationService.initializeNewObservation();
            bmiObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "60621009",
                    "display": "Body mass index"
                }, {
                    "system": "http://loinc.org",
                    "code": "39156-5",
                    "display": "Body mass index (BMI) [Ratio]"
                }],
                "text": "Body mass index"
            };
            bmiObs.bodySiteCodeableConcept = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "38266002",
                        "display": "Entire body as a whole"
                    }
                ]
            };
            bmiObs.referenceRange =
                [
                    {
                        "high": {
                            "value": 20
                        },
                        "meaning": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "310252000",
                                    "display": "Low BMI"
                                }
                            ]
                        }
                    },
                    {
                        "low": {
                            "value": 20
                        },
                        "high": {
                            "value": 25
                        },
                        "meaning": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "412768003",
                                    "display": "Normal BMI"
                                }
                            ]
                        }
                    },
                    {
                        "low": {
                            "value": 25
                        },
                        "high": {
                            "value": 30
                        },
                        "meaning": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "162863004",
                                    "display": "Overweight"
                                }
                            ]
                        }
                    },
                    {
                        "low": {
                            "value": 30
                        },
                        "high": {
                            "value": 40
                        },
                        "meaning": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "162864005",
                                    "display": "Obesity"
                                }
                            ]
                        }
                    },
                    {
                        "low": {
                            "value": 40
                        },
                        "meaning": {
                            "coding": [
                                {
                                    "system": "http://snomed.info/sct",
                                    "code": "162864005",
                                    "display": "Severe obesity"
                                }
                            ]
                        }
                    }
                ];
            bmiObs.valueQuantity = {
                "value": vm.vitals.bmi.calculated,
                "units": "lb/in2",
                "code": "362981000",  //TODO: find rights code
                "system": "http://snomed.info/sct"
            };
            bmiObs.status = "final";
            bmiObs.reliability = "ok";
            bmiObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            bmiObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');

            if (vm.vitals.bmi.interpretationCode) {
                bmiObs.interpretation = {
                    "coding": [],
                    "text": vm.vitals.bmi.interpretationText
                };
                var coding = angular.fromJson(vm.vitals.bmi.interpretationCode);
                coding.system = vm.interpretations.system;
                bmiObs.interpretation.coding.push(coding);
            }
            return bmiObs;
        }

        function _buildHeightObs() {
            var heightObs = observationService.initializeNewObservation();
            if (vm.vitals.bmi.heightMeasured === "Standing") {
                heightObs.code = {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "8302-2",
                        "display": "Body height"
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "248333004",
                        "display": "Standing height"
                    }],
                    "text": "Standing body height"
                };
            } else {
                heightObs.code = {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "8306-3",
                        "display": "Body height - lying"
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "248334005",
                        "display": "Length of body"
                    }],
                    "text": "Lying body height"
                };
            }
            heightObs.valueQuantity = {
                "value": vm.vitals.bmi.height,
                "units": "in",
                "system": "http://snomed.info/sct",
                "code": "258677007"
            };
            heightObs.status = "final";
            heightObs.reliability = "ok";
            heightObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            heightObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');

            return heightObs;
        }

        function _buildWeightObs() {
            var weightObs = observationService.initializeNewObservation();
            weightObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "27113001",
                    "display": "Body weight"
                }, {
                    "system": "http://loinc.org",
                    "code": "3141-9",
                    "display": "Body weight Measured"
                }],
                "text": "Body weight"
            };
            weightObs.valueQuantity = {
                "value": vm.vitals.bmi.weight,
                "units": "lb",
                "system": "http://snomed.info/sct",
                "code": "258693003"
            };
            weightObs.status = "final";
            weightObs.reliability = "ok";
            weightObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            weightObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return weightObs;
        }

        function _processCreateResponse(results) {
            var deferred = $q.defer();
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Observation saved, but location is unavailable. CORS not implemented correctly at remote host.");
                deferred.resolve(undefined);
            } else {
                logInfo("Observation recorded at " + resourceVersionId);
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
        vm.consultation = {};
        vm.smokingStatuses = [];
        vm.bpInterpretations = [];
        vm.bmiInterpretations = [];
        vm.interpretations = [];
        vm.bodyTempFinding = undefined;
        vm.bodyTempMethods = undefined;
        vm.vitals = {
            "bp": {
                "systolic": undefined,
                "diastolic": undefined,
                "interpretationCode": undefined,
                "color": "black",
                "interpretationText": undefined
            },
            "hr": {
                "pulse": undefined,
                "interpretationCode": undefined,
                "color": "black",
                "interpretationText": undefined
            },
            "respiration": {
                "rate": undefined,
                "interpretationCode": undefined,
                "color": "black",
                "interpretationText": undefined
            },
            "bmi": {
                "height": undefined,
                "heightMeasured": "Standing",
                "weight": undefined,
                "calculated": undefined,
                "interpretationCode": undefined,
                "color": "black",
                "interpretationText": undefined
            },
            "smokingStatus": undefined,
            "temperature": {
                "value": undefined,
                "method": undefined,
                "interpretationCode": undefined,
                "color": "black",
                "interpretationText": undefined
            }
        };
        vm.consultation.patient = undefined;
        vm.smartLaunchUrl = '';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'common', 'fhirServers', 'localValueSets', 'identifierService', 'observationService',
            'observationValueSets', 'practitionerService', 'careProviderService', 'patientService', consultationDetail]);

})();