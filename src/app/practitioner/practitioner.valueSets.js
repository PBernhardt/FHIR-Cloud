(function () {
    'use strict';

    var serviceId = 'practitionerValueSets';

    function practitionerValueSets() {

        function practitionerRole() {
            return {
                system: "http://hl7.org/fhir/practitioner-role",
                caseSensitive: true,
                concept: [
                    {
                        code: "doctor",
                        display: "Doctor"
                    },
                    {
                        code: "nurse",
                        display: "Nurse"
                    },
                    {
                        code: "pharmacist",
                        display: "Pharmacist"
                    },
                    {
                        code: "researcher",
                        display: "Researcher"
                    },
                    {
                        code: "teacher",
                        display: "Teacher/educator"
                    },
                    {
                        code: "ict",
                        display: "ICT professional"
                    }
                ]
            };
        }

        function practitionerSpeciality() {
            return {
                system: "http://snomed.info/sct",
                caseSensitive: true,
                concept: [
                    {code: "394592004", display: "Clinical oncology"},
                    {code: "394581000", display: "Community medicine"},
                    {
                        code: "394814009", display: "General practice",
                        concept: [
                            {code: "408444009", display: "General dental practice"},
                            {code: "408443003", display: "General medical practice"}]
                    },
                    {code: "408446006", display: "Gynecological oncology"},
                    {
                        code: "394733009", display: "Medical Specialty",
                        concept: [
                            {code: "394578005", display: "Audiological medicine"},
                            {code: "394579002", display: "Cardiology"},
                            {code: "394804000", display: "Clinical cytogenetics and molecular genetics"},
                            {code: "394580004", display: "Clinical genetics "},
                            {code: "394803006", display: "Clinical hematology "},
                            {code: "408480009", display: "Clinical immunology"},
                            {code: "394805004", display: "Clinical immunology/allergy"},
                            {code: "394600006", display: "Clinical pharmacology"},
                            {code: "394601005", display: "Clinical physiology"},
                            {code: "408478003", display: "Critical care medicine"},
                            {code: "394812008", display: "Dental medicine specialties"},
                            {code: "394582007", display: "Dermatology"},
                            {code: "410005002", display: "Dive medicine"},
                            {code: "394583002", display: "Endocrinology"},
                            {code: "419772000", display: "Family practice"},
                            {code: "394584008", display: "Gastroenterology"},
                            {code: "394802001", display: "General medicine"},
                            {code: "394808002", display: "Genito-urinary medicine "},
                            {code: "394811001", display: "Geriatric medicine"},
                            {code: "394807007", display: "Infectious diseases"},
                            {code: "419192003", display: "Internal medicine "},
                            {code: "394593009", display: "Medical oncology"},
                            {code: "394813003", display: "Medical ophthalmology"},
                            {code: "410001006", display: "Military medicine"},
                            {code: "394589003", display: "Nephrology"},
                            {code: "394591006", display: "Neurology"},
                            {code: "394649004", display: "Nuclear medicine"},
                            {code: "416304004", display: "Osteopathic manipulative medicine"},
                            {
                                code: "394537008", display: "Pediatric specialty",
                                concept: [
                                    {code: "408445005", display: "Neonatology"},
                                    {code: "408459003", display: "Pediatric cardiology"},
                                    {code: "419917007", display: "Pediatric emergency medicine"},
                                    {code: "419610006", display: "Pediatric endocrinology"},
                                    {code: "418058008", display: "Pediatric gastroenterology"},
                                    {code: "420208008", display: "Pediatric genetics "},
                                    {code: "418652005", display: "Pediatric hematology"},
                                    {code: "418535003", display: "Pediatric immunology"},
                                    {code: "418862001", display: "Pediatric infectious diseases"},
                                    {code: "419215006", display: "Pediatric intensive care"},
                                    {code: "419365004", display: "Pediatric nephrology"},
                                    {code: "394538003", display: "Pediatric neurology"},
                                    {code: "418002000", display: "Pediatric oncology"},
                                    {code: "419983000", display: "Pediatric ophthalmology"},
                                    {code: "417887005", display: "Pediatric otolaryngology"},
                                    {code: "419170002", display: "Pediatric pulmonology"},
                                    {code: "419472004", display: "Pediatric rheumatology"}]
                            },
                            {code: "409968004", display: "Preventive medicine"},
                            {code: "408440000", display: "Public health medicine"},
                            {code: "418112009", display: "Pulmonary medicine"},
                            {code: "394602003", display: "Rehabilitation"},
                            {code: "408447002", display: "Respite care"},
                            {code: "394810000", display: "Rheumatology"},
                            {code: "408450004", display: "Sleep studies"},
                            {code: "394590007", display: "Thoracic medicine"},
                            {code: "409967009", display: "Toxicology"}]
                    },
                    {
                        code: "394585009", display: "Obstetrics and gynecology",
                        concept: [
                            {code: "394586005", display: "Gynecology"},
                            {code: "408470005", display: "Obstetrics"}]
                    },
                    {code: "394821009", display: "Occupational medicine"},
                    {
                        code: "418960008", display: "Otolaryngology",
                        concept: [
                            {code: "417887005", display: "Pediatric otolaryngology"}]
                    },
                    {
                        code: "394595002", display: "Pathology",
                        concept: [
                            {code: "421661004", display: "Blood banking and transfusion medicine"},
                            {code: "394819004", display: "Blood transfusion"},
                            {code: "394596001", display: "Chemical pathology"},
                            {code: "394915009", display: "General pathology"},
                            {code: "394916005", display: "Hematopathology"},
                            {code: "394597005", display: "Histopathology"},
                            {code: "394598000", display: "Immunopathology"},
                            {code: "394820005", display: "Medical microbiology"},
                            {code: "394599008", display: "Neuropathology"}]
                    },
                    {
                        code: "394587001", display: "Psychiatry",
                        concept: [
                            {code: "408467006", display: "Adult mental illness"},
                            {code: "394588006", display: "Child and adolescent psychiatry "},
                            {code: "394817002", display: "Forensic psychiatry"},
                            {code: "408468001", display: "Learning disability "},
                            {code: "394815005", display: "Mental handicap"},
                            {code: "394816006", display: "Mental illness"},
                            {code: "394818007", display: "Old age psychiatry"},
                            {code: "394913002", display: "Psychotherapy"}]
                    },
                    {code: "394806003", display: "Palliative medicine"},
                    {
                        code: "394732004", display: "Surgical Specialty",
                        concept: [
                            {code: "394576009", display: "Accident & emergency"},
                            {code: "394577000", display: "Anesthetics"},
                            {code: "408469009", display: "Breast surgery"},
                            {
                                code: "394603008", display: "Cardiothoracic surgery", concept: [
                                {code: "408466002", display: "Cardiac surgery"},
                                {code: "408471009", display: "Cardiothoracic transplantation"},
                                {code: "408456005", display: "Thoracic surgery"}]
                            },
                            {code: "408464004", display: "Colorectal surgery"},
                            {code: "418018006", display: "Dermatologic surgery "},
                            {code: "394604002", display: "Ear, nose and throat surgery"},
                            {code: "408441001", display: "Endodontics surgery"},
                            {code: "394609007", display: "General surgery"},
                            {code: "408474001", display: "Hepatobiliary and pancreatic surgery"},
                            {code: "394610002", display: "Neurosurgery"},
                            {
                                code: "394594003", display: "Ophthalmology surgery", concept: [
                                {code: "422191005", display: "Ophthalmic surgery"},
                                {code: "419983000", display: "Pediatric ophthalmology"}
                            ]
                            },
                            {
                                code: "408465003", display: "Oral and maxillofacial surgery", concept: [
                                {code: "408457001", display: "Maxillofacial surgery"},
                                {code: "408473007", display: "Public health dentistry"},
                                {code: "408449004", display: "Surgical dentistry"}
                            ]
                            },
                            {code: "394605001", display: "Oral surgery"},
                            {code: "394608004", display: "Orthodontics"},
                            {code: "394882004", display: "Pain management"},
                            {code: "394607009", display: "Pediatric dentistry"},
                            {code: "394539006", display: "Pediatric surgery"},
                            {code: "408461007", display: "Periodontics"},
                            {
                                code: "394611003",
                                display: "Plastic surgery",
                                concept: [{code: "408462000", display: "Burns care"}]
                            },
                            {code: "408460008", display: "Prosthodontics"},
                            {code: "394606000", display: "Restorative dentistry"},
                            {code: "419321007", display: "Surgical oncology"},
                            {code: "408477008", display: "Transplantation surgery"},
                            {code: "394801008", display: "Trauma and orthopedics"},
                            {code: "408479006", display: "Upper gastrointestinal surgery"},
                            {
                                code: "394612005", display: "Urology", concept: [
                                {code: "419043006", display: "Urological oncology"}]
                            },
                            {code: "408463005", display: "Vascular surgery"}]
                    },
                    {
                        code: "394734003", display: "Radiological specialties", concept: [
                        {code: "408455009", display: "Interventional radiology"},
                        {code: "419815003", display: "Radiation oncology"},
                        {code: "394914008", display: "Radiology"}
                    ]
                    }
                ]
            };
        }

        var service = {
            practitionerRole: practitionerRole,
            practitionerSpecialty: practitionerSpeciality
        };

        return service;
    }

    angular.module('FHIRCloud').factory(serviceId, [practitionerValueSets]);

})();
