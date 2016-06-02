/* Tèsèvè
 * A simple static webserver, in an app.
 *
 * ~/app.js - Application entry point
 * started at 25/08/2015, by leny@flatLand!
 */

"use strict";

var electron = require( "electron" ),
    teseve = electron.app,
    BrowserWindow = electron.BrowserWindow,
    path = require( "path" ),
    lodash = require( "lodash" ),
    os = require( "os" ),
    Menu = electron.Menu;

global.app = {
    "windows": {}
};

var oMenu = [
    {
        "label": "Tèsèvè",
        "submenu": [
            {
                "label": "About Tèsèvè",
                "selector": "orderFrontStandardAboutPanel:"
            },
            {
                "type": "separator"
            },
            {
                "label": "Services",
                "submenu": []
            },
            {
                "type": "separator"
            },
            {
                "label": "Hide Electron",
                "accelerator": "CmdOrCtrl+H",
                "selector": "hide:"
            },
            {
                "label": "Hide Others",
                "accelerator": "CmdOrCtrl+Shift+H",
                "selector": "hideOtherApplications:"
            },
            {
                "label": "Show All",
                "selector": "unhideAllApplications:"
            },
            {
                "type": "separator"
            },
            {
                "label": "Quit",
                "accelerator": "CmdOrCtrl+Q",
                "selector": "terminate:"
            }
        ]
    },
    {
        "label": "Server",
        "submenu": [
            {
                "label": "New Server",
                "accelerator": "CmdOrCtrl+N",
                "click": function() {
                    fCreateNewWindow();
                }
            // },
            // {
            //     "type": "separator"
            // },
            // {
            //     "label": "Close Server",
            //     "accelerator": "CmdOrCtrl+W",
            //     "click": function() {
            //         console.log( "Close current window!" );
            //     }
            // },
            // {
            //     "label": "Close All Servers",
            //     "accelerator": "CmdOrCtrl+Shift+W",
            //     "click": function() {
            //         console.log( "Close current window!" );
            //     }
            }
        ]
    }
];

var fCreateNewWindow = function() {
    var sNewID = lodash.uniqueId(),
        oWindow = new BrowserWindow( {
            "id": sNewID,
            "title": "Tèsèvè",
            "icon": path.resolve( __dirname, "assets/icon.png" ),
            "width": 640,
            "height": 480,
            "minWidth": 640,
            "minHeight": 480,
            "center": true,
            "standard-window": false,
            "resizable": true,
            "frame": false,
            "show": false
        } );

    // oWindow.openDevTools();

    global.app.windows[ sNewID ] = oWindow;

    oWindow.on( "closed", function() {
        delete global.app.windows[ sNewID ];
        oWindow = null;
    } );

    oWindow.loadURL( "file://" + __dirname + "/app.html" );
};

teseve.on( "window-all-closed", function() {
    if( process.platform !== "darwin" ) {
        electron.quit();
    }
} );

teseve.on( "activate", function() {
    if ( global.app.windows && Object.keys( global.app.windows ).length === 0 ) {
        fCreateNewWindow();
    }
} );

teseve.on( "ready", function() {
    Menu.setApplicationMenu( Menu.buildFromTemplate( oMenu ) );

    fCreateNewWindow();
} );
