// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

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
        src: ['src/js/module.js',
              'src/js/dynamic-layout.directive.js',
              'src/js/layout-on-load.directive.js',
              'src/js/filter.service.js',
              'src/js/position.service.js',
              'src/js/ranker.service.js',
              'src/js/as.filter.js',
              'src/js/custom-filter.filter.js',
              'src/js/custom-ranker.filter.js'],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.js': 'dist/js/<%= pkg.name %>.js'
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    eslint: {
      // when this task is run, lint the Gruntfile and all js files in src
      options: {
        configFile: '.eslintrc',
      },
      build: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js']
    },
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n',
        mangle: false
      },
      build: {
        files: {
          'dist/js/<%= pkg.name %>.min.js':  ['dist/js/<%= pkg.name %>.js'],
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
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.registerTask('default', ['eslint', 'karma', 'concat', 'ngAnnotate', 'uglify']);
};
