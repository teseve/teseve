/* Tèsèvè
 * A simple static webserver, in an app.
 *
 * ~/js/main.js - Application Window entry point
 * started at 25/08/2015, by leny@flatLand!
 */

"use strict";

var remote = window.require( "remote" ),
    dialog = remote.require( "dialog" ),
    shell = remote.require( "shell" ),
    os = require( "os" ),
    lodash = require( "lodash" ),
    emptyPort = require( "empty-port" ),
    express = require( "express" ),
    humanSize = require( "human-size" ),
    fs = require( "fs" );

var oCurrentWindow = remote.getCurrentWindow(),
    $rootSelectorButton,
    $rootSelectorPreview,
    $portInput,
    $serverLink,
    $logsContainer,
    $emptyLogs,
    fSelectRoot,
    fInitDOM,
    fChangePort,
    fReconfigureServer,
    fServerLogging,
    sRootPath,
    iPort,
    bServerIsConfigured = false;

oCurrentWindow.on( "blur", function() {
    document.body.classList.remove( "enabled" );
} );

oCurrentWindow.on( "focus", function() {
    document.body.classList.add( "enabled" );
} );

fServerLogging = function( oRequest, oResponse, fNext ) {
    var aLogLine = [ "<li>" ];
        aLogLine.push( "<time>" + ( ( new Date() ).toTimeString().split( " " )[ 0 ] ) + "</time>" );
        aLogLine.push( "<span>" + ( oRequest.method ) + "</span>" );
        aLogLine.push( "<strong>" + ( oRequest.url ) + "</strong>" );
        aLogLine.push( "</li>" );
    $logsContainer.insertAdjacentHTML( "beforeend", aLogLine.join( "" ) );
    $logsContainer.scrollTop = $logsContainer.scrollHeight;
    oRequest.connection.setTimeout( 2000 );
    fNext();
};

fReconfigureServer = function() {
    if( !iPort || !sRootPath ) {
        return;
    }

    var sURL = "http://localhost:" + iPort;
    document.body.classList.remove( "ready" );
    $serverLink.setAttribute( "href", sURL );
    $serverLink.innerHTML = sURL;

    if( oCurrentWindow.server != null ) {
        oCurrentWindow.server.close();
    }

    express().use( fServerLogging ).use( express.static( sRootPath ) ).listen( iPort, function() {
        oCurrentWindow.server = this;
        bServerIsConfigured = true;
        document.body.classList.add( "ready" );
    } );
};

fSelectRoot = function( e ) {
    e.preventDefault();
    dialog.showOpenDialog( oCurrentWindow, { "properties": [ "openDirectory" ] }, function( aFolders ) {
        if( lodash.isArray( aFolders ) ) {
            $rootSelectorPreview.innerHTML = ( sRootPath = aFolders[ 0 ] ).replace( os.homedir(), "~" );

            fReconfigureServer();
        }
    } );
}; // fSelectRoot

fChangePort = function( e ) {
    iPort = +( e.currentTarget.value );

    fReconfigureServer();
};

// init DOM
fInitDOM = function( oError, iGivenPort ) {
    iPort = iGivenPort || 12345;

    switch( os.platform() ) {
        case "win32":
        case "win64":
            document.body.classList.add( "windows" );
            break;

        default:
            document.body.classList.add( os.platform() );
            break;
    }

    ( $rootSelectorButton = document.getElementById( "root-select" ) ).addEventListener( "click", fSelectRoot );
    $rootSelectorPreview = document.getElementById( "root-preview" );
    $logsContainer = document.getElementById( "logs-content" );
    ( $serverLink = document.getElementById( "server-link" ) ).addEventListener( "click", function( e ) {
        e.preventDefault();
        if( bServerIsConfigured ) {
            shell.openExternal( e.currentTarget.getAttribute( "href" ) );
        }
    } );
    ( $emptyLogs = document.getElementById( "empty-logs" ) ).addEventListener( "click", function( e ) {
        e.preventDefault();
        $logsContainer.innerHTML = "";
    } );
    ( $portInput = document.getElementById( "port-input" ) ).value = iPort;
    $portInput.addEventListener( "change", fChangePort );

    document.getElementById( "close" ).addEventListener( "click", function() {
        return oCurrentWindow.close() && false;
    } );

    document.getElementById( "minify" ).addEventListener( "click", function() {
        return oCurrentWindow.minimize() && false;
    } );

    document.getElementById( "magnify" ).addEventListener( "click", function() {
        this.classList[ oCurrentWindow.isMaximized() ? "remove" : "add" ]( "enabled" );
        return oCurrentWindow.maximize() && false;
    } );

    oCurrentWindow.show();
};

emptyPort( {
    "startPort": 1000,
    "maxPort": 65535
}, fInitDOM );
