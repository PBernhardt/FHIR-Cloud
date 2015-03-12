(function () {
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
                {"code": "mi", "display": "Māori", "system": "urn:std:iso:639-1"},
                {"code": "mr", "display": "Marathi (Marāṭhī)", "system": "urn:std:iso:639-1"},
                {"code": "mh", "display": "Marshallese", "system": "urn:std:iso:639-1"},
                {"code": "mn", "display": "Mongolian", "system": "urn:std:iso:639-1"},
                {"code": "na", "display": "Nauru", "system": "urn:std:iso:639-1"},
                {"code": "nv", "display": "Navajo, Navaho", "system": "urn:std:iso:639-1"},
                {"code": "nb", "display": "Norwegian Bokmål", "system": "urn:std:iso:639-1"},
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
                {"code": "pi", "display": "Pāli", "system": "urn:std:iso:639-1"},
                {"code": "fa", "display": "Persian", "system": "urn:std:iso:639-1"},
                {"code": "pl", "display": "Polish", "system": "urn:std:iso:639-1"},
                {"code": "ps", "display": "Pashto, Pushto", "system": "urn:std:iso:639-1"},
                {"code": "pt", "display": "Portuguese", "system": "urn:std:iso:639-1"},
                {"code": "qu", "display": "Quechua", "system": "urn:std:iso:639-1"},
                {"code": "rm", "display": "Romansh", "system": "urn:std:iso:639-1"},
                {"code": "rn", "display": "Kirundi", "system": "urn:std:iso:639-1"},
                {"code": "ro", "display": "Romanian, Moldavian, Moldovan", "system": "urn:std:iso:639-1"},
                {"code": "ru", "display": "Russian", "system": "urn:std:iso:639-1"},
                {"code": "sa", "display": "Sanskrit (Saṁskṛta)", "system": "urn:std:iso:639-1"},
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
                {"code": "vo", "display": "Volapük", "system": "urn:std:iso:639-1"},
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
            ethnicity: ethnicity,
            race: race
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [localValueSets]);

})();
