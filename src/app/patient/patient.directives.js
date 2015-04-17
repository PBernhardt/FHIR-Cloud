(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    app.directive('smartApp', ['$compile', '$sce', function ($compile, $sce) {
        // Description:
        //
        // Usage:
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'smartUrl': '=smartUrl'
            },
            link: function (scope, element, attr) {
                var loadedUri = '';

                scope.$watch('smartUrl', function (uri) {
                    if (loadedUri !== uri) {
                        loadedUri = uri;

                        scope.trustedUri = $sce.trustAsResourceUrl(scope.smartUrl);

                        var iFrameHtml = '<iframe src="{{trustedUri}}" style="height: 1280px; width: 800px;" allowfullscreen="" frameborder="0"></iframe>';
                     //   var iFrameHtml = '<a href="{{trustedUri}}" target="_blank">SMART App</a>';
                        var markup = $compile(iFrameHtml)(scope);
                        element.empty();
                        element.append(markup);
                    }
                })
            }
        };
        return directiveDefinitionObject;
    }]);

    app.directive('fhirClinicalResource', function () {
        var directiveDefinitionObject = {
            restrict: 'E',
            scope: {
                'resource': '=resource?'
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
})();