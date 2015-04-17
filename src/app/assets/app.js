(function () {
    'use strict';

    var app = angular.module('FHIRCloud', [
        // Angular modules
        'ngAnimate',        // animations
        'ngMaterial',       // material design
        'ngRoute',         // routing,
        'ngSanitize',
        'ngMessages',
        'ngCookies',
        'common',
        'ui.bootstrap'
    ]);
})();
(function () {
    'use strict';

    // Define the common module
    // Contains services:
    //  - common
    //  - logger
    var commonModule = angular.module('common', []);

    // Must configure the common service and set its
    // events via the commonConfigProvider
    commonModule.provider('commonConfig', function () {
        this.config = {
            // These are the properties we need to set
            //controllerActivateSuccessEvent: '',
        };
        this.$get = function () {
            return {
                config: this.config
            };
        };
    });

    function common($http, $location, $q, $rootScope, $timeout, $window, commonConfig, logger) {

        function activateController(promises, controllerId) {
            return $q.all(promises).then(function (eventArgs) {
                var data = {controllerId: controllerId};
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        }

        function changeServer(server) {
            if (angular.isDefined(server)) {
                var data = {"activeServer": server};
                $window.localStorage.removeItem("patient");
                $window.localStorage.removeItem("organization");
                var currentLocation = $location.path();
                if ((currentLocation !== '/patient') && (currentLocation !== '/organization') ) {
                    $location.path('/home');
                }
                $broadcast(commonConfig.config.serverChangeEvent, data);
            }
        }

        //TODO: remove this
        function toggleProgressBar(show) {
            var data = {show: show};
            $broadcast(commonConfig.config.progressToggleEvent, data);
        }

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        }

        function generateUUID() {
            var d = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });
        }

        function isNumber(val) {
            // negative or positive
            return /^[-]?\d+$/.test(val);
        }

        function isAbsoluteUri(input) {
            // ^(?:[a-z]+:)?//
            //    ^ - beginning of the string
            //        (?: - beginning of a non-captured group
            //            [a-z]+ - any character of 'a' to 'z' 1 or more times
            //            : - string (colon character)
            //    )? - end of the non-captured group. Group appearing 0 or 1 times
            //// - string (two forward slash characters)
            //        'i' - non case-sensitive flag
            var r = new RegExp('^(?:[a-z]+:)?//', 'i');
            return r.test(input);
        }

        function makeHumanName(nameText) {
            var humanName = {
                "given": [],
                "family": [],
                "text": nameText
            };
            if (nameText) {
                var nameParts = nameText.split(" ");
                var len = parseInt(nameParts.length, 10);
                var mid = parseInt(Math.ceil(len / 2), 10);
                for (var i = 0; i < mid; i++) {
                    humanName.given.push(nameParts[i]);
                    if (nameParts[mid + i]) {
                        if (len % 2 > 0 && i > 0) {
                            humanName.family.push(nameParts[mid + i]);
                        } else {
                            humanName.family.push(nameParts[mid + i]);
                        }
                    }
                }
            }
            return humanName;
        }

        function mapDisplayToCoding(display, coding) {
            var foundItem;
            for (var i = 0; i < coding.length; i++) {
                if (display === coding[i].display) {
                    foundItem = coding[i];
                    break;
                }
            }
            return foundItem;
        }

        function removeNullProperties(target) {
            Object.keys(target).map(function (key) {
                if (target[key] instanceof Object) {
                    if (!Object.keys(target[key]).length && typeof target[key].getMonth !== 'function') {
                        delete target[key];
                    } else {
                        removeNullProperties(target[key]);
                    }
                } else if (target[key] === null) {
                    delete target[key];
                }
            });
            return target;
        }

        function setResourceId(resourceId, resourceVersionId) {
            var id = resourceId;
            if (angular.isUndefined(resourceVersionId) === false) {
                if (angular.isUndefined(resourceId)) {
                    var index = resourceVersionId.indexOf('/_history');
                    if (index > 0) {
                        id = resourceVersionId.substring(0, index);
                    } else {
                        id = resourceVersionId;
                    }
                }
            }
            return id;
        }

        function textContains(text, searchText) {
            return text && -1 !== text.toLowerCase().indexOf(searchText.toLowerCase());
        }

        function unexpectedOutcome(error) {
            var message = 'Unexpected response from server - ';
            if (error.status) {
                message = message + 'HTTP Status: ' + error.status;
            }
            if (error.outcome && error.outcome.issue) {
                _.forEach(error.outcome.issue, function (item) {
                    message = message + ': ' + item.severity + ' - ' + item.details;
                });
            }
            return message;
        }

        function randomHash() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }

        var service = {
            // common angular dependencies
            $broadcast: $broadcast,
            $http: $http,
            $q: $q,
            $timeout: $timeout,
            // generic
            activateController: activateController,
            changeServer: changeServer,
            generateUUID: generateUUID,
            isAbsoluteUri: isAbsoluteUri,
            isNumber: isNumber,
            logger: logger, // for accessibility
            makeHumanName: makeHumanName,
            mapDisplayToCoding: mapDisplayToCoding,
            randomHash: randomHash,
            removeNullProperties: removeNullProperties,
            setResourceId: setResourceId,
            shuffle: shuffle,
            textContains: textContains,
            toggleProgressBar: toggleProgressBar,
            unexpectedOutcome: unexpectedOutcome
        };

        return service;
    }

    commonModule.factory('common',
        ['$http', '$location', '$q', '$rootScope', '$timeout', '$window', 'commonConfig', 'logger', common]);
})();(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    var imageSettings = {
        imageBasePath: './assets/jpeg/',
        unknownPersonImageSource: './assets/jpeg/unknown_person.jpg'
    };

    var keyCodes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        del: 46
    };

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        progressToggle: 'progress.toggle',
        serverChanged: 'server.changed'
    };

    var config = {
        appErrorPrefix: '[FS Error] ', //Configure the exceptionHandler decorator
        docTitle: 'FHIRCloud: ',
        events: events,
        imageSettings: imageSettings,
        keyCodes: keyCodes,
        version: '0.1.0'
    };

    app.value('config', config);

    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);

    /*
     app.config(['$locationProvider', function ($locationProvider) {
     $locationProvider.html5Mode(true);
     }]);
     */

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/conformance', {
            templateUrl: 'conformance/conformance-search.html'
        }).when('/conformance/view/:hashKey', {
            templateUrl: 'conformance/conformance-view.html'
        }).when('/consultation', {
            templateUrl: 'consultation/consultation-edit.html'
        }).when('/consultation/smart/:smartApp/:patientId', {
            templateUrl: 'consultation/consultation-smart.html'
        }).when('/extensionDefinition', {
            templateUrl: 'extensionDefinition/extensionDefinition-search.html'
        }).when('/extensionDefinition/view/:hashKey', {
            templateUrl: 'extensionDefinition/extensionDefinition-view.html'
        }).when('/extensionDefinition/edit/:hashKey', {
            templateUrl: 'extensionDefinition/extensionDefinition-edit.html'
        }).when('/home', {
            templateUrl: 'home/home.html'
        }).when('/lab', {
            templateUrl: 'lab/lab-edit.html'
        }).when('/operationDefinition', {
            templateUrl: 'operationDefinition/operationDefinition-search.html'
        }).when('/operationDefinition/view/:hashKey', {
            templateUrl: 'operationDefinition/operationDefinition-view.html'
        }).when('/operationDefinition/edit/:hashKey', {
            templateUrl: 'operationDefinition/operationDefinition-edit.html'
        }).when('/organization', {
            templateUrl: 'organization/organization-search.html'
        }).when('/organization/get/:id', {
            templateUrl: 'organization/organization-view.html'
        }).when('/organization/detailed-search', {
            templateUrl: 'organization/organization-detailed-search.html'
        }).when('/organization/view/:hashKey', {
            templateUrl: 'organization/organization-view.html'
        }).when('/organization/edit/:hashKey', {
            templateUrl: 'organization/organization-edit.html'
        }).when('/organization/get/:resourceId', {
            templateUrl: 'organization/organization-view.html'
        }).when('/patient/org/:orgId', {
            templateUrl: 'patient/patient-detailed-search.html'
        }).when('/patient', {
            templateUrl: 'patient/patient-search.html'
        }).when('/patient/get/:id', {
            templateUrl: 'patient/patient-view.html'
        }).when('/patient/view/:hashKey', {
            templateUrl: 'patient/patient-view.html'
        }).when('/patient/edit/:hashKey', {
            templateUrl: 'patient/patient-edit.html'
        }).when('/patient/detailed-search', {
            templateUrl: 'patient/patient-detailed-search.html'
        }).when('/practitioner', {
            templateUrl: 'practitioner/practitioner-search.html'
        }).when('/person', {
            templateUrl: 'person/person-search.html'
        }).when('/person/view/:hashKey', {
            templateUrl: 'person/person-view.html'
        }).when('/person/edit/:hashKey', {
            templateUrl: 'person/person-edit.html'
        }).when('/profile', {
            templateUrl: 'profile/profile-search.html'
        }).when('/profile/view/:hashKey', {
            templateUrl: 'profile/profile-view.html'
        }).when('/profile/edit/:hashKey', {
            templateUrl: 'profile/profile-edit.html'
        }).when('/healthcareService', {
            templateUrl: 'templates/home.html'
        }).when('/relatedPerson', {
            templateUrl: 'relatedPerson/relatedPerson-search.html'
        }).when('/relatedPerson/view/:hashKey', {
            templateUrl: 'relatedPerson/relatedPerson-view.html'
        }).when('/relatedPerson/edit/:hashKey', {
            templateUrl: 'person/person-edit.html'
        }).when('/valueSet', {
            templateUrl: 'valueSet/valueSet-search.html'
        }).when('/valueSet/view/:hashKey', {
            templateUrl: 'valueSet/valueSet-view.html'
        }).when('/valueSet/edit/:hashKey', {
            templateUrl: 'valueSet/valueSet-edit.html'
        })
            .when('/daf/:profile', {
                templateUrl: 'templates/daf.html'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }]);

    app.config(['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('green');

        $mdIconProvider
            .icon("actions", "./assets/svg/actions.svg", 24)
            .icon("account", "./assets/svg/account.svg", 24)
            .icon("add", "./assets/svg/add.svg", 24)
            .icon("cardio", "./assets/svg/cardio3.svg", 24)
            .icon("cloud", "./assets/svg/cloud.svg", 24)
            .icon("delete", "./assets/svg/delete.svg", 24)
            .icon("diagnosis", "./assets/svg/stethoscope.svg", 24)
            .icon("edit", "./assets/svg/edit.svg", 24)
            .icon("error", "./assets/svg/error.svg", 48)
            .icon("family", "./assets/svg/group.svg", 24)
            .icon("female", "./assets/svg/female.svg", 24)
            .icon("fire", "./assets/svg/fire.svg", 24)
            .icon("group", "./assets/svg/group.svg", 24)
            .icon("groupAdd", "./assets/svg/groupAdd.svg", 24)
            .icon("healing", "./assets/svg/healing.svg", 24)
            .icon("hospital", "./assets/svg/hospital.svg", 24)
            .icon("https", "./assets/svg/https.svg", 24)
            .icon("lab", "./assets/svg/lab3.svg", 24)
            .icon("list", "./assets/svg/list.svg", 24)
            .icon("male", "./assets/svg/male.svg", 24)
            .icon("menu", "./assets/svg/menu.svg", 24)
            .icon("more", "./assets/svg/more.svg", 24)
            .icon("openId", "./assets/svg/openId.svg", 24)
            .icon("organization", "./assets/svg/hospital.svg", 24)
            .icon("person", "./assets/svg/person.svg", 24)
            .icon("personAdd", "./assets/svg/personAdd.svg", 24)
            .icon("practitioner", "./assets/svg/md.svg", 24)
            .icon("refresh", "./assets/svg/refresh.svg", 24)
            .icon("rx", "./assets/svg/rx.svg", 24)
            .icon("saveToCloud", "./assets/svg/saveToCloud.svg", 24)
            .icon("saveToList", "./assets/svg/saveToList.svg", 24)
            .icon("search", "./assets/svg/search.svg", 24)
            .icon("settings", "./assets/svg/settings.svg", 24)
            .icon("smart", "./assets/svg/SMART.svg", 24)
            .icon("view", "./assets/svg/visibility.svg", 12)
            .icon("vitals", "./assets/svg/pulse1.svg", 24);
    }]);

    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common = {'Accept': 'application/json+fhir, application/json, text/plain, */*'};
        $httpProvider.defaults.headers.put = {'Content-Type': 'application/json+fhir'};
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/json+fhir'};
    }]);

    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.progressToggleEvent = config.events.progressToggle;
        cfg.config.serverChangeEvent = config.events.serverChanged;
    }]);

    app.config(['$compileProvider', function ($compileProvider) {
        //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
        //  chrome-extension: will be added to the end of the expression
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    }]);
})();(function () {
    'use strict';

    var serviceId = 'dataCache';

    function dataCache($cacheFactory) {

        var fhirCache = $cacheFactory('fhirCache', {capacity: 20});

        function addToCache(key, value) {
            fhirCache.put(key, value);
        }

        function getCacheStats() {
            return fhirCache.info();
        }

        function getItemFromCache(hash, key) {
            var foundItem;
            if (hash && key) {
                var items = readFromCache(key);
                if (items) {
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (items[i].$$hashKey === hash) {
                            foundItem = items[i];
                            break;
                        }
                    }
                }
            }
            return foundItem;
        }

        function readFromCache(key) {
            return fhirCache.get(key);
        }

        var service = {
            addToCache: addToCache,
            readFromCache: readFromCache,
            getCacheStats: getCacheStats,
            getItemFromCache: getItemFromCache
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$cacheFactory', dataCache]);

})();
(function () {
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
})();(function () {
    'use strict';

    var serviceId = 'fhirClient';

    function fhirClient($http, common) {
        var $q = common.$q;

        function addResource(baseUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            $http.post(baseUrl, fhirResource)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status) {
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function deleteResource(resourceUrl) {
            var deferred = $q.defer();
            $http.delete(resourceUrl)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status, headers) {
                    if (status === 410) {
                        // already deleted
                        var results = {};
                        results.data = data;
                        results.status = status;
                        results.headers = headers;
                        deferred.resolve(results);
                    } else {
                        var error = { "status": status, "outcome": data };
                        deferred.reject(error);
                    }
                });
            return deferred.promise;
        }

        function getResource(resourceUrl) {
            var deferred = $q.defer();
            $http.get(resourceUrl)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status) {
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function updateResource(resourceUrl, resource) {
            var fhirResource = common.removeNullProperties(resource);
            var deferred = $q.defer();
            $http.put(resourceUrl, fhirResource)
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;
                    deferred.resolve(results);
                })
                .error(function (data, status) {
                    var error = { "status": status, "outcome": data };
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        var service = {
            deleteResource: deleteResource,
            getResource: getResource,
            addResource: addResource,
            updateResource: updateResource
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', fhirClient]);


})();(function () {
    'use strict';

    var serviceId = 'fhirServers';

    function fhirServers($cookieStore, $window, common, dataCache) {
        var $q = common.$q;

        function getActiveServer() {
            var activeServer = dataCache.readFromCache('activeServer');
            if (angular.isUndefined(activeServer)) {
                activeServer = $cookieStore.get('activeServer');
            }
            if (angular.isUndefined(activeServer)) {
                if (angular.isDefined($window.localStorage.activeServer) && ($window.localStorage.activeServer !== null)) {
                    activeServer = JSON.parse($window.localStorage.activeServer);
                }
            }
            if (angular.isUndefined(activeServer)) {
                getAllServers()
                    .then(function (servers) {
                        activeServer = servers[0];
                        setActiveServer(activeServer);
                    });
            }
            return $q.when(activeServer);
        }

        function setActiveServer(server) {
            dataCache.addToCache('activeServer', server);
            $cookieStore.put('activeServer', server);
            $window.localStorage.activeServer = JSON.stringify(server);
        }

        function getAllServers() {
            var deferred = $q.defer();
            try {
                var baseList = [
                    {
                        "id": 0,
                        "name": "SMART",
                        "baseUrl": "https://fhir-open-api-dstu2.smarthealthit.org",
                        "secure": true
                    },
                    {
                        "id": 1,
                        "name": "HAPI",
                        "baseUrl": "https://fhirtest.uhn.ca/baseDstu2",
                        "secure": true
                    },
                    {
                        "id": 2,
                        "name": "RelayHealth",
                        "baseUrl": "https://api.stage.data.relayhealth.com/rhc/fhirservice",
                        "secure": true
                    },
                    {
                        "id": 3,
                        "name": "Health Directions",
                        "baseUrl": "http://fhir-dev.healthintersections.com.au/open",
                        "secure": false
                    },
                    {
                        "id": 4,
                        "name": "Argonaut Reference",
                        "baseUrl": "http://argonaut.healthintersections.com.au/open",
                        "secure": false
                    }
                    /*                   , {
                     "id": 7,
                     "name": "HealthConnex",
                     "baseUrl": "http://sqlonfhir.azurewebsites.net/api"
                     },

                     {
                     "id": 8,
                     "name": "EPIC",
                     "baseUrl": "http://open.epic.com/Clinical/FHIR"
                     },
                     {
                     "id": 9,
                     "name": "Cerner",
                     "baseUrl": "https://fhir.sandboxcernerpowerchart.com/fhir/open/d075cf8b-3261-481d-97e5-ba6c48d3b41f",
                     "secure": true
                     },
                     {
                     "id": 10,
                     "name": "AEGIS",
                     "baseUrl": "http://wildfhir.aegis.net/fhir2"
                     }*/
                ];
                var servers = dataCache.readFromCache('servers');
                if (angular.isUndefined(servers)) {
                    servers = baseList;
                    dataCache.addToCache('servers', servers);
                }
                deferred.resolve(servers);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }

        function getServerById(id) {
            var deferred = $q.defer();
            var server = null;
            getAllServers()
                .then(function (servers) {
                    for (var i = 0, len = servers.length; i < len; i++) {
                        if (servers[i].id === id) {
                            server = servers[i];
                            break;
                        }
                    }
                    return deferred.resolve(server);
                });
            return deferred.promise;
        }

        var service = {
            getAllServers: getAllServers,
            getServerById: getServerById,
            getActiveServer: getActiveServer,
            setActiveServer: setActiveServer
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$cookieStore', '$window', 'common', 'dataCache', fhirServers]);

})();(function () {
    'use strict';

    var serviceId = 'fileReader';

    function fileReader(common) {
        var $q = common.$q;

        function readAsDataUrl(file, scope) {
            var deferred = $q.defer();
            var reader = _getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        }

        function _getReader(deferred, scope) {
            var reader = new FileReader();
            reader.onload = _onLoad(reader, deferred, scope);
            reader.onerror = _onError(reader, deferred, scope);
            reader.onprogress = _onProgress(reader, scope);
            return reader;
        }

        function _onError(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        }

        function _onLoad(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        }

        function _onProgress(reader, scope) {
            return function (event) {
                scope.$broadcast("fileProgress",
                    {
                        total: event.total,
                        loaded: event.loaded
                    });
            };
        }
        var service = {
            readAsDataUrl: readAsDataUrl
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', fileReader]);


})();(function () {
    'use strict';

    var app = angular.module('FHIRCloud');

    app.filter('lastUrlPart', function () {
        return function (input) {
            var urlParts = input.split("/");
            if (angular.isArray(urlParts)) {
                return urlParts[urlParts.length - 1];
            } else {
                return input;
            }
        };
    });

    app.filter('displayAge', function() {
        return function (birthDate) {
            if (birthDate) {
                var retValue;
                var dob = birthDate;
                if (angular.isDate(dob) === false) {
                    dob = new Date(birthDate);
                }

                var ageDifMs = Date.now() - dob.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                var years = Math.floor(ageDate.getUTCFullYear() - 1970);
                retValue = "age " + years;
                if (years < 2) {
                    var months = Math.floor(ageDifMs/2628000000);
                    retValue = "age " + months + ' months';

                    if (months < 6) {
                        var weeks = Math.floor(ageDifMs/604800000);
                        retValue = "age " + weeks + ' weeks';
                    }
                }
                return retValue;
            } else {
                return "unknown";
            }
        }
    });

    app.filter('codeableConcept', function () {
        return function (codeableConcept) {
            if (angular.isUndefined(codeableConcept)) {
                return '';
            } else if (angular.isArray(codeableConcept.coding)) {
                if (codeableConcept.text) {
                    return codeableConcept.text;
                } else {
                    var item = _.first(codeableConcept.coding, 'display');
                    if (item && angular.isArray(item) && item.length > 0) {
                        return item[0].display;
                    } else if (item && item.display) {
                        return item.display;
                    } else {
                        return "No display text for code: (" + item.system + ":" + item.code + ")";
                    }
                }
            } else {
                return "Bad input";
            }
        };
    });

    app.filter('smartUrl', function ($sce) {
        return function (appUrl, fhirServer, patientId) {
            var launchUrl = appUrl + '?fhirServiceUrl=' + fhirServer + '&patient=' + patientId;
            return $sce.trustAsResourceUrl(launchUrl);
        }
    });

    app.filter('dateString', function () {
        return function (dateTime) {
            if (angular.isDefined(dateTime)) {
                return moment(dateTime).format('YYYY-MM-DD');
            }
        }
    });

    app.filter('fullName', function () {
        function buildName(input) {
            if (input && angular.isArray(input)) {
                return input.join(' ');
            } else {
                return '';
            }
        }

        return function (humanName) {
            if (humanName && angular.isArray(humanName)) {
                return buildName(humanName[0].given) + ' ' + buildName(humanName[0].family);
            } else if (humanName && humanName.given) {
                return buildName(humanName.given) + ' ' + buildName(humanName.family);
            } else {
                return 'Name Unknown';
            }
        };
    });

    app.filter('idFromURL', function () {
        return function (uri) {
            if (uri.length > 5) {
                var pathArray = uri.split('/');
                return pathArray[pathArray.length - 1];
            }
        }
    });

    app.filter('periodText', function () {
        return function (period) {
            if (period) {
                return (period.start ? moment(period.start).format('MMM`YY') + '-' : '?-') + (period.end ? moment(period.end).format('MMM`YY') : 'current');
            } else {
                return '';
            }
        };
    });

    app.filter('questionnaireAnswerType', function () {
        function capitalizeFirstWord(input) {
            return input.replace(/^./, function (match) {
                return match.toUpperCase();
            });
        }

        return function (inputType) {
            if (_.contains(['choice', 'open-choice'], inputType)) {
                return "valueCoding";
            } else if (inputType === 'reference') {  //NOTE: may change with DSTU 2
                return "valueResource";
            } else {
                return "value" + capitalizeFirstWord(inputType);
            }
        };
    });

    app.filter('titleCase', function () {
        return function (input) {
            return input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };
    });

    app.filter('questionnaireInputType', function () {
        return function (inputType) {
            var retValue = 'text';
            if (inputType) {
                if (_.contains(['date', 'dateTime'], inputType)) { // datetime workaround for now
                    retValue = 'date';
                } else if (_.contains(['time'], inputType)) {
                    retValue = 'time';
                } else if (_.contains(['instant'], inputType)) {
                    retValue = 'datetime-local';
                } else if (_.contains(['integer', 'decimal'], inputType)) {
                    retValue = 'number';
                } else if (_.contains(['boolean'], inputType)) {
                    retValue = 'checkbox';
                } else if (_.contains(['Attachment'], inputType)) {
                    retValue = 'file';
                }
            }
            return retValue;
        };
    });

    app.filter('messageTotalResults', function () {
        return function (count) {
            switch (count) {
                case 0:
                    return 'No results';
                case 1:
                    return '1 result';
                default:
                    return count + ' results';
            }
        };
    });

    app.filter('questionnaireFlyover', function () {
        return function (extension) {
            var retValue = '';
            if (angular.isArray(extension)) {
                var flyover = _.find(extension, function (item) {
                    return item.url === 'http://hl7.org/fhir/Profile/questionnaire-extensions#flyover';
                });
                if (flyover !== null && flyover.valueString) {
                    retValue = flyover.valueString;
                }
            }
            return retValue;
        };
    });

    app.filter('questionnaireLabel', function () {
        function capitalizeFirstWord(input) {
            return input.replace(/^./, function (match) {
                return match.toUpperCase();
            });
        }

        function spaceWords(input) {
            return input.replace(/([a-z])([A-Z])/g, '$1 $2');
        }

        return function (linkId) {
            var retValue = 'Unspecified';
            if (linkId) {
                retValue = spaceWords(linkId);
                var startIndex = retValue.lastIndexOf('.');
                if (startIndex > 0) {
                    retValue = retValue.substring(startIndex + 1);
                    // check for hashed notation
                    var hashIndex = retValue.indexOf('[#');
                    if (hashIndex > 0) {
                        retValue = retValue.substring(hashIndex + 2);
                        retValue = retValue.replace("]", "");
                    }
                    retValue = retValue.replace("[x]", "");
                    retValue = capitalizeFirstWord(retValue);
                }
            }
            return retValue;
        };
    });

    app.filter('renderObject', function () {
        return function (item) {
            var objectString = '';
            var keys = _.keys(item);
            _.forEach(keys, function (key) {
                if (angular.isDefined(item[key]) && (key !== '$$hashKey')) {
                    if (angular.isDefined(objectString)) {
                        objectString = objectString + ", " + key + ": " + item[key];
                    } else {
                        objectString = key + ": " + item[key];
                    }
                }
            });
            return objectString;
        };
    });

    app.filter('singleLineAddress', function () {
        return function (address) {
            if (address) {
                return (address.line ? address.line.join(' ') + ', ' : '') + (address.city ? address.city + ', ' : '') + (address.state ? address.state : '') + (address.postalCode ? ' ' + address.postalCode : '') + (address.country ? ', ' + address.country : '');
            } else {
                return '';
            }
        };
    });

    app.filter('truncate', function () {
        return function (input, len) {
            if (typeof input === 'undefined' || input === null || input === '') {
                return '';
            }
            if (isNaN(len) || (len <= 0)) {
                len = 20;
            }
            input = input.replace(/\r?\n|\r/gm, ' ').replace(/<[^>]*>/gi, ' ').split(' ');
            var resultString = '';

            while (input.length > 0) {
                resultString += input.splice(0, len).join(' ');
                if (resultString.length >= len) {
                    break;
                }
            }
            if (resultString.length > len && resultString.indexOf(' ')) {
                resultString = (resultString.substring(0, len)) + ' ...';
            }
            return resultString;
        };
    });

    app.filter('unexpectedOutcome', function () {
        return function (error) {
            var message = "Unexpected response from server/n";
            if (error.status) {
                message = "HTTP Status: " + message.status + "\n";
            }
            if (error.outcome && error.outcome.issue) {
                _.forEach(message.outcome.issue, function (item) {
                    message = message + item.severity + ": " + item.details + "\n";
                });
            }
            return message;
        };
    });

    app.filter('abbreviateState', function () {
        return function (longState) {
            var state = angular.lowercase(longState);
            var abbr;
            switch (state) {
                case 'alabama':
                    abbr = 'AL';
                    break;
                case 'alaska':
                    abbr = 'AK';
                    break;
                case 'hawaii':
                    abbr = 'HI';
                    break;
                case 'idaho':
                    abbr = 'ID';
                    break;
                case 'illinois':
                    abbr = 'IL';
                    break;
                case 'indiana':
                    abbr = 'IN';
                    break;
                case 'iowa':
                    abbr = 'IA';
                    break;
                case 'kansas':
                    abbr = 'KS';
                    break;
                case 'kentucky':
                    abbr = 'KY';
                    break;
                case 'louisiana':
                    abbr = 'LA';
                    break;
                case 'maine':
                    abbr = 'MA';
                    break;
                case 'maryland':
                    abbr = 'MD';
                    break;
                case 'massachusetts':
                    abbr = 'MA';
                    break;
                case 'michigan':
                    abbr = 'MI';
                    break;
                case 'minnesota':
                    abbr = 'MN';
                    break;
                case 'mississippi':
                    abbr = 'MS';
                    break;
                case 'missouri':
                    abbr = 'MO';
                    break;
                case 'montana ':
                    abbr = 'MT';
                    break;
                case 'nebraska':
                    abbr = 'NB';
                    break;
                case 'nevada':
                    abbr = 'NV';
                    break;
                case 'new hampshire':
                    abbr = 'NH';
                    break;
                case 'new jersey':
                    abbr = 'NJ';
                    break;
                case 'new mexico':
                    abbr = 'NM';
                    break;
                case 'new york':
                    abbr = 'NY';
                    break;
                case 'north carolina':
                    abbr = 'NC';
                    break;
                case 'north dakota':
                    abbr = 'ND';
                    break;
                case 'ohio':
                    abbr = 'OH';
                    break;
                case 'oklahoma':
                    abbr = 'OK';
                    break;
                case 'oregon':
                    abbr = 'OR';
                    break;
                case 'pennsylvania':
                    abbr = 'PA';
                    break;
                case 'rhode island':
                    abbr = 'RI';
                    break;
                case 'south carolina':
                    abbr = 'SC';
                    break;
                case 'south dakota':
                    abbr = 'SD';
                    break;
                case 'tennessee':
                    abbr = 'TN';
                    break;
                case 'texas':
                    abbr = 'TX';
                    break;
                case 'utah':
                    abbr = 'UT';
                    break;
                case 'vermont':
                    abbr = 'VT';
                    break;
                case 'virginia':
                    abbr = 'VA';
                    break;
                case 'washington':
                    abbr = 'WA';
                    break;
                case 'west virginia':
                    abbr = 'WV';
                    break;
                case 'wisconsin':
                    abbr = 'WI';
                    break;
                case 'wyoming':
                    abbr = 'WY';
                    break;
                case 'georgia':
                    abbr = 'GA';
                    break;
                case 'florida':
                    abbr = 'FL';
                    break;
                case 'delaware':
                    abbr = 'DE';
                    break;
                case 'connecticut':
                    abbr = 'CT';
                    break;
                case 'colorado':
                    abbr = 'CO';
                    break;
                case 'california':
                    abbr = 'CA';
                    break;
                case 'arkansas':
                    abbr = 'AR';
                    break;
                case 'arizona':
                    abbr = 'AZ';
                    break;
                case 'district of columbia':
                    abbr = 'DC';
                    break;
                default:
                    abbr = state;
            }
            return abbr;
        };
    });
})();(function () {
    'use strict';

    var serviceId = 'localValueSets';

    function localValueSets() {

        function race() {
            return {
                "system": "http://hl7.org/fhir/v3/Race",
                "concept": [
                    {
                        "code": "1002-5",
                        "display": "American Indian or Alaska Native"
                    },
                    {
                        "code": "2028-9",
                        "display": "Asian"
                    },
                    {
                        "code": "2054-5",
                        "display": "Black or African American"
                    },
                    {
                        "code": "2076-8",
                        "display": "Native Hawaiian or Other Pacific Islander"
                    },
                    {
                        "code": "2106-3",
                        "display": "White"
                    }
                ]
            }
        }

        function ethnicity() {
            return {
                "system": "http://hl7.org/fhir/v3/Ethnicity",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "2135-2",
                        "abstract": false,
                        "display": "Hispanic or Latino",
                        "definition": "Hispanic or Latino",
                        "concept": [
                            {
                                "code": "2137-8",
                                "abstract": false,
                                "display": "Spaniard",
                                "definition": "Spaniard",
                                "concept": [
                                    {
                                        "code": "2138-6",
                                        "abstract": false,
                                        "display": "Andalusian",
                                        "definition": "Andalusian"
                                    },
                                    {
                                        "code": "2139-4",
                                        "abstract": false,
                                        "display": "Asturian",
                                        "definition": "Asturian"
                                    },
                                    {
                                        "code": "2140-2",
                                        "abstract": false,
                                        "display": "Castillian",
                                        "definition": "Castillian"
                                    },
                                    {
                                        "code": "2141-0",
                                        "abstract": false,
                                        "display": "Catalonian",
                                        "definition": "Catalonian"
                                    },
                                    {
                                        "code": "2142-8",
                                        "abstract": false,
                                        "display": "Belearic Islander",
                                        "definition": "Belearic Islander"
                                    },
                                    {
                                        "code": "2143-6",
                                        "abstract": false,
                                        "display": "Gallego",
                                        "definition": "Gallego"
                                    },
                                    {
                                        "code": "2144-4",
                                        "abstract": false,
                                        "display": "Valencian",
                                        "definition": "Valencian"
                                    },
                                    {
                                        "code": "2145-1",
                                        "abstract": false,
                                        "display": "Canarian",
                                        "definition": "Canarian"
                                    },
                                    {
                                        "code": "2146-9",
                                        "abstract": false,
                                        "display": "Spanish Basque",
                                        "definition": "Spanish Basque"
                                    }
                                ]
                            },
                            {
                                "code": "2148-5",
                                "abstract": false,
                                "display": "Mexican",
                                "definition": "Mexican",
                                "concept": [
                                    {
                                        "code": "2149-3",
                                        "abstract": false,
                                        "display": "Mexican American",
                                        "definition": "Mexican American"
                                    },
                                    {
                                        "code": "2150-1",
                                        "abstract": false,
                                        "display": "Mexicano",
                                        "definition": "Mexicano"
                                    },
                                    {
                                        "code": "2151-9",
                                        "abstract": false,
                                        "display": "Chicano",
                                        "definition": "Chicano"
                                    },
                                    {
                                        "code": "2152-7",
                                        "abstract": false,
                                        "display": "La Raza",
                                        "definition": "La Raza"
                                    },
                                    {
                                        "code": "2153-5",
                                        "abstract": false,
                                        "display": "Mexican American Indian",
                                        "definition": "Mexican American Indian"
                                    }
                                ]
                            },
                            {
                                "code": "2155-0",
                                "abstract": false,
                                "display": "Central American",
                                "definition": "Central American",
                                "concept": [
                                    {
                                        "code": "2156-8",
                                        "abstract": false,
                                        "display": "Costa Rican",
                                        "definition": "Costa Rican"
                                    },
                                    {
                                        "code": "2157-6",
                                        "abstract": false,
                                        "display": "Guatemalan",
                                        "definition": "Guatemalan"
                                    },
                                    {
                                        "code": "2158-4",
                                        "abstract": false,
                                        "display": "Honduran",
                                        "definition": "Honduran"
                                    },
                                    {
                                        "code": "2159-2",
                                        "abstract": false,
                                        "display": "Nicaraguan",
                                        "definition": "Nicaraguan"
                                    },
                                    {
                                        "code": "2160-0",
                                        "abstract": false,
                                        "display": "Panamanian",
                                        "definition": "Panamanian"
                                    },
                                    {
                                        "code": "2161-8",
                                        "abstract": false,
                                        "display": "Salvadoran",
                                        "definition": "Salvadoran"
                                    },
                                    {
                                        "code": "2162-6",
                                        "abstract": false,
                                        "display": "Central American Indian",
                                        "definition": "Central American Indian"
                                    },
                                    {
                                        "code": "2163-4",
                                        "abstract": false,
                                        "display": "Canal Zone",
                                        "definition": "Canal Zone"
                                    }
                                ]
                            },
                            {
                                "code": "2165-9",
                                "abstract": false,
                                "display": "South American",
                                "definition": "South American",
                                "concept": [
                                    {
                                        "code": "2166-7",
                                        "abstract": false,
                                        "display": "Argentinean",
                                        "definition": "Argentinean"
                                    },
                                    {
                                        "code": "2167-5",
                                        "abstract": false,
                                        "display": "Bolivian",
                                        "definition": "Bolivian"
                                    },
                                    {
                                        "code": "2168-3",
                                        "abstract": false,
                                        "display": "Chilean",
                                        "definition": "Chilean"
                                    },
                                    {
                                        "code": "2169-1",
                                        "abstract": false,
                                        "display": "Colombian",
                                        "definition": "Colombian"
                                    },
                                    {
                                        "code": "2170-9",
                                        "abstract": false,
                                        "display": "Ecuadorian",
                                        "definition": "Ecuadorian"
                                    },
                                    {
                                        "code": "2171-7",
                                        "abstract": false,
                                        "display": "Paraguayan",
                                        "definition": "Paraguayan"
                                    },
                                    {
                                        "code": "2172-5",
                                        "abstract": false,
                                        "display": "Peruvian",
                                        "definition": "Peruvian"
                                    },
                                    {
                                        "code": "2173-3",
                                        "abstract": false,
                                        "display": "Uruguayan",
                                        "definition": "Uruguayan"
                                    },
                                    {
                                        "code": "2174-1",
                                        "abstract": false,
                                        "display": "Venezuelan",
                                        "definition": "Venezuelan"
                                    },
                                    {
                                        "code": "2175-8",
                                        "abstract": false,
                                        "display": "South American Indian",
                                        "definition": "South American Indian"
                                    },
                                    {
                                        "code": "2176-6",
                                        "abstract": false,
                                        "display": "Criollo",
                                        "definition": "Criollo"
                                    }
                                ]
                            },
                            {
                                "code": "2178-2",
                                "abstract": false,
                                "display": "Latin American",
                                "definition": "Latin American"
                            },
                            {
                                "code": "2180-8",
                                "abstract": false,
                                "display": "Puerto Rican",
                                "definition": "Puerto Rican"
                            },
                            {
                                "code": "2182-4",
                                "abstract": false,
                                "display": "Cuban",
                                "definition": "Cuban"
                            },
                            {
                                "code": "2184-0",
                                "abstract": false,
                                "display": "Dominican",
                                "definition": "Dominican"
                            }
                        ]
                    },
                    {
                        "code": "2186-5",
                        "abstract": false,
                        "display": "Not Hispanic or Latino",
                        "definition": "Note that this term remains in the table for completeness, even though within HL7, the notion of \"not otherwise coded\" term is deprecated."
                    }
                ]
            }
        }

        function religion() {
            return {
                "system": "http://hl7.org/fhir/v3/ReligiousAffiliation",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "1001",
                        "abstract": false,
                        "display": "Adventist",
                        "definition": "Adventist"
                    },
                    {
                        "code": "1002",
                        "abstract": false,
                        "display": "African Religions",
                        "definition": "African Religions"
                    },
                    {
                        "code": "1003",
                        "abstract": false,
                        "display": "Afro-Caribbean Religions",
                        "definition": "Afro-Caribbean Religions"
                    },
                    {
                        "code": "1004",
                        "abstract": false,
                        "display": "Agnosticism",
                        "definition": "Agnosticism"
                    },
                    {
                        "code": "1005",
                        "abstract": false,
                        "display": "Anglican",
                        "definition": "Anglican"
                    },
                    {
                        "code": "1006",
                        "abstract": false,
                        "display": "Animism",
                        "definition": "Animism"
                    },
                    {
                        "code": "1007",
                        "abstract": false,
                        "display": "Atheism",
                        "definition": "Atheism"
                    },
                    {
                        "code": "1008",
                        "abstract": false,
                        "display": "Babi & Baha'I faiths",
                        "definition": "Babi & Baha'I faiths"
                    },
                    {
                        "code": "1009",
                        "abstract": false,
                        "display": "Baptist",
                        "definition": "Baptist"
                    },
                    {
                        "code": "1010",
                        "abstract": false,
                        "display": "Bon",
                        "definition": "Bon"
                    },
                    {
                        "code": "1011",
                        "abstract": false,
                        "display": "Cao Dai",
                        "definition": "Cao Dai"
                    },
                    {
                        "code": "1012",
                        "abstract": false,
                        "display": "Celticism",
                        "definition": "Celticism"
                    },
                    {
                        "code": "1013",
                        "abstract": false,
                        "display": "Christian (non-Catholic, non-specific)",
                        "definition": "Christian (non-Catholic, non-specific)"
                    },
                    {
                        "code": "1014",
                        "abstract": false,
                        "display": "Confucianism",
                        "definition": "Confucianism"
                    },
                    {
                        "code": "1015",
                        "abstract": false,
                        "display": "Cyberculture Religions",
                        "definition": "Cyberculture Religions"
                    },
                    {
                        "code": "1016",
                        "abstract": false,
                        "display": "Divination",
                        "definition": "Divination"
                    },
                    {
                        "code": "1017",
                        "abstract": false,
                        "display": "Fourth Way",
                        "definition": "Fourth Way"
                    },
                    {
                        "code": "1018",
                        "abstract": false,
                        "display": "Free Daism",
                        "definition": "Free Daism"
                    },
                    {
                        "code": "1019",
                        "abstract": false,
                        "display": "Gnosis",
                        "definition": "Gnosis"
                    },
                    {
                        "code": "1020",
                        "abstract": false,
                        "display": "Hinduism",
                        "definition": "Hinduism"
                    },
                    {
                        "code": "1021",
                        "abstract": false,
                        "display": "Humanism",
                        "definition": "Humanism"
                    },
                    {
                        "code": "1022",
                        "abstract": false,
                        "display": "Independent",
                        "definition": "Independent"
                    },
                    {
                        "code": "1023",
                        "abstract": false,
                        "display": "Islam",
                        "definition": "Islam"
                    },
                    {
                        "code": "1024",
                        "abstract": false,
                        "display": "Jainism",
                        "definition": "Jainism"
                    },
                    {
                        "code": "1025",
                        "abstract": false,
                        "display": "Jehovah's Witnesses",
                        "definition": "Jehovah's Witnesses"
                    },
                    {
                        "code": "1026",
                        "abstract": false,
                        "display": "Judaism",
                        "definition": "Judaism"
                    },
                    {
                        "code": "1027",
                        "abstract": false,
                        "display": "Latter Day Saints",
                        "definition": "Latter Day Saints"
                    },
                    {
                        "code": "1028",
                        "abstract": false,
                        "display": "Lutheran",
                        "definition": "Lutheran"
                    },
                    {
                        "code": "1029",
                        "abstract": false,
                        "display": "Mahayana",
                        "definition": "Mahayana"
                    },
                    {
                        "code": "1030",
                        "abstract": false,
                        "display": "Meditation",
                        "definition": "Meditation"
                    },
                    {
                        "code": "1031",
                        "abstract": false,
                        "display": "Messianic Judaism",
                        "definition": "Messianic Judaism"
                    },
                    {
                        "code": "1032",
                        "abstract": false,
                        "display": "Mitraism",
                        "definition": "Mitraism"
                    },
                    {
                        "code": "1033",
                        "abstract": false,
                        "display": "New Age",
                        "definition": "New Age"
                    },
                    {
                        "code": "1034",
                        "abstract": false,
                        "display": "non-Roman Catholic",
                        "definition": "non-Roman Catholic"
                    },
                    {
                        "code": "1035",
                        "abstract": false,
                        "display": "Occult",
                        "definition": "Occult"
                    },
                    {
                        "code": "1036",
                        "abstract": false,
                        "display": "Orthodox",
                        "definition": "Orthodox"
                    },
                    {
                        "code": "1037",
                        "abstract": false,
                        "display": "Paganism",
                        "definition": "Paganism"
                    },
                    {
                        "code": "1038",
                        "abstract": false,
                        "display": "Pentecostal",
                        "definition": "Pentecostal"
                    },
                    {
                        "code": "1039",
                        "abstract": false,
                        "display": "Process, The",
                        "definition": "Process, The"
                    },
                    {
                        "code": "1040",
                        "abstract": false,
                        "display": "Reformed/Presbyterian",
                        "definition": "Reformed/Presbyterian"
                    },
                    {
                        "code": "1041",
                        "abstract": false,
                        "display": "Roman Catholic Church",
                        "definition": "Roman Catholic Church"
                    },
                    {
                        "code": "1042",
                        "abstract": false,
                        "display": "Satanism",
                        "definition": "Satanism"
                    },
                    {
                        "code": "1043",
                        "abstract": false,
                        "display": "Scientology",
                        "definition": "Scientology"
                    },
                    {
                        "code": "1044",
                        "abstract": false,
                        "display": "Shamanism",
                        "definition": "Shamanism"
                    },
                    {
                        "code": "1045",
                        "abstract": false,
                        "display": "Shiite (Islam)",
                        "definition": "Shiite (Islam)"
                    },
                    {
                        "code": "1046",
                        "abstract": false,
                        "display": "Shinto",
                        "definition": "Shinto"
                    },
                    {
                        "code": "1047",
                        "abstract": false,
                        "display": "Sikism",
                        "definition": "Sikism"
                    },
                    {
                        "code": "1048",
                        "abstract": false,
                        "display": "Spiritualism",
                        "definition": "Spiritualism"
                    },
                    {
                        "code": "1049",
                        "abstract": false,
                        "display": "Sunni (Islam)",
                        "definition": "Sunni (Islam)"
                    },
                    {
                        "code": "1050",
                        "abstract": false,
                        "display": "Taoism",
                        "definition": "Taoism"
                    },
                    {
                        "code": "1051",
                        "abstract": false,
                        "display": "Theravada",
                        "definition": "Theravada"
                    },
                    {
                        "code": "1052",
                        "abstract": false,
                        "display": "Unitarian-Universalism",
                        "definition": "Unitarian-Universalism"
                    },
                    {
                        "code": "1053",
                        "abstract": false,
                        "display": "Universal Life Church",
                        "definition": "Universal Life Church"
                    },
                    {
                        "code": "1054",
                        "abstract": false,
                        "display": "Vajrayana (Tibetan)",
                        "definition": "Vajrayana (Tibetan)"
                    },
                    {
                        "code": "1055",
                        "abstract": false,
                        "display": "Veda",
                        "definition": "Veda"
                    },
                    {
                        "code": "1056",
                        "abstract": false,
                        "display": "Voodoo",
                        "definition": "Voodoo"
                    },
                    {
                        "code": "1057",
                        "abstract": false,
                        "display": "Wicca",
                        "definition": "Wicca"
                    },
                    {
                        "code": "1058",
                        "abstract": false,
                        "display": "Yaohushua",
                        "definition": "Yaohushua"
                    },
                    {
                        "code": "1059",
                        "abstract": false,
                        "display": "Zen Buddhism",
                        "definition": "Zen Buddhism"
                    },
                    {
                        "code": "1060",
                        "abstract": false,
                        "display": "Zoroastrianism",
                        "definition": "Zoroastrianism"
                    },
                    {
                        "code": "1061",
                        "abstract": false,
                        "display": "Assembly of God",
                        "definition": "Assembly of God"
                    },
                    {
                        "code": "1062",
                        "abstract": false,
                        "display": "Brethren",
                        "definition": "Brethren"
                    },
                    {
                        "code": "1063",
                        "abstract": false,
                        "display": "Christian Scientist",
                        "definition": "Christian Scientist"
                    },
                    {
                        "code": "1064",
                        "abstract": false,
                        "display": "Church of Christ",
                        "definition": "Church of Christ"
                    },
                    {
                        "code": "1065",
                        "abstract": false,
                        "display": "Church of God",
                        "definition": "Church of God"
                    },
                    {
                        "code": "1066",
                        "abstract": false,
                        "display": "Congregational",
                        "definition": "Congregational"
                    },
                    {
                        "code": "1067",
                        "abstract": false,
                        "display": "Disciples of Christ",
                        "definition": "Disciples of Christ"
                    },
                    {
                        "code": "1068",
                        "abstract": false,
                        "display": "Eastern Orthodox",
                        "definition": "Eastern Orthodox"
                    },
                    {
                        "code": "1069",
                        "abstract": false,
                        "display": "Episcopalian",
                        "definition": "Episcopalian"
                    },
                    {
                        "code": "1070",
                        "abstract": false,
                        "display": "Evangelical Covenant",
                        "definition": "Evangelical Covenant"
                    },
                    {
                        "code": "1071",
                        "abstract": false,
                        "display": "Friends",
                        "definition": "Friends"
                    },
                    {
                        "code": "1072",
                        "abstract": false,
                        "display": "Full Gospel",
                        "definition": "Full Gospel"
                    },
                    {
                        "code": "1073",
                        "abstract": false,
                        "display": "Methodist",
                        "definition": "Methodist"
                    },
                    {
                        "code": "1074",
                        "abstract": false,
                        "display": "Native American",
                        "definition": "Native American"
                    },
                    {
                        "code": "1075",
                        "abstract": false,
                        "display": "Nazarene",
                        "definition": "Nazarene"
                    },
                    {
                        "code": "1076",
                        "abstract": false,
                        "display": "Presbyterian",
                        "definition": "Presbyterian"
                    },
                    {
                        "code": "1077",
                        "abstract": false,
                        "display": "Protestant",
                        "definition": "Protestant"
                    },
                    {
                        "code": "1078",
                        "abstract": false,
                        "display": "Protestant, No Denomination",
                        "definition": "Protestant, No Denomination"
                    },
                    {
                        "code": "1079",
                        "abstract": false,
                        "display": "Reformed",
                        "definition": "Reformed"
                    },
                    {
                        "code": "1080",
                        "abstract": false,
                        "display": "Salvation Army",
                        "definition": "Salvation Army"
                    },
                    {
                        "code": "1081",
                        "abstract": false,
                        "display": "Unitarian Universalist",
                        "definition": "Unitarian Universalist"
                    },
                    {
                        "code": "1082",
                        "abstract": false,
                        "display": "United Church of Christ",
                        "definition": "United Church of Christ"
                    }
                ]
            }
        }

        function administrativeGender() {
            return [
                {"code": "unknown", "display": "Unknown", "system": "http://hl7.org/fhir/administrative-gender"},
                {"code": "female", "display": "Female", "system": "http://hl7.org/fhir/administrative-gender"},
                {"code": "male", "display": "Male", "system": "http://hl7.org/fhir/administrative-gender"},
                {"code": "other", "display": "Other", "system": "http://hl7.org/fhir/administrative-gender"}
            ];
        }

        // http://hl7.org/fhir/contactentity-type
        function contactEntityType() {
            return [
                {"code": "BILL", "display": "Billing", "system": "http://hl7.org/fhir/contactentity-type"},
                {"code": "ADMIN", "display": "Administrative", "system": "http://hl7.org/fhir/contactentity-type"},
                {"code": "HR", "display": "Human Resource", "system": "http://hl7.org/fhir/contactentity-type"},
                {"code": "PAYOR", "display": "Payor", "system": "http://hl7.org/fhir/contactentity-type"},
                {"code": "PATINF", "display": "Patient", "system": "http://hl7.org/fhir/contactentity-type"},
                {"code": "PRESS", "display": "Press", "system": "http://hl7.org/fhir/contactentity-type"}
            ];
        }

        function languages() {
            return [
                {"code": "ab", "display": "Abkhaz", "system": "urn:std:iso:639-1"},
                {"code": "aa", "display": "Afar", "system": "urn:std:iso:639-1"},
                {"code": "af", "display": "Afrikaans", "system": "urn:std:iso:639-1"},
                {"code": "ak", "display": "Akan", "system": "urn:std:iso:639-1"},
                {"code": "sq", "display": "Albanian", "system": "urn:std:iso:639-1"},
                {"code": "am", "display": "Amharic", "system": "urn:std:iso:639-1"},
                {"code": "ar", "display": "Arabic", "system": "urn:std:iso:639-1"},
                {"code": "an", "display": "Aragonese", "system": "urn:std:iso:639-1"},
                {"code": "hy", "display": "Armenian", "system": "urn:std:iso:639-1"},
                {"code": "as", "display": "Assamese", "system": "urn:std:iso:639-1"},
                {"code": "av", "display": "Avaric", "system": "urn:std:iso:639-1"},
                {"code": "ae", "display": "Avestan", "system": "urn:std:iso:639-1"},
                {"code": "ay", "display": "Aymara", "system": "urn:std:iso:639-1"},
                {"code": "az", "display": "Azerbaijani", "system": "urn:std:iso:639-1"},
                {"code": "bm", "display": "Bambara", "system": "urn:std:iso:639-1"},
                {"code": "ba", "display": "Bashkir", "system": "urn:std:iso:639-1"},
                {"code": "eu", "display": "Basque", "system": "urn:std:iso:639-1"},
                {"code": "be", "display": "Belarusian", "system": "urn:std:iso:639-1"},
                {"code": "bn", "display": "Bengali", "system": "urn:std:iso:639-1"},
                {"code": "bh", "display": "Bihari", "system": "urn:std:iso:639-1"},
                {"code": "bi", "display": "Bislama", "system": "urn:std:iso:639-1"},
                {"code": "bs", "display": "Bosnian", "system": "urn:std:iso:639-1"},
                {"code": "br", "display": "Breton", "system": "urn:std:iso:639-1"},
                {"code": "bg", "display": "Bulgarian", "system": "urn:std:iso:639-1"},
                {"code": "my", "display": "Burmese", "system": "urn:std:iso:639-1"},
                {"code": "ca", "display": "Catalan; Valencian", "system": "urn:std:iso:639-1"},
                {"code": "ch", "display": "Chamorro", "system": "urn:std:iso:639-1"},
                {"code": "ce", "display": "Chechen", "system": "urn:std:iso:639-1"},
                {"code": "ny", "display": "Chichewa; Chewa; Nyanja", "system": "urn:std:iso:639-1"},
                {"code": "zh", "display": "Chinese", "system": "urn:std:iso:639-1"},
                {"code": "cv", "display": "Chuvash", "system": "urn:std:iso:639-1"},
                {"code": "kw", "display": "Cornish", "system": "urn:std:iso:639-1"},
                {"code": "co", "display": "Corsican", "system": "urn:std:iso:639-1"},
                {"code": "cr", "display": "Cree", "system": "urn:std:iso:639-1"},
                {"code": "hr", "display": "Croatian", "system": "urn:std:iso:639-1"},
                {"code": "cs", "display": "Czech", "system": "urn:std:iso:639-1"},
                {"code": "da", "display": "Danish", "system": "urn:std:iso:639-1"},
                {"code": "dv", "display": "Divehi; Dhivehi; Maldivian;", "system": "urn:std:iso:639-1"},
                {"code": "nl", "display": "Dutch", "system": "urn:std:iso:639-1"},
                {"code": "en", "display": "English", "system": "urn:std:iso:639-1"},
                {"code": "eo", "display": "Esperanto", "system": "urn:std:iso:639-1"},
                {"code": "et", "display": "Estonian", "system": "urn:std:iso:639-1"},
                {"code": "ee", "display": "Ewe", "system": "urn:std:iso:639-1"},
                {"code": "fo", "display": "Faroese", "system": "urn:std:iso:639-1"},
                {"code": "fj", "display": "Fijian", "system": "urn:std:iso:639-1"},
                {"code": "fi", "display": "Finnish", "system": "urn:std:iso:639-1"},
                {"code": "fr", "display": "French", "system": "urn:std:iso:639-1"},
                {"code": "ff", "display": "Fula; Fulah; Pulaar; Pular", "system": "urn:std:iso:639-1"},
                {"code": "gl", "display": "Galician", "system": "urn:std:iso:639-1"},
                {"code": "ka", "display": "Georgian", "system": "urn:std:iso:639-1"},
                {"code": "de", "display": "German", "system": "urn:std:iso:639-1"},
                {"code": "el", "display": "Greek, Modern", "system": "urn:std:iso:639-1"},
                {"code": "gn", "display": "Guaraní", "system": "urn:std:iso:639-1"},
                {"code": "gu", "display": "Gujarati", "system": "urn:std:iso:639-1"},
                {"code": "ht", "display": "Haitian; Haitian Creole", "system": "urn:std:iso:639-1"},
                {"code": "ha", "display": "Hausa", "system": "urn:std:iso:639-1"},
                {"code": "he", "display": "Hebrew (modern)", "system": "urn:std:iso:639-1"},
                {"code": "hz", "display": "Herero", "system": "urn:std:iso:639-1"},
                {"code": "hi", "display": "Hindi", "system": "urn:std:iso:639-1"},
                {"code": "ho", "display": "Hiri Motu", "system": "urn:std:iso:639-1"},
                {"code": "hu", "display": "Hungarian", "system": "urn:std:iso:639-1"},
                {"code": "ia", "display": "Interlingua", "system": "urn:std:iso:639-1"},
                {"code": "id", "display": "Indonesian", "system": "urn:std:iso:639-1"},
                {"code": "ie", "display": "Interlingue", "system": "urn:std:iso:639-1"},
                {"code": "ga", "display": "Irish", "system": "urn:std:iso:639-1"},
                {"code": "ig", "display": "Igbo", "system": "urn:std:iso:639-1"},
                {"code": "ik", "display": "Inupiaq", "system": "urn:std:iso:639-1"},
                {"code": "io", "display": "Ido", "system": "urn:std:iso:639-1"},
                {"code": "is", "display": "Icelandic", "system": "urn:std:iso:639-1"},
                {"code": "it", "display": "Italian", "system": "urn:std:iso:639-1"},
                {"code": "iu", "display": "Inuktitut", "system": "urn:std:iso:639-1"},
                {"code": "ja", "display": "Japanese", "system": "urn:std:iso:639-1"},
                {"code": "jv", "display": "Javanese", "system": "urn:std:iso:639-1"},
                {"code": "kl", "display": "Kalaallisut, Greenlandic", "system": "urn:std:iso:639-1"},
                {"code": "kn", "display": "Kannada", "system": "urn:std:iso:639-1"},
                {"code": "kr", "display": "Kanuri", "system": "urn:std:iso:639-1"},
                {"code": "ks", "display": "Kashmiri", "system": "urn:std:iso:639-1"},
                {"code": "kk", "display": "Kazakh", "system": "urn:std:iso:639-1"},
                {"code": "km", "display": "Khmer", "system": "urn:std:iso:639-1"},
                {"code": "ki", "display": "Kikuyu, Gikuyu", "system": "urn:std:iso:639-1"},
                {"code": "rw", "display": "Kinyarwanda", "system": "urn:std:iso:639-1"},
                {"code": "ky", "display": "Kirghiz, Kyrgyz", "system": "urn:std:iso:639-1"},
                {"code": "kv", "display": "Komi", "system": "urn:std:iso:639-1"},
                {"code": "kg", "display": "Kongo", "system": "urn:std:iso:639-1"},
                {"code": "ko", "display": "Korean", "system": "urn:std:iso:639-1"},
                {"code": "ku", "display": "Kurdish", "system": "urn:std:iso:639-1"},
                {"code": "kj", "display": "Kwanyama, Kuanyama", "system": "urn:std:iso:639-1"},
                {"code": "la", "display": "Latin", "system": "urn:std:iso:639-1"},
                {"code": "lb", "display": "Luxembourgish, Letzeburgesch", "system": "urn:std:iso:639-1"},
                {"code": "lg", "display": "Luganda", "system": "urn:std:iso:639-1"},
                {"code": "li", "display": "Limburgish, Limburgan, Limburger", "system": "urn:std:iso:639-1"},
                {"code": "ln", "display": "Lingala", "system": "urn:std:iso:639-1"},
                {"code": "lo", "display": "Lao", "system": "urn:std:iso:639-1"},
                {"code": "lt", "display": "Lithuanian", "system": "urn:std:iso:639-1"},
                {"code": "lu", "display": "Luba-Katanga", "system": "urn:std:iso:639-1"},
                {"code": "lv", "display": "Latvian", "system": "urn:std:iso:639-1"},
                {"code": "gv", "display": "Manx", "system": "urn:std:iso:639-1"},
                {"code": "mk", "display": "Macedonian", "system": "urn:std:iso:639-1"},
                {"code": "mg", "display": "Malagasy", "system": "urn:std:iso:639-1"},
                {"code": "ms", "display": "Malay", "system": "urn:std:iso:639-1"},
                {"code": "ml", "display": "Malayalam", "system": "urn:std:iso:639-1"},
                {"code": "mt", "display": "Maltese", "system": "urn:std:iso:639-1"},
                {"code": "mi", "display": "Maori", "system": "urn:std:iso:639-1"},
                {"code": "mr", "display": "Marathi (Marāṭhī)", "system": "urn:std:iso:639-1"},
                {"code": "mh", "display": "Marshallese", "system": "urn:std:iso:639-1"},
                {"code": "mn", "display": "Mongolian", "system": "urn:std:iso:639-1"},
                {"code": "na", "display": "Nauru", "system": "urn:std:iso:639-1"},
                {"code": "nv", "display": "Navajo, Navaho", "system": "urn:std:iso:639-1"},
                {"code": "nb", "display": "Norwegian Bokm\u00e5l", "system": "urn:std:iso:639-1"},
                {"code": "nd", "display": "North Ndebele", "system": "urn:std:iso:639-1"},
                {"code": "ne", "display": "Nepali", "system": "urn:std:iso:639-1"},
                {"code": "ng", "display": "Ndonga", "system": "urn:std:iso:639-1"},
                {"code": "nn", "display": "Norwegian Nynorsk", "system": "urn:std:iso:639-1"},
                {"code": "no", "display": "Norwegian", "system": "urn:std:iso:639-1"},
                {"code": "ii", "display": "Nuosu", "system": "urn:std:iso:639-1"},
                {"code": "nr", "display": "South Ndebele", "system": "urn:std:iso:639-1"},
                {"code": "oc", "display": "Occitan", "system": "urn:std:iso:639-1"},
                {"code": "oj", "display": "Ojibwe, Ojibwa", "system": "urn:std:iso:639-1"},
                {"code": "cu", "display": "Old Church Slavonic", "system": "urn:std:iso:639-1"},
                {"code": "om", "display": "Oromo", "system": "urn:std:iso:639-1"},
                {"code": "or", "display": "Oriya", "system": "urn:std:iso:639-1"},
                {"code": "os", "display": "Ossetian, Ossetic", "system": "urn:std:iso:639-1"},
                {"code": "pa", "display": "Panjabi, Punjabi", "system": "urn:std:iso:639-1"},
                {"code": "pi", "display": "Pali", "system": "urn:std:iso:639-1"},
                {"code": "fa", "display": "Persian", "system": "urn:std:iso:639-1"},
                {"code": "pl", "display": "Polish", "system": "urn:std:iso:639-1"},
                {"code": "ps", "display": "Pashto, Pushto", "system": "urn:std:iso:639-1"},
                {"code": "pt", "display": "Portuguese", "system": "urn:std:iso:639-1"},
                {"code": "qu", "display": "Quechua", "system": "urn:std:iso:639-1"},
                {"code": "rm", "display": "Romansh", "system": "urn:std:iso:639-1"},
                {"code": "rn", "display": "Kirundi", "system": "urn:std:iso:639-1"},
                {"code": "ro", "display": "Romanian, Moldavian, Moldovan", "system": "urn:std:iso:639-1"},
                {"code": "ru", "display": "Russian", "system": "urn:std:iso:639-1"},
                {"code": "sa", "display": "Sanskrit (Samskrta)", "system": "urn:std:iso:639-1"},
                {"code": "sc", "display": "Sardinian", "system": "urn:std:iso:639-1"},
                {"code": "sd", "display": "Sindhi", "system": "urn:std:iso:639-1"},
                {"code": "se", "display": "Northern Sami", "system": "urn:std:iso:639-1"},
                {"code": "sm", "display": "Samoan", "system": "urn:std:iso:639-1"},
                {"code": "sg", "display": "Sango", "system": "urn:std:iso:639-1"},
                {"code": "sr", "display": "Serbian", "system": "urn:std:iso:639-1"},
                {"code": "gd", "display": "Scottish Gaelic; Gaelic", "system": "urn:std:iso:639-1"},
                {"code": "sn", "display": "Shona", "system": "urn:std:iso:639-1"},
                {"code": "si", "display": "Sinhala, Sinhalese", "system": "urn:std:iso:639-1"},
                {"code": "sk", "display": "Slovak", "system": "urn:std:iso:639-1"},
                {"code": "sl", "display": "Slovene", "system": "urn:std:iso:639-1"},
                {"code": "so", "display": "Somali", "system": "urn:std:iso:639-1"},
                {"code": "st", "display": "Southern Sotho", "system": "urn:std:iso:639-1"},
                {"code": "es", "display": "Spanish; Castilian", "system": "urn:std:iso:639-1"},
                {"code": "su", "display": "Sundanese", "system": "urn:std:iso:639-1"},
                {"code": "sw", "display": "Swahili", "system": "urn:std:iso:639-1"},
                {"code": "ss", "display": "Swati", "system": "urn:std:iso:639-1"},
                {"code": "sv", "display": "Swedish", "system": "urn:std:iso:639-1"},
                {"code": "ta", "display": "Tamil", "system": "urn:std:iso:639-1"},
                {"code": "te", "display": "Telugu", "system": "urn:std:iso:639-1"},
                {"code": "tg", "display": "Tajik", "system": "urn:std:iso:639-1"},
                {"code": "th", "display": "Thai", "system": "urn:std:iso:639-1"},
                {"code": "ti", "display": "Tigrinya", "system": "urn:std:iso:639-1"},
                {"code": "bo", "display": "Tibetan Standard, Tibetan, Central", "system": "urn:std:iso:639-1"},
                {"code": "tk", "display": "Turkmen", "system": "urn:std:iso:639-1"},
                {"code": "tl", "display": "Tagalog", "system": "urn:std:iso:639-1"},
                {"code": "tn", "display": "Tswana", "system": "urn:std:iso:639-1"},
                {"code": "to", "display": "Tonga (Tonga Islands)", "system": "urn:std:iso:639-1"},
                {"code": "tr", "display": "Turkish", "system": "urn:std:iso:639-1"},
                {"code": "ts", "display": "Tsonga", "system": "urn:std:iso:639-1"},
                {"code": "tt", "display": "Tatar", "system": "urn:std:iso:639-1"},
                {"code": "tw", "display": "Twi", "system": "urn:std:iso:639-1"},
                {"code": "ty", "display": "Tahitian", "system": "urn:std:iso:639-1"},
                {"code": "ug", "display": "Uighur, Uyghur", "system": "urn:std:iso:639-1"},
                {"code": "uk", "display": "Ukrainian", "system": "urn:std:iso:639-1"},
                {"code": "ur", "display": "Urdu", "system": "urn:std:iso:639-1"},
                {"code": "uz", "display": "Uzbek", "system": "urn:std:iso:639-1"},
                {"code": "ve", "display": "Venda", "system": "urn:std:iso:639-1"},
                {"code": "vi", "display": "Vietnamese", "system": "urn:std:iso:639-1"},
                {"code": "vo", "display": "Volapuk", "system": "urn:std:iso:639-1"},
                {"code": "wa", "display": "Walloon", "system": "urn:std:iso:639-1"},
                {"code": "cy", "display": "Welsh", "system": "urn:std:iso:639-1"},
                {"code": "wo", "display": "Wolof", "system": "urn:std:iso:639-1"},
                {"code": "fy", "display": "Western Frisian", "system": "urn:std:iso:639-1"},
                {"code": "xh", "display": "Xhosa", "system": "urn:std:iso:639-1"},
                {"code": "yi", "display": "Yiddish", "system": "urn:std:iso:639-1"},
                {"code": "yo", "display": "Yoruba", "system": "urn:std:iso:639-1"},
                {"code": "za", "display": "Zhuang, Chuang", "system": "urn:std:iso:639-1"}
            ];
        }

        // http://hl7.org/fhir/vs/location-mode
        function locationMode() {
            return [
                {
                    "code": "instance",
                    "display": "A specific location instance",
                    "system": "http://hl7.org/fhir/vs/location-mode"
                },
                {"code": "kind", "display": "A class of locations", "system": "http://hl7.org/fhir/vs/location-mode"}
            ];
        }

        // http://hl7.org/fhir/location-physical-type
        function locationPhysicalType() {
            return [
                {"code": "bu", "display": "Building", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "wi", "display": "Wing", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "co", "display": "Corridor", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "ro", "display": "Room", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "ve", "display": "Vehicle", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "ho", "display": "House", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "ca", "display": "Cabinet", "system": "http://hl7.org/fhir/location-physical-type"},
                {"code": "rd", "display": "Road", "system": "http://hl7.org/fhir/location-physical-type"}
            ];
        }

        function locationStatus() {
            return [
                {"code": "active", "display": "Active", "system": "http://hl7.org/fhir/vs/location-status"},
                {"code": "suspended", "display": "Suspended", "system": "http://hl7.org/fhir/vs/location-status"},
                {"code": "inactive", "display": "Inactive", "system": "http://hl7.org/fhir/vs/location-status"}
            ];
        }

        function maritalStatus() {
            return [
                {"code": "UNK", "display": "Unknown", "system": "http://hl7.org/fhir/v3/NullFlavor"},
                {"code": "A", "display": "Annulled", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "D", "display": "Divorced", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "I", "display": "Interlocutory", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "L", "display": "Legally Seperated", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "M", "display": "Married", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "P", "display": "Polygamous", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "S", "display": "Never Married", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "T", "display": "Domestic Partner", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "U", "display": "Unmarried", "system": "http://hl7.org/fhir/v3/MaritalStatus"},
                {"code": "W", "display": "Widowed", "system": "http://hl7.org/fhir/v3/MaritalStatus"}
            ];
        }

        // http://hl7.org/fhir/organization-type
        function organizationType() {
            return [
                {"code": "prov", "display": "Healthcare Provider", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "dept", "display": "Hospital Department", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "icu", "display": "Intensive Care Unit", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "team", "display": "Organization Team", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "fed", "display": "Federal Government", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "ins", "display": "Insurance Company", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "edu", "display": "Educational Institute", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "reli", "display": "Religious Institution", "system": "http://hl7.org/fhir/organization-type"},
                {"code": "pharm", "display": "Pharmacy", "system": "http://hl7.org/fhir/organization-type"}
            ];
        }

        function questionnaireAnswerStatus() {
            return [
                {
                    "code": "in progress",
                    "display": "in progress",
                    "definition": "This QuestionnaireAnswers has been partially filled out with answers, but changes or additions are still expected to be made to it."
                },
                {
                    "code": "completed",
                    "display": "completed",
                    "definition": "This QuestionnaireAnswers has been filled out with answers, and the current content is regarded as definitive."
                },
                {
                    "code": "amended",
                    "display": "amended",
                    "definition": "This QuestionnaireAnswers has been filled out with answers, then marked as complete, yet changes or additions have been made to it afterwards."
                }
            ];
        }

        function smokingStatus() {
            return [
                {"code": "449868002", "display": "Smokes tobacco daily", "system": "http://snomed.info/sct"},
                {"code": "428041000124106", "display": "Occasional tobacco smoker", "system": "http://snomed.info/sct"},
                {"code": "8517006", "display": "Ex-smoker", "system": "http://snomed.info/sct"},
                {"code": "266919005", "display": "Never smoked tobacco", "system": "http://snomed.info/sct"},
                {"code": "77176002", "display": "Smoker, current status unknown", "system": "http://snomed.info/sct"},
                {"code": "266927001", "display": "Unknown if ever smoked", "system": "http://snomed.info/sct"},
                {"code": "428071000124103", "display": "Heavy tobacco smoker", "system": "http://snomed.info/sct"},
                {"code": "428061000124105", "display": "Light tobacco smoker", "system": "http://snomed.info/sct"}
            ];
            /*
             449868002	Smokes tobacco daily (finding)
             428041000124106	Occasional tobacco smoker (finding)
             8517006	Ex-smoker (finding)
             266919005	Never smoked tobacco (finding)
             77176002	Smoker (finding)
             266927001	Tobacco smoking consumption unknown (finding)
             428071000124103	Heavy tobacco smoker (finding)
             428061000124105	Light tobacco smoker (finding)
             */
        }

        var service = {
            administrativeGender: administrativeGender,
            contactEntityType: contactEntityType,
            iso6391Languages: languages,
            locationMode: locationMode,
            locationPhysicalType: locationPhysicalType,
            locationStatus: locationStatus,
            maritalStatus: maritalStatus,
            organizationType: organizationType,
            questionnaireAnswerStatus: questionnaireAnswerStatus,
            religion: religion,
            smokingStatus: smokingStatus,
            ethnicity: ethnicity,
            race: race
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [localValueSets]);

})();
(function () {
    'use strict';

    function logger($log, $window, $mdToast) {

        function getLogFn(moduleId, fnName) {
            fnName = fnName || 'log';
            switch (fnName.toLowerCase()) { // convert aliases
                case 'success':
                    fnName = 'logSuccess';
                    break;
                case 'error':
                    fnName = 'logError';
                    break;
                case 'warn':
                    fnName = 'logWarning';
                    break;
                case 'info':
                    fnName = 'log';
                    break;
            }

            var logFn = service[fnName] || service.log;
            return function (msg, data, showToast) {
                logFn(msg, data, moduleId, (showToast === undefined) ? true : showToast);
            };
        }

        function log(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'info');
        }

        function logWarning(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'warning');
        }

        function logSuccess(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'success');
        }

        function logError(message, data, source, showToast) {
            function generateUUID() {
                var d = new Date().getTime();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                    function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                    });
            }
            //TODO: uncomment when UI support is restored
/*            var errors;
            if ($window.localStorage.errors) {
                errors = JSON.parse($window.localStorage.errors);
            } else {
                errors = [];
            }
            var localError = {"message": message};
            localError.id = generateUUID();
            errors.push(localError);

            $window.localStorage.errors = JSON.stringify(errors);*/

            logIt(message, data, source, showToast, 'error');
        }

        function logIt(message, data, source, showToast, toastType) {
            var write = (toastType === 'error') ? $log.error : $log.log;
            source = source ? '[' + source + '] ' : '';
            write(source, message);
            if (showToast) {
                $mdToast.show($mdToast.simple()
                    .content(message)
                    .position('right bottom')
                    .hideDelay(write === $log.error ? 4000 : 2000));
            }
        }

        var service = {
            getLogFn: getLogFn,
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning
        };

        return service;
    }

    angular.module('common')
        .factory('logger', ['$log', '$window', '$mdToast', logger]);

})();(function () {
    'use strict';

    var controllerId = 'mainController';

    function mainController($filter, $mdDialog, $mdSidenav, $location, $window, common, conformanceService, fhirServers) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var _adminPages = [
            {name: 'Organization', href: 'organization/view/current'},
            {name: 'Patient', href: 'patient/view/current'},
            {name: 'Practitioner', href: 'practitioner'},
            {name: 'Person', href: 'person'},
            {name: 'Related Person', href: 'relatedPerson'}
        ];
        var _conformancePages = [
            {name: 'Conformance Statement', href: 'conformance'},
            {name: 'Profile', href: 'profile'},
            {name: 'Extension Definition', href: 'extensionDefinition'},
            {name: 'Operation Definition', href: 'operationDefinition'},
            {name: 'Value Set', href: 'valueSet'}
        ];
        var _documentsPages = [
            {name: 'Composition', href: 'composition'},
            {name: 'Document Reference', href: 'documentReference'},
            {name: 'Document Manifest', href: 'documentManifest'}
        ];
        var _dafResources = [
            {name: 'Patient', href: 'daf/patient'},
            {name: 'Allergy Intolerance', href: 'daf/allergyIntolerance'},
            {name: 'Diagnostic Order', href: 'daf/diagnosticOrder'},
            {name: 'Diagnostic Report', href: 'daf/diagnosticReport'},
            {name: 'Encounter', href: 'daf/encounter'},
            {name: 'Family History', href: 'daf/familyHistory'},
            {name: 'Immunization', href: 'daf/immunization'},
            {name: 'Results', href: 'daf/results'},
            {name: 'Medication', href: 'daf/medication'},
            {name: 'Medication Statement', href: 'daf/medicationStatement'},
            {name: 'Medication Administration', href: 'daf/medicationAdministration'},
            {name: 'Condition', href: 'daf/condition'},
            {name: 'Procedure', href: 'daf/procedure'},
            {name: 'Smoking Status', href: 'daf/smokingStatus'},
            {name: 'Vital Signs', href: 'daf/vitalSigns'},
            {name: 'List', href: 'daf/list'}
        ];
        var _sections = [
            {name: 'Administration', id: 1, pages: _adminPages},
       //     {name: 'Conformance', id: 2, pages: _conformancePages},
       //     {name: 'Documents', id: 3, pages: _documentsPages},
            {name: 'DAF Profiles', id: 3, pages: _dafResources}
        ];
        var noToast = false;

        function activate() {
            common.activateController([getFHIRServers(), getActiveServer()], controllerId)
                .then(function () {
                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getFHIRServers() {
            fhirServers.getAllServers().then(function (data) {
                vm.FHIRServers = data;
            })
        }

        function toggleMenu() {
            $mdSidenav('left').toggle();
        }

        function toggleServers() {
            $mdSidenav('right').toggle();
        }

        function showAbout(ev) {
            $mdDialog.show({
                controller: aboutController,
                templateUrl: 'templates/about.html',
                targetEvent: ev
            })
                .then(function() {
                    logInfo("About dialog closed", null, noToast);
                }, function(error) {
                    logError("Error", error, noToast);
                });
        }

        function aboutController($scope, $mdDialog) {
            function close() {
                $mdDialog.hide();
            }
            $scope.close = close;
            $scope.activeServer = vm.activeServer;
            if (angular.isDefined($window.localStorage.patient) && ($window.localStorage.patient !== null)) {
                $scope.patient = JSON.parse($window.localStorage.patient);
                $scope.patient.fullName = $filter('fullName')($scope.patient.name);
            }
        }

        function authenticate(ev) {
            $mdDialog.show({
                templateUrl: './templates/authenticate.html',
                targetEvent: ev
            })
                .then(function (data) {
                    // what they entered
                }, function () {
                    // login cancelled
                })
        }

        function selectServer(fhirServer) {
            $mdSidenav('right').close();
            conformanceService.clearCache();
            conformanceService.getConformanceMetadata(fhirServer.baseUrl)
                .then(function (conformance) {
                    logInfo('Retrieved conformance statement for ' + fhirServer.name, null, noToast);
                    vm.activeServer = fhirServer;
                    fhirServers.setActiveServer(fhirServer);
                    if (angular.isUndefined(conformance.rest[0].security)) {
                        logInfo("Security information missing - this is an OPEN server", null, noToast);
                    } else if (angular.isArray(conformance.rest[0].security.extension)) {
                        _.forEach(conformance.rest[0].security.extension, function (ex) {
                            if (_.endsWith(ex.url, "#authorize")) {
                                vm.activeServer.authorizeUri = ex.valueUri;
                                logInfo("Authorize URI found: " + vm.activeServer.authorizeUri, null, noToast);
                            }
                            if (_.endsWith(ex.url, "#token")) {
                                vm.activeServer.tokenUri = ex.valueUri;
                                logInfo("Token URI found: " + vm.activeServer.tokenUri, null, noToast);
                            }
                        })
                    }
                    common.changeServer(fhirServer);
                }, function (error) {
                    logError('Error returning conformance statement for ' + fhirServer.name + '. Server ' + vm.activeServer.name + ' abides.', error);
                });
            logInfo('Requesting access to server ' + fhirServer.name + ' ...');
        }

        function isSectionSelected(section) {
            return section === vm.menu.selectedSection;
        }

        function pageSelected(page) {
            vm.menu.selectedPage = page.name;
            $location.path('/' + page.href);
        }

        function toggleSelectSection(section) {
            if (angular.isDefined(vm.menu.selectedSection) && (vm.menu.selectedSection.id === section.id)) {
                vm.menu.selectedSection = undefined;

            } else {
                vm.menu.selectedSection = section;
            }
            vm.menu.selectedPage = undefined;
            vm.menu.selectedSubPage = undefined;
        }

        vm.authenticate = authenticate;
        vm.FHIRServers = [];
        vm.isSectionSelected = isSectionSelected;
        vm.menu = {
            sections: _sections,
            selectedSection: undefined,
            selectedPage: undefined,
            selectedSubPage: undefined
        };
        vm.pageSelected = pageSelected;
        vm.selectServer = selectServer;
        vm.showAbout = showAbout;
        vm.toggleMenu = toggleMenu;
        vm.toggleSelectSection = toggleSelectSection;
        vm.toggleServers = toggleServers;
        vm.activeServer = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$mdDialog', '$mdSidenav', '$location', '$window', 'common', 'conformanceService', 'fhirServers', mainController]);

})();
(function () {
    'use strict';

    // Must configure the common service and set its 
    // events via the commonConfigProvider

    angular.module('common')
        .factory('progress', ['common', 'commonConfig', progress]);

    function progress(common, commonConfig) {
        var service = {
            progressHide: progressHide,
            progressShow: progressShow
        };

        return service;

        function progressHide() {
            progressToggle(false);
        }

        function progressShow() {
            progressToggle(true);
        }

        function progressToggle(show) {
            common.$broadcast(commonConfig.config.progressToggleEvent, { show: show });
        }
    }
})();(function () {
    'use strict';

    var serviceId = 'sessionService';

    function sessionService(dataCache) {

        var dataCacheKey = 'session';

        function updateSession(session) {
            dataCache.addToCache(dataCacheKey, session);
        }

        function getSession() {
            var session = dataCache.readFromCache(dataCacheKey);
            if (session) {
                return session;
            } else {
                return  { "patient": undefined, "organization": undefined, "ihe": undefined, "person": undefined};
            }
        }

        var service = {
            updateSession: updateSession,
            getSession: getSession
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['dataCache', sessionService]);

})();(function () {
    'use strict';

    var controllerId = 'conformanceDetail';

    function conformanceDetail($location, $mdDialog, $routeParams, common, fhirServers, identifierService, conformanceService, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var noToast = false;

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteConformance(conformance) {
            function executeDelete() {
                if (conformance && conformance.resourceId && conformance.hashKey) {
                    conformanceService.deleteCachedConformance(conformance.hashKey, conformance.resourceId)
                        .then(function () {
                            logSuccess("Deleted conformance " + conformance.name);
                            $location.path('/conformances');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + conformance.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(conformance) {
            if (conformance && conformance.hashKey) {
                $location.path('/conformance/edit/' + conformance.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedConformance() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (angular.isDefined(rawData.text)) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative = '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.conformance = rawData;
                if (angular.isUndefined(vm.conformance.code)) {
                    vm.conformance.code = {"coding": []};
                }
                vm.title = vm.conformance.name;
                identifierService.init(vm.conformance.identifier);
                contactPointService.init(vm.conformance.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = conformanceService.initializeNewConformance();
                intitializeRelatedData(data);
                vm.title = 'Add New Conformance';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    conformanceService.getCachedConformance($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Conformance/' + $routeParams.id;
                    conformanceService.getConformance(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.conformance) {
                title = vm.title = 'Edit ' + ((vm.conformance && vm.conformance.fullName) || '');
            } else {
                title = vm.title = 'Add New Conformance';
            }
            vm.title = title;
            return vm.title;
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Conformance saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
            } else {
                vm.conformance.resourceId = common.setResourceId(vm.conformance.resourceId, resourceVersionId);
                logSuccess("Conformance saved at " + resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.conformance.name.length < 5) {
                logError("Conformance Name must be at least 5 characters");
                return;
            }
            var conformance = conformanceService.initializeNewConformance().resource;
            conformance.name = vm.conformance.name;
            conformance.identifier = identifierService.getAll();
            if (vm.isEditing) {
                conformanceService.updateConformance(vm.conformance.resourceId, conformance)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                conformanceService.addConformance(conformance)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedConformance();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteConformance;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.conformance = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'conformanceDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$routeParams', 'common', 'fhirServers', 'identifierService', 'conformanceService', 'contactPointService', conformanceDetail]);

})();(function () {
    'use strict';

    var controllerId = 'conformanceSearch';

    function conformanceSearch($location, $mdSidenav, common, config, fhirServers, conformanceService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            conformanceService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {

                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/conformance/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.conformances = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                conformanceService.getConformances(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Conformance Statements from ' + vm.activeServer.name, false);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            conformanceService.getConformancesByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.conformances) ? data.conformances.length : 0) + ' Conformance Statements from ' + vm.activeServer.name);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.conformances = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Conformance Statements';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'conformanceService', conformanceSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'conformanceService';

    function conformanceService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localConformances';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function getConformanceMetadata(baseUrl) {
            var deferred = $q.defer();

            var cachedData = dataCache.readFromCache(dataCacheKey);
            if (cachedData) {
                deferred.resolve(cachedData);
            } else {
                fhirClient.getResource(baseUrl + '/metadata')
                    .then(function (results) {
                        dataCache.addToCache(dataCacheKey, results.data);
                        deferred.resolve(results.data);
                    }, function (outcome) {
                        deferred.reject(outcome);
                    });
            }
            return deferred.promise;
        }

        function addConformance(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Conformance";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedConformance(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedConformances = searchResults.entry;
                for (var i = 0, len = cachedConformances.length; i < len; i++) {
                    if (cachedConformances[i].$$hashKey === hashKey) {
                        cachedConformances.splice(i, 1);
                        searchResults.entry = cachedConformances;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Conformance not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteConformance(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteConformance(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedConformance(hashKey) {
            function getConformance(searchResults) {
                var cachedConformance;
                var cachedConformances = searchResults.entry;
                cachedConformance = _.find(cachedConformances, {'$$hashKey': hashKey});
                if (cachedConformance) {
                    deferred.resolve(cachedConformance);
                } else {
                    deferred.reject('Conformance not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getConformance,
                function () {
                    deferred.reject('Conformance search results not found in cache.');
                });
            return deferred.promise;
        }

        function getConformance(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getConformanceReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Conformance?name=' + input + '&_count=20')
                .then(function (results) {
                    var extensionDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                extensionDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (extensionDefinitions.length === 0) {
                        extensionDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(extensionDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getConformances(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Conformance?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getConformancesByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewConformance() {
            var data = {};
            data.resource = {
                "resourceType": "Conformance",
                "active": true
            };
            return data;
        }

        function updateConformance(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }


        var service = {
            addConformance: addConformance,
            clearCache: clearCache,
            deleteCachedConformance: deleteCachedConformance,
            deleteConformance: deleteConformance,
            getCachedConformance: getCachedConformance,
            getCachedSearchResults: getCachedSearchResults,
            getConformance: getConformance,
            getConformanceMetadata: getConformanceMetadata,
            getConformances: getConformances,
            getConformancesByLink: getConformancesByLink,
            getConformanceReference: getConformanceReference,
            initializeNewConformance: initializeNewConformance,
            updateConformance: updateConformance
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', conformanceService]);
})();(function () {
    'use strict';

    var serviceId = 'attachmentService';

    function attachmentService(common, fileReader) {
        var attachments = [];
        var title = '';
        var $q = common.$q;

        function add(file, scope) {
            var deferred = $q.defer();
            if (file) {
                //TODO - add content type and file size validation
                var attachment = { "contentType": file.type };
                attachment.size = file.size;
                fileReader.readAsDataUrl(file, scope)
                    .then(function (result) {
                        attachment.url = result;
                        attachments.push(attachment);
                        deferred.resolve(attachments);
                    }, function(error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.reject("File not selected.");
            }
            return deferred.promise;
        }

        function addUrl(url) {
            var attachment = { "url": url};
            attachments.push(attachment);
        }

        function getAll() {
            return attachments;
        }

        function getTitle() {
            return title;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = attachments.length; i < len; i++) {
                    if (attachments[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items, instanceTitle) {
            title = instanceTitle;
            if (angular.isArray(items)) {
                attachments = items;
            } else {
                attachments = [];
            }
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            attachments.splice(index, 1);
            return attachments;
        }

        function reset() {
            while (attachments.length > 0) {
                attachments.pop();
            }
        }

        var service = {
            add: add,
            addUrl: addUrl,
            remove: remove,
            getAll: getAll,
            getTitle: getTitle,
            init: init,
            reset: reset
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'fileReader', attachmentService]);
})();(function () {
    'use strict';

    var controllerId = 'attachment';

    function attachment($scope, common, attachmentService) {
        /*jshint validthis:true */
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');

        function activate() {
            common.activateController([getAttachments(), getTitle()], controllerId).then(function () {
                // nothing yet
            });
        }

        function getAttachments() {
            vm.attachments = attachmentService.getAll();
        }

        function getAttachmentTypes() {
            // TODO - load supported attachment file types
        }

        function getTitle() {
            vm.title = attachmentService.getTitle();
        }

        function readFile() {
            attachmentService.add(vm.selectedFile, $scope)
                .then(function (result) {
                    vm.attachments = result;
                }, function (error) {
                    logError(error);
                });
        }

        function removeListItem(item) {
            attachmentService.remove(item);
        }

        function reset(form) {
            vm.attachment = {};
            form.$setPristine();
        }

        vm.attachments = [];
        vm.readFile = readFile;
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.selectedFile = null;
        vm.title = getTitle;

        activate();
    }
    angular.module('FHIRCloud').controller(controllerId, ['$scope', 'common', 'attachmentService', attachment]);

})();
(function () {
    'use strict';

    var controllerId = 'address';

    function address(common, addressService) {
        /* jshint validthis:true */
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        function addToList(form, item) {
            if (form.$valid) {
                addressService.add(_.clone(item));
                vm.addresses = addressService.getAll();
                initAddress();
                form.$setPristine();
            }
        }

        vm.addToList = addToList;

        function getAddresses() {
            vm.addresses = addressService.getAll();
        }

        function getLocation(input) {
            var deferred = $q.defer();
            addressService.searchGoogle(input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(error);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getLocation = getLocation;

        function getMode() {
            vm.mode = addressService.getMode();
            return vm.mode;
        }

        function initAddress() {
            if (vm.mode === 'single' && vm.addresses.length > 0) {
                vm.address = vm.addresses[0];
            }
            else {
                vm.address = {};
            }
            return vm.address;
        }

        function removeListItem(item) {
            addressService.remove(item);
            vm.addresses = addressService.getAll();
        }

        vm.removeListItem = removeListItem;

        function reset(form) {
            initAddress();
            form.$setPristine();
        }

        vm.reset = reset;

        function supportHome() {
            vm.showHome = addressService.supportHome();
            return vm.showHome;
        }

        function activate() {
            common.activateController([getAddresses(), getMode(), supportHome(), initAddress()], controllerId)
                .then(function () {
                    if (vm.addresses.length > 0 && vm.mode === 'single') {
                        vm.address = vm.addresses[0];
                    }
                });
        }

        vm.address = undefined;
        vm.addresses = [];
        vm.mode = 'multi';
        vm.searchText = '';
        vm.showHome = true;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'addressService', address]);

})();
(function () {
    'use strict';

    var serviceId = 'addressService';

    function addressService($http, common) {
        var $q = common.$q;
        var _mode = 'multi';
        var addresses = [];
        var home = true;

        function add(item) {
            // Optimized for complete US addresses
            function updateFromFormattedAddress(item) {
                var address = {};
                address.line = [];
                if (item.text) {
                    var parts = item.text.split(", ");
                    address.line.push(parts[0]);
                    address.city = parts[1];
                    var stateAndZip = parts[2].split(" ");
                    address.state = stateAndZip[0];
                    address.postalCode = stateAndZip[1];
                    address.country = parts[3];
                }
                item.$$hashKey = common.randomHash();
                item.address = address;
                return item;
            }

            var index = _.indexOf(addresses, item);

            if (index > -1) {
                addresses[index] = updateFromFormattedAddress(item);
            } else {
                addresses.push(updateFromFormattedAddress(item));
            }
        }

        function getAll() {
            return _.compact(addresses);
        }

        function getMode() {
            return _mode;
        }

        function init(items, supportHome, mode) {
            _mode = mode ? mode : 'multi';
            home = supportHome;
            addresses = [];
            if (items && angular.isArray(items)) {
                for (var i = 0, len = items.length; i < len; i++) {
                    var item = {"address": items[i]};
                    if (angular.isObject(item.address)) {
                        item.use = item.address.use;
                        item.text =
                            (angular.isArray(item.address.line) ? item.address.line.join(' ') + ', ' : '') + (item.address.city ? (item.address.city + ', ') : '') + (item.address.state ? (item.address.state + ' ') : '') + (item.address.postalCode ? (item.address.postalCode + ', ') : '') + (item.address.country ? (item.address.country) : '');
                        addresses.push(item);
                    }
                }
            }
        }

        function mapFromViewModel() {
            function mapItem(item) {
                var mappedItem = {"line": []};
                if (item) {
                    if (item.use) {
                        mappedItem.use = item.use;
                    }
                    if (item.text) {
                        mappedItem.text = item.text;
                    }
                    if (item.address) {
                        mappedItem.line = item.address.line;
                        mappedItem.city = item.address.city;
                        mappedItem.state = item.address.state;
                        mappedItem.postalCode = item.address.postalCode;
                        mappedItem.country = item.address.country;
                    }
                }
                return mappedItem;
            }

            var mappedAddresses;
            if (addresses) {
                mappedAddresses = [];
                for (var i = 0, len = addresses.length; i < len; i++) {
                    var mappedItem = mapItem(addresses[i]);
                    mappedAddresses.push(mappedItem);
                }
            }
            return mappedAddresses;
        }

        function remove(item) {
            _.remove(addresses, function (n) {
                return item.$$hashKey === n.$$hashKey;
            });
        }

        function reset() {
            while (addresses.length > 0) {
                addresses.pop();
            }
        }

        function searchGoogle(input) {
            var deferred = $q.defer();
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCtbVf7g-kQmMQjF_kAfGawAZabKcq4rdo', {
                params: {
                    address: input
                }
            })
                .success(function (data) {
                    var addresses = [];
                    if (data.results) {
                        angular.forEach(data.results,
                            function (item) {
                                addresses.push(item.formatted_address);
                            });
                    }
                    deferred.resolve(addresses);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function setSingle(item) {
            reset();
            add(item);
        }

        function supportHome() {
            return home;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getMode: getMode,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            searchGoogle: searchGoogle,
            setSingle: setSingle,
            supportHome: supportHome
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$http', 'common', addressService]);
})();(function () {
    'use strict';

    var controllerId = 'careProvider';

    function careProvider(common, fhirServers, organizationReferenceService, practitionerReferenceService, careProviderService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function activate() {
            common.activateController([getActiveServer(), initializeReferences()], controllerId).then(function () {
            });
        }
        vm.activate = activate;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function initializeReferences()
        {
            var careProviders = careProviderService.getAll();
            for (var i = 0, len = careProviders.length; i < len; i++) {
                var item = careProviders[i];
                if (item.reference.indexOf('Practitioner/') !== -1) {
                    practitionerReferenceService.add(item);
                } else {
                    organizationReferenceService.add(item);
                }
            }
            vm.practitioners = practitionerReferenceService.getAll();
            vm.organizations = organizationReferenceService.getAll();
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function addToOrganizationList(organization) {
            if (organization) {
                organizationReferenceService.add(organization);
                vm.organizations = organizationReferenceService.getAll();
                careProviderService.add(organization);
            }
        }

        vm.addToOrganizationList = addToOrganizationList;

        function removeFromOrganizationList(organization) {
            organizationReferenceService.remove(organization);
            vm.organizations = organizationReferenceService.getAll();
            careProviderService.remove(organization);
        }

        vm.removeFromOrganizationList = removeFromOrganizationList;

        function getPractitionerReference(input) {
            var deferred = $q.defer();
            practitionerReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getPractitionerReference = getPractitionerReference;

        function addToPractitionerList(practitioner) {
            if (practitioner) {
                practitionerReferenceService.add(practitioner);
                vm.practitioners = practitionerReferenceService.getAll();
                careProviderService.add(practitioner);
            }
        }

        vm.addToPractitionerList = addToPractitionerList;

        function removeFromPractitionerList(practitioner) {
            practitionerReferenceService.remove(practitioner);
            vm.practitioners = practitionerReferenceService.getAll();
            careProviderService.remove(practitioner);
        }

        vm.removeFromPractitionerList = removeFromPractitionerList;

        vm.activeServer = null;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedOrganization = null;
        vm.selectedPractitioner = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'organizationReferenceService', 'practitionerReferenceService', 'careProviderService', careProvider]);
})();(function () {
    'use strict';

    var serviceId = 'careProviderService';

    function careProviderService(common) {
        var careProviders = [];

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                careProviders[index] = item;
            } else {
                careProviders.push(item);
            }
        }

        function getAll() {
            return _.compact(careProviders);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = careProviders.length; i < len; i++) {
                    if (careProviders[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                careProviders = items;
            } else if (angular.isObject(items)) {
                careProviders = [];
                careProviders.push(items);
            }
            return careProviders;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            careProviders.splice(index, 1);
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', careProviderService]);

})();(function () {
    'use strict';

    var controllerId = 'communication';

    function communication(common, communicationService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getCommunications(), loadLanguageValues()], controllerId)
                .then(function () {
                });
        }

        function addToList(form, item) {
            if (item) {
                vm.communication.language.coding.push(item);
                vm.communication.preferred = false;
                vm.communication.$$hashKey = item.$$hashKey;
                communicationService.add(_.clone(vm.communication));
                vm.communications = communicationService.getAll();
                vm.communication = initCommunication();
                form.$setPristine();
                form.$setUntouched();
            }
        }

        vm.addToList = addToList;

        function getCommunications() {
            return vm.communications = communicationService.getAll();
        }

        function changePreferred(language) {
            communicationService.update(language);
            vm.communications = communicationService.getAll();
        }

        vm.changePreferred = changePreferred;

        function querySearch(query) {
            var results = query ? vm.languageValues.filter(createFilterFor(query)) : [];
            return results;
        }

        vm.querySearch = querySearch;

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(language) {
                return (angular.lowercase(language.display).indexOf(lowercaseQuery) === 0);
            };
        }

        function loadLanguageValues() {
            return vm.languageValues = localValueSets.iso6391Languages();
        }

        function removeFromList(language) {
            communicationService.remove(language);
            vm.communications = communicationService.getAll();
        }

        vm.removeFromList = removeFromList;

        function reset(form) {
            form.$setPristine();
        }

        vm.reset = reset;

        function updateLanguage() {
            communicationService.setSingle(_.clone(vm.language));
        }

        function initCommunication() {
            return vm.communication = { "language": {"coding": [], "text": undefined}, "preferred": false };
        }

        vm.updateLanguage = updateLanguage;
        vm.communication = initCommunication();
        vm.communications = [];
        vm.languageSearchText = '';
        vm.languageValues = [];
        vm.selectedLanguage = {};

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'communicationService', 'localValueSets', communication]);

})();
(function () {
    'use strict';

    var serviceId = 'communicationService';

    function communicationService(common) {
        var communications = [];
        var _mode = 'multi';
        var _communication = { "language": null, "preferred": false };

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                communications[index] = item;
            } else {
                communications.push(item);
            }
        }

        function getAll() {
            return _.compact(communications);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = communications.length; i < len; i++) {
                    if (communications[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function getSingle() {
            return _communication;
        }

        function init(items, mode) {
            _mode = mode ? mode : 'multi';
            if (angular.isArray(items)) {
                communications = items;
            } else if (angular.isObject(items)) {
                communications = [];
                communications.push(items);
            }
            _communication = communications[0];
            return communications;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            communications.splice(index, 1);
        }

        function update(item) {
            if (angular.isUndefined(item.$$hashKey) === false) {
                for (var i = 0, len = communications.length; i < len; i++) {
                    if (communications[i].$$hashKey === item.$$hashKey) {
                        communications[i] = item;
                    } else if (item.preferred == true) {
                        communications[i].preferred = false;
                    }
                }
            }
        }

        function reset() {
            while (communications.length > 0) {
                communications.pop();
            }
        }

        function setSingle(item) {
            _communication = item;
        }

        var service = {
            add: add,
            remove: remove,
            update: update,
            getAll: getAll,
            getMode: getMode,
            getSingle: getSingle,
            init: init,
            reset: reset,
            setSingle: setSingle
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', communicationService]);

})();(function () {
    'use strict';

    var controllerId = 'contact';

    function contact(common, contactService, localValueSets) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getContacts(), getContactTypes()], controllerId).then(function () {
                // nothing yet
            });
        }

        function addToList(form, item) {
            if (form.$valid) {
                contactService.add(item);
                vm.contacts = contactService.getAll();
                vm.contact =  {};
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.contact = item;
        }

        function getContacts() {
            vm.contacts = contactService.getAll();
        }

        function getContactTypes() {
            vm.contactTypes = localValueSets.contactEntityType();
        }

        function removeListItem(item) {
            contactService.remove(item);
            vm.contacts = contactService.getAll();
        }

        function reset(form) {
            vm.contact = {};
            form.$setPristine();
        }
        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.contact = { purpose: { coding: []}};
        vm.contacts = [];
        vm.removeListItem = removeListItem;
        vm.reset = reset;

        activate();
    }
    angular.module('FHIRCloud').controller(controllerId, ['common', 'contactService', 'localValueSets', contact]);

})();
(function () {
    'use strict';

    var serviceId = 'contactService';

    function contactService(common, localValueSets) {
        var contacts = [];

        function add(item) {
            if (item) {
                var index = getIndex(item.$$hashKey);
                if (index > -1) {
                    contacts[index] = item;
                } else {
                    contacts.push(item);
                }
            }
        }

        function getAll() {
            return contacts;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = contacts.length; i < len; i++) {
                    if (contacts[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                contacts = items;
            } else {
                contacts = [];
            }
        }

        function mapFromViewModel() {
            var mappedContacts;

            function mapItem(item) {
                var mappedItem = { "telecom": [], "purpose": {} };
                if (item) {
                    if (item.name) {
                        mappedItem.name = common.makeHumanName(item.name);
                    }
                    if (item.email) {
                        var email = { "value": item.email, "use": "work", "system": "email" };
                        mappedItem.telecom.push(email);
                    }
                    if (item.phone) {
                        var phone = { "value": item.phone, "use": "work", "system": "phone" };
                        mappedItem.telecom.push(phone);
                    }
                    if (item.purpose) {
                        var coding = common.mapDisplayToCoding(item.purpose, localValueSets.contactEntityType());
                        if (coding) {
                            mappedItem.purpose.coding = [];
                            mappedItem.purpose.coding.push(coding);
                        }
                    }
                }
                return mappedItem;
            }

            if (contacts) {
                mappedContacts = [];
                for (var i = 0, len = contacts.length; i < len; i++) {
                    var mappedItem = mapItem(contacts[i]);
                    mappedContacts.push(mappedItem);
                }
            }
            return mappedContacts;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            contacts.splice(index, 1);
        }

        function reset() {
            while (contacts.length > 0) {
                contacts.pop();
            }
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'localValueSets', contactService]);

})();(function () {
    'use strict';

    var controllerId = 'contactPoint';

    function contactPoint(common, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getContactPoints(), supportHome(), supportMobile()], controllerId).then(function () {
                vm.contactPoint = { "use": "work"};
            });
        }

        function addToList(form, item) {
            if (form.$valid) {
                if (item.email) {
                    contactPointService.add({"system": "email", "value": item.email, "use": item.use});
                }
                if (item.phone) {
                    contactPointService.add({"system": "phone", "value": item.phone, "use": item.use});
                }
                if (item.fax) {
                    contactPointService.add({"system": "fax", "value": item.fax, "use": item.use});
                }
                if (item.url) {
                    contactPointService.add({"system": "url", "value": item.url, "use": item.use});
                }
                vm.contactPoints = contactPointService.getAll();
                vm.contactPoint = {};
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.contactPoint = item;
        }

        function getContactPoints() {
            vm.contactPoints = contactPointService.getAll();
        }

        function removeListItem(item) {
            contactPointService.remove(item);
            vm.contactPoints = contactPointService.getAll();
        }

        function reset(form) {
            form.$setPristine();
            vm.contactPoint = { "use": "work"};
        }

        function supportHome() {
            vm.showHome = contactPointService.supportHome();
            return vm.showHome;
        }

        function supportMobile() {
            vm.showMobile = contactPointService.supportMobile();
            return vm.showMobile;
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.contactPoint = { purpose: { coding: []}};
        vm.contactPoints = [];
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.showHome = true;
        vm.showMobile = true;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'contactPointService', contactPoint]);

})();
(function () {
    'use strict';

    var serviceId = 'contactPointService';

    function contactPointService() {
        var contactPoints = [];
        var home = true;
        var mobile = true;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                contactPoints[index] = item;
            } else {
                contactPoints.push(item);
            }
        }

        function getAll() {
            return contactPoints;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = contactPoints.length; i < len; i++) {
                    if (contactPoints[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items, showHome, showMobile) {
            home = showHome;
            mobile = showMobile;
            if (angular.isArray(items)) {
                contactPoints = items;
            } else {
                contactPoints = [];
            }
        }

        function mapFromViewModel() {
            function mapItem(item) {
                var mappedItems = [];
                var mappedItem = {};
                if (item) {
                    if (item.phone) {
                        mappedItem = {"system": "phone", "value": item.phone};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.fax) {
                        mappedItem = {"system": "fax", "value": item.fax};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.email) {
                        mappedItem = {"system": "email", "value": item.email};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                    if (item.email) {
                        mappedItem = {"system": "url", "value": item.url};
                        if (item.use) {
                            mappedItem.use = item.use;
                        }
                        mappedItems.push(mappedItem);
                    }
                }
                return mappedItems;
            }

            var mappedContactPoints;
            if (contactPoints) {
                mappedContactPoints = [];
                for (var i = 0, len = contactPoints.length; i < len; i++) {
                    var mappedItems = mapItem(contactPoints[i]);
                    for (var j = 0, len2 = mappedItems.length; j < len2; j++) {
                        mappedContactPoints.push(mappedItems[j]);
                    }
                }
            }
            return contactPoints;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            contactPoints.splice(index, 1);
        }

        function reset() {
            while (contactPoints.length > 0) {
                contactPoints.pop();
            }
        }

        function supportHome() {
            return home;
        }

        function supportMobile() {
            return mobile;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            supportHome: supportHome,
            supportMobile: supportMobile
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [contactPointService]);
   
})();
(function () {
    'use strict';

    var controllerId = 'demographics';

    function demographics(common, config, demographicsService, localValueSets) {
        /*jshint validthis:true */
        var vm = this;
        var keyCodes = config.keyCodes;

        function activate() {
            common.activateController([], controllerId).then(function () {
                initData();
            });
        }

        function addLanguage($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.selectedLanguage = null;
            } else if ($event.keyCode === keyCodes.enter) {
                if (vm.selectedLanguage !== null) {
                    var coding = {"coding": [vm.selectedLanguage], "text": vm.selectedLanguage.display};
                    if (_.first(vm.demographics.language, coding).length === 0) {
                        vm.demographics.language.push(coding);
                    }
                    updateLanguage();
                }
                vm.selectedLanguage = null;
            }
        }

        function loadEthnicities() {
            return vm.ethnicities = localValueSets.ethnicity();
        }

        vm.loadEthnicities = loadEthnicities;

        function loadGenders() {
            return vm.genders = localValueSets.administrativeGender();
        }

        vm.loadGenders = loadGenders;

        function loadLanguages() {
            return vm.languages = localValueSets.iso6391Languages();
        }

        vm.loadLanguages = loadLanguages;

        function loadMaritalStatuses() {
            return vm.maritalStatuses = localValueSets.maritalStatus();
        }

        vm.loadMaritalStatuses = loadMaritalStatuses;

        function loadReligions() {
            return vm.religions = localValueSets.religion();
        }

        vm.loadReligions = loadReligions;

        function loadRaces() {
            return vm.races = localValueSets.race();
        }

        vm.loadRaces = loadRaces;

        function initData() {
            vm.demographics.birthDate = demographicsService.getBirthDate();
            vm.demographics.birthOrder = demographicsService.getBirthOrder();
            vm.demographics.deceased = demographicsService.getDeceased();
            vm.demographics.deceasedDate = demographicsService.getDeceasedDate();
            vm.demographics.gender = demographicsService.getGender();
            vm.demographics.language = demographicsService.getLanguage();
            vm.demographics.maritalStatus = demographicsService.getMaritalStatus();
            vm.demographics.multipleBirth = demographicsService.getMultipleBirth();
            // Known extensions
            vm.demographics.race = demographicsService.getRace();
            vm.demographics.religion = demographicsService.getReligion();
            vm.demographics.ethnicity = demographicsService.getEthnicity();
            vm.demographics.mothersMaidenName = demographicsService.getMothersMaidenName();
            vm.demographics.placeOfBirth = demographicsService.getBirthPlace();

            loadMaritalStatuses();
            loadRaces();
            loadEthnicities();
            loadReligions();
        }

        function updateBirthDate() {
            demographicsService.setBirthDate(vm.demographics.birthDate);
        }


        function updateBirthOrder() {
            demographicsService.setBirthOrder(vm.demographics.birthOrder);
        }


        function updateDeceased() {
            demographicsService.setDeceased(vm.demographics.deceased);
        }


        function updateDeceasedDate() {
            demographicsService.setDeceasedDate(vm.demographics.deceasedDate);
        }

        function updateGender() {
            demographicsService.setGender(vm.demographics.gender);
        }

        function updateMaritalStatus(maritalStatusCoding) {
            var codeableConcept = {
                "text": maritalStatusCoding.display,
                "coding": [{
                    "system": maritalStatusCoding.system,
                    "code": maritalStatusCoding.code,
                    "display": maritalStatusCoding.display
                }]
            };
            demographicsService.setMaritalStatus(codeableConcept);
        }

        function updateMultipleBirth() {
            demographicsService.setMultipleBirth(vm.demographics.multipleBirth);
        }

        function updateRace(raceCoding) {
            var codeableConcept = {
                "text": raceCoding.display,
                "coding": [{
                    "system": vm.races.system,
                    "code": raceCoding.code,
                    "display": raceCoding.display
                }]
            };
            demographicsService.setRace(codeableConcept);
        }

        function updateReligion(religionCoding) {
            var codeableConcept = {
                "text": religionCoding.display,
                "coding": [{
                    "system": vm.religions.system,
                    "code": religionCoding.code,
                    "display": religionCoding.display
                }]
            };
            demographicsService.setReligion(codeableConcept);
        }

        function updateEthnicity(ethnicityCoding) {
            var codeableConcept = {
                "text": ethnicityCoding.display,
                "coding": [{
                    "system": vm.ethnicities.system,
                    "code": ethnicityCoding.code,
                    "display": ethnicityCoding.display
                }]
            };
            demographicsService.setEthnicity(codeableConcept);
        }

        vm.addLanguage = addLanguage;
        vm.demographics = {
            "birthDate": null,
            "birthOrder": null,
            "deceased": false,
            "deceasedDate": null,
            "gender": null,
            "language": [],
            "maritalStatus": null,
            "multipleBirth": false
        };
        vm.genders = [];
        vm.maritalStatuses = [];
        vm.religions = [];
        vm.races = null;
        vm.ethnicityCoding = null;
        vm.raceCoding = null;
        vm.religionCoding = null;
        vm.raceCoding = null;
        vm.maritalStatusCoding = null;
        vm.ethnicities = [];
        vm.updateBirthDate = updateBirthDate;
        vm.updateBirthOrder = updateBirthOrder;
        vm.updateDeceased = updateDeceased;
        vm.updateDeceasedDate = updateDeceasedDate;
        vm.updateGender = updateGender;
        vm.updateMaritalStatus = updateMaritalStatus;
        vm.updateMultipleBirth = updateMultipleBirth;
        vm.updateRace = updateRace;
        vm.updateReligion = updateReligion;
        vm.updateEthnicity = updateEthnicity;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'config', 'demographicsService', 'localValueSets', demographics]);

})();
(function () {
    'use strict';

    var serviceId = 'demographicsService';

    function demographicsService($filter) {
        var _birthDate = null;
        var _birthOrder = null;
        var _deceased = false;
        var _deceasedDate = null;
        var _language = [];
        var _multipleBirth = false;
        var _gender = null;
        var _maritalStatus = undefined;
        var _race = undefined;
        var _religion = undefined;
        var _ethnicity = undefined;
        var _birthPlace = undefined;
        var _mothersMaidenName = undefined;

        function getRace() {
            return _race;
        }

        function getReligion() {
            return _religion;
        }

        function getEthnicity() {
            return _ethnicity;
        }

        function getBirthPlace() {
            return _birthPlace;
        }

        function getMothersMaidenName() {
            return _mothersMaidenName;
        }

        function getBirthDate() {
            return _birthDate;
        }

        function getBirthOrder() {
            return _birthOrder;
        }

        function getDeceased() {
            return _deceased;
        }

        function getDeceasedDate() {
            return _deceasedDate;
        }

        function getGender() {
            return _gender;
        }

        function getLanguage() {
            return _language;
        }

        function getMaritalStatus() {
            return _maritalStatus;
        }

        function getMultipleBirth() {
            return _multipleBirth;
        }

        function init(gender, maritalStatus, language) {
            if (gender) {
                _gender = gender;
            }
            if (maritalStatus) {
                _maritalStatus = maritalStatus;
            }
            if (language) {
                _language = language;
            }
        }

        function initBirth(multipleBirth, birthOrder) {
            if (birthOrder) {
                _birthOrder = birthOrder;
                _multipleBirth = true;
            } else {
                _multipleBirth = multipleBirth;
            }
        }

        function initDeath(deceased, dateOfDeath) {
            if (dateOfDeath) {
                _deceasedDate = dateOfDeath;
                _deceased = true;
            } else {
                _deceased = deceased;
            }
        }

        function initializeKnownExtensions(extensions) {
            if (extensions) {
                for (var i = 0, len = extensions.length; i < len; i++) {
                    var ext = extensions[i];
                    if (ext.url) {
                        switch (ext.url) {
                            case "http://hl7.org/fhir/StructureDefinition/us-core-race":
                                _race = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/us-core-religion":
                                _religion = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity":
                                _ethnicity = ext.valueCodeableConcept;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName":
                                _mothersMaidenName = ext.valueString;
                                break;
                            case "http://hl7.org/fhir/StructureDefinition/birthPlace":
                                _birthPlace = ext.valueAddress;
                                _birthPlace.text = $filter('singleLineAddress')(ext.valueAddress);
                                break;
                            default:
                            break;
                        }
                    }
                }
            }
        }

        function setRace(value) {
            _race = value;
        }

        function setReligion(value) {
            _religion = value;
        }

        function setEthnicity(value) {
            _ethnicity = value;
        }

        function setBirthPlace(value) {
            _birthPlace = value;
        }

        function setMothersMaidenName(value) {
            _mothersMaidenName = value;
        }

        function setBirthDate(value) {
            _birthDate = new Date(value);
        }

        function setBirthOrder(value) {
            _birthOrder = value;
        }

        function setDeceased(value) {
            _deceased = value;
            if (_deceased === false) {
                _deceasedDate = null;
            }
        }

        function setDeceasedDate(value) {
            _deceasedDate = value;
        }

        // only 1 item in array permitted
        function setGender(value) {
            _gender = value;
        }

        function setLanguage(value) {
            _language = value;
        }

        // only 1 item in array permitted
        function setMaritalStatus(value) {
            _maritalStatus.coding = [];
            if (value) {
                if (angular.isObject(value)) {
                    _maritalStatus.coding.push(value);
                } else {
                    _maritalStatus.coding.push(JSON.parse(value));
                }
            }
        }

        function setMultipleBirth(value) {
            _multipleBirth = value;
            if (_multipleBirth === false) {
                _birthOrder = null;
            }
        }

        var service = {
            getBirthDate: getBirthDate,
            getBirthOrder: getBirthOrder,
            getDeceased: getDeceased,
            getDeceasedDate: getDeceasedDate,
            getGender: getGender,
            getLanguage: getLanguage,
            getMaritalStatus: getMaritalStatus,
            getMultipleBirth: getMultipleBirth,
            init: init,
            initBirth: initBirth,
            initDeath: initDeath,
            setBirthDate: setBirthDate,
            setBirthOrder: setBirthOrder,
            setDeceased: setDeceased,
            setDeceasedDate: setDeceasedDate,
            setGender: setGender,
            setLanguage: setLanguage,
            setMaritalStatus: setMaritalStatus,
            setMultipleBirth: setMultipleBirth,
            getRace: getRace,
            setRace: setRace,
            getEthnicity: getEthnicity,
            setEthnicity: setEthnicity,
            getReligion: getReligion,
            setReligion: setReligion,
            getMothersMaidenName: getMothersMaidenName,
            setMothersMaidenName: setMothersMaidenName,
            getBirthPlace: getBirthPlace,
            setBirthPlace: setBirthPlace,
            initializeKnownExtensions: initializeKnownExtensions
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', demographicsService]);

})();(function () {
    'use strict';

    var controllerId = 'humanName';

    function humanName(common, humanNameService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getHumanNames(), getMode(), initName()], controllerId)
                .then(function () {
                    if (vm.humanNames.length > 0 && vm.mode === 'single') {
                        vm.humanName = vm.humanNames[0];
                    } else {
                        vm.humanName = {"use": "usual"};
                    }
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                var name = {
                    "prefix": [],
                    "suffix": [],
                    "given": [],
                    "family": [],
                    "use": item.use,
                    "period": item.period
                }
                if (angular.isDefined(item.prefix)) {
                    name.prefix =  item.prefix.split(' ');
                }
                if (angular.isDefined(item.suffix)) {
                    name.suffix =  item.suffix.split(' ');
                }
                if (angular.isDefined(item.given)) {
                    name.given =  item.given.split(' ');
                }
                if (angular.isDefined(item.family)) {
                    name.family =  item.family.split(' ');
                }
                humanNameService.add(_.clone(name));
                vm.humanNames = humanNameService.getAll();
                initName();
                form.$setPristine();
            }
        }

        function editListItem(item) {
            vm.humanName = item;
        }

        function getHumanNames() {
            vm.humanNames = humanNameService.getAll();
        }

        function getMode() {
            vm.mode = humanNameService.getMode();
            return vm.mode;
        }

        function initName() {
            if (vm.mode === 'single' && vm.humanNames.length > 0) {
                vm.humanName = vm.humanNames[0];
            } else {
                vm.humanName = {"use": "usual"};
            }
            return vm.humanName;
        }

        function removeListItem(item) {
            vm.humanNames = humanNameService.remove(item);
        }

        function reset(form) {
            initName();
            form.$setPristine();
        }

        function updateName() {
            if (vm.mode === 'single') {
                humanNameService.setSingle(vm.humanName);
            }
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.humanName = {};
        vm.humanNames = [];
        vm.mode = 'multi';
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.updateName = updateName;

        activate();
    }
    angular.module('FHIRCloud').controller(controllerId, ['common', 'humanNameService', humanName]);

})();
(function () {
    'use strict';

    var serviceId = 'humanNameService';

    function humanNameService($filter) {
        var humanNames = [];
        var _mode = 'multi';

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                humanNames[index] = item;
            } else {
                item.text = $filter('fullName')(item);
                humanNames.push(item);
            }
        }

        function getAll() {
            return _.compact(humanNames);
        }

        function getFullName() {
            var fullName = 'Unspecified Name';
            if (humanNames.length > 0) {
                fullName = humanNames[0].given + ' ' + humanNames[0].family;
            }
            return fullName;
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = humanNames.length; i < len; i++) {
                    if (humanNames[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function init(items, mode) {
            _mode = mode ? mode : 'multi';
            if (angular.isArray(items)) {
                humanNames = [];
                _.forEach(items, function (item) {
                    if ((angular.isUndefined(item) || item === null) === false) {
                        var humanName = {};
                        if (angular.isArray(item.given)) {
                            humanName.given = item.given;
                        }
                        if (angular.isArray(item.family)) {
                            humanName.family = item.family;
                        }
                        if (angular.isArray(item.prefix)) {
                            humanName.prefix = item.prefix;
                        }
                        if (angular.isArray(item.suffix)) {
                            humanName.suffix = item.suffix;
                        }
                        humanName.text = item.text || $filter('fullName')(item);
                        humanName.period = item.period;
                        humanName.use = item.use;
                        humanNames.push(humanName);
                    }
                });
            } else {
                humanNames = [];
            }
            return humanNames;
        }

        function mapFromViewModel() {
            var model = [];
            _.forEach(humanNames, function (item) {
                var mappedItem = {};
                mappedItem.given = item.given;
                mappedItem.family = item.family;
                mappedItem.prefix = item.prefix;
                mappedItem.suffix = item.suffix;
                mappedItem.text = item.text;
                mappedItem.period = item.period;
                mappedItem.use = item.use;
                model.push(mappedItem);
            });
            return model;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            humanNames.splice(index, 1);
            return humanNames;
        }

        function reset() {
            while (humanNames.length > 0) {
                humanNames.pop();
            }
        }

        function setSingle(item) {
            reset();
            add(item);
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getFullName: getFullName,
            getMode: getMode,
            init: init,
            mapFromViewModel: mapFromViewModel,
            reset: reset,
            setSingle: setSingle
        };

        return service;

    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', humanNameService]);

})();(function () {
    'use strict';

    var controllerId = 'identifier';

    function identifier(common, identifierService) {
        /* jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController([getIdentifiers(), getMode()], controllerId)
                .then(function () {
                    if (vm.identifiers.length > 0 && vm.mode === 'single') {
                        vm.identifier = vm.identifiers[0];
                    }
                });
        }

        function addToList(form, item) {
            if (form.$valid) {
                identifierService.add(_.clone(item));
                vm.identifiers = identifierService.getAll();
                vm.identifier = {};
                form.$setPristine();
                form.$setUntouched();
            }
        }

        function editListItem(item) {
            vm.identifier = item;
        }

        function generateIdentifier() {
            return common.generateUUID();
        }

        function getIdentifiers() {
            vm.identifiers = identifierService.getAll();
        }

        function getMode() {
            vm.mode = identifierService.getMode();
            return vm.mode;
        }

        function removeListItem(item) {
            identifierService.remove(item);
            vm.identifiers = identifierService.getAll();
        }

        function reset(form) {
            vm.identifier = { "use": "usual"};
            form.$setPristine();
        }

        function updateIdentifier() {
            identifierService.setSingle(_.clone(vm.identifier));
        }

        vm.addToList = addToList;
        vm.editListItem = editListItem;
        vm.genId = generateIdentifier;
        vm.identifier = {};
        vm.identifiers = [];
        vm.mode = 'multi';
        vm.removeListItem = removeListItem;
        vm.reset = reset;
        vm.updateIdentifier = updateIdentifier;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId, ['common', 'identifierService', identifier]);

})();
(function () {
    'use strict';

    var serviceId = 'identifierService';

    function identifierService(common) {
        var identifiers = [];
        var _mode = 'multi';
        var _identifier;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                identifiers[index] = item;
            } else {
                identifiers.push(item);
            }
        }

        function getAll() {
            return _.compact(identifiers);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = identifiers.length; i < len; i++) {
                    if (identifiers[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function getMode() {
            return _mode;
        }

        function getSingle() {
            return _identifier;
        }

        function init(items, mode, type) {
            _mode = mode ? mode : 'multi';
            if (angular.isArray(items)) {
                identifiers = items;
            } else if (angular.isObject(items)) {
                identifiers = [];
                identifiers.push(items);
            }
            else {
                identifiers = [];
                var system = "urn:fhir-cloud:id";
                if (type) {
                    system = "urn:fhir-cloud:" + type;
                }
                var defaultId = {
                    "use": "usual",
                    "system": system,
                    "value": common.generateUUID()
                };
                identifiers.push(defaultId);
            }
            _identifier = identifiers[0];
            return identifiers;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            identifiers.splice(index, 1);
        }

        function reset() {
            while (identifiers.length > 0) {
                identifiers.pop();
            }
        }

        function setSingle(item) {
            _identifier = item;
        }

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            getMode: getMode,
            getSingle: getSingle,
            init: init,
            reset: reset,
            setSingle: setSingle
        };
        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', identifierService]);

})();(function () {
    'use strict';

    var controllerId = 'organizationReference';

    function organizationReference(common, fhirServers, organizationReferenceService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
            });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function addToList(organization) {
            if (organization) {
                logInfo("Adding " + organization.reference + " to list", null, noToast);
                organizationReferenceService.add(organization);
                vm.organizations = organizationReferenceService.getAll();
            }
        }
        vm.addToList = addToList;

        function removeFromList(organization) {
            organizationReferenceService.remove(organization);
            vm.organizations = organizationReferenceService.getAll();
        }

        vm.removeFromList = removeFromList;


        vm.activeServer = null;
        vm.activate = activate;
        vm.isBusy = false;
        vm.organizations = [];
        vm.organizationSearchText = '';
        vm.selectedOrganization = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'organizationReferenceService', organizationReference]);
})();(function () {
    'use strict';

    var serviceId = 'organizationReferenceService';

    function organizationReferenceService($filter, common, fhirClient) {
        var organizationList = [];
        var $q = common.$q;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                organizationList[index] = item;
            } else {
                organizationList.push(item);
            }
        }

        function getAll() {
            return _.compact(organizationList);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = organizationList.length; i < len; i++) {
                    if (organizationList[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function remoteLookup(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Organization?name=' + input + '&_count=10')
                .then(function (results) {
                    var organizations = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Organization') {
                                organizations.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/Organization/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(organizations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function init(items) {
            if (angular.isArray(items)) {
                organizationList = [];
                _.forEach(items, function (item) {
                    if (item) {
                        organizationList.push(item);
                    }
                });
            } else {
                organizationList = [];
            }
            return organizationList;
        }


        function remove(item) {
            var index = getIndex(item.$$hashKey);
            organizationList.splice(index, 1);
            return organizationList;
        }

        function reset() {
            while (organizationList.length > 0) {
                organizationList.pop();
            }
        }


        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            remoteLookup: remoteLookup,
            init: init,
            reset: reset
        };

        return service;

    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', 'common', 'fhirClient', organizationReferenceService]);

})();(function () {
    'use strict';

    var controllerId = 'practitionerReference';

    function practitionerReference(common, fhirServers, practitionerReferenceService) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
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
            practitionerReferenceService.remoteLookup(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getPractitionerReference = getPractitionerReference;

        function addToList(practitioner) {
            if (practitioner) {
                logInfo("Adding " + practitioner.reference + " to list", null, noToast);
                practitionerReferenceService.add(practitioner);
                vm.practitioners = practitionerReferenceService.getAll();
            }
        }
        vm.addToList = addToList;

        function removeFromList(practitioner) {
            practitionerReferenceService.remove(practitioner);
            vm.practitioners = practitionerReferenceService.getAll();
        }

        vm.removeFromList = removeFromList;


        vm.activeServer = null;
        vm.activate = activate;
        vm.isBusy = false;
        vm.practitioners = [];
        vm.practitionerSearchText = '';
        vm.selectedPractitioner = null;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['common', 'fhirServers', 'practitionerReferenceService', practitionerReference]);
})();(function () {
    'use strict';

    var serviceId = 'practitionerReferenceService';

    function practitionerReferenceService($filter, common, fhirClient) {
        var practitionerList = [];
        var $q = common.$q;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                practitionerList[index] = item;
            } else {
                practitionerList.push(item);
            }
        }

        function getAll() {
            return _.compact(practitionerList);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = practitionerList.length; i < len; i++) {
                    if (practitionerList[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function remoteLookup(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Practitioner?name=' + input + '&_count=10')
                .then(function (results) {
                    var practitioners = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Practitioner') {
                                practitioners.push({
                                    display: $filter('fullName')(item.resource.name),
                                    reference: baseUrl + '/Practitioner/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (practitioners.length === 0) {
                        practitioners.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(practitioners);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function init(items) {
            if (angular.isArray(items)) {
                practitionerList = [];
                _.forEach(items, function (item) {
                    if (item) {
                        practitionerList.push(item);
                    }
                });
            } else {
                practitionerList = [];
            }
            return practitionerList;
        }


        function remove(item) {
            var index = getIndex(item.$$hashKey);
            practitionerList.splice(index, 1);
            return practitionerList;
        }

        function reset() {
            while (practitionerList.length > 0) {
                practitionerList.pop();
            }
        }


        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            remoteLookup: remoteLookup,
            init: init,
            reset: reset
        };

        return service;

    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', 'common', 'fhirClient', practitionerReferenceService]);

})();(function () {
    'use strict';

    var controllerId = 'extensionDefinitionDetail';

    function extensionDefinitionDetail($location, $mdDialog, $routeParams, common, fhirServers, identifierService, extensionDefinitionService, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var noToast = false;

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteExtensionDefinition(extensionDefinition) {
            function executeDelete() {
                if (extensionDefinition && extensionDefinition.resourceId && extensionDefinition.hashKey) {
                    extensionDefinitionService.deleteCachedExtensionDefinition(extensionDefinition.hashKey, extensionDefinition.resourceId)
                        .then(function () {
                            logSuccess("Deleted extensionDefinition " + extensionDefinition.name);
                            $location.path('/extensionDefinitions');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + extensionDefinition.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(extensionDefinition) {
            if (extensionDefinition && extensionDefinition.hashKey) {
                $location.path('/extensionDefinition/edit/' + extensionDefinition.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedExtensionDefinition() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (angular.isDefined(rawData.text)) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative = '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.extensionDefinition = rawData;
                if (angular.isUndefined(vm.extensionDefinition.code)) {
                    vm.extensionDefinition.code = {"coding": []};
                }
                vm.title = vm.extensionDefinition.name;
                identifierService.init(vm.extensionDefinition.identifier);
                contactPointService.init(vm.extensionDefinition.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = extensionDefinitionService.initializeNewExtensionDefinition();
                intitializeRelatedData(data);
                vm.title = 'Add New ExtensionDefinition';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    extensionDefinitionService.getCachedExtensionDefinition($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {

                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/ExtensionDefinition/' + $routeParams.id;
                    extensionDefinitionService.getExtensionDefinition(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.extensionDefinition) {
                title = vm.title = 'Edit ' + ((vm.extensionDefinition && vm.extensionDefinition.fullName) || '');
            } else {
                title = vm.title = 'Add New ExtensionDefinition';
            }
            vm.title = title;
            return vm.title;
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("ExtensionDefinition saved, but location is unavailable. CORS not implemented correctly at remote host.", null, noToast);
            } else {
                vm.extensionDefinition.resourceId = common.setResourceId(vm.extensionDefinition.resourceId, resourceVersionId);
                logSuccess("ExtensionDefinition saved at " + resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.extensionDefinition.name.length < 5) {
                logError("ExtensionDefinition Name must be at least 5 characters");
                return;
            }
            var extensionDefinition = extensionDefinitionService.initializeNewExtensionDefinition().resource;
            extensionDefinition.name = vm.extensionDefinition.name;
            extensionDefinition.identifier = identifierService.getAll();
            if (vm.isEditing) {
                extensionDefinitionService.updateExtensionDefinition(vm.extensionDefinition.resourceId, extensionDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                extensionDefinitionService.addExtensionDefinition(extensionDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedExtensionDefinition();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteExtensionDefinition;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.extensionDefinition = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'extensionDefinitionDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdDialog', '$routeParams', 'common', 'fhirServers', 'identifierService', 'extensionDefinitionService', 'contactPointService', extensionDefinitionDetail]);

})();(function () {
    'use strict';

    var controllerId = 'extensionDefinitionSearch';

    function extensionDefinitionSearch($location, $mdSidenav, common, config, fhirServers, extensionDefinitionService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            extensionDefinitionService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    $mdSidenav('right').close();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/extensionDefinition/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.extensionDefinitions = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                extensionDefinitionService.getExtensionDefinitions(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' ExtensionDefinitions from ' + vm.activeServer.name, false);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            extensionDefinitionService.getExtensionDefinitionsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.extensionDefinitions) ? data.extensionDefinitions.length : 0) + ' ExtensionDefinitions from ' + vm.activeServer.name);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.extensionDefinitions = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'ExtensionDefinitions';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'extensionDefinitionService', extensionDefinitionSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'extensionDefinitionService';

    function extensionDefinitionService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localExtensionDefinitions';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addExtensionDefinition(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/ExtensionDefinition";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedExtensionDefinition(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedExtensionDefinitions = searchResults.entry;
                for (var i = 0, len = cachedExtensionDefinitions.length; i < len; i++) {
                    if (cachedExtensionDefinitions[i].$$hashKey === hashKey) {
                        cachedExtensionDefinitions.splice(i, 1);
                        searchResults.entry = cachedExtensionDefinitions;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('ExtensionDefinition not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteExtensionDefinition(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteExtensionDefinition(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedExtensionDefinition(hashKey) {
            function getExtensionDefinition(searchResults) {
                var cachedExtensionDefinition;
                var cachedExtensionDefinitions = searchResults.entry;
                cachedExtensionDefinition = _.find(cachedExtensionDefinitions, {'$$hashKey': hashKey});
                if (cachedExtensionDefinition) {
                    deferred.resolve(cachedExtensionDefinition);
                } else {
                    deferred.reject('ExtensionDefinition not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getExtensionDefinition,
                function () {
                    deferred.reject('ExtensionDefinition search results not found in cache.');
                });
            return deferred.promise;
        }

        function getExtensionDefinition(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getExtensionDefinitionReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/ExtensionDefinition?name=' + input + '&_count=20')
                .then(function (results) {
                    var extensionDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                extensionDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (extensionDefinitions.length === 0) {
                        extensionDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(extensionDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getExtensionDefinitions(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/ExtensionDefinition?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getExtensionDefinitionsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewExtensionDefinition() {
            var data = {};
            data.resource = {
                "resourceType": "ExtensionDefinition",
                "identifier": [],
                "telecom": [],
                 "active": true
            };
            return data;
        }

        function updateExtensionDefinition(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addExtensionDefinition: addExtensionDefinition,
            clearCache: clearCache,
            deleteCachedExtensionDefinition: deleteCachedExtensionDefinition,
            deleteExtensionDefinition: deleteExtensionDefinition,
            getCachedExtensionDefinition: getCachedExtensionDefinition,
            getCachedSearchResults: getCachedSearchResults,
            getExtensionDefinition: getExtensionDefinition,
            getExtensionDefinitions: getExtensionDefinitions,
            getExtensionDefinitionsByLink: getExtensionDefinitionsByLink,
            getExtensionDefinitionReference: getExtensionDefinitionReference,
            initializeNewExtensionDefinition: initializeNewExtensionDefinition,
            updateExtensionDefinition: updateExtensionDefinition
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', extensionDefinitionService]);

})();(function () {
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
                    var m = moment(new Date());
                    vm.vitals.date = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute());
                    _getPatientContext();

                });
        }

        function _initializeBP() {
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
                    case 'bp-centiles':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/bp-centiles/launch.html?";
                        break;
                    case 'growth-chart':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/growth-chart/launch.html?";
                        break;
                    case 'disease-monograph':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/disease-monograph/launch.html?";
                        break;
                    case 'diabetes-monograph':
                        appUrl = "https://fhir-dstu2.smarthealthit.org/apps/diabetes-monograph/launch.html?";
                        break;
                    default:
                        appUrl = "https://fhir.meducation.com/launch.html?";
                }
                var fhirServer = encodeURIComponent(vm.activeServer.baseUrl);

                // "https://fhir-dstu2.smarthealthit.org/apps/cardiac-risk/launch.html?fhirServiceUrl=https%3A%2F%2Ffhir-open-api-dstu2.smarthealthit.org&patientId=1551992";
                vm.smartLaunchUrl = appUrl + 'fhirServiceUrl=' + fhirServer + '&patientId=' + $routeParams.patientId;
                logInfo("Launching SMART on FHIR application, please wait ...");

            } else if (angular.isDefined($window.localStorage.patient)) {
                vm.consultation.patient = JSON.parse($window.localStorage.patient);
                vm.consultation.patient.fullName = $filter('fullName')(vm.consultation.patient.name);
                vm.consultation.patient.age = common.calculateAge(vm.consultation.patient.birthDate);
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
                        $location.path('/lab');
                        break;
                    case 2:
                        $location.path('consultation/smart/cardiac-risk/' + vm.consultation.patient.id);
                        break;
                    case 3:
                        $location.path('consultation/smart/disease-monograph/' + vm.consultation.patient.id);
                        break;
                    case 4:
                        $location.path('consultation/smart/diabetes-monograph/' + vm.consultation.patient.id);
                        break;
                    case 5:
                        $location.path('consultation/smart/bp-centiles/' + vm.consultation.patient.id);
                        break;
                    case 6:
                        $location.path('consultation/smart/meducation/' + vm.consultation.patient.id);
                        break;
                    case 7:
                        $location.path('/patient');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Back to face sheet', icon: 'person', index: 0},
                    {name: 'Lab', icon: 'lab', index: 1},
                    {name: 'Cardiac Risk', icon: 'cardio', index: 2},
/*                    {name: 'Disease monograph', icon: 'smart', index: 3},
                    {name: 'Diabetes monograph', icon: 'smart', index: 4},
                    {name: 'BP Centiles', icon: 'smart', index: 5},
                    {name: 'Meducation', icon: 'rx', index: 6},*/
                    {name: 'Find another patient', icon: 'person', index: 7}
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
            smokingStatusObs.appliesDateTime = vm.vitals.date.toISOString();
            return smokingStatusObs;
        }

        function _buildHeartRate() {
            var systolicObs = observationService.initializeNewObservation();
            systolicObs.code = {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "8867-4",
                    "display": "Heart rate",
                    "primary": true
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
            systolicObs.appliesDateTime = vm.vitals.date.toISOString();
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
                    "display": "Respiratory rate",
                    "primary": true
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

            systolicObs.appliesDateTime = vm.vitals.date.toISOString();
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
            bodyTempObs.appliesDateTime = vm.vitals.date.toISOString();
            return bodyTempObs;
        }

        function _buildSystolic() {
            var systolicObs = observationService.initializeNewObservation();
            systolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "271649006",
                    "display": "Systolic blood pressure",
                    "primary": false
                }, {
                    "system": "http://loinc.org",
                    "code": "8480-6",
                    "display": "Systolic blood pressure",
                    "primary": true
                }],
                "text": "Systolic blood pressure"
            };
            systolicObs.valueQuantity = {
                "value": vm.vitals.bp.systolic,
                "units": "mm[Hg]",
                "system": "http://loinc.org",
                "code": "20053-5"
            };
            systolicObs.status = "final";
            systolicObs.reliability = "ok";
            systolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            systolicObs.appliesDateTime = vm.vitals.date.toISOString();
            return systolicObs;
        }

        function _buildDiastolic() {
            var diastolicObs = observationService.initializeNewObservation();
            diastolicObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "271650006",
                    "display": "Diastolic blood pressure",
                    "primary": false
                }, {
                    "system": "http://loinc.org",
                    "code": "8462-4",
                    "display": "Diastolic blood pressure",
                    "primary": true
                }],
                "text": "Diastolic blood pressure"
            };
            diastolicObs.valueQuantity = {
                "value": vm.vitals.bp.diastolic,
                "units": "mm[Hg]",
                "system": "http://loinc.org",
                "code": "20053-5"
            };
            diastolicObs.status = "final";
            diastolicObs.reliability = "ok";
            diastolicObs.subject = {
                "reference": 'Patient/' + vm.consultation.patient.id,
                "display": vm.consultation.patient.fullName
            };
            diastolicObs.appliesDateTime = vm.vitals.date.toISOString();
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
                            "display": "Blood pressure systolic & diastolic",
                            "primary": true
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
                bpInterpretationObs.appliesDateTime = vm.vitals.date.toISOString();

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
                    "display": "Body mass index",
                    "primary": false
                }, {
                    "system": "http://loinc.org",
                    "code": "39156-5",
                    "display": "Body mass index (BMI) [Ratio]",
                    "primary": true
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
            bmiObs.appliesDateTime = vm.vitals.date.toISOString();

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
                        "display": "Body height",
                        "primary": true
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "248333004",
                        "display": "Standing height",
                        "primary": false
                    }],
                    "text": "Standing body height"
                };
            } else {
                heightObs.code = {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "8306-3",
                        "display": "Body height - lying",
                        "primary": true
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "248334005",
                        "display": "Length of body",
                        "primary": false
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
            heightObs.appliesDateTime = vm.vitals.date.toISOString();

            return heightObs;
        }

        function _buildWeightObs() {
            var weightObs = observationService.initializeNewObservation();
            weightObs.code = {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "27113001",
                    "display": "Body weight",
                    "primary": false
                }, {
                    "system": "http://loinc.org",
                    "code": "3141-9",
                    "display": "Body weight Measured",
                    "primary": true
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
            weightObs.appliesDateTime = vm.vitals.date.toISOString();
            return weightObs;
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

})();(function () {
    'use strict';

    var serviceId = 'observationService';

    function observationService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets) {
        var dataCacheKey = 'localObservations';
        var itemCacheKey = 'contextObservation';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addObservation(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Observation";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedObservation(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedObservations = searchResults.entry;
                    searchResults.entry = _.remove(cachedObservations, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteObservation(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteObservation(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedObservation(hashKey) {
            function getObservation(searchResults) {
                var cachedObservation;
                var cachedObservations = searchResults.entry;
                for (var i = 0, len = cachedObservations.length; i < len; i++) {
                    if (cachedObservations[i].$$hashKey === hashKey) {
                        cachedObservation = cachedObservations[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedObservation.resourceId = (baseUrl + cachedObservation.resourceType + '/' + cachedObservation.id);
                        cachedObservation.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedObservation) {
                    deferred.resolve(cachedObservation);
                } else {
                    deferred.reject('Observation not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getObservation,
                function () {
                    deferred.reject('Observation search results not found in cache.');
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getObservation(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getObservationContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getObservationReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Observation?code=' + input + '&_count=20')
                .then(function (results) {
                    var observations = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Observation') {
                                    observations.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (observations.length === 0) {
                        observations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(observations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchObservations(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Observation?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getObservations(baseUrl, searchFilter, patientId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(patientId)) {
                deferred.reject('Invalid search input');
            }


            if (angular.isDefined(patientId)) {
                var patientParam = 'subject:Patient=' + patientId;
                if (params.length > 1) {
                    params = params + '&' + patientParam;
                } else {
                    params = patientParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Observation/_filter?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getObservationsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewObservation() {
            return {
                "resourceType": "Observation",
                "code": null, // CodeableConcept

                // value[x]: Actual result. One of these 10:
                "valueQuantity": null,
                "valueCodeableConcept": null,
                "valueString": null,
                "valueRange": null,
                "valueRatio": null,
                "valueSampledData": null,
                "valueAttachment": null,
                "valueTime": null,
                "valueDateTime": null,
                "valuePeriod": null,

                "dataAbsentReason": null, // CodeableConcept
                "interpretation": null, // CodeableConcept
                "comments": null,

                // applies[x]: Physiologically Relevant time/time-period for observation. One of these 2:
                "appliesDateTime": null,
                "appliesPeriod": null,

                "issued": null, // instant
                "status": null, // code: registered | preliminary | final | amended
                "reliability": null, // code:  ok | ongoing | early | questionable | calibrating | error

                // bodySite[x]: Observed body part. One of these 2:
                "bodySiteCodeableConcept": null,
                "bodySiteReference": null, // Reference(BodySite),

                "method": null, // CodeableConcept
                "identifier": [{
                    "system": "urn:fhir-cloud:observation",
                    "value": common.randomHash(),
                    "use": "official",
                    "assigner": {"display": "FHIR Cloud"}
                }],
                "subject": null, // Reference(Patient | Group | Device | Location)
                "specimen": null, // Reference(Specimen)
                "performer": [], // [Reference(Practitioner | Organization | Patient | RelatedPerson)]
                "device": null, // Reference(Device | DeviceMetric)
                "encounter": null, // Reference(Encounter)

                "referenceRange": [
                    //   "low": null, // Quantity
                    //   "high": null, // Quantity
                    //   "meaning": null, // CodeableConcept
                    //   "age": null, // Range, applicable age range, if relevant
                    //   "text": null
                ],

                "related": [
                    //  "type": null, // code:  has-component | has-member | derived-from | sequel-to | replaces | qualified-by | interfered-by
                    //  "target": null // Reference(Observation)
                ]
            };
        }

        function setObservationContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateObservation(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedRandomObservations(organizationId, organizationName) {
            var deferred = $q.defer();
            var birthPlace = [];
            var mothersMaiden = [];
            $http.get('http://api.randomuser.me/?results=25&nat=us')
                .success(function (data) {
                    angular.forEach(data.results, function (result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Observation",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
                            "contact": [],
                            "communication": _randomCommunication(),
                            "maritalStatus": _randomMaritalStatus(),
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": [{"url": user.picture.large}],
                            "identifier": [
                                {
                                    "system": "urn:oid:2.16.840.1.113883.4.1",
                                    "value": user.SSN,
                                    "use": "official",
                                    "label": "Social Security Number",
                                    "assigner": {"display": "Social Security Administration"}
                                },
                                {
                                    "system": "urn:oid:2.16.840.1.113883.15.18",
                                    "value": user.registered,
                                    "use": "official",
                                    "label": organizationName + " master Id",
                                    "assigner": {"display": organizationName}
                                }
                            ],
                            "managingOrganization": {
                                "reference": "Organization/" + organizationId,
                                "display": organizationName
                            },
                            "link": [],
                            "active": true,
                            "extension": []
                        };
                        resource.extension.push(_randomRace());
                        resource.extension.push(_randomEthnicity());
                        resource.extension.push(_randomReligion());
                        resource.extension.push(_randomMothersMaiden(mothersMaiden));
                        resource.extension.push(_randomBirthPlace(birthPlace));

                        mothersMaiden.push([$filter('titleCase')(user.name.last)]);
                        birthPlace.push(resource.address[0].city + ', ' + resource.address[0].state);

                        var timer = $timeout(function () {
                        }, 3000);
                        timer.then(function () {
                            addObservation(resource).then(function (results) {
                                logInfo("Created observation " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create observation " + user.name.first + " " + user.name.last, error, false);
                            })
                        })
                    });
                    deferred.resolve();
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function _randomMothersMaiden(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/observation-mothersMaidenName",
                "valueString": ''
            };
            if (array.length > 0) {
                common.shuffle(array);
                extension.valueString = array[0];
            } else {
                extension.valueString = "Gibson";
            }
            return extension;
        }

        function _randomBirthPlace(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/birthPlace",
                "valueAddress": null
            };
            if (array.length > 0) {
                common.shuffle(array);
                extension.valueAddress = {"text": array[0]};
            } else {
                extension.valueAddress = {"text": "New York, NY", "city": "New York", "state": "NY", "country": "USA"};
            }
            return extension;
        }

        function _randomRace() {
            var races = localValueSets.race();
            common.shuffle(races.concept);
            var race = races.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
                "valueCodeableConcept": {"coding": [], "text": race.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": races.system,
                "code": race.code,
                "display": race.display
            });
            return extension;
        }

        function _randomEthnicity() {
            var ethnicities = localValueSets.ethnicity();
            common.shuffle(ethnicities.concept);
            var ethnicity = ethnicities.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
                "valueCodeableConcept": {"coding": [], "text": ethnicity.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": ethnicities.system,
                "code": ethnicity.code,
                "display": ethnicity.display
            });
            return extension;
        }

        function _randomReligion() {
            var religions = localValueSets.religion();
            common.shuffle(religions.concept);
            var religion = religions.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-religion",
                "valueCodeableConcept": {"coding": [], "text": religion.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": religions.system,
                "code": religion.code,
                "display": religion.display
            });
            return extension;
        }

        function _randomCommunication() {
            var languages = localValueSets.iso6391Languages();
            common.shuffle(languages);

            var communication = [];
            var primaryLanguage = {"language": {"text": languages[1].display, "coding": []}, "preferred": true};
            primaryLanguage.language.coding.push({
                "system": languages[1].system,
                "code": languages[1].code,
                "display": languages[1].display
            });
            communication.push(primaryLanguage);
            return communication;
        }

        function _randomMaritalStatus() {
            var maritalStatuses = localValueSets.maritalStatus();
            common.shuffle(maritalStatuses);
            var maritalStatus = maritalStatuses[1];
            var concept = {
                "coding": [], "text": maritalStatus.display
            };
            concept.coding.push({
                "system": maritalStatus.system,
                "code": maritalStatus.code,
                "display": maritalStatus.display
            });
            return concept;
        }

        function _prepArrays(resource) {
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.performer.length === 0) {
                resource.performer = null;
            }
            if (resource.referenceRange.length === 0) {
                resource.referenceRange = null;
            }
            if (resource.related.length === 0) {
                resource.related = null;
            }
            return $q.when(resource);
        }

        var service = {
            addObservation: addObservation,
            clearCache: clearCache,
            deleteCachedObservation: deleteCachedObservation,
            deleteObservation: deleteObservation,
            getCachedObservation: getCachedObservation,
            getCachedSearchResults: getCachedSearchResults,
            getObservation: getObservation,
            getObservationContext: getObservationContext,
            getObservationReference: getObservationReference,
            getObservations: getObservations,
            getObservationsByLink: getObservationsByLink,
            initializeNewObservation: initializeNewObservation,
            setObservationContext: setObservationContext,
            updateObservation: updateObservation,
            seedRandomObservations: seedRandomObservations,
            searchObservations: searchObservations
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets',
        observationService]);
})();(function () {
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
                    var m = moment(new Date());
                    vm.lab.date = new Date(m.year(), m.month(), m.date(), m.hour(), m.minute());
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
                    {name: 'Consult', icon: 'consult', index: 1},
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
                 below 200 mg/dL - desirable
                 200 > 239 - borderline high
                 >= 240 - high risk

                 Children:
                 below 170 mg/dL - desirable
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

        function saveCRP(form) {
            var crpObservation = _buildCrpResult();
            logInfo("Saving HS CRP result to " + vm.activeServer.name);
            observationService.addObservation(crpObservation)
                .then(_processCreateResponse,
                function (error) {
                    logError(common.unexpectedOutcome(error));
                }).then(function () {
                    logInfo("HS CRP result saved successfully!");
                    _initializeCrp(form);
                })
        }

        vm.saveCRP = saveCRP;

        function updateCRP() {
            /*
             Low risk: less than 1.0 mg/L
             Average risk: 1.0 to 3.0 mg/L
             High risk: 3.0 mg/L to 10.0 mg/L
             Abnormal: above 10
             */
            switch (true) {
                case (vm.lab.crp.value < 1.0):
                    vm.lab.crp.interpretationText = "Low risk";
                    vm.lab.crp.color = "green";
                    break;
                case ((vm.lab.crp.value >= 1.0) && (vm.lab.crp.value < 3.0)):
                    vm.lab.crp.interpretationText = "Average risk";
                    vm.lab.crp.color = "orange";
                    break;
                case ((vm.lab.crp.value >= 3.0) && (vm.lab.crp.value < 10)):
                    vm.lab.crp.interpretationText = "High risk";
                    vm.lab.crp.color = "red";
                    break;
                case (vm.lab.crp.value >= 10):
                    vm.lab.crp.interpretationText = "Abnormally high (retest later)";
                    vm.lab.crp.color = "purple";
                    break;
                default:
                    vm.lab.crp.interpretationText = "Indeterminate";
                    vm.lab.crp.color = "grey";
                    break;
            }
        }

        vm.updateCRP = updateCRP;

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

        function _initializeCrp(form) {
            vm.lab.crp.value = undefined;
            vm.lab.crp.interpretationText = "Enter new reading";
            vm.lab.crp.color = "black";
            form.$setPristine();
        }

        function _buildCrpResult() {
            var hsCRPObs = observationService.initializeNewObservation();
            hsCRPObs.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "30522-7",
                        "display": "CRP SerPl High Sens-mCnc",
                        "primary": true
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "55235003",
                        "display": "C-reactive protein measurement",
                        "primary": false
                    }, {
                        "system": "http://snomed.info/sct",
                        "code": "135842001",
                        "display": "Serum C-reactive protein measurement",
                        "primary": false
                    }
                ],
                "text": "High-sensitivity C-Reactive Protein (CRP)"
            };
            hsCRPObs.valueQuantity = {
                "value": vm.lab.crp.value,
                "units": "mg/L",
                "system": "http://snomed.info/sct",
                "code": "258796002"
            };
            hsCRPObs.referenceRange = [
                {
                    "low": {
                        "value": 0
                    },
                    "high": {
                        "value": 0.9
                    },
                    "meaning": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "394688002",
                                "display": "Low risk of primary heart disease"
                            }
                        ]
                    }
                },
                {
                    "low": {
                        "value": 1.0
                    },
                    "high": {
                        "value": 2.9
                    },
                    "meaning": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "394689005",
                                "display": "Moderate risk of primary heart disease"
                            }
                        ]
                    }
                },
                {
                    "low": {
                        "value": 3.0
                    },
                    "high": {
                        "value": 9.9
                    },
                    "meaning": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "394690001",
                                "display": "High risk of primary heart disease"
                            }
                        ]
                    }
                },
                {
                    "low": {
                        "value": 10
                    },
                    "meaning": {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "166584001",
                                "display": "C-reactive protein abnormal"
                            }
                        ]
                    }
                }
            ];
            hsCRPObs.status = "final";
            hsCRPObs.reliability = "ok";
            hsCRPObs.subject = {
                "reference": 'Patient/' + vm.lab.patient.id,
                "display": vm.lab.patient.fullName
            };
            hsCRPObs.appliesDateTime = vm.lab.date.toISOString();
            return hsCRPObs;
        }

        function _buildTriglycerideResult() {
            var triglycerideResult = observationService.initializeNewObservation();
            triglycerideResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "2571-8",
                        "display": "Trigl SerPl-mCnc",
                        "primary": true
                    }
                ],
                "text": "Triglyceride"
            };
            triglycerideResult.valueQuantity = {
                "value": vm.lab.lipid.triglyceride.value,
                "units": "mg/dL",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            triglycerideResult.referenceRange = [
                {
                    "high": {
                        "value": 200,
                        "units": "mg/dL",
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
            triglycerideResult.appliesDateTime = vm.lab.date.toISOString();
            return triglycerideResult;
        }

        function _buildTotalCResult() {
            var cholesterolResult = observationService.initializeNewObservation();
            cholesterolResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "2093-3",
                        "display": "Cholest SerPl-mCnc",
                        "primary": true

                    }
                ],
                "text": "Total cholesterol"
            };
            cholesterolResult.valueQuantity = {
                "value": vm.lab.lipid.cholesterol.value,
                "units": "mg/dL",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            cholesterolResult.referenceRange = [
                {
                    "high": {
                        "value": (vm.lab.patient.age < 18 ? 200 : 240),
                        "units": "mg/dL",
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
            cholesterolResult.appliesDateTime = vm.lab.date.toISOString();
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
                        "code": "2089-1",
                        "display": "LDLc SerPl-mCnc",
                        "primary": true
                    }
                ],
                "text": "Cholesterol in LDL"
            };
            ldlCResult.valueQuantity = {
                "value": vm.lab.lipid.ldlCholesterol.value,
                "units": "mg/dL",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            ldlCResult.referenceRange = [
                {
                    "high": {
                        "value": 160,
                        "units": "mg/dL",
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
            ldlCResult.appliesDateTime = vm.lab.date.toISOString();

            return ldlCResult;
        }

        function _buildHdlCResult() {
            var hdlCResult = observationService.initializeNewObservation();
            hdlCResult.code = {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "2085-9",
                        "display": "HDLc SerPl-mCnc",
                        "primary": true
                    }
                ],
                "text": "Cholesterol in HDL"
            };
            hdlCResult.valueQuantity = {
                "value": vm.lab.lipid.hdlCholesterol.value,
                "units": "mg/dL",
                "system": "http://snomed.info/sct",
                "code": "258797006"
            };
            hdlCResult.referenceRange = [
                {
                    "low": {
                        "value": (vm.lab.patient.gender === 'male' ? 50 : 40),
                        "units": "mg/dL",
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
            hdlCResult.appliesDateTime = vm.lab.date.toISOString();

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
        vm.interpretations = [];
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
            },
            "crp": {
                "value": undefined,
                "color": "black",
                "interpretationText": undefined
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
();(function () {
    'use strict';

    var serviceId = 'observationValueSets';

    function observationValueSets() {

        function bpInterpretation() {
            return {
                "system": "http://hl7.org/fhir/v2/0078",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "<",
                        "display": "Below absolute low-off instrument scale"
                    },
                    {
                        "code": ">",
                        "display": "Above absolute high-off instrument scale"
                    },
                    {
                        "code": "A",
                        "display": "Abnormal (applies to non-numeric results)"
                    },
                    {
                        "code": "AA",
                        "display": "Very abnormal (applies to non-numeric units, analogous to panic limits for numeric units)"
                    },
                    {
                        "code": "B",
                        "display": "Better-use when direction not relevant"
                    },
                    {
                        "code": "D",
                        "display": "Significant change down"
                    },
                    {
                        "code": "H",
                        "display": "Above high normal"
                    },
                    {
                        "code": "HH",
                        "display": "Above upper panic limits"
                    },
                    {
                        "code": "L",
                        "display": "Below low normal"
                    },
                    {
                        "code": "LL",
                        "display": "Below lower panic limits"
                    },
                    {
                        "code": "N",
                        "display": "Normal"
                    },
                    {
                        "code": "NEG",
                        "display": "Negative"
                    },
                    {
                        "code": "POS",
                        "display": "Positive"
                    },
                    {
                        "code": "U",
                        "display": "Significant change up"
                    },
                    {
                        "code": "null",
                        "display": "No range defined, or normal ranges don't apply"
                    }
                ]
            }
        }

        function bmiRange() {
            return {
                "system": "http://snomed.info/sct",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "310252000",
                        "display": "Low BMI"
                    }, {
                        "code": "412768003",
                        "display": "Normal BMI"
                    }, {
                        "code": "162863004",
                        "display": "Overweight"
                    }, {
                        "code": "162864005",
                        "display": "Obesity"
                    }, {
                        "code": "162864005",
                        "display": "Severe obesity"
                    }]
            }
        }

        function bodyTempFindings() {
            return {
                "system": "http://snomed.info/sct",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "164301009",
                        "display": "O/E - temperature low"
                    },
                    {
                        "code": "164300005",
                        "display": "O/E - temperature normal"
                    },
                    {
                        "code": "164303007",
                        "display": "O/E - temperature elevated"
                    },
                    {
                        "code": "271897009",
                        "display": "O/E - temperature fever"
                    },
                    {
                        "code": "164288004",
                        "display": "O/E - pyrexia of unknown origin"
                    },
                    {
                        "code": "274307008",
                        "display": "O/E - hypothermia"
                    },
                    {
                        "code": "274308003",
                        "display": "O/E - hyperpyrexia"
                    }]
            }
        }

        function bodyTempMethods() {
            return {
                "system": "http://snomed.info/sct",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "164292006",
                        "display": "O/E - axillary temperature",
                        "$$label": "Axillary"
                    }, {
                        "code": "275874003",
                        "display": "O/E - oral temperature",
                        "$$label": "Oral"
                    }, {
                        "code": "164294007",
                        "display": "O/E - rectal temperature",
                        "$$label": "Rectal"
                    }, {
                        "code": "164296009",
                        "display": "O/E - skin strip temperature",
                        "$$label": "By skin"
                    }, {
                        "code": "315632006",
                        "display": "O/E - tympanic temperature",
                        "$$label": "By ear"
                    }]
            }
        }

        function interpretation() {
            return {
                "system": "http://hl7.org/fhir/v2/0078",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "<",
                        "display": "Below absolute low-off instrument scale"
                    },
                    {
                        "code": ">",
                        "display": "Above absolute high-off instrument scale"
                    },
                    {
                        "code": "A",
                        "display": "Abnormal (applies to non-numeric results)"
                    },
                    {
                        "code": "AA",
                        "display": "Very abnormal (applies to non-numeric units, analogous to panic limits for numeric units)"
                    },
                    {
                        "code": "AC",
                        "display": "Anti-complementary substances present"
                    },
                    {
                        "code": "B",
                        "display": "Better-use when direction not relevant"
                    },
                    {
                        "code": "D",
                        "display": "Significant change down"
                    },
                    {
                        "code": "DET",
                        "display": "Detected"
                    },
                    {
                        "code": "H",
                        "display": "Above high normal"
                    },
                    {
                        "code": "HH",
                        "display": "Above upper panic limits"
                    },
                    {
                        "code": "I",
                        "display": "Intermediate. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "IND",
                        "display": "Indeterminate"
                    },
                    {
                        "code": "L",
                        "display": "Below low normal"
                    },
                    {
                        "code": "LL",
                        "display": "Below lower panic limits"
                    },
                    {
                        "code": "MS",
                        "display": "Moderately susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "N",
                        "display": "Normal (applies to non-numeric results)"
                    },
                    {
                        "code": "ND",
                        "display": "Not Detected"
                    },
                    {
                        "code": "NEG",
                        "display": "Negative"
                    },
                    {
                        "code": "NR",
                        "display": "Non-reactive"
                    },
                    {
                        "code": "POS",
                        "display": "Positive"
                    },
                    {
                        "code": "QCF",
                        "display": "Quality Control Failure"
                    },
                    {
                        "code": "R",
                        "display": "Resistant. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "RR",
                        "display": "Reactive"
                    },
                    {
                        "code": "S",
                        "display": "Susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "TOX",
                        "display": "Cytotoxic substance present"
                    },
                    {
                        "code": "U",
                        "display": "Significant change up"
                    },
                    {
                        "code": "VS",
                        "display": "Very susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "W",
                        "display": "Worse-use when direction not relevant"
                    },
                    {
                        "code": "WR",
                        "display": "Weakly reactive"
                    },
                    {
                        "code": "null",
                        "display": "No range defined, or normal ranges don't apply"
                    }
                ]
            }
        }

        function reliability() {
            return {
                "system": "http://hl7.org/fhir/observation-reliability",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "ok",
                        "display": "Ok",
                        "definition": "The result has no reliability concerns."
                    },
                    {
                        "code": "ongoing",
                        "display": "Ongoing",
                        "definition": "An early estimate of value; measurement is still occurring."
                    },
                    {
                        "code": "early",
                        "display": "Early",
                        "definition": "An early estimate of value; processing is still occurring."
                    },
                    {
                        "code": "questionable",
                        "display": "Questionable",
                        "definition": "The observation value should be treated with care."
                    },
                    {
                        "code": "calibrating",
                        "display": "Calibrating",
                        "definition": "The result has been generated while calibration is occurring."
                    },
                    {
                        "code": "error",
                        "display": "Error",
                        "definition": "The observation could not be completed because of an error."
                    },
                    {
                        "code": "unknown",
                        "display": "Unknown",
                        "definition": "No observation  reliability value was available."
                    }
                ]
            }
        }

        function smokingStatus() {
            return {
                "system": "http://snomed.info/sct",
                "concept": [
                    {"code": "449868002", "display": "Smokes tobacco daily"},
                    {"code": "428041000124106", "display": "Occasional tobacco smoker"},
                    {"code": "8517006", "display": "Ex-smoker"},
                    {"code": "266919005", "display": "Never smoked tobacco"},
                    {"code": "77176002", "display": "Smoker, current status unknown"},
                    {"code": "266927001", "display": "Unknown if ever smoked"},
                    {"code": "428071000124103", "display": "Heavy tobacco smoker"},
                    {"code": "428061000124105", "display": "Light tobacco smoker"}
                ]
            }
        }

        function status() {
            return {
                "system": "http://hl7.org/fhir/observation-status",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "registered",
                        "display": "Registered",
                        "definition": "The existence of the observation is registered, but there is no result yet available."
                    },
                    {
                        "code": "preliminary",
                        "display": "Preliminary",
                        "definition": "This is an initial or interim observation: data may be incomplete or unverified."
                    },
                    {
                        "code": "final",
                        "display": "Final",
                        "definition": "The observation is complete and verified by an authorized person."
                    },
                    {
                        "code": "amended",
                        "display": "Amended",
                        "definition": "The observation has been modified subsequent to being Final, and is complete and verified by an authorized person."
                    },
                    {
                        "code": "cancelled",
                        "display": "Cancelled",
                        "definition": "The observation is unavailable because the measurement was not started or not completed (also sometimes called \"aborted\")."
                    },
                    {
                        "code": "entered-in-error",
                        "display": "Entered In Error",
                        "definition": "The observation has been withdrawn following previous Final release."
                    },
                    {
                        "code": "unknown",
                        "display": "Unknown",
                        "definition": "The observation status is unknown.  Note that \"unknown\" is a value of last resort and every attempt should be made to provide a meaningful value other than \"unknown\"."
                    }
                ]
            }
        }

        /*
         Vital Signs
         Include these codes as defined in http://loinc.org
         Code	Display
         x    9279-1	Respiratory rate
         x    8867-4	Heart rate
         2710-2	Oxygen saturation in Capillary blood by Oximetry
         x    55284-4	Blood pressure systolic and diastolic
         x    8480-6	Systolic blood pressure
         x    8462-4	Diastolic blood pressure
         x    8310-5	Body temperature
         x    8302-2	Body height
         x    8306-3	Body height --lying
         8287-5	Head Occipital-frontal circumference by Tape measure
         x    3141-9	Body weight Measured
         x    39156-5	Body mass index (BMI) [Ratio]
         3140-1	Body surface area Derived from formula
         */

        var service = {
            bmiRange: bmiRange,
            bodyTempFindings: bodyTempFindings,
            bodyTempMethods: bodyTempMethods,
            bpInterpretation: bpInterpretation,
            interpretation: interpretation,
            reliability: reliability,
            smokingStatus: smokingStatus,
            status: status
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [observationValueSets]);

})();
(function () {
    'use strict';

    var controllerId = 'operationDefinitionDetail';

    function operationDefinitionDetail($location, $routeParams, $window, $mdDialog, common, contactPointService, fhirServers, operationDefinitionService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteOperationDefinition(operationDefinition) {
            function executeDelete() {
                if (operationDefinition && operationDefinition.resourceId && operationDefinition.hashKey) {
                    operationDefinitionService.deleteCachedOperationDefinition(operationDefinition.hashKey, operationDefinition.resourceId)
                        .then(function () {
                            logSuccess("Deleted operationDefinition " + operationDefinition.name);
                            $location.path('/operationDefinitions');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + operationDefinition.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(operationDefinition) {
            if (operationDefinition && operationDefinition.hashKey) {
                $location.path('/operationDefinition/edit/' + operationDefinition.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

         function getRequestedOperationDefinition() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.operationDefinition = rawData;
                contactPointService.init(vm.operationDefinition.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = operationDefinitionService.initializeNewOperationDefinition();
                intitializeRelatedData(data);
                vm.title = 'Add New OperationDefinition';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    operationDefinitionService.getCachedOperationDefinition($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/OperationDefinition/' + $routeParams.id;
                    operationDefinitionService.getOperationDefinition(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("OperationDefinition saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.operationDefinition.resourceId = common.setResourceId(vm.operationDefinition.resourceId, resourceVersionId);
                logSuccess("OperationDefinition saved at " + resourceVersionId);
            }
            vm.isEditing = true;
        }

        function save() {
            if (vm.operationDefinition.name.length < 5) {
                logError("OperationDefinition Name must be at least 5 characters");
                return;
            }
            var operationDefinition = operationDefinitionService.initializeNewOperationDefinition().resource;
            operationDefinition.name = vm.operationDefinition.name;
            operationDefinition.id = vm.operationDefinition.id;
            operationDefinition.text = vm.operationDefinition.text;
            operationDefinition.title = vm.operationDefinition.title;
            operationDefinition.telecom = contactPointService.mapFromViewModel();
            operationDefinition.status = vm.operationDefinition.status;
            operationDefinition.kind = vm.operationDefinition.kind;
            operationDefinition.instance = vm.operationDefinition.instance;
            operationDefinition.parameter = [];
            if (vm.isEditing) {
                operationDefinitionService.updateOperationDefinition(vm.operationDefinition.resourceId, operationDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                operationDefinitionService.addOperationDefinition(operationDefinition)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedOperationDefinition();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteOperationDefinition;
        vm.edit = edit;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.operationDefinition = undefined;
        vm.operationDefinitionTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'operationDefinitionDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'contactPointService', 'fhirServers', 'operationDefinitionService', operationDefinitionDetail]);

})();(function () {
    'use strict';

    var controllerId = 'operationDefinitionSearch';

    function operationDefinitionSearch($location, $mdSidenav, common, config, fhirServers, operationDefinitionService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            operationDefinitionService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    $mdSidenav('right').close();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/operationDefinition/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.operationDefinitions = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                operationDefinitionService.getOperationDefinitions(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' OperationDefinitions from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            operationDefinitionService.getOperationDefinitionsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.operationDefinitions) ? data.operationDefinitions.length : 0) + ' OperationDefinitions from ' + vm.activeServer.name);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.operationDefinitions = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'OperationDefinitions';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'operationDefinitionService', operationDefinitionSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'operationDefinitionService';

    function operationDefinitionService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localOperationDefinitions';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addOperationDefinition(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/OperationDefinition";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedOperationDefinition(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedOperationDefinitions = searchResults.entry;
                for (var i = 0, len = cachedOperationDefinitions.length; i < len; i++) {
                    if (cachedOperationDefinitions[i].$$hashKey === hashKey) {
                        cachedOperationDefinitions.splice(i, 1);
                        searchResults.entry = cachedOperationDefinitions;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('OperationDefinition not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteOperationDefinition(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteOperationDefinition(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedOperationDefinition(hashKey) {
            function getOperationDefinition(searchResults) {
                var cachedOperationDefinition;
                var cachedOperationDefinitions = searchResults.entry;
                cachedOperationDefinition = _.find(cachedOperationDefinitions, {'$$hashKey': hashKey});
                if (cachedOperationDefinition) {
                    deferred.resolve(cachedOperationDefinition);
                } else {
                    deferred.reject('OperationDefinition not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getOperationDefinition,
                function () {
                    deferred.reject('OperationDefinition search results not found in cache.');
                });
            return deferred.promise;
        }

        function getOperationDefinition(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getOperationDefinitionReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/OperationDefinition?name=' + input + '&_count=20')
                .then(function (results) {
                    var operationDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                operationDefinitions.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (operationDefinitions.length === 0) {
                        operationDefinitions.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(operationDefinitions);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getOperationDefinitions(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/OperationDefinition?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getOperationDefinitionsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "operationDefinitions": []};
                    var operationDefinitions = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'OperationDefinition') {
                                    operationDefinitions.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (operationDefinitions.length === 0) {
                        operationDefinitions.push({display: "No matches", reference: ''});
                    }
                    searchResults.operationDefinitions = operationDefinitions;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewOperationDefinition() {
            var data = {};
            data.resource = {
                "resourceType": "OperationDefinition",
                "identifier": [],
                "type": {"coding": []},
                "telecom": [],
                "contact": [],
                "address": [],
                "partOf": null,
                "location": [],
                "active": true
            };
            return data;
        }

        function updateOperationDefinition(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addOperationDefinition: addOperationDefinition,
            clearCache: clearCache,
            deleteCachedOperationDefinition: deleteCachedOperationDefinition,
            deleteOperationDefinition: deleteOperationDefinition,
            getCachedOperationDefinition: getCachedOperationDefinition,
            getCachedSearchResults: getCachedSearchResults,
            getOperationDefinition: getOperationDefinition,
            getOperationDefinitions: getOperationDefinitions,
            getOperationDefinitionsByLink: getOperationDefinitionsByLink,
            getOperationDefinitionReference: getOperationDefinitionReference,
            initializeNewOperationDefinition: initializeNewOperationDefinition,
            updateOperationDefinition: updateOperationDefinition
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', operationDefinitionService]);

})();(function () {
    'use strict';

    var controllerId = 'organizationDetail';

    function organizationDetail($filter, $location, $mdBottomSheet, $routeParams, $scope, $window, addressService,
                                $mdDialog, common, contactService, fhirServers, identifierService, localValueSets,
                                organizationService, contactPointService, sessionService, patientService, personService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var $q = common.$q;
        var noToast = false;

        $scope.$on('server.changed',
            function (event, data) {
                vm.activeServer = data.activeServer;
                logInfo("Remote server changed to " + vm.activeServer.name);
            }
        );

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteOrganization(organization) {
            function executeDelete() {
                if (organization && organization.resourceId) {
                    organizationService.deleteCachedOrganization(organization.hashKey, organization.resourceId)
                        .then(function () {
                            logSuccess("Deleted organization " + organization.name);
                            $location.path('/organization');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            if (angular.isDefined(organization) && organization.resourceId) {
                var confirm = $mdDialog.confirm().title('Delete ' + organization.name + '?').ok('Yes').cancel('No');
                $mdDialog.show(confirm).then(executeDelete);
            } else {
                logInfo("You must first select an organization to delete.")
            }
        }

        function edit(organization) {
            if (organization && organization.hashKey) {
                $location.path('/organization/edit/' + organization.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting organizations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getOrganizationTypes() {
            vm.organizationTypes = localValueSets.organizationType();
        }

        function getRequestedOrganization() {
            function initializeRelatedData(data) {
                vm.organization = data.resource || data;
                if (angular.isUndefined(vm.organization.type)) {
                    vm.organization.type = {"coding": []};
                }
                vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
                vm.title = vm.organization.name;
                identifierService.init(vm.organization.identifier, "multi", "organization");
                addressService.init(vm.organization.address, false);
                contactService.init(vm.organization.contact);
                contactPointService.init(vm.organization.telecom, false, false);

                if (vm.lookupKey !== "new") {
                    $window.localStorage.organization = JSON.stringify(vm.organization);
                }
            }

            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.organization) || ($window.localStorage.organization === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/organization');
                    }
                } else {
                    vm.organization = JSON.parse($window.localStorage.organization);
                    vm.organization.hashKey = "current";
                    initializeRelatedData(vm.organization);
                }
            } else if (vm.lookupKey === 'new') {
                var data = organizationService.initializeNewOrganization();
                initializeRelatedData(data);
                vm.title = 'Add New Organization';
                vm.isEditing = false;
            } else if (angular.isDefined($routeParams.resourceId)) {
                var fullPath = vm.activeServer.baseUrl + '/Organization/' + $routeParams.resourceId;
                logInfo("Fetching " + fullPath, null, noToast);
                organizationService.getOrganization(fullPath)
                    .then(initializeRelatedData).then(function () {
                        var session = sessionService.getSession();
                        session.organization = vm.organization;
                        sessionService.updateSession(session);
                    }, function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            } else {
                if (vm.lookupKey) {
                    organizationService.getCachedOrganization(vm.lookupKey)
                        .then(initializeRelatedData).then(function () {
                            var session = sessionService.getSession();
                            session.organization = vm.organization;
                            sessionService.updateSession(session);
                        }, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Organization/' + $routeParams.id;
                    organizationService.getOrganization(resourceId)
                        .then(initializeRelatedData, function (error) {
                            logError($filter('unexpectedOutcome')(error));
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.organization) {
                title = vm.title = 'Edit ' + ((vm.organization && vm.organization.fullName) || '');
            } else {
                title = vm.title = 'Add New Organization';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logInfo("Organization saved, but location is unavailable. CORS is not implemented correctly at " + vm.activeServer.name);
            } else {
                logInfo("Organization saved at " + resourceVersionId);
                vm.organization.resourceVersionId = resourceVersionId;
                vm.organization.resourceId = common.setResourceId(vm.organization.resourceId, resourceVersionId);
            }
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.organization.name.length < 5) {
                logError("Organization Name must be at least 5 characters");
                return;
            }
            var organization = organizationService.initializeNewOrganization().resource;
            organization.name = vm.organization.name;
            organization.type = vm.organization.type;
            organization.address = addressService.mapFromViewModel();
            organization.telecom = contactPointService.mapFromViewModel();
            organization.contact = contactService.mapFromViewModel();
            organization.partOf = vm.organization.partOf;
            organization.identifier = identifierService.getAll();
            organization.active = vm.organization.active;
            if (vm.isEditing) {
                organization.id = vm.organization.id;
                organizationService.updateOrganization(vm.organization.resourceId, organization)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            } else {
                organizationService.addOrganization(organization)
                    .then(processResult,
                    function (error) {
                        logError($filter('unexpectedOutcome')(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer(), getOrganizationTypes()], controllerId).then(function () {
                getRequestedOrganization();
            });
        }

        function createRandomPatients(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logSuccess("Creating random patients for " + vm.organization.name);
            patientService.seedRandomPatients(vm.organization.id, vm.organization.name).then(
                function (result) {
                    logSuccess(result, null, noToast);
                }, function (error) {
                    logError($filter('unexpectedOutcome')(error));
                });
        }

        function createRandomPersons(event) {
            vm.organization.resourceId = vm.activeServer.baseUrl + '/Organization/' + vm.organization.id;
            logSuccess("Creating random patients for " + vm.organization.resourceId);
            personService.seedRandomPersons(vm.organization.resourceId, vm.organization.name).then(
                function (result) {
                    logSuccess(result, null, noToast);
                }, function (error) {
                    logError($filter('unexpectedOutcome')(error));
                });
        }

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
                        createRandomPatients();
                        break;
                    case 1:
                        $location.path('/patient/org/' + vm.organization.id);
                        break;
                    case 2:
                        $location.path('/organization/detailed-search');
                        break;
                    case 3:
                        $location.path('/organization');
                        break;
                    case 4:
                        $location.path('/organization/edit/current');
                        break;
                    case 5:
                        $location.path('/organization/edit/new');
                        break;
                    case 6:
                        deleteOrganization(vm.organization);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Add random patients', icon: 'groupAdd', index: 0},
                        {name: 'Get patients', icon: 'group', index: 1},
                        {name: 'Quick find', icon: 'hospital', index: 3},
                        {name: 'Edit organization', icon: 'edit', index: 4},
                        {name: 'Add new organization', icon: 'add', index: 5}
                    ];
                } else {
                    this.items = [
                        {name: 'Detailed search', icon: 'search', index: 2},
                        {name: 'Quick find', icon: 'hospital', index: 3}
                    ];
                }
                this.title = 'Organization search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deleteOrganization;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.organization = undefined;
        vm.organizationTypes = undefined;
        vm.save = save;
        vm.searchText = undefined;
        vm.states = undefined;
        vm.title = 'organizationDetail';
        vm.createRandomPatients = createRandomPatients;
        vm.createRandomPersons = createRandomPersons;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$routeParams', '$scope', '$window', 'addressService', '$mdDialog',
            'common', 'contactService', 'fhirServers', 'identifierService', 'localValueSets', 'organizationService',
            'contactPointService', 'sessionService', 'patientService', 'personService', organizationDetail]);

})
();(function () {
    'use strict';

    var controllerId = 'organizationSearch';

    function organizationSearch($location, $mdBottomSheet, $mdSidenav, $scope, common, fhirServers, localValueSets, organizationService) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var noToast = false;
        var $q = common.$q;

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            organizationService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                    _loadOrganizationTypes();
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/organization/view/' + hash);
            }
        }

        vm.goToDetail = goToDetail;

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.organizations = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function querySearch(searchText) {
            var deferred = $q.defer();
            organizationService.getOrganizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting organizations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }
        vm.querySearch = querySearch;

        function searchOrganizations(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            organizationService.searchOrganizations(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error finding organizations: ', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function dereferenceLink(url) {
            organizationService.getOrganizationsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.organizations) ? data.organizations.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                });
        }

        vm.dereferenceLink = dereferenceLink;

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data) ? data.length : 0) + ' Organizations from ' + vm.activeServer.name, null, noToast);
                    deferred.resolve(data || []);
                }, function (error) {
                    logError('Error getting organizations', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.getOrganizationReference = getOrganizationReference;

        function goToOrganization(organization) {
            if (organization && organization.$$hashKey) {
                $location.path('/organization/view/' + organization.$$hashKey);
            }
        }
        vm.goToOrganization = goToOrganization;

        function _loadOrganizationTypes() {
            vm.organizationTypes = localValueSets.organizationType();
        }

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
                        $location.path('/organization/edit/new');
                        break;
                    case 1:
                        $location.path('/organization/detailed-search');
                        break;
                    case 2:
                        $location.path('/organization');
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new organization', icon: 'add', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'hospital', index: 2}
                ];
                this.title = 'Organization search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.organizationSearch.name) {
                queryParam.param = "name";
                queryParam.value = vm.organizationSearch.name;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.organizationSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.organizationSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.organizationSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.organizationSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.identifier.system && vm.organizationSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.organizationSearch.identifier.system.concat("|", vm.organizationSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.type) {
                queryParam.param = "type";
                queryParam.value = vm.organizationSearch.type;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.organizationSearch.partOf) {
                queryParam.param = "partOf";
                queryParam.value = vm.organizationSearch.partOf.reference;
                queryParams.push(_.clone(queryParam));
            }
            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            searchOrganizations(queryString);
        }

        vm.detailSearch = detailSearch;

        vm.activeServer = null;
        vm.isBusy = false;
        vm.organizations = [];
        vm.errorOutcome = null;
        vm.organizationTypes = null;
        vm.organizationSearch = {
            name: undefined,
            address: {street: undefined, city: undefined, state: undefined, postalCode: undefined},
            identifier: {system: undefined, value: undefined},
            type: undefined,
            partOf: undefined
        };
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Organizations';
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdSidenav', '$scope', 'common', 'fhirServers', 'localValueSets', 'organizationService', organizationSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'organizationService';

    function organizationService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localOrganizations';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function addOrganization(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Organization";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedOrganization(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedOrganizations = searchResults.entry;
                for (var i = 0, len = cachedOrganizations.length; i < len; i++) {
                    if (cachedOrganizations[i].$$hashKey === hashKey) {
                        cachedOrganizations.splice(i, 1);
                        searchResults.entry = cachedOrganizations;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Organization not found in cache: ' + hashKey, null, noToast);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteOrganization(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteOrganization(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedOrganization(hashKey) {
            function getOrganization(searchResults) {
                var cachedOrganization;
                var cachedOrganizations = searchResults.entry;
                cachedOrganization = _.find(cachedOrganizations, {'$$hashKey': hashKey});
                if (cachedOrganization) {
                    deferred.resolve(cachedOrganization);
                } else {
                    deferred.reject('Organization not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getOrganization,
                function () {
                    deferred.reject('Organization search results not found in cache.');
                });
            return deferred.promise;
        }

        function getOrganization(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getOrganizationReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Organization?name=' + input + '&_count=10')
                .then(function (results) {
                    var organizations = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Organization') {
                                organizations.push({
                                    display: item.resource.name,
                                    reference: baseUrl + '/Organization/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(organizations);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getOrganizations(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Organization?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchOrganizations(baseUrl, filter) {
            var deferred = $q.defer();

            if (angular.isUndefined(filter)) {
                deferred.reject('Invalid search input');
            }

            fhirClient.getResource(baseUrl + '/Organization?' + filter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getOrganizationsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "organizations": []};
                    var organizations = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Organization') {
                                    organizations.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (organizations.length === 0) {
                        organizations.push({display: "No matches", reference: ''});
                    }
                    searchResults.organizations = organizations;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewOrganization() {
            var data = {};
            data.resource = {
                "resourceType": "Organization",
                "identifier": [],
                "type": {"coding": []},
                "telecom": [],
                "contact": [],
                "address": [],
                "partOf": null,
                "location": [],
                "active": true
            };
            return data;
        }

        function updateOrganization(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addOrganization: addOrganization,
            clearCache: clearCache,
            deleteCachedOrganization: deleteCachedOrganization,
            deleteOrganization: deleteOrganization,
            getCachedOrganization: getCachedOrganization,
            getCachedSearchResults: getCachedSearchResults,
            getOrganization: getOrganization,
            getOrganizations: getOrganizations,
            getOrganizationsByLink: getOrganizationsByLink,
            getOrganizationReference: getOrganizationReference,
            initializeNewOrganization: initializeNewOrganization,
            searchOrganizations: searchOrganizations,
            updateOrganization: updateOrganization
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', organizationService]);

})();(function () {
    'use strict';

    var controllerId = 'patientDetail';

    function patientDetail($filter, $location, $mdBottomSheet, $mdDialog, $routeParams, $scope, $window, addressService,
                           attachmentService, common, demographicsService, fhirServers, humanNameService, identifierService,
                           organizationService, patientService, contactPointService, practitionerService, communicationService,
                           careProviderService, observationService, config) {

        /*jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer()], controllerId).then(function () {
                _getRequestedPatient();
            });
        }

        function deletePatient(patient, event) {
            function executeDelete() {
                if (patient && patient.resourceId && patient.hashKey) {
                    patientService.deleteCachedPatient(patient.hashKey, patient.resourceId)
                        .then(function () {
                            logInfo("Deleted patient " + patient.fullName);
                            $location.path('/patient');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + patient.fullName + '?')
                .ariaLabel('delete patient')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + patient.fullName);
                });
        }

        function edit(patient) {
            if (patient && patient.hashKey) {
                $location.path('/patient/' + patient.hashKey);
            }
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    deferred.resolve(data);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function _getEverything() {
            patientService.getPatientEverything(vm.patient.resourceId)
                .then(function (data) {
                    vm.summary = data.summary;
                    vm.history = data.history;
                    logInfo("Retrieved everything for patient at " + vm.patient.resourceId, null, noToast);
                }, function (error) {
                    logError(common.unexpectedOutcome(error), null, noToast);
                    _getObservations();  //TODO: fallback for those servers that haven't implemented $everything operation
                });
        }

        function _getObservations() {
            observationService.getObservations(vm.activeServer.baseUrl, null, vm.patient.id)
                .then(function (data) {
                    vm.summary = data.entry;
                    logInfo("Retrieved observations for patient " + vm.patient.fullName, null, noToast);
                }, function (error) {
                    vm.isBusy = false;
                    logError(common.unexpectedOutcome(error), null, noToast);
                });
        }

        function _getRequestedPatient() {
            function initializeAdministrationData(data) {
                vm.patient = data;
                humanNameService.init(vm.patient.name);
                demographicsService.init(vm.patient.gender, vm.patient.maritalStatus, vm.patient.communication);
                demographicsService.initBirth(vm.patient.multipleBirthBoolean, vm.patient.multipleBirthInteger);
                demographicsService.initDeath(vm.patient.deceasedBoolean, vm.patient.deceasedDateTime);
                demographicsService.setBirthDate(vm.patient.birthDate);
                demographicsService.initializeKnownExtensions(vm.patient.extension);
                vm.patient.race = demographicsService.getRace();
                vm.patient.religion = demographicsService.getReligion();
                vm.patient.ethnicity = demographicsService.getEthnicity();
                vm.patient.mothersMaidenName = demographicsService.getMothersMaidenName();
                vm.patient.birthPlace = demographicsService.getBirthPlace();
                attachmentService.init(vm.patient.photo, "Photos");
                identifierService.init(vm.patient.identifier, "multi", "patient");
                addressService.init(vm.patient.address, true);
                contactPointService.init(vm.patient.telecom, true, true);
                careProviderService.init(vm.patient.careProvider);
                if (vm.patient.communication) {
                    communicationService.init(vm.patient.communication, "multi");
                }
                vm.patient.fullName = humanNameService.getFullName();
                if (angular.isDefined(vm.patient.id)) {
                    vm.patient.resourceId = (vm.activeServer.baseUrl + '/Patient/' + vm.patient.id);
                }
                if (vm.patient.managingOrganization && vm.patient.managingOrganization.reference) {
                    var reference = vm.patient.managingOrganization.reference;
                    if (common.isAbsoluteUri(reference) === false) {
                        vm.patient.managingOrganization.reference = vm.activeServer.baseUrl + '/' + reference;
                    }
                    if (angular.isUndefined(vm.patient.managingOrganization.display)) {
                        vm.patient.managingOrganization.display = reference;
                    }
                }
                if (vm.lookupKey !== "new") {
                    $window.localStorage.patient = JSON.stringify(vm.patient);
                }
            }

            vm.patient = undefined;
            vm.lookupKey = $routeParams.hashKey;

            if (vm.lookupKey === "current") {
                if (angular.isUndefined($window.localStorage.patient) || ($window.localStorage.patient === null)) {
                    if (angular.isUndefined($routeParams.id)) {
                        $location.path('/patient');
                    }
                } else {
                    vm.patient = JSON.parse($window.localStorage.patient);
                    vm.patient.hashKey = "current";
                    initializeAdministrationData(vm.patient);
                }
            } else if (angular.isDefined($routeParams.id)) {
                vm.isBusy = true;
                var resourceId = vm.activeServer.baseUrl + '/Patient/' + $routeParams.id;
                patientService.getPatient(resourceId)
                    .then(function (resource) {
                        initializeAdministrationData(resource.data);
                        if (vm.patient) {
                            _getEverything(resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    }).then(function () {
                        vm.isBusy = false;
                    });
            } else if (vm.lookupKey === 'new') {
                var data = patientService.initializeNewPatient();
                initializeAdministrationData(data);
                vm.title = 'Add New Patient';
                vm.isEditing = false;
            } else if (vm.lookupKey !== "current") {
                vm.isBusy = true;
                patientService.getCachedPatient(vm.lookupKey)
                    .then(function (data) {
                        initializeAdministrationData(data);
                        if (vm.patient && vm.patient.resourceId) {
                            _getEverything(vm.patient.resourceId);
                        }
                    }, function (error) {
                        logError(common.unexpectedOutcome(error));
                    })
                    .then(function () {
                        vm.isBusy = false;
                    });
            } else {
                logError("Unable to resolve patient lookup");
            }
        }

        function save() {
            function processResult(results) {
                var resourceVersionId = results.headers.location || results.headers["content-location"];
                if (angular.isUndefined(resourceVersionId)) {
                    logWarning("Patient saved, but location is unavailable. CORS not implemented correctly at remote host.");
                } else {
                    logInfo("Patient saved at " + resourceVersionId);
                    vm.patient.resourceVersionId = resourceVersionId;
                    vm.patient.resourceId = common.setResourceId(vm.patient.resourceId, resourceVersionId);
                }
                vm.patient.fullName = humanNameService.getFullName();
                vm.isEditing = true;
                $window.localStorage.patient = JSON.stringify(vm.patient);
                vm.isBusy = false;
            }

            var patient = patientService.initializeNewPatient();
            if (humanNameService.getAll().length === 0) {
                logError("Patient must have at least one name.");
                return;
            }
            patient.name = humanNameService.mapFromViewModel();
            patient.photo = attachmentService.getAll();

            patient.birthDate = $filter('dateString')(demographicsService.getBirthDate());
            patient.gender = demographicsService.getGender();
            patient.maritalStatus = demographicsService.getMaritalStatus();
            patient.multipleBirthBoolean = demographicsService.getMultipleBirth();
            patient.multipleBirthInteger = demographicsService.getBirthOrder();
            patient.deceasedBoolean = demographicsService.getDeceased();
            patient.deceasedDateTime = demographicsService.getDeceasedDate();
            patient.race = demographicsService.getRace();
            patient.religion = demographicsService.getReligion();
            patient.ethnicity = demographicsService.getEthnicity();
            patient.mothersMaidenName = demographicsService.getMothersMaidenName();
            patient.birthPlace = demographicsService.getBirthPlace();

            patient.address = addressService.mapFromViewModel();
            patient.telecom = contactPointService.mapFromViewModel();
            patient.identifier = identifierService.getAll();
            patient.managingOrganization = vm.patient.managingOrganization;
            patient.communication = communicationService.getAll();
            patient.careProvider = careProviderService.getAll();

            patient.active = vm.patient.active;
            vm.isBusy = true;
            if (vm.isEditing) {
                patient.id = vm.patient.id;
                patientService.updatePatient(vm.patient.resourceId, patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            } else {
                patientService.addPatient(patient)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                        vm.isBusy = false;
                    });
            }
        }

        function showAuditData($index, $event) {
            showRawData(vm.history[$index], $event);
        }

        function showClinicalData($index, $event) {
            showRawData(vm.summary[$index], $event);
        }

        function showRawData(item, event) {
            $mdDialog.show({
                optionsOrPresent: {disableParentScroll: false},
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: item
                },
                targetEvent: event
            });
        }

        function canDelete() {
            return !vm.isEditing;
        }

        $scope.$on('server.changed',
            function (event, data) {
                vm.activeServer = data.activeServer;
                logInfo("Remote server changed to " + vm.activeServer.name);
            }
        );

        function canSave() {
            return !vm.isSaving;
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

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
                        $location.path('/consultation');
                        break;
                    case 1:
                        $location.path('/lab');
                        break;
                    case 2:
                        logInfo("Refreshing patient data from " + vm.activeServer.name);
                        $location.path('/patient/get/' + vm.patient.id);
                        break;
                    case 3:
                        $location.path('/patient');
                        break;
                    case 4:
                        $location.path('/patient/edit/current');
                        break;
                    case 5:
                        $location.path('/patient/edit/new');
                        break;
                    case 6:
                        deletePatient(vm.patient);
                        break;
                }
            });
            function ResourceSheetController($mdBottomSheet) {
                if (vm.isEditing) {
                    this.items = [
                        {name: 'Vitals', icon: 'vitals', index: 0},
                        {name: 'Lab', icon: 'lab', index: 1},
                        {name: 'Refresh data', icon: 'refresh', index: 2},
                        {name: 'Find another patient', icon: 'person', index: 3},
                        {name: 'Edit patient', icon: 'edit', index: 4},
                        {name: 'Add new patient', icon: 'personAdd', index: 5}
                    ];
                } else {
                    this.items = [
                        {name: 'Find another patient', icon: 'person', index: 3},
                    ];
                }
                this.title = 'Patient options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.actions = actions;
        vm.activeServer = null;
        vm.delete = deletePatient;
        vm.dataEvents = [];
        vm.errors = [];
        vm.history = [];
        vm.isBusy = false;
        vm.summary = [];
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.lookupKey = undefined;
        vm.isBusy = false;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.patient = undefined;
        vm.practitionerSearchText = '';
        vm.save = save;
        vm.selectedPractitioner = null;
        vm.title = 'Patient Detail';
        vm.showAuditData = showAuditData;
        vm.showClinicalData = showClinicalData;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$filter', '$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$scope', '$window',
            'addressService', 'attachmentService', 'common', 'demographicsService', 'fhirServers',
            'humanNameService', 'identifierService', 'organizationService', 'patientService', 'contactPointService',
            'practitionerService', 'communicationService', 'careProviderService', 'observationService', 'config', patientDetail]);
})();(function () {
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
})();(function () {
    'use strict';

    var controllerId = 'patientSearch';

    function patientSearch($location, $mdBottomSheet, $routeParams, $scope, common, fhirServers, localValueSets, patientService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;
        var $q = common.$q;

        function activate() {
            common.activateController([getActiveServer()], controllerId)
                .then(function () {
                    if (angular.isDefined($routeParams.orgId)) {
                        getOrganizationPatients($routeParams.orgId);
                        logInfo("Retrieving patients for current organization, please wait...");
                    } else {
                        _loadLocalLookups();
                    }
                }, function (error) {
                    logError('Error initializing patient search', error);
                });
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function getOrganizationPatients(orgId) {
            vm.patientSearch.organization = orgId;
            detailSearch();
        }

        function goToPatient(patient) {
            if (patient && patient.$$hashKey) {
                $location.path('/patient/view/' + patient.$$hashKey);
            }
        }

        function _loadLocalLookups() {
            vm.ethnicities = localValueSets.ethnicity().concept;
            vm.races = localValueSets.race().concept;
            vm.languages = localValueSets.iso6391Languages();
        }

        function detailSearch() {
            // build query string from inputs
            var queryString = '';
            var queryParam = {param: '', value: ''};
            var queryParams = [];
            if (vm.patientSearch.organization) {
                queryParam.param = "organization";
                queryParam.value = vm.patientSearch.organization;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.name.given) {
                queryParam.param = "given";
                queryParam.value = vm.patientSearch.name.given;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.name.family) {
                queryParam.param = "family";
                queryParam.value = vm.patientSearch.name.family;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.mothersMaidenName) {
                queryParam.param = "mothersMaidenName";
                queryParam.value = vm.patientSearch.mothersMaidenName;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.street) {
                queryParam.param = "addressLine";
                queryParam.value = vm.patientSearch.address.street;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.city) {
                queryParam.param = "city";
                queryParam.value = vm.patientSearch.address.city;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.state) {
                queryParam.param = "state";
                queryParam.value = vm.patientSearch.address.state;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.address.postalCode) {
                queryParam.param = "postalCode";
                queryParam.value = vm.patientSearch.address.postalCode;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.dob) {
                queryParam.param = "birthDate";
                queryParam.value = formatString(vm.patientSearch.dob);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.age.start || vm.patientSearch.age.end) {
                if (vm.patientSearch.age.start === vm.patientSearch.age.end) {
                    queryParam.param = "age";
                    queryParam.value = vm.patientSearch.age.start;
                    queryParams.push(_.clone(queryParam));
                }
                else {
                    queryParam.param = "age";
                    queryParam.value = ">".concat(vm.patientSearch.age.start === 0 ? vm.patientSearch.age.start : (vm.patientSearch.age.start - 1));
                    queryParams.push(_.clone(queryParam));
                    queryParam.value = "<".concat(vm.patientSearch.age.end === 1 ? vm.patientSearch.age.end : (vm.patientSearch.age.end + 1));
                    queryParams.push(_.clone(queryParam));
                }
            }
            if (vm.patientSearch.identifier.system && vm.patientSearch.identifier.value) {
                queryParam.param = "identifier";
                queryParam.value = vm.patientSearch.identifier.system.concat("|", vm.patientSearch.identifier.value);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.telecom) {
                queryParam.param = "telecom";
                queryParam.value = vm.patientSearch.telecom;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.gender) {
                queryParam.param = "gender";
                queryParam.value = vm.patientSearch.gender;
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.race) {
                queryParam.param = "race";
                queryParam.value = localValueSets.race().system.concat("|", vm.patientSearch.race.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.language) {
                queryParam.param = "language";
                queryParam.value = vm.patientSearch.language.system.concat("|", vm.patientSearch.language.code);
                queryParams.push(_.clone(queryParam));
            }
            if (vm.patientSearch.ethnicity) {
                queryParam.param = "ethnicity";
                queryParam.value = localValueSets.ethnicity().system.concat("|", vm.patientSearch.ethnicity.code);
                queryParams.push(_.clone(queryParam));
            }

            _.forEach(queryParams, function (item) {
                queryString = queryString.concat(item.param, "=", encodeURIComponent(item.value), "&");
            });
            queryString = _.trimRight(queryString, '&');

            function formatString(input) {
                var yyyy = input.getFullYear().toString();
                var mm = (input.getMonth() + 1).toString();
                var dd = input.getDate().toString();
                return yyyy.concat('-', mm[1] ? mm : '0' + mm[0]).concat('-', dd[1] ? dd : '0' + dd[0]);
            }

            searchPatients(queryString);
        }

        function dereferenceLink(url) {
            vm.isBusy = true;
            patientService.getPatientsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
                    vm.activeServer.name, null, noToast);
                    return data;
                }, function (error) {
                    vm.isBusy = false;
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    vm.isBusy = false;
                });
        }

        function quickSearch(searchText) {
            var deferred = $q.defer();
            patientService.getPatients(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
                    vm.activeServer.name, null, noToast);
                    deferred.resolve(data.entry || []);
                }, function (error) {
                    logError('Error getting patients', error, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        vm.quickSearch = quickSearch;

        function searchPatients(searchText) {
            var deferred = $q.defer();
            vm.isBusy = true;
            patientService.searchPatients(vm.activeServer.baseUrl, searchText)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Patients from ' +
                    vm.activeServer.name, null, noToast);
                    processSearchResults(data);
                    vm.isBusy = false;
                    vm.selectedTab = 1;
                }, function (error) {
                    vm.isBusy = false;
                    logError('Error getting patients', error);
                    deferred.reject();
                })
                .then(deferred.resolve());
            return deferred.promise;
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.patients = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function ageRangeChange() {
            if (vm.patientSearch.age.end === undefined) {
                vm.patientSearch.age.end = vm.patientSearch.age.start;
            }
            if (vm.patientSearch.age.start === undefined) {
                vm.patientSearch.age.start = vm.patientSearch.age.end;
            }
            if (vm.patientSearch.age.start > vm.patientSearch.age.end) {
                vm.patientSearch.age.end = vm.patientSearch.age.start;
            }
        }

        function dobChange() {
            if (vm.patientSearch.dob !== undefined) {
                vm.patientSearch.age.end = vm.patientSearch.age.start = undefined;
            }
        }

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
                        $location.path('/patient/edit/new');
                        break;
                    case 1:
                        $location.path('/patient/detailed-search');
                        break;
                    case 2:
                        $location.path('/patient');
                        break;
                }
            });

            /**
             * Bottom Sheet controller for Patient search
             */
            function ResourceSheetController($mdBottomSheet) {
                this.items = [
                    {name: 'Add new patient', icon: 'personAdd', index: 0},
                    {name: 'Detailed search', icon: 'search', index: 1},
                    {name: 'Quick find', icon: 'person', index: 2}
                ];
                this.title = 'Patient search options';
                this.performAction = function (action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        vm.activeServer = null;
        vm.dereferenceLink = dereferenceLink;
        vm.goToPatient = goToPatient;
        vm.patients = [];
        vm.selectedPatient = null;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Patients';
        vm.managingOrganization = undefined;
        vm.practitioner = undefined;
        vm.actions = actions;
        vm.races = [];
        vm.ethnicities = [];
        vm.languages = [];
        vm.detailSearch = detailSearch;
        vm.isBusy = false;
        vm.ageRangeChange = ageRangeChange;
        vm.dobChange = dobChange;
        vm.patientSearch = {
            name: {first: undefined, last: undefined},
            mothersMaidenName: undefined,
            address: {street: undefined, city: undefined, state: undefined, postalCode: undefined},
            telecom: undefined,
            identifier: {system: undefined, value: undefined},
            age: {start: undefined, end: undefined},
            dob: undefined,
            race: undefined,
            gender: undefined,
            ethnicity: undefined,
            language: undefined,
            organization: undefined,
            careProvider: undefined
        };
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.selectedTab = 0;
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$routeParams', '$scope', 'common', 'fhirServers', 'localValueSets', 'patientService', patientSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'patientService';

    function patientService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers, localValueSets) {
        var dataCacheKey = 'localPatients';
        var itemCacheKey = 'contextPatient';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addPatient(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Patient";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedPatient(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPatients = searchResults.entry;
                    searchResults.entry = _.remove(cachedPatients, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deletePatient(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deletePatient(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatientEverything(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId + '/$everything')
                .then(function (results) {
                    var everything = {"patient": null, "summary": [], "history": []};
                    everything.history = _.remove(results.data.entry, function (item) {
                        return (item.resource.resourceType === 'AuditEvent');
                    });
                    everything.patient = _.remove(results.data.entry, function (item) {
                        return (item.resource.resourceType === 'Patient');
                    })[0];
                    everything.summary = results.data.entry;
                    deferred.resolve(everything);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPatient(hashKey) {
            function getPatient(searchResults) {
                var cachedPatient;
                var cachedPatients = searchResults.entry;
                for (var i = 0, len = cachedPatients.length; i < len; i++) {
                    if (cachedPatients[i].$$hashKey === hashKey) {
                        cachedPatient = cachedPatients[i].resource;
                        var baseUrl = (searchResults.base || (activeServer.baseUrl + '/'));
                        cachedPatient.resourceId = (baseUrl + cachedPatient.resourceType + '/' + cachedPatient.id);
                        cachedPatient.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedPatient) {
                    deferred.resolve(cachedPatient);
                } else {
                    deferred.reject('Patient not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            var activeServer;
            getCachedSearchResults()
                .then(fhirServers.getActiveServer()
                    .then(function (server) {
                        activeServer = server;
                    }))
                .then(getPatient,
                function () {
                    deferred.reject('Patient search results not found in cache.');
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getPatient(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatientContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPatientReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Patient?name=' + input + '&_count=20')
                .then(function (results) {
                    var patients = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Patient') {
                                    patients.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (patients.length === 0) {
                        patients.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(patients);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function searchPatients(baseUrl, searchFilter) {
            var deferred = $q.defer();

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }
            fhirClient.getResource(baseUrl + '/Patient?' + searchFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatients(baseUrl, searchFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(searchFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(searchFilter) && searchFilter.length > 1) {
                var names = searchFilter.split(' ');
                if (names.length === 1) {
                    params = 'name=' + names[0];
                } else {
                    params = 'given=' + names[0] + '&family=' + names[1];
                }
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization:=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Patient?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPatientsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewPatient() {
            return {
                "resourceType": "Patient",
                "name": [],
                "gender": undefined,
                "birthDate": null,
                "maritalStatus": undefined,
                "multipleBirth": false,
                "telecom": [],
                "address": [],
                "photo": [],
                "communication": [],
                "managingOrganization": null,
                "careProvider": [],
                "contact": [],
                "link": [],
                "extension": [],
                "active": true
            };
        }

        function setPatientContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePatient(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedRandomPatients(organizationId, organizationName) {
            var deferred = $q.defer();
            var birthPlace = [];
            var mothersMaiden = [];
            $http.get('http://api.randomuser.me/?results=25&nat=us')
                .success(function (data) {
                    angular.forEach(data.results, function (result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Patient",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": _randomBirthDate(),
                            "contact": [],
                            "communication": _randomCommunication(),
                            "maritalStatus": _randomMaritalStatus(),
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": [{"url": user.picture.large}],
                            "identifier": [
                                {
                                    "system": "urn:oid:2.16.840.1.113883.4.1",
                                    "value": user.SSN,
                                    "use": "secondary",
                                    "assigner": {"display": "Social Security Administration"}
                                },
                                {
                                    "system": "urn:oid:2.16.840.1.113883.15.18",
                                    "value": user.registered,
                                    "use": "official",
                                    "assigner": {"display": organizationName}
                                },
                                {
                                    "system": "urn:fhir-cloud:patient",
                                    "value": common.randomHash(),
                                    "use": "secondary",
                                    "assigner": {"display": "FHIR Cloud"}
                                }
                            ],
                            "managingOrganization": {
                                "reference": "Organization/" + organizationId,
                                "display": organizationName
                            },
                            "link": [],
                            "active": true,
                            "extension": []
                        };
                        resource.extension.push(_randomRace());
                        resource.extension.push(_randomEthnicity());
                        resource.extension.push(_randomReligion());
                        resource.extension.push(_randomMothersMaiden(mothersMaiden));
                        resource.extension.push(_randomBirthPlace(birthPlace));

                        mothersMaiden.push($filter('titleCase')(user.name.last));
                        birthPlace.push(resource.address[0].city + ', ' +  $filter('abbreviateState')(user.location.state));

                        var timer = $timeout(function () {
                        }, 3000);
                        timer.then(function () {
                            addPatient(resource).then(function (results) {
                                logInfo("Created patient " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create patient " + user.name.first + " " + user.name.last, error, false);
                            })
                        })
                    });
                    deferred.resolve();
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function _randomMothersMaiden(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName",
                "valueString": ''
            };
            if (array.length > 0) {
                common.shuffle(array);
                extension.valueString = array[0];
            } else {
                extension.valueString = "Gibson";
            }
            return extension;
        }

        function _randomBirthDate() {
            var start = new Date(1945, 1, 1);
            var end = new Date(1995, 12, 31);
            var randomDob = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            return $filter('date')(randomDob, 'yyyy-MM-dd');
        }

        function _randomBirthPlace(array) {
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/birthPlace",
                "valueAddress": null
            };
            if (array.length > 0) {
                common.shuffle(array);
                var parts = array[0].split(",");
                extension.valueAddress = {"text": array[0], "city": parts[0], "state": parts[1], "country": "USA"};
            } else {
                extension.valueAddress = {"text": "New York, NY", "city": "New York", "state": "NY", "country": "USA"};
            }
            return extension;
        }

        function _randomRace() {
            var races = localValueSets.race();
            common.shuffle(races.concept);
            var race = races.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
                "valueCodeableConcept": {"coding": [], "text": race.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": races.system,
                "code": race.code,
                "display": race.display
            });
            return extension;
        }

        var allEthnicities = [];
        var ethnicitySystem = '';

        function _randomEthnicity() {
            function prepEthnicities() {
                var ethnicities = localValueSets.ethnicity();
                ethnicitySystem = ethnicities.system;
                for (var i = 0, main = ethnicities.concept.length; i < main; i++) {
                    var mainConcept = ethnicities.concept[i];
                    allEthnicities.push(mainConcept);
                    if (angular.isDefined(mainConcept.concept) && angular.isArray(mainConcept.concept)) {
                        for (var j = 0, group = mainConcept.concept.length; j < group; j++) {
                            var groupConcept = mainConcept.concept[j];
                            allEthnicities.push(groupConcept);
                            if (angular.isDefined(groupConcept.concept) && angular.isArray(groupConcept.concept)) {
                                for (var k = 0, leaf = groupConcept.concept.length; k < leaf; k++) {
                                    var leafConcept = groupConcept.concept[k];
                                    allEthnicities.push(leafConcept);
                                }
                            }
                        }
                    }

                }
            }

            if (allEthnicities.length === 0) {
                prepEthnicities();
            }
            common.shuffle(allEthnicities);
            var ethnicity = allEthnicities[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity",
                "valueCodeableConcept": {"coding": [], "text": ethnicity.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": ethnicitySystem,
                "code": ethnicity.code,
                "display": ethnicity.display
            });
            return extension;
        }

        function _randomReligion() {
            var religions = localValueSets.religion();
            common.shuffle(religions.concept);
            var religion = religions.concept[1];
            var extension = {
                "url": "http://hl7.org/fhir/StructureDefinition/us-core-religion",
                "valueCodeableConcept": {"coding": [], "text": religion.display}
            };
            extension.valueCodeableConcept.coding.push({
                "system": religions.system,
                "code": religion.code,
                "display": religion.display
            });
            return extension;
        }

        function _randomCommunication() {
            var languages = localValueSets.iso6391Languages();
            common.shuffle(languages);

            var communication = [];
            var primaryLanguage = {"language": {"text": languages[1].display, "coding": []}, "preferred": true};
            primaryLanguage.language.coding.push({
                "system": languages[1].system,
                "code": languages[1].code,
                "display": languages[1].display
            });
            communication.push(primaryLanguage);
            return communication;
        }

        function _randomMaritalStatus() {
            var maritalStatuses = localValueSets.maritalStatus();
            common.shuffle(maritalStatuses);
            var maritalStatus = maritalStatuses[1];
            var concept = {
                "coding": [], "text": maritalStatus.display
            };
            concept.coding.push({
                "system": maritalStatus.system,
                "code": maritalStatus.code,
                "display": maritalStatus.display
            });
            return concept;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.photo.length === 0) {
                resource.photo = null;
            }
            if (resource.communication.length === 0) {
                resource.communication = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            if (angular.isDefined(resource.maritalStatus)) {
                if (angular.isUndefined(resource.maritalStatus.coding) || resource.maritalStatus.coding.length === 0) {
                    resource.maritalStatus = null;
                }
            }
            return $q.when(resource);
        }

        var service = {
            addPatient: addPatient,
            clearCache: clearCache,
            deleteCachedPatient: deleteCachedPatient,
            deletePatient: deletePatient,
            getCachedPatient: getCachedPatient,
            getCachedSearchResults: getCachedSearchResults,
            getPatient: getPatient,
            getPatientContext: getPatientContext,
            getPatientReference: getPatientReference,
            getPatients: getPatients,
            getPatientsByLink: getPatientsByLink,
            getPatientEverything: getPatientEverything,
            initializeNewPatient: initializeNewPatient,
            setPatientContext: setPatientContext,
            updatePatient: updatePatient,
            seedRandomPatients: seedRandomPatients,
            searchPatients: searchPatients
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers', 'localValueSets',
        patientService]);
})
();(function () {
    'use strict';

    var controllerId = 'personDetail';

    function personDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $window, addressService, common, fhirServers, identifierService, personService, contactPointService, attachmentService, humanNameService, organizationService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deletePerson(person) {
            function executeDelete() {
                if (person && person.resourceId && person.hashKey) {
                    personService.deleteCachedPerson(person.hashKey, person.resourceId)
                        .then(function () {
                            logInfo("Deleted person " + person.fullName);
                            $location.path('/person');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + person.fullName + '?')
                .ariaLabel('delete person')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + person.fullName);
                });
        }

        function edit(person) {
            if (person && person.hashKey) {
                $location.path('/person/edit/' + person.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            vm.loadingOrganizations = true;
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingOrganizations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getRequestedPerson() {
            function intitializeRelatedData(data) {
                vm.person = data;
                attachmentService.init([vm.person.photo], 'Photo');
                humanNameService.init(vm.person.name);
                identifierService.init(vm.person.identifier, "multi", "person");
                addressService.init(vm.person.address, true);
                contactPointService.init(vm.person.telecom, true, true);
                vm.person.fullName = humanNameService.getFullName();
            }

            if ($routeParams.hashKey === 'new') {
                vm.person = null;
                attachmentService.reset();
                humanNameService.reset();
                identifierService.reset();
                addressService.reset();
                contactPointService.reset();
                personService.seedNewPerson()
                    .then(intitializeRelatedData)
                    .then(function () {
                        vm.title = 'Add New person';
                        vm.isEditing = false;
                    }, function (error) {
                        logError(error);
                    });
            } else {
                if ($routeParams.hashKey) {
                    personService.getCachedPerson($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Person/' + $routeParams.id;
                    personService.getPerson(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.person) {
                title = vm.title = 'Edit ' + ((vm.person && vm.person.fullName) || '');
            } else {
                title = vm.title = 'Add New person';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Person saved, but location is unavailable. CORS not implemented correctly at remote host.", true);
            } else {
                vm.person.resourceId = common.setResourceId(vm.person.resourceId, resourceVersionId);
                logInfo("Person saved at " + resourceVersionId, true);
            }
            vm.person.fullName = vm.person.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            var person = personService.initializePerson().resource;
            person.name = humanNameService.mapFromViewModel();
            person.photo = attachmentService.getAll()[0];
            person.address = addressService.mapFromViewModel();
            person.telecom = contactPointService.mapFromViewModel();
            person.identifier = identifierService.getAll();
            person.gender = vm.person.gender;
            person.birthDate = vm.person.birthDate;
            person.link = vm.person.link;
            person.managingOrganization = vm.person.managingOrganization;
            if (vm.isEditing) {
                personService.updatePerson(vm.person.resourceId, person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                personService.addPerson(person)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function personActionsMenu($event) {
            var menuItems = [
                {name: 'Edit', icon: 'img/account4.svg'},
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Locate', icon: 'img/share39.svg'},
                {name: 'Delete', icon: 'img/rubbish.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Edit':
                        $location.path('/person/edit/' + vm.person.$$hashKey);
                        break;
                    case 'Add':
                        $location.path('/person/edit/new');
                        break;
                    case 'Locate':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Delete':
                        deletePerson(vm.person, $event);
                }
            });
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });


        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedPerson();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deletePerson;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.person = undefined;
        vm.personTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'Person Detail';
        vm.personActionsMenu = personActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$window', 'addressService', 'common', 'fhirServers', 'identifierService', 'personService', 'contactPointService', 'attachmentService', 'humanNameService', 'organizationService', personDetail]);

})();(function () {
    'use strict';

    var controllerId = 'personSearch';

    function personSearch($location, $mdBottomSheet, common, config, fhirServers, personService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var keyCodes = config.keyCodes;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedPersons()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error activating controller', error, noToast);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _getCachedPersons() {
            personService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' persons from cache', null, noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goToPerson(person) {
            if (person && person.$$hashKey) {
                $location.path('/person/view/' + person.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.persons = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit() {
            if (vm.searchText.length > 0) {
                toggleSpinner(true);
                personService.getPersons(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' persons from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error: ' + error);
                        toggleSpinner(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        function personSearchActionsMenu($event) {
            var menuItems = [
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Search', icon: 'img/search100.svg'},
                {name: 'Clear', icon: 'img/clear5.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Add':
                        $location.path('/person/edit/new');
                        break;
                    case 'Search':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Clear':
                        personService.clearCache();
                        vm.searchText = '';
                        vm.persons = [];
                        vm.paging = null;
                        $location.path('/person');
                        logInfo('Search results cache cleared');
                }
            });
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.keyPress = keyPress;
        vm.goToPerson = goToPerson;
        vm.persons = [];
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Person';
        vm.personSearchActionsMenu = personSearchActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', 'common', 'config', 'fhirServers', 'personService', personSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'personService';

    function personService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localPersons';
        var itemCacheKey = 'contextPerson';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addPerson(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Person";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedPerson(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPersons = searchResults.entry;
                    searchResults.entry = _.remove(cachedPersons, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deletePerson(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deletePerson(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPerson(hashKey) {
            function getPerson(searchResults) {
                var cachedPerson;
                var cachedPersons = searchResults.entry;
                for (var i = 0, len = cachedPersons.length; i < len; i++) {
                    if (cachedPersons[i].$$hashKey === hashKey) {
                        cachedPerson = cachedPersons[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedPerson.resourceId = (searchResults.base + cachedPerson.resourceType + '/' + cachedPerson.id);
                        cachedPerson.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedPerson) {
                    deferred.resolve(cachedPerson);
                } else {
                    deferred.reject('Person not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getPerson,
                function () {
                    deferred.reject('Person search results not found in cache.');
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getPerson(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPersonContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPersonReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Person/?name=' + input + '&_count=20&_summary=true')
                .then(function (results) {
                    var Persons = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Person') {
                                    //  var display = com
                                    Persons.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (Persons.length === 0) {
                        Persons.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(Persons);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPersons(baseUrl, nameFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(nameFilter) && nameFilter.length > 1) {
                var names = nameFilter.split(' ');
                if (names.length === 1) {
                    params = 'name=' + names[0];
                } else {
                    params = 'given=' + names[0] + '&family=' + names[1];
                }
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization:Organization=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Person?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedNewPerson() {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me')
                .success(function (data) {
                    var user = data.results[0].user;
                    var resource = {
                        "resourceType": "Person",
                        "name": [{
                            "family": [$filter('titleCase')(user.name.last)],
                            "given": [$filter('titleCase')(user.name.first)],
                            "prefix": [$filter('titleCase')(user.name.title)],
                            "use": "usual"
                        }],
                        "gender": user.gender,
                        "birthDate": new Date(parseInt(user.dob)),
                        "telecom": [
                            {"system": "email", "value": user.email, "use": "home"},
                            {"system": "phone", "value": user.cell, "use": "mobile"},
                            {"system": "phone", "value": user.phone, "use": "home"}],
                        "address": [{
                            "line": [$filter('titleCase')(user.location.street)],
                            "city": $filter('titleCase')(user.location.city),
                            "state": $filter('abbreviateState')(user.location.state),
                            "postalCode": user.location.zip,
                            "use": "home"
                        }],
                        "photo": {"url": user.picture.large},
                        "identifier": [{"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official"}],
                        "managingOrganization": null,
                        "link": [],
                        "active": true
                    };
                    var randomPerson = {"resource": resource};
                    deferred.resolve(randomPerson.resource);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function initializePerson() {
            var data = {};
            data.resource = {
                "resourceType": "Person",
                "name": [],
                "gender": undefined,
                "birthDate": undefined,
                "telecom": [],
                "address": [],
                "photo": undefined,
                "identifier": [],
                "managingOrganization": undefined,
                "link": [],
                "active": true
            };
            return data;
        }

        function seedRandomPersons(resourceId, organizationName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=100')
                .success(function (data) {
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Person",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": {"url": user.picture.large},
                            "identifier": [
                                {"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official", "label":"Social Security Number", "assigner": {"display" : "Social Security Administration"}},
                                {"system": "urn:oid:2.16.840.1.113883.15.34", "value": user.registered, "use": "official", "label": organizationName + " master Id", "assigner": {"reference": resourceId, "display": organizationName}}
                            ],
                            "managingOrganization": { "reference": resourceId, "display": organizationName },
                            "link": [],
                            "active": true
                        };
                        var timer = $timeout(function () {}, 5000);
                        timer.then(function () {
                            addPerson(resource).then(function (results) {
                                logInfo("Created person " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create person " + user.name.first + " " + user.name.last, error, false);
                            })
                        })
                    });
                    deferred.resolve();
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function setPersonContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePerson(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            return $q.when(resource);
        }


        var service = {
            addPerson: addPerson,
            clearCache: clearCache,
            deleteCachedPerson: deleteCachedPerson,
            deletePerson: deletePerson,
            getCachedPerson: getCachedPerson,
            getCachedSearchResults: getCachedSearchResults,
            getPerson: getPerson,
            getPersonContext: getPersonContext,
            getPersonReference: getPersonReference,
            getPersons: getPersons,
            initializePerson: initializePerson,
            seedNewPerson: seedNewPerson,
            seedRandomPersons: seedRandomPersons,
            setPersonContext: setPersonContext,
            updatePerson: updatePerson
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        personService]);
})();(function () {
    'use strict';

    var controllerId = 'practitionerSearch';

    function practitionerSearch($location, $mdSidenav, common, config, fhirServers, practitionerService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var keyCodes = config.keyCodes;
        var logError = getLogFn(controllerId, 'error');
        var logInfo = getLogFn(controllerId, 'info');
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedpractitioners()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error ' + error);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                });
        }

        function _getCachedpractitioners() {
            practitionerService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' practitioners from cache', noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goTopractitioner(practitioner) {
            if (practitioner && practitioner.$$hashKey) {
                $location.path('/practitionerReference/view/' + practitioner.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.practitioners = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function dereferenceLink(url) {
            common.toggleProgressBar(true);
            practitionerService.getpractitionersByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.practitioners) ? data.practitioners.length : 0) + ' practitioners from ' + vm.activeServer.name, noToast);
                    return data;
                }, function (error) {
                    common.toggleProgressBar(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    common.toggleProgressBar(false);
                });
        }

        function submit() {
            if (vm.searchText.length > 0) {
                common.toggleProgressBar(true);
                practitionerService.getpractitioners(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' practitioners from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error getting practitioners', error, noToast);
                        common.toggleProgressBar(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        common.toggleProgressBar(false);
                    });
            }
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSideNav(event) {
            event.preventDefault();
            $mdSidenav('right').toggle();
        }

        vm.activeServer = null;
        vm.keyPress = keyPress;
        vm.goTopractitioner = goTopractitioner;
        vm.practitioners = [];
        vm.practitionersCount = 0;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'practitioners';
        vm.managingOrganization = undefined;
        vm.toggleSideNav = toggleSideNav;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdSidenav', 'common', 'config', 'fhirServers', 'practitionerService', practitionerSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'practitionerService';

    function practitionerService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localPractitioners';
        var itemCacheKey = 'contextPractitioner';
        var $q = common.$q;

        function addPractitioner(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Practitioner";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedPractitioner(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedPractitioners = searchResults.entry;
                    searchResults.entry = _.remove(cachedPractitioners, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }
            var deferred = $q.defer();
            deletePractitioner(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deletePractitioner(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitionerEverything(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId + '/$everything')
                .then(function (results) {
                    var everything = {"practitioner": null, "summary": [], "history": []};
                    everything.history = _.remove(results.data.entry, function(item) {
                       return (item.resource.resourceType === 'SecurityEvent');
                    });
                    everything.practitioner = _.remove(results.data.entry, function(item) {
                        return (item.resource.resourceType === 'Practitioner');
                    })[0];
                    everything.summary = results.data.entry;
                    deferred.resolve(everything);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedPractitioner(hashKey) {
            function getPractitioner(searchResults) {
                var cachedPractitioner;
                var cachedPractitioners = searchResults.entry;
                for (var i = 0, len = cachedPractitioners.length; i < len; i++) {
                    if (cachedPractitioners[i].$$hashKey === hashKey) {
                        cachedPractitioner = cachedPractitioners[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedPractitioner.resourceId = (searchResults.base + cachedPractitioner.resourceType + '/' + cachedPractitioner.id);
                        cachedPractitioner.hashKey = cachedPractitioner.$$hashKey;
                        break;
                    }
                }
                if (cachedPractitioner) {
                    deferred.resolve(cachedPractitioner);
                } else {
                    deferred.reject('Practitioner not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getPractitioner,
                function () {
                    deferred.reject('Practitioner search results not found in cache.');
                });
            return deferred.promise;

        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getPractitioner(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitionerContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getPractitionerReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Practitioner?name=' + input + '&_count=10')
                .then(function (results) {
                    var practitioners = [];
                    if (results.data.entry) {
                        for (var i = 0, len = results.data.entry.length; i < len; i++) {
                            var item = results.data.entry[i];
                            if (item.resource && item.resource.resourceType === 'Practitioner') {
                                practitioners.push({
                                    display: $filter('fullName')(item.resource.name),
                                    reference: baseUrl + '/Practitioner/' + item.resource.id
                                });
                            }
                            if (10 === i) {
                                break;
                            }
                        }
                    }
                    if (practitioners.length === 0) {
                        practitioners.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(practitioners);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitioners(baseUrl, nameFilter) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter)) {
                deferred.reject('Invalid search input');
            }
            var names = nameFilter.split(' ');
            if (names.length === 1) {
                params = 'name=' + names[0];
            } else {
                params = 'given=' + names[0] + '&family=' + names[1];
            }

            fhirClient.getResource(baseUrl + '/Practitioner?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getPractitionersByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewPractitioner() {
            return {
                "resourceType": "Practitioner",
                "name": [],
                "gender": undefined,
                "birthDate": null,
                "maritalStatus": undefined,
                //              "multipleBirth": false,
                "telecom": [],
                "address": [],
                "photo": [],
                "communication": [],
                "managingpractitioner": null,
                "contact": [],
                "link": [],
                "active": true
            };
        }

        function setPractitionerContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updatePractitioner(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedRandomPractitioners(resourceId, practitionerName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=10')
                .success(function (data) {
                    var count = 0;
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Practitioner",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
                            "contact": [],
                            "communication": [],
                            "maritalStatus": [],
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": [{"url": user.picture.large}],
                            "identifier": [
                                {"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official", "label":"Social Security Number", "assigner": {"display" : "Social Security Administration"}},
                                {"system": "urn:oid:2.16.840.1.113883.15.18", "value": user.registered, "use": "official", "label": practitionerName + " master Id", "assigner": {"reference": resourceId, "display": practitionerName}}
                            ],
                            "managingpractitioner": { "reference": resourceId, "display": practitionerName },
                            "link": [],
                            "active": true
                        };
                        $timeout(addPractitioner(resource).then(count = count + 1), 2000);

                    });
                    deferred.resolve(count + ' practitioners created for ' + practitionerName);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.photo.length === 0) {
                resource.photo = null;
            }
            if (resource.communication.length === 0) {
                resource.communication = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            if (resource.maritalStatus.coding && resource.maritalStatus.coding.length === 0) {
                resource.maritalStatus = null;
            }
            return $q.when(resource);
        }

        var service = {
            addPractitioner: addPractitioner,
            clearCache: clearCache,
            deleteCachedPractitioner: deleteCachedPractitioner,
            deletePractitioner: deletePractitioner,
            getCachedPractitioner: getCachedPractitioner,
            getCachedSearchResults: getCachedSearchResults,
            getPractitioner: getPractitioner,
            getPractitionerContext: getPractitionerContext,
            getPractitionerReference: getPractitionerReference,
            getPractitioners: getPractitioners,
            getPractitionersByLink: getPractitionersByLink,
            getPractitionerEverything: getPractitionerEverything,
            initializeNewPractitioner: initializeNewPractitioner,
            setPractitionerContext: setPractitionerContext,
            updatePractitioner: updatePractitioner,
            seedRandomPractitioners: seedRandomPractitioners
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        practitionerService]);
})();(function () {
    'use strict';

    var controllerId = 'profileDetail';

    function profileDetail($location, $routeParams, $window, $mdDialog, common, fhirServers, profileService, contactPointService, valueSetService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteProfile(profile) {
            function executeDelete() {
                if (profile && profile.resourceId && profile.hashKey) {
                    profileService.deleteCachedProfile(profile.hashKey, profile.resourceId)
                        .then(function () {
                            logSuccess("Deleted profile " + profile.name);
                            $location.path('/profiles');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + profile.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(profile) {
            if (profile && profile.hashKey) {
                $location.path('/profile/edit/' + profile.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedProfile() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                if (rawData.text) {
                    vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                } else {
                    vm.narrative =  '<div>Not provided</div>';
                }
                vm.json = rawData;
                vm.json.text = {div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.profile = rawData;
                if (angular.isUndefined(vm.profile.type)) {
                    vm.profile.type = {"coding": []};
                }
                vm.title = vm.profile.name;
                contactPointService.init(vm.profile.telecom, false, false);
            }

            if ($routeParams.hashKey === 'new') {
                var data = profileService.initializeNewProfile();
                intitializeRelatedData(data);
                vm.title = 'Add New Profile';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    profileService.getCachedProfile($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Profile/' + $routeParams.id;
                    profileService.getProfile(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.profile) {
                title = vm.title = 'Edit ' + ((vm.profile && vm.profile.fullName) || '');
            } else {
                title = vm.title = 'Add New Profile';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Profile saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.profile.resourceId = common.setResourceId(vm.profile.resourceId, resourceVersionId);
                logSuccess("Profile saved at " + resourceVersionId);
            }
            // vm.profile.fullName = profile.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.profile.name.length < 5) {
                logError("Profile Name must be at least 5 characters");
                return;
            }
            var profile = profileService.initializeNewProfile().resource;
            profile.name = vm.profile.name;
            profile.type = vm.profile.type;
            profile.telecom = contactPointService.mapFromViewModel();
            profile.active = vm.profile.active;
            if (vm.isEditing) {
                profileService.updateProfile(vm.profile.resourceId, profile)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                profileService.addProfile(profile)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function showFullDescription(element, event) {
            $mdDialog.show({
                optionsOrPresent: {disableParentScroll: false},
                templateUrl: 'templates/rawData-dialog.html',
                controller: 'rawDataController',
                locals: {
                    data: element
                },
                targetEvent: event
            });
        }

        function viewProfileDetail(profile, event) {
            console.log(profile);
        }

        function viewExtensionDefinition(extensionDefinition, event) {
            console.log(extensionDefinition);
        }

        function viewBoundValueSet(reference, event) {
            $mdDialog.show({
                optionsOrPresent: {disableParentScroll: false},
                templateUrl: 'templates/valueSet-popup.html',
                controller: 'valueSetPopupController',
                locals: {
                    data: reference
                },
                targetEvent: event
            });
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedProfile();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteProfile;
        vm.edit = edit;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.profile = undefined;
        vm.save = save;
        vm.title = 'profileDetail';
        vm.showFullDescription = showFullDescription;
        vm.viewExtensionDefinition = viewExtensionDefinition;
        vm.viewBoundValueSet = viewBoundValueSet;
        vm.viewProfileDetail = viewProfileDetail;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'fhirServers', 'profileService', 'contactPointService', 'valueSetService', profileDetail]);

})();(function () {
    'use strict';

    var controllerId = 'profileSearch';

    function profileSearch($location, common, config, fhirServers, profileService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            profileService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {
                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/profile/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.profiles = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                profileService.getProfiles(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' Profiles from ' + vm.activeServer.name, false);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            profileService.getProfilesByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.profiles) ? data.profiles.length : 0) + ' Profiles from ' + vm.activeServer.name, true);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.profiles = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Profiles';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', 'common', 'config', 'fhirServers', 'profileService', profileSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'profileService';

    function profileService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localProfiles';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addProfile(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/Profile";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedProfile(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedProfiles = searchResults.entry;
                for (var i = 0, len = cachedProfiles.length; i < len; i++) {
                    if (cachedProfiles[i].$$hashKey === hashKey) {
                        cachedProfiles.splice(i, 1);
                        searchResults.entry = cachedProfiles;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('Profile not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteProfile(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteProfile(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedProfile(hashKey) {
            function getProfile(searchResults) {
                var cachedProfile;
                var cachedProfiles = searchResults.entry;
                cachedProfile = _.find(cachedProfiles, {'$$hashKey': hashKey});
                if (cachedProfile) {
                    deferred.resolve(cachedProfile);
                } else {
                    deferred.reject('Profile not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getProfile,
                function () {
                    deferred.reject('Profile search results not found in cache.');
                });
            return deferred.promise;
        }

        function getProfile(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getProfileReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Profile?type=' + input + '&_count=20')
                .then(function (results) {
                    var profiles = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                profiles.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (profiles.length === 0) {
                        profiles.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(profiles);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getProfiles(baseUrl, nameFilter) {
            var deferred = $q.defer();

            fhirClient.getResource(baseUrl + '/Profile?name=' + nameFilter + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getProfilesByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "profiles": []};
                    var profiles = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Profile') {
                                    profiles.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (profiles.length === 0) {
                        profiles.push({display: "No matches", reference: ''});
                    }
                    searchResults.profiles = profiles;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewProfile() {
            var data = {};
            data.resource = {
                "resourceType": "Profile",
                "identifier": [],
                "type": {"coding": []},
                "telecom": [],
                "contact": [],
                "address": [],
                "partOf": null,
                "location": [],
                "active": true
            };
            return data;
        }

        function updateProfile(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.contact.length === 0) {
                resource.contact = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.location.length === 0) {
                resource.location = null;
            }
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addProfile: addProfile,
            clearCache: clearCache,
            deleteCachedProfile: deleteCachedProfile,
            deleteProfile: deleteProfile,
            getCachedProfile: getCachedProfile,
            getCachedSearchResults: getCachedSearchResults,
            getProfile: getProfile,
            getProfiles: getProfiles,
            getProfilesByLink: getProfilesByLink,
            getProfileReference: getProfileReference,
            initializeNewProfile: initializeNewProfile,
            updateProfile: updateProfile
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', profileService]);

})();(function () {
    'use strict';

    var controllerId = 'relatedPersonDetail';

    function relatedPersonDetail($location, $mdBottomSheet, $mdDialog, $routeParams, $window, addressService, common, fhirServers, identifierService, relatedPersonService, contactPointService, attachmentService, humanNameService, organizationService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');
        var $q = common.$q;

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteRelatedperson(relatedPerson) {
            function executeDelete() {
                if (relatedPerson && relatedPerson.resourceId && relatedPerson.hashKey) {
                    relatedPersonService.deleteCachedRelatedperson(relatedPerson.hashKey, relatedPerson.resourceId)
                        .then(function () {
                            logInfo("Deleted relatedPerson " + relatedPerson.fullName);
                            $location.path('/relatedPerson');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }

            var confirm = $mdDialog.confirm()
                .title('Delete ' + relatedPerson.fullName + '?')
                .ariaLabel('delete relatedPerson')
                .ok('Yes')
                .cancel('No')
                .targetEvent(event);
            $mdDialog.show(confirm).then(executeDelete,
                function () {
                    logInfo('You decided to keep ' + relatedPerson.fullName);
                });
        }

        function edit(relatedPerson) {
            if (relatedPerson && relatedPerson.hashKey) {
                $location.path('/relatedPerson/edit/' + relatedPerson.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getOrganizationReference(input) {
            var deferred = $q.defer();
            vm.loadingOrganizations = true;
            organizationService.getOrganizationReference(vm.activeServer.baseUrl, input)
                .then(function (data) {
                    vm.loadingOrganizations = false;
                    deferred.resolve(data);
                }, function (error) {
                    vm.loadingOrganizations = false;
                    logError(common.unexpectedOutcome(error));
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getRequestedRelatedperson() {
            function intitializeRelatedData(data) {
                vm.relatedPerson = data;
                attachmentService.init([vm.relatedPerson.photo], 'Photo');
                humanNameService.init(vm.relatedPerson.name);
                identifierService.init(vm.relatedPerson.identifier, "multi", "relatedPerson");
                addressService.init(vm.relatedPerson.address, true);
                contactPointService.init(vm.relatedPerson.telecom, true, true);
                vm.relatedPerson.fullName = humanNameService.getFullName();
            }

            if ($routeParams.hashKey === 'new') {
                vm.relatedPerson = null;
                attachmentService.reset();
                humanNameService.reset();
                identifierService.reset();
                addressService.reset();
                contactPointService.reset();
                relatedPersonService.seedNewRelatedperson()
                    .then(intitializeRelatedData)
                    .then(function () {
                        vm.title = 'Add New relatedPerson';
                        vm.isEditing = false;
                    }, function (error) {
                        logError(error);
                    });
            } else {
                if ($routeParams.hashKey) {
                    relatedPersonService.getCachedRelatedperson($routeParams.hashKey)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/Relatedperson/' + $routeParams.id;
                    relatedPersonService.getRelatedperson(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.relatedPerson) {
                title = vm.title = 'Edit ' + ((vm.relatedPerson && vm.relatedPerson.fullName) || '');
            } else {
                title = vm.title = 'Add New relatedPerson';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("Relatedperson saved, but location is unavailable. CORS not implemented correctly at remote host.", true);
            } else {
                vm.relatedPerson.resourceId = common.setResourceId(vm.relatedPerson.resourceId, resourceVersionId);
                logInfo("Relatedperson saved at " + resourceVersionId, true);
            }
            vm.relatedPerson.fullName = vm.relatedPerson.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            var relatedPerson = relatedPersonService.initializeRelatedperson().resource;
            relatedPerson.name = humanNameService.mapFromViewModel();
            relatedPerson.photo = attachmentService.getAll()[0];
            relatedPerson.address = addressService.mapFromViewModel();
            relatedPerson.telecom = contactPointService.mapFromViewModel();
            relatedPerson.identifier = identifierService.getAll();
            relatedPerson.gender = vm.relatedPerson.gender;
            relatedPerson.birthDate = vm.relatedPerson.birthDate;
            relatedPerson.link = vm.relatedPerson.link;
            relatedPerson.managingOrganization = vm.relatedPerson.managingOrganization;
            if (vm.isEditing) {
                relatedPersonService.updateRelatedperson(vm.relatedPerson.resourceId, relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                relatedPersonService.addRelatedperson(relatedPerson)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        function relatedPersonActionsMenu($event) {
            var menuItems = [
                {name: 'Edit', icon: 'img/account4.svg'},
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Locate', icon: 'img/share39.svg'},
                {name: 'Delete', icon: 'img/rubbish.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Edit':
                        $location.path('/relatedPerson/edit/' + vm.relatedPerson.$$hashKey);
                        break;
                    case 'Add':
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 'Locate':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Delete':
                        deleteRelatedperson(vm.relatedPerson, $event);
                }
            });
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });


        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedRelatedperson();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.contactTypes = undefined;
        vm.delete = deleteRelatedperson;
        vm.edit = edit;
        vm.getOrganizationReference = getOrganizationReference;
        vm.getTitle = getTitle;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.loadingOrganizations = false;
        vm.relatedPerson = undefined;
        vm.relatedPersonTypes = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'Relatedperson Detail';
        vm.relatedPersonActionsMenu = relatedPersonActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', '$mdDialog', '$routeParams', '$window', 'addressService', 'common', 'fhirServers', 'identifierService', 'relatedPersonService', 'contactPointService', 'attachmentService', 'humanNameService', 'organizationService', relatedPersonDetail]);

})();(function () {
    'use strict';

    var controllerId = 'relatedPersonSearch';

    function relatedPersonSearch($location, $mdBottomSheet, common, config, fhirServers, relatedPersonService) {
        /*jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');
        var keyCodes = config.keyCodes;
        var noToast = false;

        function activate() {
            common.activateController([_getActiveServer(), _getCachedRelatedpersons()], controllerId)
                .then(function () {

                }, function (error) {
                    logError('Error activating controller', error, noToast);
                });
        }

        function _getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function _getCachedRelatedpersons() {
            relatedPersonService.getCachedSearchResults()
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' relatedPersons from cache', null, noToast);
                    return data;
                }, function (message) {
                    logInfo(message, null, noToast);
                })
                .then(processSearchResults);
        }

        function goToRelatedperson(relatedPerson) {
            if (relatedPerson && relatedPerson.$$hashKey) {
                $location.path('/relatedPerson/view/' + relatedPerson.$$hashKey);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.relatedPersons = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit() {
            if (vm.searchText.length > 0) {
                toggleSpinner(true);
                relatedPersonService.getRelatedpersons(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' relatedPersons from ' + vm.activeServer.name);
                        return data;
                    }, function (error) {
                        logError('Error: ' + error);
                        toggleSpinner(false);
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        function relatedPersonSearchActionsMenu($event) {
            var menuItems = [
                {name: 'Add', icon: 'img/add184.svg'},
                {name: 'Search', icon: 'img/search100.svg'},
                {name: 'Clear', icon: 'img/clear5.svg'}
            ];
            $mdBottomSheet.show({
                locals: {items: menuItems},
                templateUrl: 'templates/bottomSheet.html',
                controller: 'bottomSheetController',
                targetEvent: $event
            }).then(function (clickedItem) {
                switch (clickedItem.name) {
                    case 'Add':
                        $location.path('/relatedPerson/edit/new');
                        break;
                    case 'Search':
                        logInfo('TODO: implement Locate');
                        break;
                    case 'Clear':
                        relatedPersonService.clearCache();
                        vm.searchText = '';
                        vm.relatedPersons = [];
                        vm.paging = null;
                        $location.path('/relatedPerson');
                        logInfo('Search results cache cleared');
                }
            });
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.keyPress = keyPress;
        vm.goToRelatedperson = goToRelatedperson;
        vm.relatedPersons = [];
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.submit = submit;
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'Relatedperson';
        vm.relatedPersonSearchActionsMenu = relatedPersonSearchActionsMenu;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$mdBottomSheet', 'common', 'config', 'fhirServers', 'relatedPersonService', relatedPersonSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'relatedPersonService';

    function relatedPersonService($filter, $http, $timeout, common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localRelatedPersons';
        var itemCacheKey = 'contextRelatedPerson';
        var logError = common.logger.getLogFn(serviceId, 'error');
        var logInfo = common.logger.getLogFn(serviceId, 'info');
        var $q = common.$q;

        function addRelatedperson(resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/relatedPerson";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedRelatedperson(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                if (searchResults && searchResults.entry) {
                    var cachedRelatedpersons = searchResults.entry;
                    searchResults.entry = _.remove(cachedRelatedpersons, function (item) {
                        return item.$$hashKey !== hashKey;
                    });
                    searchResults.totalResults = (searchResults.totalResults - 1);
                    dataCache.addToCache(dataCacheKey, searchResults);
                }
                deferred.resolve();
            }

            var deferred = $q.defer();
            deleteRelatedperson(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache,
                function (error) {
                    deferred.reject(error);
                })
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteRelatedperson(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedRelatedperson(hashKey) {
            function getRelatedperson(searchResults) {
                var cachedRelatedperson;
                var cachedRelatedpersons = searchResults.entry;
                for (var i = 0, len = cachedRelatedpersons.length; i < len; i++) {
                    if (cachedRelatedpersons[i].$$hashKey === hashKey) {
                        cachedRelatedperson = cachedRelatedpersons[i].resource;
                        //TODO: FHIR Change request to make fully-qualified resourceId part of meta data
                        cachedRelatedperson.resourceId = (searchResults.base + cachedRelatedperson.resourceType + '/' + cachedRelatedperson.id);
                        cachedRelatedperson.hashKey = hashKey;
                        break;
                    }
                }
                if (cachedRelatedperson) {
                    deferred.resolve(cachedRelatedperson);
                } else {
                    deferred.reject('Relatedperson not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getRelatedperson,
                function () {
                    deferred.reject('Relatedperson search results not found in cache.');
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getRelatedperson(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (data) {
                    dataCache.addToCache(dataCacheKey, data);
                    deferred.resolve(data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getRelatedpersonContext() {
            return dataCache.readFromCache(dataCacheKey);
        }

        function getRelatedpersonReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/Relatedperson/?name=' + input + '&_count=20&_summary=true')
                .then(function (results) {
                    var Relatedpersons = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'Relatedperson') {
                                    //  var display = com
                                    Relatedpersons.push({
                                        display: $filter('fullName')(item.content.name),
                                        reference: item.id
                                    });
                                }
                            });
                    }
                    if (Relatedpersons.length === 0) {
                        Relatedpersons.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(Relatedpersons);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getRelatedpersons(baseUrl, nameFilter, organizationId) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter) && angular.isUndefined(organizationId)) {
                deferred.reject('Invalid search input');
            }

            if (angular.isDefined(nameFilter) && nameFilter.length > 1) {
                var names = nameFilter.split(' ');
                if (names.length === 1) {
                    params = 'name=' + names[0];
                } else {
                    params = 'given=' + names[0] + '&family=' + names[1];
                }
            }

            if (angular.isDefined(organizationId)) {
                var orgParam = 'organization:Organization=' + organizationId;
                if (params.length > 1) {
                    params = params + '&' + orgParam;
                } else {
                    params = orgParam;
                }
            }

            fhirClient.getResource(baseUrl + '/Relatedperson?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function seedNewRelatedperson() {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me')
                .success(function (data) {
                    var user = data.results[0].user;
                    var resource = {
                        "resourceType": "Relatedperson",
                        "name": [{
                            "family": [$filter('titleCase')(user.name.last)],
                            "given": [$filter('titleCase')(user.name.first)],
                            "prefix": [$filter('titleCase')(user.name.title)],
                            "use": "usual"
                        }],
                        "gender": user.gender,
                        "birthDate": new Date(parseInt(user.dob)),
                        "telecom": [
                            {"system": "email", "value": user.email, "use": "home"},
                            {"system": "phone", "value": user.cell, "use": "mobile"},
                            {"system": "phone", "value": user.phone, "use": "home"}],
                        "address": [{
                            "line": [$filter('titleCase')(user.location.street)],
                            "city": $filter('titleCase')(user.location.city),
                            "state": $filter('abbreviateState')(user.location.state),
                            "postalCode": user.location.zip,
                            "use": "home"
                        }],
                        "photo": {"url": user.picture.large},
                        "identifier": [{"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official"}],
                        "managingOrganization": null,
                        "link": [],
                        "active": true
                    };
                    var randomRelatedperson = {"resource": resource};
                    deferred.resolve(randomRelatedperson.resource);
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function initializeRelatedperson() {
            var data = {};
            data.resource = {
                "resourceType": "Relatedperson",
                "name": [],
                "gender": undefined,
                "birthDate": undefined,
                "telecom": [],
                "address": [],
                "photo": undefined,
                "identifier": [],
                "managingOrganization": undefined,
                "link": [],
                "active": true
            };
            return data;
        }

        function seedRandomRelatedpersons(resourceId, organizationName) {
            var deferred = $q.defer();
            $http.get('http://api.randomuser.me/?results=100')
                .success(function (data) {
                    angular.forEach(data.results, function(result) {
                        var user = result.user;
                        var birthDate = new Date(parseInt(user.dob));
                        var stringDOB = $filter('date')(birthDate, 'yyyy-MM-dd');
                        var resource = {
                            "resourceType": "Relatedperson",
                            "name": [{
                                "family": [$filter('titleCase')(user.name.last)],
                                "given": [$filter('titleCase')(user.name.first)],
                                "prefix": [$filter('titleCase')(user.name.title)],
                                "use": "usual"
                            }],
                            "gender": user.gender,
                            "birthDate": stringDOB,
                            "telecom": [
                                {"system": "email", "value": user.email, "use": "home"},
                                {"system": "phone", "value": user.cell, "use": "mobile"},
                                {"system": "phone", "value": user.phone, "use": "home"}],
                            "address": [{
                                "line": [$filter('titleCase')(user.location.street)],
                                "city": $filter('titleCase')(user.location.city),
                                "state": $filter('abbreviateState')(user.location.state),
                                "postalCode": user.location.zip,
                                "use": "home"
                            }],
                            "photo": {"url": user.picture.large},
                            "identifier": [
                                {"system": "urn:oid:2.16.840.1.113883.4.1", "value": user.SSN, "use": "official", "label":"Social Security Number", "assigner": {"display" : "Social Security Administration"}},
                                {"system": "urn:oid:2.16.840.1.113883.15.34", "value": user.registered, "use": "official", "label": organizationName + " master Id", "assigner": {"reference": resourceId, "display": organizationName}}
                            ],
                            "managingOrganization": { "reference": resourceId, "display": organizationName },
                            "link": [],
                            "active": true
                        };
                        var timer = $timeout(function () {}, 5000);
                        timer.then(function () {
                            addRelatedperson(resource).then(function (results) {
                                logInfo("Created relatedPerson " + user.name.first + " " + user.name.last + " at " + (results.headers.location || results.headers["content-location"]), null, false);
                            }, function (error) {
                                logError("Failed to create relatedPerson " + user.name.first + " " + user.name.last, error, false);
                            })
                        })
                    });
                    deferred.resolve();
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function setRelatedpersonContext(data) {
            dataCache.addToCache(itemCacheKey, data);
        }

        function updateRelatedperson(resourceVersionId, resource) {
            _prepArrays(resource);
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            if (resource.address.length === 0) {
                resource.address = null;
            }
            if (resource.identifier.length === 0) {
                resource.identifier = null;
            }
            if (resource.telecom.length === 0) {
                resource.telecom = null;
            }
            if (resource.link.length === 0) {
                resource.link = null;
            }
            return $q.when(resource);
        }


        var service = {
            addRelatedperson: addRelatedperson,
            clearCache: clearCache,
            deleteCachedRelatedperson: deleteCachedRelatedperson,
            deleteRelatedperson: deleteRelatedperson,
            getCachedRelatedperson: getCachedRelatedperson,
            getCachedSearchResults: getCachedSearchResults,
            getRelatedperson: getRelatedperson,
            getRelatedpersonContext: getRelatedpersonContext,
            getRelatedpersonReference: getRelatedpersonReference,
            getRelatedpersons: getRelatedpersons,
            initializeRelatedperson: initializeRelatedperson,
            seedNewRelatedperson: seedNewRelatedperson,
            seedRandomRelatedpersons: seedRandomRelatedpersons,
            setRelatedpersonContext: setRelatedpersonContext,
            updateRelatedperson: updateRelatedperson
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['$filter', '$http', '$timeout', 'common', 'dataCache', 'fhirClient', 'fhirServers',
        relatedPersonService]);
})();(function () {
    'use strict';

    var controllerId = 'bottomSheetController';

    function bottomSheet($scope, $mdBottomSheet, common, items) {
        function listItemClick($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        }

        function activate() {
            common.activateController(controllerId).then(function () {
            });
        }

        $scope.items = items;
        $scope.listItemClick = listItemClick;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$scope', '$mdBottomSheet', 'common', 'items', bottomSheet]);
})();(function () {
    'use strict';

    var controllerId = 'dafController';

    function dafController($routeParams, $sce, common, fhirServers) {
        /*jshint validthis:true */
        var vm = this;

        function activate() {
            common.activateController(controllerId).then(function () {
                setDAFUrl();
            });
        }

        function setDAFUrl() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return server.secure ? "https" : "http";
                })
                .then(function (scheme) {
                switch ($routeParams.profile) {
                    case 'patient':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/patient-daf.html");
                        break;
                    case 'allergyIntolerance':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/allergyintolerance-daf.html");
                        break;
                    case 'diagnosticOrder':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/diagnosticorder-daf.html");
                        break;
                    case 'diagnosticReport':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/diagnosticreport-daf.html");
                        break;
                    case 'encounter':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/encounter-daf.html");
                        break;
                    case 'familyHistory':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/familymemberhistory-daf.html");
                        break;
                    case 'immunization':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/immunization-daf.html");
                        break;
                    case 'results':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/observation-daf-results.html");
                        break;
                    case 'medication':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/medication-daf.html");
                        break;
                    case 'condition':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/condition-daf.html");
                        break;
                    case 'medicationAdministration':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/medicationadministration-daf.html");
                        break;
                    case 'medicationStatement':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/medicationstatement-daf.html");
                        break;
                    case 'procedure':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/procedure-daf.html");
                        break;
                    case 'smokingStatus':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/observation-daf-smokingstatus.html");
                        break;
                    case 'vitalSigns':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/observation-daf-vitalsigns.html");
                        break;
                    case 'list':
                        vm.dafUrl = $sce.trustAsResourceUrl(scheme + "://hl7-fhir.github.io/list-daf.html");
                        break;
                    case 'organization':
                        vm.dafUrl = scheme + "://hl7-fhir.github.io/patient-daf-dafpatient.html";
                        break;
                    default:
                        vm.dafUrl = scheme + "://hl7-fhir.github.io/patient-daf-dafpatient.html";
                }
            });
        }

        vm.dafUrl = '';
        vm.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$routeParams', '$sce', 'common', 'fhirServers', dafController]);
})();(function () {
    'use strict';

    var controllerId = 'rawDataController';

    function rawData($scope, $mdDialog, common, data) {
        function closeDialog() {
            $mdDialog.hide();
        }

        function activate() {
            common.activateController(controllerId).then(function () {
            });
        }

        $scope.data = angular.toJson(data, true);
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$scope', '$mdDialog', 'common', 'data', rawData]);
})();(function () {
    'use strict';

    var controllerId = 'valueSetPopupController';

    function valueSetPopupController($scope, $mdDialog, common, config, data, fhirServers, valueSetService) {
        var logInfo = common.logger.getLogFn(controllerId, 'info');
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var noToast = false;

        function closeDialog() {
            $mdDialog.hide();
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    $scope.activeServer = server;
                    return $scope.activeServer;
                });
        }

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getValueSet($scope.data);
            });
        }

        function getValueSet(identifier) {
            valueSetService.getValueSets($scope.activeServer.baseUrl, undefined, identifier)
                .then(function (bundle) {
                    $scope.options = undefined;
                    $scope.valueSet = bundle.entry[0].resource;
                    if (angular.isDefined($scope.valueSet.define)) {
                        logInfo("Value set defines its own concepts", null, noToast);
                        $scope.system =  $scope.valueSet.define.system;
                        $scope.options = $scope.valueSet.define.concept;
                        $scope.valueSet.selectedCode = $scope.options[0];
                        selectionChanged();
                    }
                    else if (angular.isDefined($scope.valueSet.compose) && angular.isArray($scope.valueSet.compose.include)) {
                        logInfo("Value set includes concepts", null, noToast);
                        $scope.system = $scope.valueSet.compose.include[0].system;
                        $scope.options = $scope.valueSet.compose.include[0].concept;
                        $scope.valueSet.selectedCode = $scope.options[0];
                        selectionChanged();
                    }
                }, function (error) {
                    logError('Error returning value set', error);
                })
        }

        function expandValueSet(searchText) {
            var deferred = $q.defer();
            $scope.fetchingExpansion = true;
            valueSetService.getFilteredExpansion($scope.activeServer.baseUrl, $scope.valueSet.id, searchText)
                .then(function (data) {
                    $scope.fetchingExpansion = false;
                    deferred.resolve(data);
                }, function (error) {
                    $scope.fetchingExpansion = false;
                    logError(error, null, noToast);
                    deferred.reject();
                });
            return deferred.promise;
        }

        function selectionChanged() {
            if ($scope.valueSet.selectedCode.system === undefined) {
                $scope.valueSet.selectedCode.system = $scope.system;
            }
        }

        $scope.data = data;
        $scope.closeDialog = closeDialog;
        $scope.activate = activate;
        $scope.expandValueSet = expandValueSet;
        $scope.selectionChanged = selectionChanged;
        $scope.fetchingExpansion = false;
        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$scope', '$mdDialog', 'common', 'config', 'data', 'fhirServers', 'valueSetService', valueSetPopupController]);
})();(function () {
    'use strict';

    var controllerId = 'valueSetDetail';

    function valueSetDetail($location, $routeParams, $window, $mdDialog, common, fhirServers, valueSetService, contactPointService) {
        /* jshint validthis:true */
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logWarning = common.logger.getLogFn(controllerId, 'warning');

        function cancel() {

        }

        function canDelete() {
            return !vm.isEditing;
        }

        function canSave() {
            return !vm.isSaving;
        }

        function deleteValueSet(valueSet) {
            function executeDelete() {
                if (valueSet && valueSet.resourceId && valueSet.hashKey) {
                    valueSetService.deleteCachedValueSet(valueSet.hashKey, valueSet.resourceId)
                        .then(function () {
                            logSuccess("Deleted valueSet " + valueSet.name);
                            $location.path('/valueSets');
                        },
                        function (error) {
                            logError(common.unexpectedOutcome(error));
                        }
                    );
                }
            }
            var confirm = $mdDialog.confirm().title('Delete ' + valueSet.name + '?').ok('Yes').cancel('No');
            $mdDialog.show(confirm).then(executeDelete);

        }

        function edit(valueSet) {
            if (valueSet && valueSet.hashKey) {
                $location.path('/valueSet/edit/' + valueSet.hashKey);
            }
        }

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getRequestedValueSet() {
            function intitializeRelatedData(data) {
                var rawData = angular.copy(data.resource);
                vm.narrative = (rawData.text.div || '<div>Not provided</div>');
                vm.json = rawData;
                vm.json.text = { div: "see narrative tab"};
                vm.json = angular.toJson(rawData, true);
                vm.valueSet = rawData;
                contactPointService.init(vm.valueSet.telecom, false, false);
                vm.title = vm.valueSet.name;
            }

            if ($routeParams.hashKey === 'new') {
                var data = valueSetService.initializeNewValueSet();
                intitializeRelatedData(data);
                vm.title = 'Add New ValueSet';
                vm.isEditing = false;
            } else {
                if ($routeParams.hashKey) {
                    valueSetService.getCachedValueSet($routeParams.hashKey)
                        .then(intitializeRelatedData).then(function () {
                        }, function (error) {
                            logError(error);
                        });
                } else if ($routeParams.id) {
                    var resourceId = vm.activeServer.baseUrl + '/ValueSet/' + $routeParams.id;
                    valueSetService.getValueSet(resourceId)
                        .then(intitializeRelatedData, function (error) {
                            logError(error);
                        });
                }
            }
        }

        function getTitle() {
            var title = '';
            if (vm.valueSet) {
                title = vm.title = 'Edit ' + ((vm.valueSet && vm.valueSet.fullName) || '');
            } else {
                title = vm.title = 'Add New ValueSet';
            }
            vm.title = title;
            return vm.title;
        }

        function goBack() {
            $window.history.back();
        }

        function processResult(results) {
            var resourceVersionId = results.headers.location || results.headers["content-location"];
            if (angular.isUndefined(resourceVersionId)) {
                logWarning("ValueSet saved, but location is unavailable. CORS not implemented correctly at remote host.");
            } else {
                vm.valueSet.resourceId = common.setResourceId(vm.valueSet.resourceId, resourceVersionId);
                logSuccess("ValueSet saved at " + resourceVersionId);
            }
            // vm.valueSet.fullName = valueSet.name;
            vm.isEditing = true;
            getTitle();
        }

        function save() {
            if (vm.valueSet.name.length < 5) {
                logError("ValueSet Name must be at least 5 characters");
                return;
            }
            var valueSet = valueSetService.initializeNewValueSet().resource;
            valueSet.name = vm.valueSet.name;
            valueSet.type = vm.valueSet.type;
            valueSet.telecom = contactPointService.mapFromViewModel();
            valueSet.partOf = vm.valueSet.partOf;
            valueSet.active = vm.valueSet.active;
            if (vm.isEditing) {
                valueSetService.updateValueSet(vm.valueSet.resourceId, valueSet)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            } else {
                valueSetService.addValueSet(valueSet)
                    .then(processResult,
                    function (error) {
                        logError(common.unexpectedOutcome(error));
                    });
            }
        }

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canDelete', {
            get: canDelete
        });

        function activate() {
            common.activateController([getActiveServer()], controllerId).then(function () {
                getRequestedValueSet();
            });
        }

        vm.activeServer = null;
        vm.cancel = cancel;
        vm.activate = activate;
        vm.delete = deleteValueSet;
        vm.edit = edit;
        vm.goBack = goBack;
        vm.isSaving = false;
        vm.isEditing = true;
        vm.valueSet = undefined;
        vm.save = save;
        vm.states = undefined;
        vm.title = 'valueSetDetail';

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', '$routeParams', '$window', '$mdDialog', 'common', 'fhirServers', 'valueSetService', 'contactPointService', valueSetDetail]);

})();(function () {
    'use strict';

    var controllerId = 'valueSetSearch';

    function valueSetSearch($location, common, config, fhirServers, valueSetService) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId, 'info');
        var logError = getLogFn(controllerId, 'error');

        /* jshint validthis:true */
        var vm = this;

        function getActiveServer() {
            fhirServers.getActiveServer()
                .then(function (server) {
                    vm.activeServer = server;
                    return vm.activeServer;
                });
        }

        function getCachedSearchResults() {
            valueSetService.getCachedSearchResults()
                .then(processSearchResults);
        }

        function activate() {
            common.activateController([getActiveServer(), getCachedSearchResults()], controllerId)
                .then(function () {

                });
        }

        function goToDetail(hash) {
            if (hash) {
                $location.path('/valueSet/view/' + hash);
            }
        }

        function processSearchResults(searchResults) {
            if (searchResults) {
                vm.valueSets = (searchResults.entry || []);
                vm.paging.links = (searchResults.link || []);
                vm.paging.totalResults = (searchResults.total || 0);
            }
        }

        function submit(valid) {
            if (valid) {
                toggleSpinner(true);
                valueSetService.getValueSets(vm.activeServer.baseUrl, vm.searchText)
                    .then(function (data) {
                        logInfo('Returned ' + (angular.isArray(data.entry) ? data.entry.length : 0) + ' ValueSets from ' + vm.activeServer.name, false);
                        return data;
                    }, function (error) {
                        toggleSpinner(false);
                        logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                    })
                    .then(processSearchResults)
                    .then(function () {
                        toggleSpinner(false);
                    });
            }
        }

        function dereferenceLink(url) {
            toggleSpinner(true);
            valueSetService.getValueSetsByLink(url)
                .then(function (data) {
                    logInfo('Returned ' + (angular.isArray(data.valueSets) ? data.valueSets.length : 0) + ' ValueSets from ' + vm.activeServer.name, true);
                    return data;
                }, function (error) {
                    toggleSpinner(false);
                    logError((angular.isDefined(error.outcome) ? error.outcome.issue[0].details : error));
                })
                .then(processSearchResults)
                .then(function () {
                    toggleSpinner(false);
                });
        }

        function keyPress($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
        }

        function toggleSpinner(on) {
            vm.isBusy = on;
        }

        vm.activeServer = null;
        vm.isBusy = false;
        vm.valueSets = [];
        vm.errorOutcome = null;
        vm.paging = {
            currentPage: 1,
            totalResults: 0,
            links: null
        };
        vm.searchResults = null;
        vm.searchText = '';
        vm.title = 'ValueSets';
        vm.keyPress = keyPress;
        vm.dereferenceLink = dereferenceLink;
        vm.submit = submit;
        vm.goToDetail = goToDetail;

        activate();
    }

    angular.module('FHIRCloud').controller(controllerId,
        ['$location', 'common', 'config', 'fhirServers', 'valueSetService', valueSetSearch]);
})();
(function () {
    'use strict';

    var serviceId = 'valueSetService';

    function valueSetService(common, dataCache, fhirClient, fhirServers) {
        var dataCacheKey = 'localValueSets';
        var getLogFn = common.logger.getLogFn;
        var logWarning = getLogFn(serviceId, 'warning');
        var $q = common.$q;

        function addValueSet(resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirServers.getActiveServer()
                .then(function (server) {
                    var url = server.baseUrl + "/ValueSet";
                    fhirClient.addResource(url, resource)
                        .then(function (results) {
                            deferred.resolve(results);
                        }, function (outcome) {
                            deferred.reject(outcome);
                        });
                });
            return deferred.promise;
        }

        function clearCache() {
            dataCache.addToCache(dataCacheKey, null);
        }

        function deleteCachedValueSet(hashKey, resourceId) {
            function removeFromCache(searchResults) {
                var removed = false;
                var cachedValueSets = searchResults.entry;
                for (var i = 0, len = cachedValueSets.length; i < len; i++) {
                    if (cachedValueSets[i].$$hashKey === hashKey) {
                        cachedValueSets.splice(i, 1);
                        searchResults.entry = cachedValueSets;
                        searchResults.totalResults = (searchResults.totalResults - 1);
                        dataCache.addToCache(dataCacheKey, searchResults);
                        removed = true;
                        break;
                    }
                }
                if (removed) {
                    deferred.resolve();
                } else {
                    logWarning('ValueSet not found in cache: ' + hashKey);
                    deferred.resolve();
                }
            }

            var deferred = $q.defer();
            deleteValueSet(resourceId)
                .then(getCachedSearchResults,
                function (error) {
                    deferred.reject(error);
                })
                .then(removeFromCache)
                .then(function () {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        function deleteValueSet(resourceId) {
            var deferred = $q.defer();
            fhirClient.deleteResource(resourceId)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getCachedSearchResults() {
            var deferred = $q.defer();
            var cachedSearchResults = dataCache.readFromCache(dataCacheKey);
            if (cachedSearchResults) {
                deferred.resolve(cachedSearchResults);
            } else {
                deferred.reject('Search results not cached.');
            }
            return deferred.promise;
        }

        function getCachedValueSet(hashKey) {
            function getValueSet(searchResults) {
                var cachedValueSet;
                var cachedValueSets = searchResults.entry;
                cachedValueSet = _.find(cachedValueSets, {'$$hashKey': hashKey});
                if (cachedValueSet) {
                    deferred.resolve(cachedValueSet);
                } else {
                    deferred.reject('ValueSet not found in cache: ' + hashKey);
                }
            }

            var deferred = $q.defer();
            getCachedSearchResults()
                .then(getValueSet,
                function () {
                    deferred.reject('ValueSet search results not found in cache.');
                });
            return deferred.promise;
        }

        function getValueSet(resourceId) {
            var deferred = $q.defer();
            fhirClient.getResource(resourceId)
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: add support for summary when DSTU2 server implementers have support
        function getValueSetReference(baseUrl, input) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/ValueSet?name=' + input + '&_count=20')
                .then(function (results) {
                    var valueSets = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                valueSets.push({display: item.resource.name, reference: item.resource.id});
                            });
                    }
                    if (valueSets.length === 0) {
                        valueSets.push({display: "No matches", reference: ''});
                    }
                    deferred.resolve(valueSets);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        //TODO: waiting for server implementers to add support for _summary
        function getValueSets(baseUrl, nameFilter, identifier) {
            var deferred = $q.defer();
            var params = '';

            if (angular.isUndefined(nameFilter) && angular.isUndefined(identifier)) {
                deferred.reject('Invalid search input');
            }
            if (angular.isDefined(nameFilter) && nameFilter.length > 1) {
                params = 'name=' + nameFilter;
            }
            if (angular.isDefined(identifier)) {
                var identifierParam = 'identifier=' + identifier;
                if (params.length > 1) {
                    params = params + '&' + identifierParam;
                } else {
                    params = identifierParam;
                }
            }
            fhirClient.getResource(baseUrl + '/ValueSet?' + params + '&_count=20')
                .then(function (results) {
                    dataCache.addToCache(dataCacheKey, results.data);
                    deferred.resolve(results.data);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function getValueSetsByLink(url) {
            var deferred = $q.defer();
            fhirClient.getResource(url)
                .then(function (results) {
                    var searchResults = {"links": {}, "valueSets": []};
                    var valueSets = [];
                    if (results.data.entry) {
                        angular.forEach(results.data.entry,
                            function (item) {
                                if (item.content && item.content.resourceType === 'ValueSet') {
                                    valueSets.push({display: item.content.name, reference: item.id});
                                }
                            });

                    }
                    if (valueSets.length === 0) {
                        valueSets.push({display: "No matches", reference: ''});
                    }
                    searchResults.valueSets = valueSets;
                    if (results.data.link) {
                        searchResults.links = results.data.link;
                    }
                    searchResults.totalResults = results.data.totalResults ? results.data.totalResults : 0;
                    deferred.resolve(searchResults);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function initializeNewValueSet() {
            var data = {};
            data.resource = {
                "resourceType": "ValueSet",
                "active": true
            };
            return data;
        }

        // http://fhir-dev.healthintersections.com.au/open/ValueSet/$expand?identifier=http://hl7.org/fhir/vs/condition-code&filter=xxx
        function getFilteredExpansion(baseUrl, id, filter) {
            var deferred = $q.defer();
            fhirClient.getResource(baseUrl + '/ValueSet/' + id + '/$expand?filter=' + filter + '&_count=10')
                .then(function (results) {
                    if (results.data && results.data.expansion && angular.isArray(results.data.expansion.contains)) {
                        deferred.resolve(results.data.expansion.contains);
                    } else {
                        deferred.reject("Response did not include expected expansion");
                    }
                });
            return deferred.promise;
        }

        function updateValueSet(resourceVersionId, resource) {
            _prepArrays(resource)
                .then(function (resource) {
                    resource.type.coding = _prepCoding(resource.type.coding);
                });
            var deferred = $q.defer();
            fhirClient.updateResource(resourceVersionId, resource)
                .then(function (results) {
                    deferred.resolve(results);
                }, function (outcome) {
                    deferred.reject(outcome);
                });
            return deferred.promise;
        }

        function _prepArrays(resource) {
            return $q.when(resource);
        }

        function _prepCoding(coding) {
            var result = null;
            if (angular.isArray(coding) && angular.isDefined(coding[0])) {
                if (angular.isObject(coding[0])) {
                    result = coding;
                } else {
                    var parsedCoding = JSON.parse(coding[0]);
                    result = [];
                    result.push(parsedCoding ? parsedCoding : null);
                }
            }
            return result;
        }

        var service = {
            addValueSet: addValueSet,
            clearCache: clearCache,
            deleteCachedValueSet: deleteCachedValueSet,
            deleteValueSet: deleteValueSet,
            getFilteredExpansion: getFilteredExpansion,
            getCachedValueSet: getCachedValueSet,
            getCachedSearchResults: getCachedSearchResults,
            getValueSet: getValueSet,
            getValueSets: getValueSets,
            getValueSetsByLink: getValueSetsByLink,
            getValueSetReference: getValueSetReference,
            initializeNewValueSet: initializeNewValueSet,
            updateValueSet: updateValueSet
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, ['common', 'dataCache', 'fhirClient', 'fhirServers', valueSetService]);

})();