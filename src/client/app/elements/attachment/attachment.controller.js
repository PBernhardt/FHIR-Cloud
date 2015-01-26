(function () {
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
    angular.module('FHIRStarter').controller(controllerId, ['$scope', 'common', 'attachmentService', attachment]);

})();
