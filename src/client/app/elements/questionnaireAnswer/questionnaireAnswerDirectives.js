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
    var app = angular.module('FHIRStarter');

    app.directive('fsQuestionnaireGroup', ['$compile', 'config',
        function ($compile, config) {
            // Description: Process individual group of profile questionnaire data. This may be entered recursively for sub-groups.
            // Usage: <fs-questionnaire-group question-group="group" answer-group="group" offset="2" cols="10" ng-model="vm.answers" value-sets="vm.valueSets" />
            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    answerGroup: '=?',
                    questionGroup: '=?',
                    offset: '=',
                    cols: '=',
                    ngModel: '=',
                    valueSets: '=?'
                }
            };
            return directiveDefinitionObject;

            function link(scope, iElem, iAttrs) {
                var groupMembers;
                var typeValue = undefined;
                var fhirType = undefined;
                var newOffset = scope.offset + 1;
                var newCol = scope.cols - 1;

                if (angular.isDefined(scope.questionGroup)) {
                    var newGroup = {};
                    newGroup.linkId = scope.questionGroup.linkId;
                    newGroup.title = scope.questionGroup.title;
                    if (angular.isDefined(scope.questionGroup.question)) {
                        newGroup.question = [];
                    } else if (angular.isDefined(scope.questionGroup.group)) {
                        newGroup.group = {};
                        scope.answerGroup.group = newGroup;
                    }
                    if (angular.isArray(scope.answerGroup)) {
                        scope.answerGroup.push(newGroup);
                    }
                }
                var groupIndex = scope.answerGroup.length - 1;

                if (scope.questionGroup.repeats) {
                    _.forEach(scope.questionGroup.question, function (item) {
                        var id = item.linkId;
                        if (angular.isDefined(groupMembers)) {
                            groupMembers = groupMembers + '..' + id;
                        } else {
                            groupMembers = id;
                        }
                    });
                }

                if (scope.questionGroup.extension) {
                    var groupType = _.find(scope.questionGroup.extension, {'url': 'http://www.healthintersections.com.au/fhir/Profile/metadata#type'});
                    if (groupType) {
                        typeValue = groupType.valueString;
                        if (_.contains(config.fhirPrimitiveTypes, typeValue)) {
                            fhirType = config.fhirTypes.Primitive;
                        } else if (_.contains(config.fhirComplexTypes, typeValue)) {
                            fhirType = config.fhirTypes.Complex;
                        } else if (_.contains(config.fhirResources, typeValue)) {
                            fhirType = config.fhirTypes.Resource;
                        }
                    }
                }

                var groupTemplate = '<div class="form-group col-md-12" >' +
                    '<legend>{{questionGroup.linkId | questionnaireLabel }}</legend>' +
                    '<span class="help-block">{{questionGroup.text || (questionGroup.extension | questionnaireFlyover)}}</span>' +
                    '<div class="controls col-md-' + scope.cols + ' col-md-offset-' + scope.offset + '" @groupIdToken>';

                if (scope.questionGroup && angular.isArray(scope.questionGroup.group)) {
                    scope.answerGroup[groupIndex].group = [];
                    groupTemplate = groupTemplate +
                        '    <data-fs-questionnaire-groups question-groups="questionGroup.group" answer-group="answerGroup[' + groupIndex + '].group" " data-ng-model="ngModel" value-sets="valueSets" offset="' + newOffset + '" cols="' + newCol + '"/>' +
                        '  </div>' +
                        '</div>';
                } else {
                    groupTemplate = groupTemplate +
                        '    <div data-ng-repeat="q in questionGroup.question">' +
                        '      <data-fs-questionnaire-question question="q" question-group="questionGroup" answer-group="answerGroup[' + groupIndex + ']" " data-ng-model="ngModel" value-sets="valueSets" total-questions="' + (scope.questionGroup.question ? scope.questionGroup.question.length : 0) + '" group-type="' + fhirType + '"/>' +
                        '    </div>@repeatDirectiveToken' +
                        '  </div>' +
                        '</div>';
                }

                if (scope.questionGroup.repeats) {
                    groupTemplate = groupTemplate.replace('@groupIdToken', 'id="' + scope.questionGroup.linkId + '"');
                    var repeatDirective = '<fs-questionnaire-repeating-group group-id="' + scope.questionGroup.linkId + '" group-members="' + groupMembers + '" data-ng-model="ngModel" value-sets="valueSets" />';
                    groupTemplate = groupTemplate.replace('@repeatDirectiveToken', repeatDirective);
                } else {
                    groupTemplate = groupTemplate.replace('@groupIdToken', '');
                    groupTemplate = groupTemplate.replace('@repeatDirectiveToken', '');
                }

                $compile(groupTemplate)(scope, function (cloned) {
                    iElem.append(cloned);
                });
            }
        }
    ]);

    app.directive('fsQuestionnaireGroupList', ['$compile', '$filter',
        function ($compile, $filter) {
            // Description: Manages the list of saved group items
            // Usage:  <fs-questionnaire-group-list items="listArray" group-id="groupId"/>
            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    items: "="
                }
            };
            return directiveDefinitionObject;

            function link(scope, iElem, iAttrs) {
                var listTemplate = '<div data-ng-show="items.length>0" class="col-md-12">' +
                    ' <form>' +
                    '   <table class="table table-responsive">' +
                    '   <caption style="text-align: left">' + $filter('questionnaireLabel')(iAttrs.groupId) + ' list</caption> ' +
                    '     <tbody>' +
                    '       <tr data-ng-repeat="item in items"><td>{{item | renderObject }}</td><td><button data-ng-click="remove(item)">x</button></td>' +
                    '       </tr>' +
                    '     </tbody>' +
                    '   </table>' +
                    ' </form> ' +
                    '</div>';

                iElem.append($compile(listTemplate)(scope));

                scope.remove = function (item) {
                    _.remove(scope.items, function (i) {
                        return item.$$hashKey === i.$$hashKey;
                    });
                };
            }
        }
    ]);

    app.directive('fsQuestionnaireGroups', ['$compile', function ($compile) {
        // Description: Starting point for building profile questionnaire
        // Usage: <data-fs-questionnaire-groups question-groups="vm.questionnaire.group.group" offset="0" cols="12" ng-model="vm.answers" value-sets="valueSets" />
        var directiveDefinitionObject = {
            restrict: 'E',
            link: link,
            scope: {
                answerGroup: '=',
                questionGroups: '=',
                offset: '=',
                cols: '=',
                ngModel: '=',
                valueSets: '='
            }
        };
        return directiveDefinitionObject;

        function link(scope, iElem, iAttrs) {
            var newGrouping = '<data-fs-questionnaire-group data-ng-repeat="item in questionGroups" data-ng-model="ngModel" value-sets="valueSets" answer-group="answerGroup" question-group="item" offset="' + scope.offset + '" cols="' + scope.cols + '"/>';
            $compile(newGrouping)(scope, function (cloned) {
                iElem.replaceWith(cloned);
            });
        }
    }]);

    app.directive('fsQuestionnaireAutoFill', ['$compile', '$timeout', 'valuesetService',
        function ($compile, $timeout, valuesetService) {

            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    ngModel: '='
                }
            };
            return directiveDefinitionObject;

            function link(scope, iElem, iAttrs) {
//code as code.display for code in vm.languages | filter:$viewValue | limitTo:5
                var template = angular.element(
                    '<input type="text" autocomplete="off" />' +
                        '<ul id="autolist">' +
                        ' <li data-ng-repeat="coding in filteredValueset">{{coding.code}}</li>' +
                        '</ul>');

                // template = angular.element('<div><input type="text" /></div>');
                var input = template.find('input');

                // input.attr('data-ng-model', iAttrs.ngModel);
                input.attr('class', 'form-control');
                input.attr('id', iAttrs.id);
                input.attr('valueset', iAttrs.valueset);
                input.attr('placeholder', iAttrs.placeholder);

                $compile(template)(scope, function (cloned) {
                    iElem.append(cloned);
                });

                // Link function
                var noResultsItem = { "code": "", "display": "No Results", "system": ""};
                var noResults = [noResultsItem];
                var minKeyCount = iAttrs.minKeyCount || 5,
                    timer,
                    input = iElem.find('input');

                input.bind('keyup', fetchValueset);

                function fetchValueset(event) {
                    scope.val = event.target.value;
                    scope.$apply(function (scope) {
                        if (scope.val.length < minKeyCount) {
                            if (timer) {
                                $timeout.cancel(timer);
                            }
                            scope.filteredValueset = null;
                        } else {
                            if (timer) {
                                $timeout.cancel(timer);
                            }
                            timer = $timeout(function () {
                                valuesetService.getFilteredExpansion(iAttrs.valueset, scope.val)
                                    .then(function (data) {
                                        if (data && data.length > 0) {
                                            scope.filteredValueset = data;
                                        } else {
                                            scope.filteredValueset = noResults;
                                        }
                                    }, function (error) {
                                        console.log(error);
                                        scope.filteredValueset = noResults;
                                    });
                            }, 300);
                        }
                    });
                }

                input.bind('blur',
                    function (event) {
                        scope.filteredValueSet = null;
                    });
            }
        }]);

    app.directive('fsQuestionnaireQuestion', ['$rootScope', '$compile', '$filter', '$parse', 'common', 'questionnaireAnswerService', 'valuesetService',
        function ($rootScope, $compile, $filter, $parse, common, questionnaireAnswerService, valuesetService) {
            // Description: Renders the HTML input element for a specific question
            // Usage:  <fs-questionnaire-question question="q" ng-model="vm.answers" value-sets="valueSets" />
            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    answerGroup: '=',
                    questionGroup: '=',
                    question: '=?',
                    ngModel: '=',
                    valueSets: '=?'
                }
            };
            return directiveDefinitionObject;
            // Question type / Extension valueString
            // -------------  ----------------------
            // choice        / CodeableConcept - needs value set lookup - must also have options property for question of type choice (if not, make this a simple text input)
            // open-choice   / CodeableConcept - needs valueset and drop down must also have options property for question of type choice (if not, make this a simple text input)
            // reference     / ResourceReference - valueString will identify resource type in ext with url = http://www.healthintersections.com.au/fhir/Profile/metadata#reference
            // fhirPrimitives will be handled as strings, dates, numbers or booleans
            // need special handling for polymorphic properties (with [x] in linkId)
            function link(scope, iElem, iAttrs) {
                //var ngModelGet = scope.ngModel;
                var question = scope.question;
                var linkId = setLinkId(question.linkId, scope.questionGroup.repeats);
                var readOnlyView;
                var defaultValue = '';
                var $q = common.$q;
                //  setModel(ngModelGet, linkId.replace('[x]', ''), scope.questionGroup.repeats, null);

                var answeredQuestion = {};
                answeredQuestion.linkId = question.linkId;
                scope.answerType = $filter('questionnaireAnswerType')(question.type);
                answeredQuestion.answer = [];
                scope.answeredQuestion = answeredQuestion;
                scope.selectedCoding;
                scope.getFilteredValueset = getFilteredValueset;

                if (angular.isDefined(scope.questionGroup.question)) {
                    scope.answerGroup.question.push(answeredQuestion);
                }

                if (question.type === 'reference') {
                    if (angular.isArray(scope.questionGroup.extension)) {
                        var reference = _.find(scope.question.extension, function (item) {
                            return item.url === "http://www.healthintersections.com.au/fhir/Profile/metadata#reference";
                        });
                        var index = reference.valueString.indexOf('?');
                        if (index > 0) {
                            var ref = reference.valueString.slice(0, index);
                            scope.referenceType = ref.replace("/", "");
                        }
                    }
                    // if patient is subject of questionnaire - make readonly
                    if (scope.referenceType === 'Patient') {
                        var patient = questionnaireAnswerService.getPatientContext();
                        var relPath = patient.resourceId.substr(patient.resourceId.indexOf("/Patient/") + 1);
                        var answer = {};
                        answer[scope.answerType] = { "reference": relPath };
                        scope.answeredQuestion.answer = [answer];
                        readOnlyView = patient.fullName;
                    }
                }

                //TODO: temporary for CC - use default date
                if (_.contains(['date', 'dateTime', 'instant'], question.type)) {
                    defaultValue = moment().format("YYYY-MM-DD");
                    var defaultDate = {};
                    defaultDate[scope.answerType] = defaultValue;
                    scope.answeredQuestion.answer = [defaultDate];
                }

                var template =
                    '  <input readOnlyToken@ requiredToken@' +
                        'type="' + $filter('questionnaireInputType')(question.type) + '" stepToken@' +
                        'id="' + linkId + '" ' +
                        'class="classToken@" valueToken@ ' +
                        'value="' + defaultValue + '"' +
                        'placeholder="' + question.text + '">repeatToken@ requiredIcon@' +
                        '</div>';

                if (_.contains(['choice', 'open-choice'], question.type)) {
                    var vsReference;
                    var needsFilter = false;
                    if (angular.isDefined(question.options)) {
                        vsReference = question.options.reference;
                        var filter = _.find(question.options.extension, function (item) {
                            return item.url === "http://www.healthintersections.com.au/fhir/Profile/metadata#expandNeedsFilter";
                        });
                        needsFilter = vsReference === "http://www.healthintersections.com.au/fhir/ValueSet/anything";
                    }
                    if (angular.isDefined(vsReference)) {
                        if (vsReference.indexOf('#') > -1) {
                            // local reference
                            buildLocalValueSet(vsReference);
                        } else if(needsFilter === false) {
                            buildExternalValueSet(vsReference);
                        } else {
                            scope.valuesetId = vsReference;
                        }
                        template =
                            ' <select ' +
                                'requiredToken@' +
                                'class="form-control"' +
                                'name="' + linkId + '" ' +
                                'id="' + linkId + '"> ' +
                                '</option><option value="">--</option>' +
                                '<option data-ng-repeat="coding in valueSet | orderBy:\'display\'" value="{{ coding }}" >' +
                                '{{coding.display || ""}}' +
                                '</select>requiredIcon@' +
                                '</div>';
                        if (needsFilter) {
                            template = '  <input requiredToken@' +
                                ' type="text"' +
                                ' id="' + linkId + '"' +
                                ' typeahead="code as code.display for code in getFilteredValueset($viewValue) | filter:$viewValue | limitTo:50"' +
                                ' typeahead-wait-ms="300"' +
                                ' class="form-control"' +
                                ' typeahead-min-length="5"' +
                                ' typeahead-editable="true"' +
                                ' data-ng-model="selectedCoding"' +
                                ' placeholder="' + question.text + '"/>requiredIcon@' +
                                '</div>';
                        }
                    }
                }

                template = question.type === 'boolean' ? template.replace("classToken@", "checkbox") : template.replace("classToken@", "form-control");
                template = angular.isDefined(readOnlyView) ? template.replace("valueToken@", 'value="' + readOnlyView + '"') : template.replace("valueToken@", "");
                template = angular.isDefined(readOnlyView) ? template.replace("readOnlyToken@", "readonly") : template.replace("readOnlyToken@", "");

                if (_.contains(['integer', 'decimal'], question.type)) {
                    template = template.replace("stepToken@", 'step="any"')
                } else {
                    template = template.replace("stepToken@", '');
                }
                if (question.repeats) {
                    var repeatDirective = '<fs-questionnaire-repeating-question model-id="' + linkId + '" data-ng-model="ngModel" answer-group="answerGroup" value-sets="valueSets" />';
                    template = template.replace("repeatToken@", repeatDirective);
                } else {
                    template = template.replace("repeatToken@", '');
                }

                if (question.required || (scope.questionGroup.required && (scope.questionGroup.question.length === 1))) {
                    template = template.replace("requiredToken@", "required ");
                    var requiredIcon = '<a href="#" class="fa fa-asterisk" tooltip="Required"></a>';
                    template = template.replace("requiredIcon@", requiredIcon);
                } else {
                    template = template.replace("requiredToken@", '');
                    template = template.replace("requiredIcon@", '');
                }

                if (iAttrs.totalQuestions > 1) {
                    template = '<label class="control-label" for="' + question.linkId + '">' + $filter('questionnaireLabel')(linkId) + '</label>&nbsp;&nbsp;' +
                        template;
                }
                template = '<div class="form-group-lg" >' + template;

                $compile(template)(scope, function (cloned) {
                    iElem.append(cloned);
                });

                function updateModel() {
                    scope.$apply(function () {
                        var element = document.getElementById(linkId);
                        var val = element.value;
                        if (_.contains(['choice', 'open-choice'], scope.question.type)) {
                            if (val.length > 2) {
                                val = JSON.parse(val);
                                if (linkId.indexOf('.coding') > 1) {
                                    common.$broadcast('codeableConceptUpdated', _.cloneDeep(val), linkId);
                                }
                            } else {
                                val = null;
                            }
                        } else if (scope.question.type == 'open-choice') {
                            //TODO: pending implementation of dynamic lookup
                            return;
                        } else if (scope.question.type === 'reference') {
                            val = { "display": val };  //TODO: will change once this has supporting lookup
                        } else if (scope.question.type === 'integer') {
                            val = parseInt(val);
                        }
                        var answer = {};
                        answer[scope.answerType] = val;
                        scope.answeredQuestion.answer = [answer];
                        //   setModel(ngModelGet, linkId.replace('[x]', ''), scope.repeats, val);
                    });
                }

                function getFilteredValueset (input) {
                    var deferred = $q.defer();
                    valuesetService.getFilteredExpansion(scope.valuesetId, input)
                        .then(function (data) {
                            if (data && data.length > 0) {
                                deferred.resolve(data);
                            } else {
                                deferred.resolve([]);
                            }
                        }, function (error) {
                            console.log(error);
                            defer.resolve([]);
                        });
                    return deferred.promise;
                }

                //TODO: break out control types into seperate directives?
                if (needsFilter === false) {
                    iElem.bind('change', updateModel);
                }
                $rootScope.$on('codeableConceptUpdated',
                    function (event, data, id) {
                        var matchId = id.replace("coding", "text");
                        if (matchId === linkId) {
                            var text = document.getElementById(matchId);
                            text.value = data.display;
                            var textAnswer = {};
                            textAnswer[scope.answerType] = data.display;
                            scope.answeredQuestion.answer = [textAnswer];
                        }
                    }
                );

                function buildLocalValueSet(vsReference) {
                    var options = [];
                    vsReference = vsReference.replace('#', '');
                    if (angular.isArray(scope.valueSets)) {
                        var valueSet;
                        _.forEach(scope.valueSets, function (vs) {
                            if (vs.id === vsReference) {
                                valueSet = vs;
                            }
                        });
                        _.forEach(valueSet.expansion.contains, function (item) {
                            var coding = {};
                            coding.code = item.code;
                            coding.display = item.display;
                            coding.system = item.system;
                            options.push(coding);
                        });
                    }
                    return scope.valueSet = options;
                }

                function buildExternalValueSet(vsReference) {
                    valuesetService.getExpansion(vsReference)
                        .then(function (expansions) {
                            return scope.valueSet = expansions;
                        }, function (error) {
                            //TODO - add proper error handler
                            var item = { "code": "any", "display": "Unavailable", "system": vsReference};
                            var options = [item];
                            return scope.valueSet = options;
                        });
                }

                function setModel(obj, path, repeats, value) {
                    if (repeats) {
                        return obj;
                    }
                    if (typeof path === "string") {
                        path = path.split('.');
                    }
                    if (path.length > 1) {
                        var p = path.shift();
                        if (obj[p] === null || !angular.isObject(obj[p])) {
                            obj[p] = {};
                        }
                        setModel(obj[p], path, repeats, value);
                    } else if (repeats) {
                        obj[path[0]] = [];
                    } else {
                        obj[path[0]] = value;
                    }
                    return obj;
                }

                // removes trailing "value"
                function setLinkId(path, repeats) {
                    if (repeats) {
                        return path;
                    }
                    if (typeof path === "string") {
                        path = path.split('.');
                        if (path[path.length - 1] === 'value') {
                            path.pop();
                        }
                    }
                    return path.join('.');
                }
            }
        }

    ])
    ;

    app.directive('fsQuestionnaireRepeatingGroup', ['$compile', '$filter', '$parse', 'common',
        function ($compile, $filter, $parse, common) {
            // Description: Manage repeating group of items.
            // Usage: <fs-questionnaire-repeating-group group-id="groupId" group-members="groupId" ng-model="vm.answers" />
            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    ngModel: '='
                }
            };
            return directiveDefinitionObject;

            function link(scope, iElem, iAttrs) {
                var groupId = iAttrs.groupId;
                var members = iAttrs.groupMembers.split('..');
                var localArray = [];
                var ngModelGet = $parse(iAttrs.ngModel)(scope);
                var logWarning = common.logger.getLogFn('fsQuestionnaireRepeatingGroup', 'warning');

                var template = '<div class="btn-group col-md-10">' +
                    '  <button type="button"' +
                    '          class="btn btn-info btn-xs"' +
                    '          data-ng-click="addToList()">' +
                    '          <i class="fa fa-plus"></i>&nbsp;Add to List' +
                    '  </button>' +
                    '</div>';

                var listDirective = '<fs-questionnaire-group-list items="ngModel.' + groupId + '" group-id="' + groupId + '" />';

                template = template + listDirective;

                scope.addToList = function () {
                    logWarning("Multiple responses not yet supported.");
                    return;
                    console.log('addRepeatingGroupToList::');
                    console.log(scope);
                    var addToArray = false;
                    var arrayItem = {};
                    var clonedGroup;

                    if (angular.isArray(scope.$parent.answerGroup)) {
                        var sourceGroup = _.find(scope.$parent.answerGroup, function (item) {
                            return (item.linkId === groupId && (item.question[0].answer.length === 0));
                        });
                        if (angular.isDefined(sourceGroup) && (angular.isArray(sourceGroup) === false)) {
                            clonedGroup = _.cloneDeep(sourceGroup);
                        }
                    }

                    // empty the input values
                    _.forEach(members, function (item) {
                        var element = document.getElementById(item);
                        var val = element.value;
                        if (val.length > 0) {
                            addToArray = true;
                            var path = item.replace(groupId + '.', '');
                            // add to cloned group
                            setArrayItem(arrayItem, path, val);
                            element.value = '';
                        }
                    });
                    if (addToArray) {
                        localArray.push(arrayItem);
                        setModel(ngModelGet, groupId, localArray);
                    }
                };

                scope.reset = function () {
                    _.forEach(members, function (item) {
                        var element = document.getElementById(item);
                        element.value = '';
                    });
                };

                $compile(template)(scope, function (cloned) {
                    iElem.replaceWith(cloned);
                });

                function setArrayItem(obj, path, value) {
                    if (typeof path === "string") {
                        path = path.split('.');
                    }
                    if (path.length > 1) {
                        var p = path.shift();
                        if (obj[p] === null || !angular.isObject(obj[p])) {
                            obj[p] = {};
                        }
                        setArrayItem(obj[p], path, value);
                    } else {
                        obj[path[0]] = value;
                    }
                    return obj;
                }

                function setModel(obj, path, value) {
                    if (typeof path === "string") {
                        path = path.split('.');
                    }
                    if (path.length > 1) {
                        var p = path.shift();
                        if (obj[p] === null || !angular.isObject(obj[p])) {
                            obj[p] = {};
                        }
                        setModel(obj[p], path, value);
                    } else {
                        obj[path[0]] = value;
                    }
                    return obj;
                }
            }
        }
    ]);

    app.directive('fsQuestionnaireRepeatingQuestion', ['$compile',
        function ($compile) {
            // Description: Manage repeating group of items.
            // Usage: <fs-questionnaire-repeating-question model-id="modelId" ng-model="vm.answers" />
            var directiveDefinitionObject = {
                restrict: 'E',
                link: link,
                scope: {
                    ngModel: '='
                }
            };
            return directiveDefinitionObject;

            function link(scope, iElem, iAttrs) {
                var modelLinkId = iAttrs.modelId;
                var template = '<span>' +
                    '  <a href="" ' +
                    '     data-ng-click="addToList()"' +
                    '     class="fa fa-plus-square-o">' +
                    '  </a>' +
                    '</span>';

                scope.addToList = function () {
                    console.log('addRepeatingQuestionToList::');
                    console.log(scope);
                };

                $compile(template)(scope, function (cloned) {
                    iElem.replaceWith(cloned);
                });
            }
        }
    ]);
})();