(function () {
    'use strict';

    var serviceId = 'patientValueSets';

    function patientValueSets() {

        function race() {
            return {
                system: "http://hl7.org/fhir/v3/Race",
                concept: [
                    {
                        code: "1002-5",
                        display: "American Indian or Alaska Native"
                    },
                    {
                        code: "2028-9",
                        display: "Asian"
                    },
                    {
                        code: "2054-5",
                        display: "Black or African American"
                    },
                    {
                        code: "2076-8",
                        display: "Native Hawaiian or Other Pacific Islander"
                    },
                    {
                        code: "2106-3",
                        display: "White"
                    }
                ]
            }
        }

        function ethnicity() {
            return [
                {
                    system: "http://hl7.org/fhir/v3/Ethnicity",
                    code: "2135-2",
                    display: "Hispanic or Latino"
                },
                {
                    system: "http://hl7.org/fhir/v3/Ethnicity",
                    code: "2186-5",
                    display: "Not Hispanic or Latino"
                },
                {
                    system: "http://hl7.org/fhir/v3/NullFlavor",
                    code: "UNK",
                    display: "Unknown"
                },
                {
                    system: "http://hl7.org/fhir/v3/NullFlavor",
                    code: "ASKU",
                    display: "Asked but no answer"
                }
            ]
        }

        function religion() {
            return {
                system: "http://hl7.org/fhir/v3/ReligiousAffiliation",
                caseSensitive: true,
                concept: [
                    {
                        code: "1001",
                        abstract: false,
                        display: "Adventist",
                        definition: "Adventist"
                    },
                    {
                        code: "1002",
                        abstract: false,
                        display: "African Religions",
                        definition: "African Religions"
                    },
                    {
                        code: "1003",
                        abstract: false,
                        display: "Afro-Caribbean Religions",
                        definition: "Afro-Caribbean Religions"
                    },
                    {
                        code: "1004",
                        abstract: false,
                        display: "Agnosticism",
                        definition: "Agnosticism"
                    },
                    {
                        code: "1005",
                        abstract: false,
                        display: "Anglican",
                        definition: "Anglican"
                    },
                    {
                        code: "1006",
                        abstract: false,
                        display: "Animism",
                        definition: "Animism"
                    },
                    {
                        code: "1007",
                        abstract: false,
                        display: "Atheism",
                        definition: "Atheism"
                    },
                    {
                        code: "1008",
                        abstract: false,
                        display: "Babi & Baha'I faiths",
                        definition: "Babi & Baha'I faiths"
                    },
                    {
                        code: "1009",
                        abstract: false,
                        display: "Baptist",
                        definition: "Baptist"
                    },
                    {
                        code: "1010",
                        abstract: false,
                        display: "Bon",
                        definition: "Bon"
                    },
                    {
                        code: "1011",
                        abstract: false,
                        display: "Cao Dai",
                        definition: "Cao Dai"
                    },
                    {
                        code: "1012",
                        abstract: false,
                        display: "Celticism",
                        definition: "Celticism"
                    },
                    {
                        code: "1013",
                        abstract: false,
                        display: "Christian (non-Catholic, non-specific)",
                        definition: "Christian (non-Catholic, non-specific)"
                    },
                    {
                        code: "1014",
                        abstract: false,
                        display: "Confucianism",
                        definition: "Confucianism"
                    },
                    {
                        code: "1015",
                        abstract: false,
                        display: "Cyberculture Religions",
                        definition: "Cyberculture Religions"
                    },
                    {
                        code: "1016",
                        abstract: false,
                        display: "Divination",
                        definition: "Divination"
                    },
                    {
                        code: "1017",
                        abstract: false,
                        display: "Fourth Way",
                        definition: "Fourth Way"
                    },
                    {
                        code: "1018",
                        abstract: false,
                        display: "Free Daism",
                        definition: "Free Daism"
                    },
                    {
                        code: "1019",
                        abstract: false,
                        display: "Gnosis",
                        definition: "Gnosis"
                    },
                    {
                        code: "1020",
                        abstract: false,
                        display: "Hinduism",
                        definition: "Hinduism"
                    },
                    {
                        code: "1021",
                        abstract: false,
                        display: "Humanism",
                        definition: "Humanism"
                    },
                    {
                        code: "1022",
                        abstract: false,
                        display: "Independent",
                        definition: "Independent"
                    },
                    {
                        code: "1023",
                        abstract: false,
                        display: "Islam",
                        definition: "Islam"
                    },
                    {
                        code: "1024",
                        abstract: false,
                        display: "Jainism",
                        definition: "Jainism"
                    },
                    {
                        code: "1025",
                        abstract: false,
                        display: "Jehovah's Witnesses",
                        definition: "Jehovah's Witnesses"
                    },
                    {
                        code: "1026",
                        abstract: false,
                        display: "Judaism",
                        definition: "Judaism"
                    },
                    {
                        code: "1027",
                        abstract: false,
                        display: "Latter Day Saints",
                        definition: "Latter Day Saints"
                    },
                    {
                        code: "1028",
                        abstract: false,
                        display: "Lutheran",
                        definition: "Lutheran"
                    },
                    {
                        code: "1029",
                        abstract: false,
                        display: "Mahayana",
                        definition: "Mahayana"
                    },
                    {
                        code: "1030",
                        abstract: false,
                        display: "Meditation",
                        definition: "Meditation"
                    },
                    {
                        code: "1031",
                        abstract: false,
                        display: "Messianic Judaism",
                        definition: "Messianic Judaism"
                    },
                    {
                        code: "1032",
                        abstract: false,
                        display: "Mitraism",
                        definition: "Mitraism"
                    },
                    {
                        code: "1033",
                        abstract: false,
                        display: "New Age",
                        definition: "New Age"
                    },
                    {
                        code: "1034",
                        abstract: false,
                        display: "non-Roman Catholic",
                        definition: "non-Roman Catholic"
                    },
                    {
                        code: "1035",
                        abstract: false,
                        display: "Occult",
                        definition: "Occult"
                    },
                    {
                        code: "1036",
                        abstract: false,
                        display: "Orthodox",
                        definition: "Orthodox"
                    },
                    {
                        code: "1037",
                        abstract: false,
                        display: "Paganism",
                        definition: "Paganism"
                    },
                    {
                        code: "1038",
                        abstract: false,
                        display: "Pentecostal",
                        definition: "Pentecostal"
                    },
                    {
                        code: "1039",
                        abstract: false,
                        display: "Process, The",
                        definition: "Process, The"
                    },
                    {
                        code: "1040",
                        abstract: false,
                        display: "Reformed/Presbyterian",
                        definition: "Reformed/Presbyterian"
                    },
                    {
                        code: "1041",
                        abstract: false,
                        display: "Roman Catholic Church",
                        definition: "Roman Catholic Church"
                    },
                    {
                        code: "1042",
                        abstract: false,
                        display: "Satanism",
                        definition: "Satanism"
                    },
                    {
                        code: "1043",
                        abstract: false,
                        display: "Scientology",
                        definition: "Scientology"
                    },
                    {
                        code: "1044",
                        abstract: false,
                        display: "Shamanism",
                        definition: "Shamanism"
                    },
                    {
                        code: "1045",
                        abstract: false,
                        display: "Shiite (Islam)",
                        definition: "Shiite (Islam)"
                    },
                    {
                        code: "1046",
                        abstract: false,
                        display: "Shinto",
                        definition: "Shinto"
                    },
                    {
                        code: "1047",
                        abstract: false,
                        display: "Sikism",
                        definition: "Sikism"
                    },
                    {
                        code: "1048",
                        abstract: false,
                        display: "Spiritualism",
                        definition: "Spiritualism"
                    },
                    {
                        code: "1049",
                        abstract: false,
                        display: "Sunni (Islam)",
                        definition: "Sunni (Islam)"
                    },
                    {
                        code: "1050",
                        abstract: false,
                        display: "Taoism",
                        definition: "Taoism"
                    },
                    {
                        code: "1051",
                        abstract: false,
                        display: "Theravada",
                        definition: "Theravada"
                    },
                    {
                        code: "1052",
                        abstract: false,
                        display: "Unitarian-Universalism",
                        definition: "Unitarian-Universalism"
                    },
                    {
                        code: "1053",
                        abstract: false,
                        display: "Universal Life Church",
                        definition: "Universal Life Church"
                    },
                    {
                        code: "1054",
                        abstract: false,
                        display: "Vajrayana (Tibetan)",
                        definition: "Vajrayana (Tibetan)"
                    },
                    {
                        code: "1055",
                        abstract: false,
                        display: "Veda",
                        definition: "Veda"
                    },
                    {
                        code: "1056",
                        abstract: false,
                        display: "Voodoo",
                        definition: "Voodoo"
                    },
                    {
                        code: "1057",
                        abstract: false,
                        display: "Wicca",
                        definition: "Wicca"
                    },
                    {
                        code: "1058",
                        abstract: false,
                        display: "Yaohushua",
                        definition: "Yaohushua"
                    },
                    {
                        code: "1059",
                        abstract: false,
                        display: "Zen Buddhism",
                        definition: "Zen Buddhism"
                    },
                    {
                        code: "1060",
                        abstract: false,
                        display: "Zoroastrianism",
                        definition: "Zoroastrianism"
                    },
                    {
                        code: "1061",
                        abstract: false,
                        display: "Assembly of God",
                        definition: "Assembly of God"
                    },
                    {
                        code: "1062",
                        abstract: false,
                        display: "Brethren",
                        definition: "Brethren"
                    },
                    {
                        code: "1063",
                        abstract: false,
                        display: "Christian Scientist",
                        definition: "Christian Scientist"
                    },
                    {
                        code: "1064",
                        abstract: false,
                        display: "Church of Christ",
                        definition: "Church of Christ"
                    },
                    {
                        code: "1065",
                        abstract: false,
                        display: "Church of God",
                        definition: "Church of God"
                    },
                    {
                        code: "1066",
                        abstract: false,
                        display: "Congregational",
                        definition: "Congregational"
                    },
                    {
                        code: "1067",
                        abstract: false,
                        display: "Disciples of Christ",
                        definition: "Disciples of Christ"
                    },
                    {
                        code: "1068",
                        abstract: false,
                        display: "Eastern Orthodox",
                        definition: "Eastern Orthodox"
                    },
                    {
                        code: "1069",
                        abstract: false,
                        display: "Episcopalian",
                        definition: "Episcopalian"
                    },
                    {
                        code: "1070",
                        abstract: false,
                        display: "Evangelical Covenant",
                        definition: "Evangelical Covenant"
                    },
                    {
                        code: "1071",
                        abstract: false,
                        display: "Friends",
                        definition: "Friends"
                    },
                    {
                        code: "1072",
                        abstract: false,
                        display: "Full Gospel",
                        definition: "Full Gospel"
                    },
                    {
                        code: "1073",
                        abstract: false,
                        display: "Methodist",
                        definition: "Methodist"
                    },
                    {
                        code: "1074",
                        abstract: false,
                        display: "Native American",
                        definition: "Native American"
                    },
                    {
                        code: "1075",
                        abstract: false,
                        display: "Nazarene",
                        definition: "Nazarene"
                    },
                    {
                        code: "1076",
                        abstract: false,
                        display: "Presbyterian",
                        definition: "Presbyterian"
                    },
                    {
                        code: "1077",
                        abstract: false,
                        display: "Protestant",
                        definition: "Protestant"
                    },
                    {
                        code: "1078",
                        abstract: false,
                        display: "Protestant, No Denomination",
                        definition: "Protestant, No Denomination"
                    },
                    {
                        code: "1079",
                        abstract: false,
                        display: "Reformed",
                        definition: "Reformed"
                    },
                    {
                        code: "1080",
                        abstract: false,
                        display: "Salvation Army",
                        definition: "Salvation Army"
                    },
                    {
                        code: "1081",
                        abstract: false,
                        display: "Unitarian Universalist",
                        definition: "Unitarian Universalist"
                    },
                    {
                        code: "1082",
                        abstract: false,
                        display: "United Church of Christ",
                        definition: "United Church of Christ"
                    }
                ]
            }
        }

        function maritalStatus() {
            return [
                {code: "UNK", display: "Unknown", system: "http://hl7.org/fhir/v3/NullFlavor"},
                {code: "A", display: "Annulled", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "D", display: "Divorced", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "I", display: "Interlocutory", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "L", display: "Legally Seperated", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "M", display: "Married", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "P", display: "Polygamous", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "S", display: "Never Married", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "T", display: "Domestic Partner", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "U", display: "Unmarried", system: "http://hl7.org/fhir/v3/MaritalStatus"},
                {code: "W", display: "Widowed", system: "http://hl7.org/fhir/v3/MaritalStatus"}
            ];
        }

        function contactRelationship() {
            return {
                system: "http://hl7.org/fhir/patient-contact-relationship",
                caseSensitive: true,
                concept: [
                    {
                        code: "emergency",
                        display: "Emergency",
                        definition: "Contact for use in case of emergency"
                    },
                    {
                        code: "family",
                        display: "Family"
                    },
                    {
                        code: "guardian",
                        display: "Guardian"
                    },
                    {
                        code: "friend",
                        display: "Friend"
                    },
                    {
                        code: "partner",
                        display: "Partner"
                    },
                    {
                        code: "work",
                        display: "Work",
                        definition: "Contact for matters related to the patients occupation/employment"
                    },
                    {
                        code: "caregiver",
                        display: "Caregiver",
                        definition: "(Non)professional caregiver"
                    },
                    {
                        code: "agent",
                        display: "Agent",
                        definition: "Contact that acts on behalf of the patient"
                    },
                    {
                        code: "guarantor",
                        display: "Guarantor",
                        definition: "Contact for financial matters"
                    },
                    {
                        code: "parent",
                        display: "Parent",
                        definition: "Parent of the patient"
                    }
                ]
            };
        }

        var service = {
            contactRelationship: contactRelationship,
            ethnicity: ethnicity,
            maritalStatus: maritalStatus,
            race: race,
            religion: religion
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [patientValueSets]);

})();
