var Hylafax = require('../HylafaxClient');
var util = require('util');

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
	console.log('------- Modem Status -------');
    return hylafax.getModemStatus().then( dump );
})
.then( function()
{
	console.log('------- Active Jobs -------');
    return hylafax.getActiveJobs().then( dump );
})
.then( function()
{
	console.log('------- Archived Jobs -------');
    return hylafax.getArchivedJobs().then( dump );
})
.then( function()
{
	console.log('------- Completed Jobs -------');
    return hylafax.getCompletedJobs().then( dump );
})
.then( undefined, function( err )
{
	console.log( 'Error occurred: %s', err );
	return null;
})
.then( term, term );


process.once('SIGINT', term );
