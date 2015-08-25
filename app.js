/* Tèsèvè
 * A simple static webserver, in an app.
 *
 * ~/app.js - Application entry point
 * started at 25/08/2015, by leny@flatLand!
 */

"use strict";

var electron = require( "app" ),
    BrowserWindow = require( "browser-window" ),
    path = require( "path" ),
    lodash = require( "lodash" ),
    os = require( "os" );

require( "electron-debug" )();
require( "crash-reporter" ).start();

global.app = {
    "windows": {}
};

electron.on( "window-all-closed", function() {
    return electron.quit(); // TODO: TMP
    if( process.platform !== "darwin" ) {
        electron.quit();
    }
} );

electron.on( "ready", function() {

    var oWindow = new BrowserWindow( {
        "id": lodash.uniqueId(),
        "title": "Tèsèvè",
        "icon": path.resolve( __dirname, "assets/icon.png" ),
        "width": 640,
        "height": 480,
        "min-width": 640,
        "min-height": 480,
        "center": true,
        "standard-window": false,
        "resizable": true,
        "frame": false,
        "show": false
    } );

    oWindow.openDevTools();

    global.app.windows[ oWindow.id ] = oWindow;

    oWindow.loadUrl( "file://" + __dirname + "/app.html" );

    oWindow.on( "closed", function( a, b, c, d ) {
        delete global.app.windows[ this.id ];
        oWindow = null;
    } );

} );
