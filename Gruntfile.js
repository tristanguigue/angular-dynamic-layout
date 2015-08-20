// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function (grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/module.js',
              'src/dynamic-layout.directive.js',
              'src/layout-on-load.directive.js',
              'src/filter.service.js',
              'src/position.service.js',
              'src/ranker.service.js',
              'src/as.filter.js',
              'src/custom-filter.filter.js',
              'src/custom-ranker.filter.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    jshint: {
      // when this task is run, lint the Gruntfile and all js files in src
      options: {
        multistr: true,
      },
      build: ['Grunfile.js', 'src/**/*.js', 'tests/**/*.js']
    },
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n',
        mangle: false
      },
      build: {
        files: {
          'dist/<%= pkg.name %>.min.js':  ['dist/<%= pkg.name %>.js'],
        }
      }
    }
  });

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['karma', 'jshint', 'concat', 'uglify']);
};
