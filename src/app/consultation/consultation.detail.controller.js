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
            common.activateController([getActiveServer(), loadSmokingStatuses(), loadInterpretations(), loadBPInterpretations()],
                controllerId).then(function () {
                    vm.vitals.date = new Date();
                    getPatientContext();

                });
        }

        function initializeBP() {
            vm.vitals.date = new Date();
            vm.vitals.bp.diastolic = 0;
            vm.vitals.bp.systolic = 0;
            vm.vitals.bp.interpretationCode = undefined;
            vm.vitals.bp.interpretationText = "Enter new reading";
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
                case (vm.vitals.bmi.calculated >= 30):
                    vm.vitals.bmi.interpretationText = "Obese";
                    vm.vitals.bmi.color = "red";
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

        function calculateAge(birthDate) {
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

        function loadSmokingStatuses() {
            return vm.smokingStatuses = observationValueSets.smokingStatus();
        }

        function loadBPInterpretations() {
            return vm.bpInterpretations = observationValueSets.bpInterpretation();
        }

        function loadInterpretations() {
            return vm.interpretations = observationValueSets.interpretation();
        }

        function getPatientContext() {
            patientService.getCachedPatient($routeParams.hashKey).then(function (data) {
                vm.consultation.patient = data;
                vm.consultation.patient.age = calculateAge(vm.consultation.patient.birthDate);
            }, function (error) {
                logError("You must first select a patient before initiating a consultation", error);
                $location.path('/patient');
            });
        }

        function getActiveServer() {
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
                        //TODO
                        break;
                    case 1:
                        $location.path('/observation/smart/cardiac-risk/' + vm.observation.id);
                        break;
                    case 2:
                        $location.path('/observation/smart/meducation/' + vm.observation.id);
                        break;
                    case 3:
                        $location.path('/observation/edit/new');
                        break;
                    case 4:
                        $location.path('/observation/edit/' + vm.observation.hashKey);
                        break;
                    case 5:
                        deleteObservation(vm.observation);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Consult', icon: 'rx', index: 0},
                    {name: 'Cardiac Risk', icon: 'cardio', index: 1},
                    {name: 'Add new observation', icon: 'personAdd', index: 3},
                    {name: 'Edit observation', icon: 'edit', index: 4},
                    {name: 'Delete observation', icon: 'delete', index: 5}
                ];
                this.title = 'Observation options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        function buildSystolic() {
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
                "display": $filter('fullName')(vm.consultation.patient.name)
            };
            systolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return systolicObs;
        }

        function buildDiastolic() {
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
                "display": $filter('fullName')(vm.consultation.patient.name)
            };
            diastolicObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');
            return diastolicObs;
        }

        function buildBPInterpretation() {
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
                    "display": $filter('fullName')(vm.consultation.patient.name)
                };
                bpInterpretationObs.appliesDateTime = $filter('date')(vm.vitals.date, 'yyyy-MM-ddTHH:mm:ss');

                return bpInterpretationObs;
            } else {
                return undefined;
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
                        vm.vitals.bp.interpretationText = "Reading is ideal and healthy"
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

        function updatePulse() {
            switch (true) {
                case (vm.vitals.hr.pulse < 60):
                    vm.vitals.hr.interpretationText = "Heart rate below normal";
                    vm.vitals.hr.color = "blue";
                    break;
                case (vm.vitals.hr.pulse > 100):
                    vm.vitals.hr.interpretationText = "Heart rate above";
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

        function saveBloodPressure(form) {
            function processBPResult(results) {
                var deferred = $q.defer();
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Observation saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
                    deferred.resolve(undefined);
                } else {
                    logInfo("Observation saved at " + resourceVersionId, null, noToast);
                    deferred.resolve($filter('idFromURL')(resourceVersionId));
                }
                return deferred.promise;
            }

            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var interpretationObs = buildBPInterpretation();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(processBPResult,
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

            logInfo("Saving vital signs to " + vm.activeServer.name);
            var observations = [];
            observations.push(buildDiastolic());
            observations.push(buildSystolic());

            savePrimaryObs(observations)
                .then(function (interpretationObs) {
                    //TODO: if either sys/dia failed, compensate transaction
                    if (angular.isDefined(interpretationObs)) {
                        observationService.addObservation(interpretationObs)
                            .then(processBPResult,
                            function (error) {
                                logError(common.unexpectedOutcome(error));
                            })
                    }
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    initializeBP();
                    form.$setPristine();
                })
        }

        vm.saveBloodPressure = saveBloodPressure;

        function saveHeartRate(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var interpretationObs = buildBPInterpretation();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(processBPResult,
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

            logInfo("Saving heart rate to " + vm.activeServer.name);
            var observations = [];
            observations.push(buildDiastolic());
            observations.push(buildSystolic());

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
                    initializeBP();
                    form.$setPristine();
                })
        }

        vm.saveHeartRate = saveHeartRate;

        function saveBMI(form) {
            function savePrimaryObs(observations) {
                var deferred = $q.defer();
                var completed = 0;
                var interpretationObs = buildBPInterpretation();
                for (var i = 0, len = observations.length; i <= len; i++) {
                    if (observations[i] !== undefined) {
                        vm.isBusy = true;
                        observationService.addObservation(observations[i])
                            .then(processBPResult,
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

            logInfo("Saving heart rate to " + vm.activeServer.name);
            var observations = [];
            observations.push(buildDiastolic());
            observations.push(buildSystolic());

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
                    initializeBP();
                    form.$setPristine();
                })
        }

        vm.saveBMI = saveBMI;

        function saveSmokingStatus() {

        }

        vm.saveSmokingStatus = saveSmokingStatus;

        function _processCreateResponse(results) {
            var deferred = $q.defer();
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Observation saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
                deferred.resolve(undefined);
            } else {
                logInfo("Observation saved at " + resourceVersionId, null, noToast);
                deferred.resolve($filter('idFromURL')(resourceVersionId));
            }
            return deferred.promise;
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.calculateAge = calculateAge;
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
        vm.interpretations = [];
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
            "temperature": undefined
        };
        vm.consultation.patient = undefined;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'common', 'fhirServers', 'localValueSets', 'identifierService', 'observationService',
            'observationValueSets', 'practitionerService', 'careProviderService', 'patientService', consultationDetail]);

})();