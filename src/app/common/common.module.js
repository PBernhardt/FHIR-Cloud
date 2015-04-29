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
                $window.localStorage.removeItem("patient");
                $window.localStorage.removeItem("organization");
                var currentLocation = $location.path();
                if ((currentLocation !== '/patient') && (currentLocation !== '/organization')) {
                    $location.path('/home');
                }
                $broadcast(commonConfig.config.serverChangeEvent, server);
            }
        }

        function changePatientList(patients) {
            if (angular.isDefined(patients)) {
                $broadcast(commonConfig.config.patientListChangeEvent, patients);
            }
        }

        function changePersonList(persons) {
            if (angular.isDefined(persons)) {
                $broadcast(commonConfig.config.personListChangeEvent, persons);
            }
        }

        function changePractitionerList(practitioners) {
            if (angular.isDefined(practitioners)) {
                $broadcast(commonConfig.config.practitionerListChangeEvent, practitioners);
            }
        }

        function changeRelatedPersonList(relatedPerson) {
            if (angular.isDefined(relatedPerson)) {
                $broadcast(commonConfig.config.relatedPersonListChangeEvent, relatedPerson);
            }
        }

        function changeUser(user) {
            if (angular.isDefined(user)) {
                $broadcast(commonConfig.config.authenticatedUserChangeEvent, user);
            }
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

        function makeAddress(singleLineAddress) {
            if (singleLineAddress.length === 0) return null;
            var address = {};
            address.line = [];
            if (singleLineAddress.text) {
                var parts = singleLineAddress.text.split(", ");
                address.line.push(parts[0]);
                address.city = parts[1];
                var stateAndZip = parts[2].split(" ");
                address.state = stateAndZip[0];
                address.postalCode = stateAndZip[1];
                address.country = parts[3];
            }
            return address;
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
            changePatientList: changePatientList,
            changePersonList: changePersonList,
            changePractitionerList: changePractitionerList,
            changeRelatedPersonList: changeRelatedPersonList,
            changeServer: changeServer,
            changeUser: changeUser,
            generateUUID: generateUUID,
            isAbsoluteUri: isAbsoluteUri,
            isNumber: isNumber,
            logger: logger, // for accessibility
            makeAddress: makeAddress,
            makeHumanName: makeHumanName,
            mapDisplayToCoding: mapDisplayToCoding,
            randomHash: randomHash,
            removeNullProperties: removeNullProperties,
            setResourceId: setResourceId,
            shuffle: shuffle,
            textContains: textContains,
            unexpectedOutcome: unexpectedOutcome
        };

        return service;
    }

    commonModule.factory('common',
        ['$http', '$location', '$q', '$rootScope', '$timeout', '$window', 'commonConfig', 'logger', common]);
})();