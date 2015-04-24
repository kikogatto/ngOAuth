'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: {
            // Configurable paths
            app: 'src/app',
            dist:'dist',
            test: 'src/tests',
            examples: 'src/examples',
            tmp : '.tmp',
            config : 'config',
            lib : 'lib',
        },

        // Empties folders to start fresh
        clean: {
            test: ['<%= config.tmp %>'],
            dist: ['<%= config.dist %>'],
        },

        ngtemplates:    {
            options:    {
                htmlmin:  {
                    collapseBooleanAttributes:      true,
                    collapseWhitespace:             true,
                    removeAttributeQuotes:          true,
                    removeComments:                 true, // Only if you don't use comment directives!
                    removeEmptyAttributes:          true,
                    removeRedundantAttributes:      true,
                    removeScriptTypeAttributes:     true,
                    removeStyleLinkTypeAttributes:  true
                },
                standalone : true
            },
            compiledTemplates: {
                cwd: '<%= config.app %>',
                src: '**/*.html',
                dest: '<%= config.tmp %>/templates.js',
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/components/**/*.js',
                '<%= config.app %>/assets/**/*.js',
                '<%= config.app %>/*.js',
                '<%= config.test %>/**/*.specs.js',
            ]
        },

        jasmine: {
            taskName: {
                src: [
                    '<%= config.app %>/core/ngOAuth.js',
                    '<%= config.app %>/*.js',
                    '<%= config.app %>/**/*.js',
                    '<%= config.tmp %>/*.js',
                ],
                options: {
                    specs: '<%= config.test %>/**/*.specs.js',
                    vendor: [
                        '<%= config.lib %>/jquery/jquery.js',
                        '<%= config.lib %>/jquery-ui/jquery-ui.js',
                        '<%= config.lib %>/angular/angular.js',
                        '<%= config.lib %>/angular-mocks/angular-mocks.js',
                        '<%= config.lib %>/angular-cookies/angular-cookies.js',
                        '<%= config.lib %>/angular-resource/angular-resource.js',
                        '<%= config.lib %>/angular-sanitize/angular-sanitize.js',
                        '<%= config.lib %>/angular-route/angular-route.js',
                        '<%= config.lib %>/angular-animate/angular-animate.js',
                        '<%= config.lib %>/moment/moment.js',
                        '<%= config.lib %>/moment/locales/pt-br.js',
                        '<%= config.lib %>/ngstorage/ngstorage.js',
                    ],
                    helpers: [
                        '<%= config.test %>/config.tests.js',
                    ],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'bin/coverage/coverage.json',
                        report: 'bin/coverage',
                        thresholds: {
                            lines: 90,
                            statements: 90,
                            branches: 90,
                            functions: 90
                        }
                    }
                }
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './lib',
                    layout: 'byComponent',
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
//                cwd: '<%= config.app %>',
                dest: '<%= config.dist %>/ng-oauth.js',
//                src: ['<%= config.app %>/**/*.js','<%= config.tmp %>/templates.js']
                src: ['<%= config.app %>/core/ngOAuth.js', '<%= config.app %>/core/houseBrandOAuth.js', '<%= config.app %>/core/demoOAuth.js','<%= config.tmp %>/templates.js']
            },
        },
                // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '**/*.js'
                    ]
                }]
            },
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            examples: {
                options: {
                    open: true,
                    base: [ '<%= config.dist %>','<%= config.lib %>','<%= config.examples %>'],
                    livereload: false
                }
            }
        },

    });


    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:test',
            'ngtemplates',
            'jshint',
            'jasmine',
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'test',
        'concat:dist',
    ]);

    grunt.registerTask('serve', function (target) {
        if (target === 'examples') {
            return grunt.task.run([ 'connect:examples:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'less',
            'copy:config',
            'ngtemplates:compiledTemplates',
            'ngtemplates:commonsTemplates',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
