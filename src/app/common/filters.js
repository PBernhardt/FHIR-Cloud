(function () {
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

    app.filter('displayAge', function () {
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
                    var months = Math.floor(ageDifMs / 2628000000);
                    retValue = "age " + months + ' months';

                    if (months < 6) {
                        var weeks = Math.floor(ageDifMs / 604800000);
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
                return '';
            }
        };
    });

    app.filter('extensionValue', ['$filter', function ($filter) {
        return function (extension) {
            if (angular.isDefined(extension.valueString)) {
                return extension.valueString;
            } else if (angular.isDefined(extension.valueAddress)) {
                return ($filter)('singleLineAddress')(extension.valueAddress);
            } else if (angular.isDefined(extension.valueCodeableConcept)) {
                return ($filter)('codeableConcept')(extension.valueCodeableConcept);
            }
            else {
                return extension;
            }
        };
    }]);

    app.filter('smartUrl', ['$sce', function ($sce) {
        return function (appUrl, fhirServer, patientId) {
            var launchUrl = appUrl + '?fhirServiceUrl=' + fhirServer + '&patient=' + patientId;
            return $sce.trustAsResourceUrl(launchUrl);
        }
    }]);

    app.filter('dateString', function () {
        return function (dateTime) {
            if (angular.isDefined(dateTime)) {
                return moment(dateTime).format('YYYY-MM-DD');
            }
        }
    });

    app.filter('displayPeriod', ['$filter', function ($filter) {
        return function (period) {
            if (angular.isDefined(period)) {
                var result = "{0} to {1}";
                var start = " -- ";
                var end = " -- ";
                if (angular.isDefined(period.start)) {
                    start = $filter('date')(period.start, 'mediumDate');
                }
                if (angular.isDefined(period.end)) {
                    end = $filter('date')(period.end, 'mediumDate');
                }
                result = result.replace("{0}", start);
                result = result.replace("{1}", end);
                return result;
            } else {
                return "period unspecified";
            }
        }
    }]);

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
                return buildName(humanName[0].given) + ' ' + buildName(humanName[0].family).replace(",", " ");
            } else if (humanName && humanName.given) {
                return buildName(humanName.given) + ' ' + buildName(humanName.family).replace(",", " ");
            } else {
                return 'Name Unknown';
            }
        };
    });

    app.filter('idFromURL', function () {
        return function (uri) {
            if (uri.length > 5) {
                var historyPosition = uri.indexOf('/_history');
                if (historyPosition > -1) {
                    uri = uri.substring(0, historyPosition);
                }
                var pathArray = uri.split('/');
                return pathArray[pathArray.length - 1];
            }
        }
    });

    app.filter('listItems', function () {
        return function (array) {
            if (angular.isUndefined(array) || angular.isArray(array) === false) {
                return array;
            } else {
                var retVal = '';
                _.each(array, function (item) {
                    if (retVal.length === 0) {
                        retVal = item;
                    } else {
                        retVal = retVal + ", " + item;
                    }
                });
                return retVal;
            }
        }
    })

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
            if (address && address.text && address.text.length > 10) {
                return address.text;
            } else if (address) {
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
})();