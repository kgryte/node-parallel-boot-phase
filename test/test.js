/* global require, describe, it */
'use strict';

// MODULES //

var chai = require( 'chai' ),
	parallel = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'parallel-boot-phase', function tests() {

	it( 'should export a function', function test() {
		expect( parallel ).to.be.a( 'function' );
	});

});
