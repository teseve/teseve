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
    lodash = require( "lodash" );

require( "electron-debug" )();
require( "crash-reporter" ).start();

var oApp = {
    "windows": {}
};

electron.on( "window-all-closed", function() {
    if( process.platform !== "darwin" ) {
        electron.quit();
    }
} );

electron.on( "ready", function() {

    var oWindow = new BrowserWindow( {
        "id": lodash.uniqueId( "teseve_window_" ),
        "width": 640,
        "height": 480,
        "icon": path.resolve( __dirname, "assets/icon.png" )
    } );

    oApp.windows[ oWindow.id ] = oWindow;

    oWindow.loadUrl( "file://" + __dirname + "/app.html" );

} );
