/**
 * @author jinguangguo
 * @date 2015/4/7
 */
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        csslint: {
            src: ['web/build/css/*.css']
        },
        concat: {
            css: {
                src: ['web/css/*.css'],
                dest: 'web/build/<%= pkg.name %>.css'
            },
            js: {

            }
        },
        //css压缩
        cssmin: {
            /*压缩 CSS 文件为 .min.css */
            options: {
                keepSpecialComments: 0 /* 移除 CSS 文件中的所有注释 */
            },
            minify: {
                files: [
                    {'web/build/css/<%= pkg.name %>.css': 'web/build/<%= pkg.name %>.css'}
                ]
            }
        },
        //html压缩
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'index.html'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.registerTask('default', ['concat', 'cssmin']);
};