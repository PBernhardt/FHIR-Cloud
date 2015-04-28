(function () {
    'use strict';

    var serviceId = 'encounterValueSets';

    function encounterValueSets() {

        function encounterAdmitSource() {
            return {
                "system": "http://hl7.org/fhir/admit-source",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "hosp-trans",
                        "display": "Transferred from other hospital"
                    },
                    {
                        "code": "emd",
                        "display": "From accident/emergency department"
                    },
                    {
                        "code": "outp",
                        "display": "From outpatient department"
                    },
                    {
                        "code": "born",
                        "display": "Born in hospital"
                    },
                    {
                        "code": "gp",
                        "display": "General Practitioner referral"
                    },
                    {
                        "code": "mp",
                        "display": "Medical Practitioner/physician referral"
                    },
                    {
                        "code": "nursing",
                        "display": "From nursing home"
                    },
                    {
                        "code": "psych",
                        "display": "From psychiatric hospital"
                    },
                    {
                        "code": "rehab",
                        "display": "From rehabilitation facility"
                    },
                    {
                        "code": "other",
                        "display": "Other"
                    }
                ]
            };
        }

        function encounterClass() {
            return {
                "system": "http://hl7.org/fhir/encounter-class",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "inpatient",
                        "display": "Inpatient",
                        "definition": "An encounter during which the patient is hospitalized and stays overnight."
                    },
                    {
                        "code": "outpatient",
                        "display": "Outpatient",
                        "definition": "An encounter during which the patient is not hospitalized overnight."
                    },
                    {
                        "code": "ambulatory",
                        "display": "Ambulatory",
                        "definition": "An encounter where the patient visits the practitioner in his/her office, e.g. a G.P. visit."
                    },
                    {
                        "code": "emergency",
                        "display": "Emergency",
                        "definition": "An encounter where the patient needs urgent care."
                    },
                    {
                        "code": "home",
                        "display": "Home",
                        "definition": "An encounter where the practitioner visits the patient at his/her home."
                    },
                    {
                        "code": "field",
                        "display": "Field",
                        "definition": "An encounter taking place outside the regular environment for giving care."
                    },
                    {
                        "code": "daytime",
                        "display": "Daytime",
                        "definition": "An encounter where the patient needs more prolonged treatment or investigations than outpatients, but who do not need to stay in the hospital overnight."
                    },
                    {
                        "code": "virtual",
                        "display": "Virtual",
                        "definition": "An encounter that takes place where the patient and practitioner do not physically meet but use electronic means for contact."
                    },
                    {
                        "code": "other",
                        "display": "Other",
                        "definition": "Any other encounter type that is not described by one of the other values. Where this is used it is expected that an implementer will include an extension value to define what the actual other type is."
                    }
                ]
            };
        }

        function encounterDietPreference() {
            return {
                "system": "http://hl7.org/fhir/diet",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "vegetarian",
                        "definition": "Food without meat, poultry or seafood"
                    },
                    {
                        "code": "dairy-free",
                        "definition": "Exludes dairy products"
                    },
                    {
                        "code": "nut-free",
                        "definition": "Excludes ingredients containing nuts"
                    },
                    {
                        "code": "gluten-free",
                        "definition": "Excludes ingredients containing gluten"
                    },
                    {
                        "code": "vegan",
                        "definition": "Food without meat, poultry, seafood, eggs, dairy products and other animal-derived substances"
                    },
                    {
                        "code": "halal",
                        "definition": "Foods that conform to Islamic law"
                    },
                    {
                        "code": "kosher",
                        "definition": "foods that conform to Jewish dietary law"
                    }
                ]
            };
        }

        function encounterLocationStatus() {
            return {
                "system": "http://hl7.org/fhir/encounter-location-status",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "planned",
                        "display": "Planned",
                        "definition": "The patient is planned to be moved to this location at some point in the future."
                    },
                    {
                        "code": "present",
                        "display": "Present",
                        "definition": "The patient is currently at this location, or was between the period specified."
                    },
                    {
                        "code": "reserved",
                        "display": "Reserved",
                        "definition": "This location is held empty for this patient."
                    }
                ]
            };
        }

        function encounterParticipantType() {
            return [
                {
                    "code": "translator",
                    "display": "Translator",
                    "system": "http://hl7.org/fhir/participant-type",
                    "definition": "A translator who is facilitating communication with the patient during the encounter"
                },
                {
                    "code": "emergency",
                    "display": "Emergency contact",
                    "system": "http://hl7.org/fhir/participant-type",
                    "definition": "A person to be contacted in case of an emergency during the encounter"
                },
                {
                    "code": "ADM",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Admitter",
                    "definition": "The practitioner who is responsible for admitting a patient to a patient encounter."
                },
                {
                    "code": "ATND",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Attender",
                    "definition": "The practitioner that has responsibility for overseeing a patient's care during a patient encounter."
                },
                {
                    "code": "CALLBCK",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Callback contact",
                    "definition": "A person or organization who should be contacted for follow-up questions about the act in place of the author."
                },
                {
                    "code": "CON",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Consultant",
                    "definition": "An advisor participating in the service by performing evaluations and making recommendations."
                },
                {
                    "code": "DIS",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Discharger",
                    "definition": "The practitioner who is responsible for the discharge of a patient from a patient encounter."
                },
                {
                    "code": "ESC",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Escort",
                    "definition": "Only with Transportation services.  A person who escorts the patient."
                },
                {
                    "code": "REF",
                    "system": "http://hl7.org/fhir/v3/ParticipationType",
                    "display": "Referrer",
                    "definition": "A person having referred the subject of the service to the performer (referring physician).  Typically, a referring physician will receive a report."
                }
            ];
        }

        function encounterPriority() {
            return {
                "system": "http://hl7.org/fhir/encounter-priority",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "imm",
                        "display": "Immediate",
                        "definition": "Within seconds"
                    },
                    {
                        "code": "emg",
                        "display": "Emergency",
                        "definition": "Within 10 minutes"
                    },
                    {
                        "code": "urg",
                        "display": "Urgent",
                        "definition": "Within 30 minutes"
                    },
                    {
                        "code": "s-urg",
                        "display": "Semi-urgent",
                        "definition": "Within 60 minutes"
                    },
                    {
                        "code": "no-urg",
                        "display": "Non-urgent",
                        "definition": "Within 120 minutes"
                    }
                ]
            };
        }

        function encounterSpecialArrangement() {
            return {
                "system": "http://hl7.org/fhir/encounter-special-arrangements",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "wheel",
                        "display": "Wheelchair"
                    },
                    {
                        "code": "stret",
                        "display": "Stretcher"
                    },
                    {
                        "code": "int",
                        "display": "Interpreter"
                    },
                    {
                        "code": "att",
                        "display": "Attendant"
                    },
                    {
                        "code": "dog",
                        "display": "Guide dog"
                    }
                ]
            };
        }

        function encounterSpecialCourtesy() {
            return {
                "system": "http://hl7.org/fhir/v3/EncounterSpecialCourtesy",
                "concept": [
                    {
                        "code": "EXT",
                        "display": "Extended courtesy"
                    },
                    {
                        "code": "NRM",
                        "display": "Normal courtesy"
                    },
                    {
                        "code": "PRF",
                        "display": "Professional courtesy"
                    },
                    {
                        "code": "STF",
                        "display": "Staff of the entity providing service"
                    },
                    {
                        "code": "VIP",
                        "display": "Very important person"
                    }
                ]
            }
        }

        function encounterState() {
            return {
                "system": "http://hl7.org/fhir/encounter-state",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "planned",
                        "display": "Planned",
                        "definition": "The Encounter has not yet started."
                    },
                    {
                        "code": "arrived",
                        "display": "Arrived",
                        "definition": "The Patient is present for the encounter, however is not currently meeting with a practitioner."
                    },
                    {
                        "code": "in-progress",
                        "display": "In Progress",
                        "definition": "The Encounter has begun and the patient is present / the practitioner and the patient are meeting."
                    },
                    {
                        "code": "onleave",
                        "display": "On Leave",
                        "definition": "The Encounter has begun, but the patient is temporarily on leave."
                    },
                    {
                        "code": "finished",
                        "display": "Finished",
                        "definition": "The Encounter has ended."
                    },
                    {
                        "code": "cancelled",
                        "display": "Cancelled",
                        "definition": "The Encounter has ended before it has begun."
                    }
                ]
            };
        }

        function encounterType() {
            return {
                "system": "http://hl7.org/fhir/encounter-type",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "ADMS",
                        "display": "Annual diabetes mellitus screening"
                    },
                    {
                        "code": "BD/BM-clin",
                        "display": "Bone drilling/bone marrow punction in clinic"
                    },
                    {
                        "code": "CCS60",
                        "display": "Infant colon screening - 60 minutes"
                    },
                    {
                        "code": "OKI",
                        "display": "Outpatient Kenacort injection"
                    }
                ]
            };
        }

        var service = {
            encounterAdmitSource: encounterAdmitSource,
            encounterClass: encounterClass,
            encounterDietPreference: encounterDietPreference,
            encounterLocationStatus: encounterLocationStatus,
            encounterParticipantType: encounterParticipantType,
            encounterPriority: encounterPriority,
            encounterSpecialArrangement: encounterSpecialArrangement,
            encounterSpecialCourtesy: encounterSpecialCourtesy,
            encounterState: encounterState,
            encounterType: encounterType
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [encounterValueSets]);

})();
