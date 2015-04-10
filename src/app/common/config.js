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

    var fhirTypes = {
        Primitive: 1,
        Complex: 2,
        Resource: 3
    };

    var fhirPrimitiveTypes = {
        base64Binary: "base64Binary",
        boolean: "boolean",
        code: "code",
        date: "date",
        dateTime: "dateTime",
        decimal: "decimal",
        id: "id",
        instant: "instant",
        integer: "integer",
        oid: "oid",
        string: "string",
        time: "time",
        uri: "uri",
        uuid: "uuid"
    };

    var fhirResources = {
        AdverseReaction: "AdverseReaction",
        Alert: "Alert",
        AllergyIntolerance: "AllergyIntolerance",
        Appointment: "Appointment",
        AppointmentResponse: "AppointmentResponse",
        Availability: "Availability",
        Binary: "Binary",
        CarePlan: "CarePlan",
        Composition: "Composition",
        ConceptMap: "ConceptMap",
        Condition: "Condition",
        Contraindication: "Contraindication",
        Conformance: "Conformance",
        DataElement: "DataElement",
        Device: "Device",
        DeviceObservationReport: "DeviceObservationReport",
        DiagnosticOrder: "DiagnosticOrder",
        DiagnosticReport: "DiagnosticReport",
        DocumentReference: "DocumentReference",
        DocumentManifest: "DocumentManifest",
        Encounter: "Encounter",
        FamilyHistory: "FamilyHistory",
        Group: "Group",
        ImagingStudy: "ImagingStudy",
        Immunization: "Immunization",
        ImmunizationRecommendation: "ImmunizationRecommendation",
        List: "List",
        Location: "Location",
        Media: "Media",
        Medication: "Medication",
        MedicationAdministration: "MedicationAdministration",
        MedicationDispense: "MedicationDispense",
        MedicationPrescription: "MedicationPrescription",
        MedicationStatement: "MedicationStatement",
        MessageHeader: "MessageHeader",
        Namespace: "Namespace",
        Observation: "Observation",
        OperationOutcome: "OperationOutcome",
        Order: "Order",
        OrderResponse: "OrderResponse",
        Organization: "Organization",
        Other: "Other",
        Patient: "Patient",
        Practitioner: "Practitioner",
        Procedure: "Procedure",
        Profile: "Profile",
        Provenance: "Provenance",
        Query: "Query",
        Questionnaire: "Questionnaire",
        QuestionnaireAnswers: "QuestionnaireAnswers",
        ReferralRequest: "ReferralRequest",
        RelatedPerson: "RelatedPerson",
        RiskAssessment: "RiskAssessment",
        SecurityEvent: "SecurityEvent",
        Slot: "Slot",
        Specimen: "Specimen",
        Subscription: "Subscription",
        Substance: "Substance",
        Supply: "Supply",
        ValueSet: "ValueSet"
    };

    var fhirComplexTypes = {
        Address: "Address",
        Age: "Age",
        Attachment: "Attachment",
        CodeableConcept: "CodeableConcept",
        Coding: "Coding",
        Contact: "Contact",
        Count: "Count",
        Distance: "Distance",
        Duration: "Duration",
        HumanName: "HumanName",
        Identifier: "Identifier",
        Money: "Money",
        Period: "Period",
        Quantity: "Quantity",
        Range: "Range",
        Ratio: "Ratio",
        SampledData: "SampledData",
        Schedule: "Schedule"
    };

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        progressToggle: 'progress.toggle'
    };

    var config = {
        appErrorPrefix: '[FS Error] ', //Configure the exceptionHandler decorator
        docTitle: 'FHIRCloud: ',
        events: events,
        fhirPrimitiveTypes: fhirPrimitiveTypes,
        fhirResources: fhirResources,
        fhirComplexTypes: fhirComplexTypes,
        fhirTypes: fhirTypes,
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
        }).when('/operationDefinition', {
            templateUrl: 'operationDefinition/operationDefinition-search.html'
        }).when('/operationDefinition/view/:hashKey', {
            templateUrl: 'operationDefinition/operationDefinition-view.html'
        }).when('/operationDefinition/edit/:hashKey', {
            templateUrl: 'operationDefinition/operationDefinition-edit.html'
        }).when('/organization', {
            templateUrl: 'organization/organization-search.html'
        }).when('/organization/detailed-search', {
            templateUrl: 'organization/organization-detailed-search.html'
        }).when('/organization/view/:hashKey', {
            templateUrl: 'organization/organization-view.html'
        }).when('/organization/edit/:hashKey', {
            templateUrl: 'organization/organization-edit.html'
        }).when('/organization/get/:resourceId', {
            templateUrl: 'organization/organization-view.html'
        }).when('/patients/:orgId', {
            templateUrl: 'patient/patient-search.html'
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
            .icon("cardio", "./assets/svg/cardio2.svg", 24)
            .icon("cloud", "./assets/svg/cloud.svg", 24)
            .icon("delete", "./assets/svg/delete.svg", 24)
            .icon("edit", "./assets/svg/edit.svg", 24)
            .icon("error", "./assets/svb/error.svg", 48)
            .icon("fire", "./assets/svg/fire.svg", 24)
            .icon("group", "./assets/svg/group.svg", 24)
            .icon("hospital", "./assets/svg/hospital.svg", 24)
            .icon("list", "./assets/svg/list.svg", 24)
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
            .icon("view", "./assets/svg/visibility.svg", 12);
    }]);

    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common = {'Accept': 'application/json+fhir, application/json, text/plain, */*'};
        $httpProvider.defaults.headers.put = {'Content-Type': 'application/json+fhir'};
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/json+fhir'};
    }]);

    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.progressToggleEvent = config.events.progressToggle;
    }]);

    app.config(['$compileProvider', function ($compileProvider) {
        //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
        //  chrome-extension: will be added to the end of the expression
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    }]);
})();