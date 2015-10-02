'use strict';

// MODULES //

var debug = require( 'debug' )( 'parallel-boot-phase:main' ),
	isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' ),
	fname = require( 'utils-function-name' );


// PARALLEL //

/**
* FUNCTION: parallel( ...fcns )
*	Returns a parallel boot phase to be used when booting an application.
*
* @param { Function[]|...Function} fcns - functions to be executed in parallel
* @returns {Function} phase
*/
function parallel() {
	var names,
		next,
		fcns,
		tmp,
		len,
		cnt,
		i;

	tmp = arguments;
	if ( isArray( tmp[ 0 ] ) ) {
		tmp = tmp[ 0 ];
	}
	len = tmp.length;
	if ( !len ) {
		throw new Error( 'insufficient input arguments. Must provide input functions.' );
	}
	fcns = new Array( len );
	names = new Array( len );
	for ( i = 0; i < len; i++ ) {
		fcns[ i ] = tmp[ i ];
		if ( !isFunction( fcns[ i ] ) ) {
			throw new TypeError( 'invalid input argument. Must provide only function arguments. Value: `' + fcns[ i ] + '`.' );
		}
		names[ i ] = fname( fcns[ i ] );
	}
	cnt = 0;

	/**
	* FUNCTION: phase( [...args], next )
	*	Boot phase.
	*
	* @param {*} [...args] - phase arguments
	* @param {Function} next - callback to invoke after completing the phase
	* @returns {Void}
	*/
	function phase() {
		/* jshint validthis:true */
		var args,
			n, i;

		n = arguments.length - 1;
		next = arguments[ n ];
		args = new Array( n );
		for ( i = 0; i < n; i++ ) {
			args[ i ] = arguments[ i ];
		}
		args.push( null );
		for ( i = 0; i < len; i++ ) {
			debug( 'Entering parallel phase: `%s` (%d)', names[ i ], i );
			args[ n ] = clbk( i );
			fcns[ i ].apply( this, args );
		}
	} // end FUNCTION phase()

	/**
	* FUNCTION: clbk( idx )
	*	Encloses an index in a closure and returns a callback.
	*
	* @private
	* @param {Number} idx - index
	* @returns {Function} callback
	*/
	function clbk( idx ) {
		/**
		* FUNCTION: clbk( [error] )
		*	Callback invoked once a phase component completes.
		*
		* @private
		* @param {Error} [error] - error object
		* @returns {Void}
		*/
		return function clbk( error ) {
			if ( error ) {
				debug( '`%s` (%d) parallel phase returned an error: %s', names[ idx ], idx, error.message );
				return next( error );
			}
			debug( 'Finished parallel phase: `%s` (%d)', names[ idx ], idx );
			done();
		}; // end FUNCTION clbk()
	} // end FUNCTION clbk()

	/**
	* FUNCTION: done()
	*	Checks if the phase is complete.
	*
	* @private
	* @returns {Void}
	*/
	function done() {
		cnt += 1;
		if ( cnt === len ) {
			debug( 'Finished all parallel phases.' );
			next();
		}
	} // end FUNCTION done()

	return phase;
} // end FUNCTION parallel()


// EXPORTS //

module.exports = parallel;
