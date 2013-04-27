module.exports = function(grunt) {

  var RE_USE_STRICT_STATEMENT = /(^|\n)[ \t]*('use strict'|"use strict");?\s*/g,
      RE_CONSOLE_METHODS      = /console.[\w]+\(.*?(\w*\(.*\))*\);/g,
      BUILD_ORDERED_LIST      = [
        'src/main.js',
        'src/helper.js',
        'src/exception/*.js',
        'src/domain/*.js',
        'src/trait/*.js',
        'src/util/*.js',
        'src/export.js'
      ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner: ['/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
                 '(function() {',
                 '',
                 '"use strict";',
                 '',
                 ''].join('\n'),
        footer: ['',
                 '})();'].join('\n')
      },
      dist: {
        src: BUILD_ORDERED_LIST,
        dest: 'dist/elastic.js',
        options: {
          process: function(content) {
            return content.replace(RE_USE_STRICT_STATEMENT, '$1').replace(RE_CONSOLE_METHODS, '');
          }
        }
      },
      debug: {
        src: BUILD_ORDERED_LIST,
        dest: 'dist/elastic.debug.js',
        options: {
          process: function(content) {
            return content.replace(RE_USE_STRICT_STATEMENT, '$1');
          }
        }
      }
    },
    watch: {
      files: ['src/**/*.js'],
      tasks: ['concat:debug'],
      options: {
        nospawn: false,
        interrupt: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['concat']);
  grunt.registerTask('devel', ['watch']);

};
