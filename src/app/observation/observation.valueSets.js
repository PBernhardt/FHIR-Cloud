(function () {
    'use strict';

    var serviceId = 'observationValueSets';

    function observationValueSets() {

        function bpInterpretation() {
            return {
                "system": "http://hl7.org/fhir/v2/0078",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "<",
                        "display": "Below absolute low-off instrument scale"
                    },
                    {
                        "code": ">",
                        "display": "Above absolute high-off instrument scale"
                    },
                    {
                        "code": "A",
                        "display": "Abnormal (applies to non-numeric results)"
                    },
                    {
                        "code": "AA",
                        "display": "Very abnormal (applies to non-numeric units, analogous to panic limits for numeric units)"
                    },
                    {
                        "code": "B",
                        "display": "Better-use when direction not relevant"
                    },
                    {
                        "code": "D",
                        "display": "Significant change down"
                    },
                    {
                        "code": "H",
                        "display": "Above high normal"
                    },
                    {
                        "code": "HH",
                        "display": "Above upper panic limits"
                    },
                    {
                        "code": "L",
                        "display": "Below low normal"
                    },
                    {
                        "code": "LL",
                        "display": "Below lower panic limits"
                    },
                    {
                        "code": "N",
                        "display": "Normal"
                    },
                    {
                        "code": "NEG",
                        "display": "Negative"
                    },
                    {
                        "code": "POS",
                        "display": "Positive"
                    },
                    {
                        "code": "U",
                        "display": "Significant change up"
                    },
                    {
                        "code": "null",
                        "display": "No range defined, or normal ranges don't apply"
                    }
                ]
            }
        }

        function interpretation()  {
            return {
                "system": "http://hl7.org/fhir/v2/0078",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "<",
                        "display": "Below absolute low-off instrument scale"
                    },
                    {
                        "code": ">",
                        "display": "Above absolute high-off instrument scale"
                    },
                    {
                        "code": "A",
                        "display": "Abnormal (applies to non-numeric results)"
                    },
                    {
                        "code": "AA",
                        "display": "Very abnormal (applies to non-numeric units, analogous to panic limits for numeric units)"
                    },
                    {
                        "code": "AC",
                        "display": "Anti-complementary substances present"
                    },
                    {
                        "code": "B",
                        "display": "Better-use when direction not relevant"
                    },
                    {
                        "code": "D",
                        "display": "Significant change down"
                    },
                    {
                        "code": "DET",
                        "display": "Detected"
                    },
                    {
                        "code": "H",
                        "display": "Above high normal"
                    },
                    {
                        "code": "HH",
                        "display": "Above upper panic limits"
                    },
                    {
                        "code": "I",
                        "display": "Intermediate. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "IND",
                        "display": "Indeterminate"
                    },
                    {
                        "code": "L",
                        "display": "Below low normal"
                    },
                    {
                        "code": "LL",
                        "display": "Below lower panic limits"
                    },
                    {
                        "code": "MS",
                        "display": "Moderately susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "N",
                        "display": "Normal (applies to non-numeric results)"
                    },
                    {
                        "code": "ND",
                        "display": "Not Detected"
                    },
                    {
                        "code": "NEG",
                        "display": "Negative"
                    },
                    {
                        "code": "NR",
                        "display": "Non-reactive"
                    },
                    {
                        "code": "POS",
                        "display": "Positive"
                    },
                    {
                        "code": "QCF",
                        "display": "Quality Control Failure"
                    },
                    {
                        "code": "R",
                        "display": "Resistant. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "RR",
                        "display": "Reactive"
                    },
                    {
                        "code": "S",
                        "display": "Susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "TOX",
                        "display": "Cytotoxic substance present"
                    },
                    {
                        "code": "U",
                        "display": "Significant change up"
                    },
                    {
                        "code": "VS",
                        "display": "Very susceptible. Indicates for microbiology susceptibilities only."
                    },
                    {
                        "code": "W",
                        "display": "Worse-use when direction not relevant"
                    },
                    {
                        "code": "WR",
                        "display": "Weakly reactive"
                    },
                    {
                        "code": "null",
                        "display": "No range defined, or normal ranges don't apply"
                    }
                ]
            }
        }

        function reliability() {
            return {
                "system": "http://hl7.org/fhir/observation-reliability",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "ok",
                        "display": "Ok",
                        "definition": "The result has no reliability concerns."
                    },
                    {
                        "code": "ongoing",
                        "display": "Ongoing",
                        "definition": "An early estimate of value; measurement is still occurring."
                    },
                    {
                        "code": "early",
                        "display": "Early",
                        "definition": "An early estimate of value; processing is still occurring."
                    },
                    {
                        "code": "questionable",
                        "display": "Questionable",
                        "definition": "The observation value should be treated with care."
                    },
                    {
                        "code": "calibrating",
                        "display": "Calibrating",
                        "definition": "The result has been generated while calibration is occurring."
                    },
                    {
                        "code": "error",
                        "display": "Error",
                        "definition": "The observation could not be completed because of an error."
                    },
                    {
                        "code": "unknown",
                        "display": "Unknown",
                        "definition": "No observation  reliability value was available."
                    }
                ]
            }
        }

        function smokingStatus() {
            return {
                "system": "http://snomed.info/sct",
                "concept": [
                    {"code": "449868002", "display": "Smokes tobacco daily"},
                    {"code": "428041000124106", "display": "Occasional tobacco smoker"},
                    {"code": "8517006", "display": "Ex-smoker"},
                    {"code": "266919005", "display": "Never smoked tobacco"},
                    {"code": "77176002", "display": "Smoker, current status unknown"},
                    {"code": "266927001", "display": "Unknown if ever smoked"},
                    {"code": "428071000124103", "display": "Heavy tobacco smoker"},
                    {"code": "428061000124105", "display": "Light tobacco smoker"}
                ]
            }
        }

        function status() {
            return {
                "system": "http://hl7.org/fhir/observation-status",
                "caseSensitive": true,
                "concept": [
                    {
                        "code": "registered",
                        "display": "Registered",
                        "definition": "The existence of the observation is registered, but there is no result yet available."
                    },
                    {
                        "code": "preliminary",
                        "display": "Preliminary",
                        "definition": "This is an initial or interim observation: data may be incomplete or unverified."
                    },
                    {
                        "code": "final",
                        "display": "Final",
                        "definition": "The observation is complete and verified by an authorized person."
                    },
                    {
                        "code": "amended",
                        "display": "Amended",
                        "definition": "The observation has been modified subsequent to being Final, and is complete and verified by an authorized person."
                    },
                    {
                        "code": "cancelled",
                        "display": "Cancelled",
                        "definition": "The observation is unavailable because the measurement was not started or not completed (also sometimes called \"aborted\")."
                    },
                    {
                        "code": "entered-in-error",
                        "display": "Entered In Error",
                        "definition": "The observation has been withdrawn following previous Final release."
                    },
                    {
                        "code": "unknown",
                        "display": "Unknown",
                        "definition": "The observation status is unknown.  Note that \"unknown\" is a value of last resort and every attempt should be made to provide a meaningful value other than \"unknown\"."
                    }
                ]
            }
        }

        /*
         Vital Signs
         Include these codes as defined in http://loinc.org
         Code	Display
         9279-1	Respiratory rate
         8867-4	Heart rate
         2710-2	Oxygen saturation in Capillary blood by Oximetry
     x    55284-4	Blood pressure systolic and diastolic
     x    8480-6	Systolic blood pressure
     x    8462-4	Diastolic blood pressure
         8310-5	Body temperature
         8302-2	Body height
         8306-3	Body height --lying
         8287-5	Head Occipital-frontal circumference by Tape measure
         3141-9	Body weight Measured
         39156-5	Body mass index (BMI) [Ratio]
         3140-1	Body surface area Derived from formula
         */

        var service = {
            bpInterpretation: bpInterpretation,
            interpretation: interpretation,
            reliability: reliability,
            smokingStatus: smokingStatus,
            status: status
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [observationValueSets]);

})();
