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

fServerLogging = function( oRequest, oResponse, fNext ) {
    var aLogLine = [ "<tr>" ];
        aLogLine.push( "<td>" + ( ( new Date() ).toTimeString().split( " " )[ 0 ] ) + "</td>" );
        aLogLine.push( "<td>" + ( oRequest.method ) + "</td>" );
        aLogLine.push( "<td>" + ( oRequest.url ) + "</td>" );
        aLogLine.push( "</tr>" );
    $logsContainer.insertAdjacentHTML( "beforeend", aLogLine.join( "" ) );
    oRequest.connection.setTimeout( 2000 );
    fNext();
};

fReconfigureServer = function() {
    var sURL = "http://localhost:" + iPort;
    $serverLink.setAttribute( "href", sURL );
    $serverLink.innerHTML = sURL;

    if( oCurrentWindow.server != null ) {
        oCurrentWindow.server.close( function() {
            console.log( "!!!" );
        } );
    }

    express().use( fServerLogging ).use( express.static( sRootPath ) ).listen( iPort, function() {
        oCurrentWindow.server = this;
    } );

    bServerIsConfigured = true;
};

fSelectRoot = function( e ) {
    e.preventDefault();
    dialog.showOpenDialog( oCurrentWindow, { "properties": [ "openDirectory" ] }, function( aFolders ) {
        if( lodash.isArray( aFolders ) ) {
            $rootSelectorPreview.innerHTML = ( sRootPath = aFolders[ 0 ] );

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
        return oCurrentWindow.maximize() && false;
    } );

    oCurrentWindow.show();
};

emptyPort( {
    "startPort": 1000,
    "maxPort": 65535
}, fInitDOM );
