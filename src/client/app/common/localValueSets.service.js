(function () {
    'use strict';

    var serviceId = 'localValueSets';

    function localValueSets() {

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
            questionnaireAnswerStatus: questionnaireAnswerStatus
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [localValueSets]);

})();
