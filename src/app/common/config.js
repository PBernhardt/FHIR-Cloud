(function () {
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
        patientListChanged: 'patientList.changed',
        practitionerListChanged: 'practitionerList.changed',
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
        }).when('/diagnosticOrder', {
            templateUrl: 'diagnosticOrder/diagnosticOrder-search.html'
        }).when('/diagnosticOrder/get/:id', {
            templateUrl: 'diagnosticOrder/diagnosticOrder-view.html'
        }).when('/diagnosticOrder/view/:hashKey', {
            templateUrl: 'diagnosticOrder/diagnosticOrder-view.html'
        }).when('/diagnosticOrder/edit/:hashKey', {
            templateUrl: 'diagnosticOrder/diagnosticOrder-edit.html'
        }).when('/diagnosticOrder/detailed-search', {
            templateUrl: 'diagnosticOrder/diagnosticOrder-detailed-search.html'
        }).when('/encounter/org/:orgId', {
            templateUrl: 'encounter/encounter-detailed-search.html'
        }).when('/encounter', {
            templateUrl: 'encounter/encounter-search.html'
        }).when('/encounter/get/:id', {
            templateUrl: 'encounter/encounter-view.html'
        }).when('/encounter/view/:hashKey', {
            templateUrl: 'encounter/encounter-view.html'
        }).when('/encounter/edit/:hashKey', {
            templateUrl: 'encounter/encounter-edit.html'
        }).when('/encounter/detailed-search', {
            templateUrl: 'encounter/encounter-detailed-search.html'
        }).when('/extensionDefinition', {
            templateUrl: 'extensionDefinition/extensionDefinition-search.html'
        }).when('/extensionDefinition/view/:hashKey', {
            templateUrl: 'extensionDefinition/extensionDefinition-view.html'
        }).when('/extensionDefinition/edit/:hashKey', {
            templateUrl: 'extensionDefinition/extensionDefinition-edit.html'
        }).when('/familyHistory', {
            templateUrl: 'familyHistory/familyHistory-search.html'
        }).when('/familyHistory/get/:id', {
            templateUrl: 'familyHistory/familyHistory-view.html'
        }).when('/familyHistory/view/:hashKey', {
            templateUrl: 'familyHistory/familyHistory-view.html'
        }).when('/familyHistory/edit/:hashKey', {
            templateUrl: 'familyHistory/familyHistory-edit.html'
        }).when('/familyHistory/detailed-search', {
            templateUrl: 'familyHistory/familyHistory-detailed-search.html'
        }).when('/home', {
            templateUrl: 'home/home.html'
        }).when('/immunization', {
            templateUrl: 'immunization/immunization-search.html'
        }).when('/immunization/get/:id', {
            templateUrl: 'immunization/immunization-view.html'
        }).when('/immunization/view/:hashKey', {
            templateUrl: 'immunization/immunization-view.html'
        }).when('/immunization/edit/:hashKey', {
            templateUrl: 'immunization/immunization-edit.html'
        }).when('/immunization/detailed-search', {
            templateUrl: 'immunization/immunization-detailed-search.html'
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
        }).when('/practitioner/org/:orgId', {
            templateUrl: 'practitioner/practitioner-detailed-search.html'
        }).when('/practitioner', {
            templateUrl: 'practitioner/practitioner-search.html'
        }).when('/practitioner/get/:id', {
            templateUrl: 'practitioner/practitioner-view.html'
        }).when('/practitioner/view/:hashKey', {
            templateUrl: 'practitioner/practitioner-view.html'
        }).when('/practitioner/edit/:hashKey', {
            templateUrl: 'practitioner/practitioner-edit.html'
        }).when('/practitioner/detailed-search', {
            templateUrl: 'practitioner/practitioner-detailed-search.html'
        }).when('/person/org/:orgId', {
            templateUrl: 'person/person-detailed-search.html'
        }).when('/person', {
            templateUrl: 'person/person-search.html'
        }).when('/person/get/:id', {
            templateUrl: 'person/person-view.html'
        }).when('/person/view/:hashKey', {
            templateUrl: 'person/person-view.html'
        }).when('/person/edit/:hashKey', {
            templateUrl: 'person/person-edit.html'
        }).when('/person/detailed-search', {
            templateUrl: 'person/person-detailed-search.html'
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
        }).when('/relatedPerson/get/:id', {
            templateUrl: 'relatedPerson/relatedPerson-view.html'
        }).when('/relatedPerson/view/:hashKey', {
            templateUrl: 'relatedPerson/relatedPerson-view.html'
        }).when('/relatedPerson/edit/:hashKey', {
            templateUrl: 'relatedPerson/relatedPerson-edit.html'
        }).when('/relatedPerson/detailed-search', {
            templateUrl: 'relatedPerson/relatedPerson-detailed-search.html'
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
            .icon("address", "./assets/svg/place.svg", 24)
            .icon("add", "./assets/svg/add.svg", 24)
            .icon("authority", "./assets/svg/authority.svg", 24)
            .icon("cardio", "./assets/svg/cardio3.svg", 24)
            .icon("cloud", "./assets/svg/cloud.svg", 24)
            .icon("contact", "./assets/svg/contact.svg", 24)
            .icon("contacts", "./assets/svg/contacts.svg", 24)
            .icon("delete", "./assets/svg/delete.svg", 24)
            .icon("diagnosis", "./assets/svg/stethoscope.svg", 24)
            .icon("domain", "./assets/svg/domain.svg", 24)
            .icon("edit", "./assets/svg/edit.svg", 24)
            .icon("email", "./assets/svg/email.svg", 16)
            .icon("encounter", "./assets/svg/man412.svg", 24)
            .icon("error", "./assets/svg/error.svg", 48)
            .icon("family", "./assets/svg/group41.svg", 24)
            .icon("fax", "./assets/svg/fax.svg", 16)
            .icon("female", "./assets/svg/female.svg", 24)
            .icon("fire", "./assets/svg/fire.svg", 24)
            .icon("group", "./assets/svg/group.svg", 24)
            .icon("groupAdd", "./assets/svg/groupAdd.svg", 24)
            .icon("healing", "./assets/svg/healing.svg", 24)
            .icon("hospital", "./assets/svg/hospital.svg", 24)
            .icon("https", "./assets/svg/https.svg", 24)
            .icon("hospital", "./assets/svg/hospital.svg", 24)
            .icon("identifier", "./assets/svg/identifier.svg", 24)
            .icon("immunization", "./assets/svg/immunize2.svg", 24)
            .icon("lab", "./assets/svg/lab3.svg", 24)
            .icon("language", "./assets/svg/language.svg", 24)
            .icon("link", "./assets/svg/link.svg", 24)
            .icon("list", "./assets/svg/list.svg", 24)
            .icon("listAdd", "./assets/svg/listAdd.svg",24)
            .icon("male", "./assets/svg/male.svg", 24)
            .icon("medication", "./assets/svg/medical12.svg", 24)
            .icon("menu", "./assets/svg/menu.svg", 24)
            .icon("more", "./assets/svg/more.svg", 24)
            .icon("openId", "./assets/svg/openId.svg", 24)
            .icon("order", "./assets/svg/flask.svg", 24)
            .icon("organization", "./assets/svg/hospital.svg", 24)
            .icon("people", "./assets/svg/people.svg", 24)
            .icon("peopleOutline", "./assets/svg/peopleOutline.svg", 24)
            .icon("person", "./assets/svg/person.svg", 24)
            .icon("personAdd", "./assets/svg/personAdd.svg", 24)
            .icon("personOutline", "./assets/svg/personOutline.svg", 24)
            .icon("phone", "./assets/svg/phone.svg", 16)
            .icon("place", "./assets/svg/place.svg", 24)
            .icon("doctor", "./assets/svg/md.svg", 24)
            .icon("quickFind", "./assets/svg/quickFind.svg", 24)
            .icon("refresh", "./assets/svg/refresh.svg", 24)
            .icon("relatedPerson", "./assets/svg/group.svg", 24)
            .icon("rx", "./assets/svg/rx.svg", 24)
            .icon("saveToCloud", "./assets/svg/saveToCloud.svg", 24)
            .icon("saveToList", "./assets/svg/saveToList.svg", 24)
            .icon("search", "./assets/svg/search.svg", 24)
            .icon("security", "./assets/svg/security.svg", 24)
            .icon("settings", "./assets/svg/settings.svg", 24)
            .icon("smart", "./assets/svg/SMART.svg", 24)
            .icon("telecom", "./assets/svg/telecom.svg", 24)
            .icon("view", "./assets/svg/visibility.svg", 12)
            .icon("vitals", "./assets/svg/pulse1.svg", 24)
            .icon("web", "./assets/svg/www.svg", 16);
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
        cfg.config.patientListChangeEvent = config.events.patientListChanged;
        cfg.config.practitionerListChangeEvent = config.events.practitionerListChanged;
    }]);

    app.config(['$compileProvider', function ($compileProvider) {
        //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
        //  chrome-extension: will be added to the end of the expression
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    }]);
})();