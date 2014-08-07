 module.exports = function(grunt) {
	    'use strict';

  grunt.initConfig({
	   pkgInfo: grunt.file.readJSON('package.json'),
	   
	   
	 rev: {
	    options: {
	      algorithm: 'sha1',
	      length: 4
	    },
	    files: {
	      src: ['<%= pkgInfo.sourceDir %>/**/*.{js,css}']
	    }
	  },	   
        clean: ['<%= pkgInfo.packageDir %>'],

        copy: {
            main: {
                src: '<%= pkgInfo.sourceDir %>/index.html',
                dest: '<%= pkgInfo.packageDir %>/index.html'
            }
        },
        
       ngmin: {
           dist: {
             files: [{
               expand: true,
               cwd: '.tmp/concat/resources/js',
               src: '*.js',
               dest: '.tmp/concat/resources/js'
             }]
           }
         },
	   useminPrepare : {
	            html: ['<%= pkgInfo.sourceDir %>/index*.html'], //search target files
	            options: {
	                dest: '<%= pkgInfo.packageDir %>' //output of concat/uglify,etc.
	            }
	        },
	   uglify: {
	        options: {
	          report: 'min'
	      }
	   },

	   usemin:{
		   html: ['<%= pkgInfo.packageDir %>/index*.html'],
		   options: {
			   	dirs: ['<%= pkgInfo.packageDir %>']
		   }
	   },
	   /*
		manifestGenerator:{
			  mycvhcache: {
				options:{
				  //is cache all the html files in source files
				  //{Boolean}
				  //default:true
				  includeHTML:false,
				  //is cache all the images tags or inline style with background-images in the  html files in source files
				  //{Boolean}
				  //default:true
				  includeHtmlImage:false,
				  //is cache all the style files imported by the html
				  //{Boolean}
				  //default:true
				  includeCSS:true,
				  //is cache all the background-images in the css contents, which were used by the  html files
				  //{Boolean}
				  //default:true
				  includeCssImage:false,
				  //is cache all the js files in the html files
				  //{Boolean}
				  //default:true
				  includeJS:true,
				  //all the files above but the fllowwing files.
				  //{Array} the item could be writen as regexpress.
				  //default:[]
				  //excludeFiles:['/\.png$/']
				  excludeFiles:[]
				},
				files: {
				  //the task will scan all the source files, and generate 'test.manifest' file as the cache setting. 
				  '<%= pkgInfo.packageDir %>/resources/mycvh.cache': ['<%= pkgInfo.sourceDir %>/index.html']
				}
			  }
			}	   
*/
	manifest: {
		generate: {
			options: {
				absolutePath: true,
				basePath: '<%= pkgInfo.sourceDir %>/',
				timestamp: true,
				network: ['*'],
				preferOnline: true,
				verbose: true
			},

			files: [
				{ 
					src: [
					'resources/js/*',
					'resources/css/*',
					// etc
					],
				dest: '<%= pkgInfo.sourceDir %>/resources/mycvs.cache' },
			]
		}
	}
	
	
  }); //End for grunt.initConfig
	
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-rev');  	
	//grunt.loadNpmTasks('grunt-manifest-generator');	
	grunt.loadNpmTasks('grunt-manifest');
	grunt.registerTask('default', ['useminPrepare', 'concat','ngmin', 'uglify', 'cssmin', 'rev', 'usemin', 'manifest']);
	//grunt.registerTask('default', ['clean','copy', 'useminPrepare', 'concat','ngmin', 'uglify', 'usemin']);
};