(function () {
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

    angular.module('FHIRStarter').factory(serviceId, ['common', 'fileReader', attachmentService]);
})();