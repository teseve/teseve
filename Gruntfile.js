// Tèsèvè - Gruntfile

var path = require( "path" ),
    execFile = require( "child_process" ).execFile,
    pkg = require( "./package.json" ),
    electron = require( "electron-prebuilt" );

var sAppName = "Teseve";

module.exports = function( grunt ) {

    require( "load-grunt-tasks" )( grunt );

    grunt.initConfig( {
        "IDENTITY": "Developer ID Application: flatLand!",
        "APPNAME": sAppName,

        // prepare build
        "copy": {
            "dev": {
                "files": [
                    {
                        "expand": true,
                        "cwd": ".",
                        "src": [
                            "package.json",
                            "app.js",
                            "app.html"
                        ],
                        "dest": "build/"
                    },
                    {
                        "expand": true,
                        "cwd": "assets/",
                        "src": [ "**/*" ],
                        "dest": "build/assets/"
                    },
                    {
                        "expand": true,
                        "cwd": "autoindexes/",
                        "src": [ "**/*" ],
                        "dest": "build/autoindexes/"
                    },
                    {
                        "expand": true,
                        "cwd": "css/",
                        "src": [ "**/*" ],
                        "dest": "build/css/"
                    },
                    {
                        "expand": true,
                        "cwd": "js/",
                        "src": [ "**/*" ],
                        "dest": "build/js/"
                    },
                    {
                        "expand": true,
                        "cwd": "views/",
                        "src": [ "**/*" ],
                        "dest": "build/views/"
                    },
                    {
                        "expand": true,
                        "cwd": "node_modules/",
                        "src": Object.keys( pkg.dependencies ).map( function( dep ) {
                            return dep + "/**/*";
                        } ),
                        "dest": "build/node_modules/"
                    }
                ]
            }
        },

        // electron
        "electron": {
            "windows": {
                "options": {
                    "name": sAppName,
                    "dir": "build/",
                    "out": "dist",
                    "version": pkg[ "electron-version" ],
                    "platform": "win32",
                    "arch": "x64",
                    "asar": true,
                    "icon": "./icon.ico"
                }
            },
            "osx": {
                "options": {
                    "name": sAppName,
                    "dir": "build/",
                    "out": "dist",
                    "version": pkg[ "electron-version" ],
                    "platform": "darwin",
                    "arch": "x64",
                    "asar": true,
                    "app-bundle-id": "com.flatland.app.teseve",
                    "app-version": pkg.version,
                    "icon": "./icon.icns"
                }
            }
        },

        // rcedit
        "rcedit": {
            "exes": {
                "files": [
                    {
                        "expand": true,
                        "cwd": "dist/" + sAppName + "-win32-x64",
                        "src": [ sAppName + ".exe" ]
                    }
                ],
                "options": {
                    "icon": "./icon.ico",
                    "file-version": pkg.version,
                    "product-version": pkg.version,
                    "version-string": {
                        "CompanyName": "flatLand!",
                        "ProductVersion": pkg.version,
                        "ProductName": sAppName,
                        "FileDescription": sAppName,
                        "InternalName": sAppName + ".exe",
                        "OriginalFilename": sAppName + ".exe",
                        "LegalCopyright": "Tèsèvè is free and unencumbered software released into the public domain, by flatLand!."
                    }
                }
            }
        },

        // shell
        "shell": {
            "electron": {
                "command": electron + " build",
                "options": {
                    "async": true,
                    "execOptions": {
                        "env": process.env
                    }
                }
            },
            "zip": {
                "command": "ditto -c -k --sequesterRsrc --keepParent dist/" + sAppName + "-darwin-x64/" + sAppName + ".app dist/" + sAppName + "-" + pkg.version + "-mac-x64.zip"
            }
        },

        // clean
        "clean": {
            "release": [
                "build/",
                "dist/"
            ]
        },

        // compress
        "compress": {
            "windows": {
                "options": {
                    "archive": "./dist/" + sAppName + "-" + pkg.version + "-win32-x64.zip",
                    "mode": "zip"
                },
                "files": [
                    {
                        "expand": true,
                        "dot": true,
                        "cwd": "./dist/" + sAppName + "-win32-x64",
                        "src": "**/*"
                    }
                ]
            },
        },

    } );

    grunt.registerTask( "default", [
        "newer:copy:dev",
        "shell:electron"
    ] );

    if( process.platform === "win32" ) {
        grunt.registerTask( "release", [
            "clean:release",
            "copy:dev",
            "electron:windows",
            "rcedit:exes",
            "compress"
        ] );
    } else {
        grunt.registerTask( "release", [
            "clean:release",
            "copy:dev",
            "electron:osx",
            "shell:zip"
        ] );
    }

    process.on( "SIGINT", function () {
        grunt.task.run( [ "shell:electron:kill" ] );
        process.exit( 1 );
    } );

};
