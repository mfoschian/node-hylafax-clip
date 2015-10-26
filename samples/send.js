var Hylafax = require('../HylafaxClient');
var fs = require('fs');
var util = require('util');


var faxfile = 'FAX.pdf';
var faxnum = '++phone_number+++';


var options =
{
	host: 'myserver'
	,port: 4559
	,username: 'myusr'
	,password: 'mypwd'
	//,debug: function(msg) { console.log('DBG: %s', msg); }
};


var hylafax = new Hylafax( options );


function term( msg )
{
	if( msg )
		console.log( 'Terminating: %s', msg );

	if( !hylafax )
		console.log( 'Hylafax instance missing' );
	else
		hylafax.disconnect();

	process.exit();
}



if( !hylafax )
	term( 'No Hylafax!');


function dump( res )
{
	console.log( 'Data: %s', util.inspect(res) );
};

hylafax.connect().then( function()
{
	console.log('Connected');
})
.then( function()
{
	//console.log( 'sending <%s> to %s', fax.path, fax.number );

	var opts =
	{
		number: faxnum
		//,debug: debugLog
	};

	return hylafax.sendFax(opts, fs.createReadStream( faxfile ));
})
.then( undefined, function( err )
{
	console.log( 'Error occurred: %s', err );
	return null;
})
.then( term, term );


process.once('SIGINT', term );
