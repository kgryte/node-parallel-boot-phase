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
		fcns,
		tmp,
		len,
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
			cb,
			n, i;

		n = arguments.length - 1;
		args = new Array( n );
		for ( i = 0; i < n; i++ ) {
			args[ i ] = arguments[ i ];
		}
		args.push( null );
		cb = next( arguments[ n ] );
		for ( i = 0; i < len; i++ ) {
			debug( 'Entering parallel phase: `%s` (%d)', names[ i ], i );
			args[ n ] = clbk( i, cb );
			fcns[ i ].apply( this, args );
		}
	} // end FUNCTION phase()

	/**
	* FUNCTION: clbk( idx, next )
	*	Encloses an index in a closure and returns a callback.
	*
	* @private
	* @param {Number} idx - index
	* @param {Function} next - callback to invoke after a parallel phase ends
	* @returns {Function} callback
	*/
	function clbk( idx, next ) {
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
			next();
		}; // end FUNCTION clbk()
	} // end FUNCTION clbk()

	/**
	* FUNCTION: next( done )
	*	Creates a callback for determining if an entire phase is complete.
	*
	* @private
	* @param {Function} done - callback to invoke after all parallel phases are complete
	* @returns {Function} callback
	*/
	function next( done ) {
		var cnt = 0;
		/**
		* FUNCTION: next( [error] )
		*	Checks if all parallel phases are complete.
		*
		* @private
		* @param {Error} [error] - error object
		* @returns {Void}
		*/
		return function next( error ) {
			if ( error ) {
				return done( error );
			}
			cnt += 1;
			if ( cnt === len ) {
				debug( 'Finished all parallel phases.' );
				done();
			}
		}; // end FUNCTION next()
	} // end FUNCTION next()

	return phase;
} // end FUNCTION parallel()


// EXPORTS //

module.exports = parallel;
