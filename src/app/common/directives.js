﻿(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    app.directive('fcGenderIcon', ['$compile', function ($compile) {
        /*
         Usage: <fc-gender-icon gender="male/female/etc."></fc-gender-icon>
         */
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'gender': '=?'
            },
            link: function (scope, element, attr) {
                var gender = scope.gender;
                if (angular.isDefined(gender)) {
                    gender = gender.toLowerCase();
                    var iconTemplate = '<md-icon md-svg-icon="' + gender + '" style="height: 12px; width=12px"></md-icon>';
                    element.append($compile(iconTemplate)(scope));
                }
            }
        };
        return directiveDefinitionObject;
    }]);

    app.directive('fsAddListItem', ['$parse', function ($parse) {
        // Description:
        //
        // Usage: <div data-fs-add-list-item="item" on-change="addListItem()"></div>
        function link(scope, element, attrs) {
            var modelGet = $parse(attrs.fsAddListItem);
            var modelSet = modelGet.assign;
            var onChange = $parse(attrs.onChange);

            var updateModel = function () {
                scope.$apply(function () {
                    modelSet(scope, element[0].files[0]);
                    onChange(scope);
                });
            };
            element.bind('change', updateModel);
        }

        var directive = {
            restrict: "EA",
            template: "<input multiple='false' type='file' />",
            replace: true,
            link: link
        };
        return directive;
    }]);

    app.directive('fcAddressList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'addresses': '=addresses'
            },
            templateUrl: 'templates/addressList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcContactPointList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'contactPoints': '=contactPoints'
            },
            templateUrl: 'templates/contactPointList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcExtensionList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'extensions': '=extensions'
            },
            templateUrl: 'templates/extensionList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcHumanNameList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'names': '=names'
            },
            templateUrl: 'templates/humanNameList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcIdentifierList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'identifiers': '=identifiers'
            },
            templateUrl: 'templates/identifierList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcLanguageList', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'languages': '=languages'
            },
            templateUrl: 'templates/languageList.html'
        };
        return directiveDefinitionObject;
    });

    app.directive('fcOrganizationReference', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'organization': '=organization',
                'title': '@'
            },
            templateUrl: 'templates/organizationReference.html',
            controller: function ($filter, $location, $mdDialog, $scope) {
                $scope.goToManagingOrganization = function (resourceReference) {
                    if ($mdDialog) {
                        $mdDialog.hide();
                    }
                    var id = ($filter)('idFromURL')(resourceReference);
                    $location.path('/organization/get/' + id);
                };
            }
        };
        return directiveDefinitionObject;
    });

    app.directive('fcResourceView', [function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'resourceId': '=resourceId',
                'show': '&show'
            },
            templateUrl: 'templates/resourceView.html'
        };
        return directiveDefinitionObject;
    }]);

    app.directive('fsPagination', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'click': '&onClick',
                'links': '=links',
                'refresh': '=?'
            },
            templateUrl: 'templates/pagination.html',
            link: function (scope, element, attr) {
                scope.$watch('links', function (links) {
                        if (links) {
                            scope.refresh = _.remove(links,
                                function (item) {
                                    return (item.relation === 'self');
                                });
                        }
                    }
                );
            }
        };
        return directiveDefinitionObject;
    });

    app.directive('fsAddToList', [function () {
        function link(scope, element, attrs) {
            scope.$watch('fsAddToList', function (value) {
                if (value === true) {
                    attrs.$set('class', 'glyphicon glyphicon-plus');
                    attrs.$set('tooltip', 'Add item to list');
                    // <span class="glyphicon glyphicon-plus"></span>
                }
            });
        }

        // Description: if value is true, set image to check mark
        // Usage: <i data-add-to-list="vm.isRequired"/></i>
        var directive = {
            restrict: 'A',
            replace: true,
            link: link,
            scope: {
                fsAddToList: "=?"
            }
        };
        return directive;

    }]);

    app.directive('fsFileInput', function ($parse) {
        // Description:
        //
        // Usage: <div fs-file-input="file" on-change="readFile()"></div>
        function link(scope, element, attrs) {
            var modelGet = $parse(attrs.fsFileInput);
            var modelSet = modelGet.assign;
            var onChange = $parse(attrs.onChange);

            var updateModel = function () {
                scope.$apply(function () {
                    modelSet(scope, element[0].files[0]);
                    onChange(scope);
                });
            };
            element.bind('change', updateModel);
        }

        var directive = {
            restrict: "EA",
            template: "<input multiple='false' type='file' />",
            replace: true,
            link: link
        };
        return directive;

    });

    app.directive('fsImgPerson', ['config', function (config) {
        //Usage:
        //<img data-fs-img-person="vm.person.photo[0]"/>
        function link(scope, element, attrs) {
            scope.$watch('fsImgPerson', function (value) {
                var imgSource = config.imageSettings.unknownPersonImageSource;
                if (value) {
                    if (value.url) {
                        imgSource = value.url;
                    } else if (value.data) {
                        imgSource = 'data:' + value.contentType + ';base64,' + value.data;
                    }
                }
                attrs.$set('src', imgSource);
            });
        }

        var directive = {
            link: link,
            scope: {
                fsImgPerson: "=?"
            },
            restrict: 'A'
        };
        return directive;
    }]);

    app.directive('fsRepeats', [function () {
        // Description: if value is true, set image to check mark
        // Usage: <i data-fs-repeats="vm.isRepeatable"/></i>
        function link(scope, element, attrs) {
            scope.$watch('fsRepeats', function (value) {
                if (value === true) {
                    attrs.$set('class', 'fa fa-repeat');
                }
            });
        }

        var directive = {
            restrict: 'A',
            replace: true,
            link: link,
            scope: {
                fsRepeats: "=?"
            }
        };
        return directive;
    }]);

    app.directive('fsRequired', [function () {
        // Description: if value is true, set image to check mark
        // Usage: <i data-fs-required="vm.isRequired"/></i>

        function link(scope, element, attrs) {
            scope.$watch('fsRequired', function (value) {
                if (value === true) {
                    attrs.$set('class', 'fa fa-asterisk');
                }
            });
        }

        var directive = {
            restrict: 'A',
            replace: true,
            link: link,
            scope: {
                fsRequired: "=?"
            }
        };
        return directive;
    }]);

    app.directive('fsSearchItem', function () {
        // Description:
        //  renders search results in list
        //
        // Usage:
        //   <data-fs-search-item name="" resourceId="" summary="" />
        var directive = {
            restrict: 'E',
            replace: true,
            require: true,
            templateUrl: '/templates/searchItem.html',
            scope: {
                name: "@name",
                resourceid: "@resourceid",
                summary: "@summary"
            }
        };
        return directive;
    });

    app.directive('fsTrueCheck', [function () {
        // Description: if value is true, set image to check mark
        // Usage: <i data-fs-true-check="vm.isRequired"/></i>
        function link(scope, element, attrs) {
            scope.$watch('fsTrueCheck', function (value) {
                if (value === true) {
                    attrs.$set('class', 'fa fa-check');
                }
            });
        }

        var directive = {
            restrict: 'A',
            replace: true,
            link: link,
            scope: {
                fsTrueCheck: "=?"
            }
        };
        return directive;

    }]);
})();