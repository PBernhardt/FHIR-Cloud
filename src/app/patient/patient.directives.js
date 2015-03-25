(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    app.directive('smartApplication', function (common, $http, $compile, $sce) {
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

                function isURLAvailable(launchUrl) {
                    var directiveId = 'smartApplication';
                    var logError = common.logger.getLogFn(directiveId, 'error');
                    var logInfo = common.logger.getLogFn(directiveId, 'info');
                    var $q = common.$q;
                    var noToast = false;
                    var deferred = $q.defer();

                    var url = encodeURIComponent(launchUrl);
                    var yqlUri = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22' + url + '%22&callback=JSON_CALLBACK';

                    $http.jsonp(yqlUri)
                        .success(function (data, status) {
                            if (data.results.length) {
                                logInfo(url + ' is available...', null, noToast);
                                deferred.resolve(true)
                            } else {
                                logError(url + ' failed: ' + status);
                                deferred.reject(false);
                            }
                        })
                        .error(function (data, status) {
                            logError(url + ' failed: ' + status);
                            deferred.reject('failed');
                        });
                    return deferred.promise;
                }

                scope.$watch('smartUrl', function (uri) {
                    var directiveId = 'smartApplication';
                    var logError = common.logger.getLogFn(directiveId, 'error');
                    var logInfo = common.logger.getLogFn(directiveId, 'info');
                    var noToast = false;

                    if (loadedUri !== uri) {
                        isURLAvailable(uri)
                            .then(function () {
                                logInfo('Uri is valid: ' + uri, null, noToast);
                                loadedUri = uri;

                                scope.trustedUri = $sce.trustAsResourceUrl(scope.smartUrl);

                                var iFrameHtml = '<iframe src="{{trustedUri}}" style="height: 1280px; width: 800px;" allowfullscreen="" frameborder="0"></iframe>';

                                var markup = $compile(iFrameHtml)(scope);
                                element.empty();
                                element.append(markup);
                            })
                            .catch(function () {
                                console.log('directive: uri invalid');
                                var badRequestImgHtml = '<md-icon md-font-icon="error" alt="SMART App Unavailable">';

                                var markup = $compile(badRequestImgHtml)(scope);

                                logError(scope.errorUrl, null, noToast);
                                element.empty();
                                element.append(markup);
                            });
                    }
                })
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