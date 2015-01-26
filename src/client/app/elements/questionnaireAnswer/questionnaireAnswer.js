/**
 * Copyright 2014 Peter Bernhardt, et. al.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/**
 * Copyright 2014 Peter Bernhardt, et. al.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
(function () {
    'use strict';

    var controllerId = 'questionnaireAnswer';

    angular.module('FHIRStarter').controller(controllerId,
        ['$routeParams', '$scope', '$window', 'common', 'localValueSets', 'questionnaireAnswerService', questionnaireAnswer]);

    function questionnaireAnswer($routeParams, $scope, $window, common, localValueSets, questionnaireAnswerService) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');

        vm.answerStatuses = [];
        vm.answers = {};
        vm.busyMessage = "Rendering profile questionnaire ...";
        vm.cancel = cancel;
        vm.activate = activate;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.isRendered = false;
        vm.loadQuestions = loadQuestions;
        vm.questionnaire = undefined;
        vm.questionnaireIdParameter = $routeParams.hashKey;
        vm.renderForm = renderForm;
        vm.save = save;
        vm.selectedProfile = null;
        vm.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };
        vm.title = 'questionnaireAnswer';
        vm.updateAnswers = updateAnswers;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        Object.defineProperty(vm, 'rendered', {
            get: isRendered
        });

        activate();

        function activate() {
            common.activateController([getAnswerStatuses(), getProfiles()], controllerId);
        }

        function cancel() {
            vm.isRendered = false;
        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function getAnswerStatuses() {
            return vm.answerStatuses = localValueSets.questionnaireAnswerStatus();
        }

        function getProfiles() {
            questionnaireAnswerService.getProfiles()
                .then(function (results) {
                    vm.profiles = results.data.entry;
                }, function (error) {
                    logError(common.unexpectedOutcome(error));
                });
        }

        function loadQuestions() {
            if (vm.selectedProfile === null || vm.selectedProfile === "") {
                return;
            }
            vm.busyMessage = "Rendering profile questionnaire ...";
            toggleSpinner(true);
            questionnaireAnswerService.getQuestions(vm.selectedProfile)
                .then(function (results) {
                    toggleSpinner(false);
                    vm.questionnaire = results.data;
                    vm.answers.resourceType = "QuestionnaireAnswers";
                    vm.answers.questionnaire = { "reference": results.config.url };
                    vm.answers.status = "completed";
                    vm.answers.group = {};
                    vm.answers.group.title = vm.questionnaire.group.title;
                    vm.answers.group.linkId = vm.questionnaire.group.linkId;
                    vm.answers.group.text = vm.questionnaire.group.text;
                    vm.answers.group.group = [];
                    vm.answers.$$narrative = null;
                    return vm.questionnaire;
                }, function (error) {
                    toggleSpinner(false);
                    if (error.outcome && error.status) {
                        logError(error.status + ' error: ' + error.outcome.issue[0].details);
                    } else {
                        logError("Unknown error: " + error);
                    }
                }).then(renderForm);
        }

        function getTitle() {
            return 'Edit ' + ((vm.questionnaire && vm.questionnaire.fullName) || '');
        }

        function goBack() {
            $window.history.back();
        }

        function isRendered() {
            return vm.isRendered;
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Answers saved, but remote location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                logSuccess("Answers saved at " + resourceVersionId);
            }
            var localAnswer = vm.answers;
            localAnswer.$$resourceId = common.setResourceId(undefined, resourceVersionId);
            vm.isEditing = false;
            localAnswer.$$user = $window.sessionStorage.username;
            localAnswer.$$eventDate = new Date();
            localAnswer.$$deleted = false;
            common.$broadcast('vitalsUpdateEvent', localAnswer);
            loadQuestions();
            toggleSpinner(false);
        }

        function renderForm() {
            vm.isRendered = true;
        }

        function save(event) {
            vm.busyMessage = "Sending answers to remote host ...";
            toggleSpinner(true);
            vm.answers.authored = moment();
            questionnaireAnswerService.addAnswer(vm.answers)
                .then(processResult,
                function (error) {
                    toggleSpinner(false);
                    logError(common.unexpectedOutcome(error));
                });
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        function updateAnswers(model, value) {
            logInfo(model + " updated to " + value);
        }
    }
})();