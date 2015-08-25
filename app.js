/* SenpSèvè
 * A simple static webserver, in an app.
 *
 * ~/app.js - Application entry point
 * started at 25/08/2015, by leny@flatLand!
 */

"use strict";

var app = require( "app" ),
    BrowserWindow = require( "browser-window" ),
    path = require( "path" ),
    lodash = require( "lodash" );

require( "electron-debug" )();
require( "crash-reporter" ).start();

var oApp = {
    "windows": {}
};

app.on( "window-all-closed", function() {
    if( process.platform !== "darwin" ) {
        app.quit();
    }
} );

app.on( "ready", function() {

    var oWindow = new BrowserWindow( {
        "id": lodash.uniqueId( "senpseve_window_" ),
        "width": 640,
        "height": 480,
        "icon": path.resolve( __dirname, "assets/icon.png" )
    } );

    oApp.windows[ oWindow.id ] = oWindow;

    oWindow.loadUrl( "file://" + __dirname + "/app.html" );

} );
