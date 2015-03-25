(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    app.directive('smartApplication', function () {
        // Description:
        //
        // Usage: <smart-application app="{app}"?fhirServiceUrl={server}&patient="{patient}"></smart-application>
        var directiveDefinitionObject = {
            restrict: 'EA',
            scope: {
                'app': '=app',
                'patient': '=patient',
                'server': '=server'
            },
            templateUrl: 'templates/smart-app.html',
            link: function (scope, element, attr) {

            }
        };
        return directiveDefinitionObject;
    });

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