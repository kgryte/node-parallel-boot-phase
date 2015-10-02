'use strict';

var express = require( 'express' ),
	bootable = require( 'app-boot' ),
	parallel = require( './../lib' );

var phase, boot, app;

// Mock connecting to a database...
function db1( app, config, locals, next ) {
	console.log( 'Connecting to database 1...' );
	setTimeout( onTimeout, 1000 );
	function onTimeout() {
		console.log( 'Connected to database 1...' );
		locals.db1 = {
			'beep': 'boop'
		};
		next();
	}
}

// Mock connecting to a different database...
function db2( app, config, locals, next ) {
	console.log( 'Connecting to database 2...' );
	setTimeout( onTimeout, 500 );
	function onTimeout() {
		console.log( 'Connected to database 2...' );
		locals.db2 = {
			'bop': 'bip'
		};
		next();
	}
}

// Callback invoked once an application boots...
function done( error ) {
	if ( error ) {
		throw error;
	}
	console.log( 'Application booted...' );
}

// Create a new application:
app = express();

// Create a boot phase:
phase = parallel( db1, db2 );

// Create a boot function:
boot = bootable( app, {}, {} );

// Register the phase:
boot.phase( phase );

// Boot the application:
boot( done );
