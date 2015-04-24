module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        shell: {
            options: {
                stdout: true
            },
            selenium: {
                command: './selenium/start',
                options: {
                    stdout: false,
                    async: true
                }
            },
            protractor_install: {
                command: 'node ./node_modules/protractor/bin/webdriver-manager update'
            },
            npm_install: {
                command: 'npm install'
            }
        },

        connect: {
            options: {
                base: 'app/'
            },
            webserver: {
                options: {
                    port: 8888,
                    keepalive: true
                }
            },
            devserver: {
                options: {
                    port: 8888
                }
            },
            testserver: {
                options: {
                    port: 9999
                }
            },
            coverage: {
                options: {
                    base: 'coverage/',
                    port: 5555,
                    keepalive: true
                }
            }
        },

        protractor: {
            options: {
                keepAlive: true,
                configFile: "./test/protractor.conf.js"
            },
            singlerun: {},
            auto: {
                keepAlive: true,
                options: {
                    args: {
                        seleniumPort: 4444
                    }
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'app/scripts/{,*/}*.js'
            ]
        },

        uglify: {
            ugly: {
                files: {
                    './app/assets/app.min.js': ['./app/assets/app.js']
                }
            },
            beautiful: {
                options: {
                    beautify: true
                },
                files: {
                    './app/assets/app.min.js': ['./app/assets/app.js']
                }
            }

        },

        concat: {
            styles: {
                dest: './app/assets/app.css',
                src: [
                    'app/styles/app.css',
                    //place your Stylesheet files here
                ]
            },
            scripts: {
                options: {
                    separator: ''
                },
                dest: './app/assets/app.js',

                src: [
                    'app/app.module.js',
                    'app/common/common.module.js',
                    'app/common/config.js',
                    'app/common/dataCache.service.js',
                    'app/common/directives.js',
                    'app/common/fhirClient.service.js',
                    'app/common/fhirServer.service.js',
                    'app/common/fileReader.service.js',
                    'app/common/filters.js',
                    'app/common/localValueSets.service.js',
                    'app/common/logger.service.js',
                    'app/common/main.controller.js',
                    'app/common/progress.service.js',
                    'app/common/session.service.js',
                    'app/conformance/conformance.detail.controller.js',
                    'app/conformance/conformance.search.controller.js',
                    'app/conformance/conformance.service.js',
                    'app/diagnosticOrder/diagnosticOrder.detail.controller.js',
                    'app/diagnosticOrder/diagnosticOrder.search.controller.js',
                    'app/diagnosticOrder/diagnosticOrder.service.js',
                    'app/elements/attachment/attachment.service.js',
                    'app/elements/attachment/attachment.controller.js',
                    'app/elements/address/address.controller.js',
                    'app/elements/address/address.service.js',
                    'app/elements/careProvider/careProvider.controller.js',
                    'app/elements/careProvider/careProvider.service.js',
                    'app/elements/communication/communication.controller.js',
                    'app/elements/communication/communication.service.js',
                    'app/elements/contact/contact.controller.js',
                    'app/elements/contact/contact.service.js',
                    'app/elements/contactPoint/contactPoint.controller.js',
                    'app/elements/contactPoint/contactPoint.service.js',
                    'app/elements/demographics/demographics.controller.js',
                    'app/elements/demographics/demographics.service.js',
                    'app/elements/humanName/humanName.controller.js',
                    'app/elements/humanName/humanName.service.js',
                    'app/elements/identifier/identifier.controller.js',
                    'app/elements/identifier/identifier.service.js',
                    'app/elements/organizationReference/organization.reference.controller.js',
                    'app/elements/organizationReference/organization.reference.service.js',
                    'app/elements/practitionerReference/practitioner.reference.controller.js',
                    'app/elements/practitionerReference/practitioner.reference.service.js',
                    'app/encounter/encounter.detail.controller.js',
                    'app/encounter/encounter.search.controller.js',
                    'app/encounter/encounter.service.js',
                    'app/extensionDefinition/extensionDefinition.detail.controller.js',
                    'app/extensionDefinition/extensionDefinition.search.controller.js',
                    'app/extensionDefinition/extensionDefinition.service.js',
                    'app/familyHistory/familyHistory.detail.controller.js',
                    'app/familyHistory/familyHistory.search.controller.js',
                    'app/familyHistory/familyHistory.service.js',
                    'app/immunization/immunization.detail.controller.js',
                    'app/immunization/immunization.search.controller.js',
                    'app/immunization/immunization.service.js',
                    'app/consultation/consultation.detail.controller.js',
                    'app/observation/observation.service.js',
                    'app/lab/lab.detail.controller.js',
                    'app/observation/observation.valueSets.js',
                    'app/operationDefinition/operationDefinition.detail.controller.js',
                    'app/operationDefinition/operationDefinition.search.controller.js',
                    'app/operationDefinition/operationDefinition.service.js',
                    'app/organization/organization.detail.controller.js',
                    'app/organization/organization.search.controller.js',
                    'app/organization/organization.service.js',
                    'app/patient/patient.detail.controller.js',
                    'app/patient/patient.directives.js',
                    'app/patient/patient.search.controller.js',
                    'app/patient/patient.service.js',
                    'app/person/person.detail.controller.js',
                    'app/person/person.search.controller.js',
                    'app/person/person.service.js',
                    'app/practitioner/practitioner.search.controller.js',
                    'app/practitioner/practitioner.service.js',
                    'app/profile/profile.detail.controller.js',
                    'app/profile/profile.search.controller.js',
                    'app/profile/profile.service.js',
                    'app/relatedPerson/relatedPerson.detail.controller.js',
                    'app/relatedPerson/relatedPerson.search.controller.js',
                    'app/relatedPerson/relatedPerson.service.js',
                    'app/templates/bottomSheet.controller.js',
                    'app/templates/daf.controller.js',
                    'app/templates/rawData.controller.js',
                    'app/templates/valueSet-popup.controller.js',
                    'app/valueSet/valueSet.detail.controller.js',
                    'app/valueSet/valueSet.search.controller.js',
                    'app/valueSet/valueSet.service.js'
                    //place your JavaScript files here
                ]
            }
        },

        watch: {
            options: {
                livereload: 7777
            },
            assets: {
                files: ['app/styles/**/*.css', 'app/scripts/**/*.js'],
                tasks: ['concat']
            },
            protractor: {
                files: ['app/scripts/**/*.js', 'test/e2e/**/*.js'],
                tasks: ['protractor:auto']
            }
        },

        open: {
            devserver: {
                path: 'http://localhost:8888'
            },
            coverage: {
                path: 'http://localhost:5555'
            }
        },

        karma: {
            unit: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unit_auto: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: true,
                singleRun: false
            },
            unit_coverage: {
                configFile: './test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true,
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    'app/scripts/*.js': ['coverage']
                },
                coverageReporter: {
                    type: 'html',
                    dir: 'coverage/'
                }
            },
        }
    });

    //single run tests
    grunt.registerTask('test', ['jshint', 'test:unit', 'test:e2e']);
    grunt.registerTask('test:unit', ['karma:unit']);
    grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);

    //autotest and watch tests
    grunt.registerTask('autotest', ['karma:unit_auto']);
    grunt.registerTask('autotest:unit', ['karma:unit_auto']);
    grunt.registerTask('autotest:e2e', ['connect:testserver', 'shell:selenium', 'watch:protractor']);

    //coverage testing
    grunt.registerTask('test:coverage', ['karma:unit_coverage']);
    grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

    //installation-related
    grunt.registerTask('install', ['update', 'shell:protractor_install']);
    grunt.registerTask('update', ['shell:npm_install', 'concat']);

    //defaults
    grunt.registerTask('default', ['dev']);

    //development
    grunt.registerTask('dev', ['update', 'connect:devserver', 'open:devserver', 'watch:assets']);

    //server daemon
    grunt.registerTask('serve', ['connect:webserver']);
};
