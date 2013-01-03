module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<file_strip_banner:lib/<%= pkg.name %>.js>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        lint: {
            files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint test'
        },
        server: {
            port: 8080,
            base: '.'
        },
        jshint: {
            options: {
                es5: true,
                proto: true,
                devel: true,
                forin: true,
                noarg: true,
                noempty: true,
                eqeqeq: true,
                bitwise: false,
                strict: true,
                undef: true,
                unused: true,
                curly: true,
                browser: true,
                indent: 4,
                maxerr: 50,
                evil: true
            },
            globals: {
                exports: true,
                module: true,
                window: true,
                require: true,
                define: true
            }
        },
        uglify: {},
        requirejs: {
            std: {
                options: {
                    name: 'adlib',
                    mainConfigFile: 'lib/adlib.js',
                    baseUrl: 'lib',
                    out: "dist/adlib.min.js",
                    optimize: "uglify2",
                    generateSourceMaps: true,
                    preserveLicenseComments: false
                }
            }
        }
    });
    // Default task.
    grunt.registerTask('build', 'requirejs');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.registerTask('default', 'requirejs lint test');
};