'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// PARALLEL //

/**
* FUNCTION: parallel( ...fcns )
*	Returns a parallel boot phase to be used when booting an application.
*
* @param { Function[]|...Function} fcns - functions to be executed in parallel
* @returns {Function} phase
*/
function parallel() {
	var next,
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
	for ( i = 0; i < len; i++ ) {
		fcns[ i ] = tmp[ i ];
		if ( !isFunction( fcns[ i ] ) ) {
			throw new TypeError( 'invalid input argument. Must provide only function arguments. Value: `' + fcns[ i ] + '`.' );
		}
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
		args.push( done );
		for ( i = 0; i < len; i++ ) {
			fcns[ i ].apply( this, args );
		}
	} // end FUNCTION phase()

	/**
	* FUNCTION: done( [error] )
	*	Callback invoked after a phase component completes.
	*
	* @private
	* @param {Error} [error] - error object
	* @returns {Void}
	*/
	function done( error ) {
		if ( error ) {
			return next( error );
		}
		cnt += 1;
		if ( cnt === len ) {
			next();
		}
	} // end FUNCTION done()

	return phase;
} // end FUNCTION parallel()


// EXPORTS //

module.exports = parallel;
