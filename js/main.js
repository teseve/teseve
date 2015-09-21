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
    mimetype = require( "mimetype" ),
    fs = require( "fs" ),
    path = require( "path" ),
    moment = require( "moment" ),
    expressHBS = require( "express-handlebars" );

var oCurrentWindow = remote.getCurrentWindow(),
    $rootSelectorButton,
    $rootSelectorPreview,
    $portInput,
    $autoindexToggler,
    $serverLink,
    $logsContainer,
    $emptyLogs,
    fSelectRoot,
    fInitDOM,
    fChangePort,
    fReconfigureServer,
    fServerLogging,
    fCheckForAutoIndex,
    fEventNullifier,
    fFileDropped,
    fParseFolder,
    sRootPath,
    iPort,
    rAutoindexPath = /^\/__dev\//,
    bServerIsConfigured = false;

oCurrentWindow.on( "blur", function() {
    document.body.classList.remove( "enabled" );
} );

oCurrentWindow.on( "focus", function() {
    document.body.classList.add( "enabled" );
} );

fEventNullifier = function( e ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
};

fFileDropped = function( e ) {
    var oFile = e.dataTransfer.files[ 0 ];
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove( "filedrag" );
    if( fs.statSync( oFile.path ).isDirectory() ) {
        $rootSelectorPreview.innerHTML = ( sRootPath = oFile.path ).replace( os.homedir(), "~" );
        $rootSelectorButton.innerHTML = "change";
        fReconfigureServer();
    }
    return false;
};

fServerLogging = function( oRequest, oResponse, fNext ) {
    if( rAutoindexPath.test( oRequest.url ) || oRequest.url === "/favicon.ico" ) {
        return fNext();
    }
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

fParseFolder = function( sPath ) {
    var aFiles = [];
    fs.readdirSync( sPath ).forEach( function( sFile ) {
        var oFile, sMimeType;
        if( sFile.substr( 0, 1 ) !== "." ) {
            oFile = fs.statSync( sPath + "/" + sFile );
            sMimeType = mimetype.lookup( sFile );
            aFiles.push( {
                "isFolder": !!oFile.isDirectory(),
                "mime": !!oFile.isDirectory() ? "folder" : ( sMimeType ? sMimeType.split( "/" )[ 0 ] : "unknown" ),
                "name": sFile,
                "size": humanSize( oFile.size ),
                "time": {
                    "raw": oFile.mtime,
                    "human": moment( oFile.mtime ).format( "YYYY-MM-DD HH:mm:SS" )
                }
            } );
        }
    } );
    return aFiles;
};

fCheckForAutoIndex = function( oRequest, oResponse, fNext ) {
    var sPath;
    if( oRequest.url.substr( -1 ) === "/" && $autoindexToggler.checked ) {
        sPath = path.join( sRootPath, oRequest.url );
        if( fs.existsSync( sPath + "/index.html" ) ) {
            return oResponse.sendFile( sPath + "/index.html" );
        }
        if( fs.existsSync( sPath + "/index.htm" ) ) {
            return oResponse.sendFile( sPath + "/index.htm" );
        }
        oResponse.render( "autoindex.hbs", {
            "files": fParseFolder( sPath ),
            "hasParent": oRequest.url !== "/",
            "port": iPort,
            "root": sRootPath.replace( os.homedir(), "~" ),
            "folder": oRequest.url,
            "version": require( __dirname + "/../package.json" ).version
        } );
    } else {
        fNext();
    }
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

    express()
        .engine( "hbs", expressHBS( { "extname": "hbs" } ) )
        .set( "view engine", "hbs" )
        .set( "views", __dirname + "/../views" )
        .use( fCheckForAutoIndex )
        .use( fServerLogging )
        .use( "/__dev", express.static( __dirname + "/../autoindexes" ) )
        .use( express.static( sRootPath ) )
        .listen( iPort, function() {
            oCurrentWindow.server = this;
            bServerIsConfigured = true;
            document.body.classList.add( "ready" );
        } );
};

fSelectRoot = function( e ) {
    var that = this;
    e.preventDefault();
    dialog.showOpenDialog( oCurrentWindow, { "properties": [ "openDirectory" ] }, function( aFolders ) {
        if( lodash.isArray( aFolders ) ) {
            $rootSelectorPreview.innerHTML = ( sRootPath = aFolders[ 0 ] ).replace( os.homedir(), "~" );
            that.innerHTML = "change";
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

    ( $autoindexToggler = document.getElementById( "autoindex-state" ) );

    document.getElementById( "close" ).addEventListener( "click", function() {
        return oCurrentWindow.close() && false;
    } );

    document.getElementById( "minify" ).addEventListener( "click", function() {
        return oCurrentWindow.minimize() && false;
    } );

    document.getElementById( "magnify" ).addEventListener( "click", function() {
        this.classList[ oCurrentWindow.isMaximized() ? "remove" : "add" ]( "enabled" );
        return ( oCurrentWindow.isMaximized() ? oCurrentWindow.unmaximize() : oCurrentWindow.maximize() ) && false;
    } );

    var eventDebug = function( e ) { e.preventDefault(); console.log( e.type ); return false; };

    // managing drag'n'drop
    document.body.addEventListener( "dragover", fEventNullifier );
    document.body.addEventListener( "dragenter", function( e ) {
        document.body.classList.add( "filedrag" );
        fEventNullifier.call( this, e );
    } );
    document.body.addEventListener( "dragleave", function( e ) {
        document.body.classList.remove( "filedrag" );
        fEventNullifier.call( this, e );
    } );
    document.body.addEventListener( "drop", fFileDropped );

    oCurrentWindow.show();
};

emptyPort( {
    "startPort": 1000,
    "maxPort": 65535
}, fInitDOM );
