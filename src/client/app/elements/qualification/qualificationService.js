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

    var serviceId = 'qualificationService';

    angular.module('FHIRStarter').factory(serviceId, [qualificationService]);

    function qualificationService() {
        var qualifications = [];

        var service = {
            add: add,
            remove: remove,
            getAll: getAll,
            init: init,
            reset: reset
        }

        return service;

        function add(item) {
            var index = getIndex(item.$$hashKey);
            if (index > -1) {
                qualifications[index] = item;
            } else {
                qualifications.push(item);
            }
        }

        function getAll() {
            return _.compact(qualifications);
        }

        function getIndex(hashKey) {
            if (angular.isUndefined(hashKey) === false) {
                for (var i = 0, len = qualifications.length; i < len; i++) {
                    if (qualifications[i].$$hashKey === hashKey) {
                        return i;
                    }
                }
            }
            return -1;
        }

        function init(items) {
            if (angular.isArray(items)) {
                qualifications = items;
            } else if (angular.isObject(items)) {
                qualifications = [];
                qualifications.push(items);
            }
            else {
                qualifications = [];
            }
            return qualifications;
        }

        function remove(item) {
            var index = getIndex(item.$$hashKey);
            qualifications.splice(index, 1);
        }

        function reset() {
            while (qualifications.length > 0) {
                qualifications.pop();
            }
        }
    }
})();