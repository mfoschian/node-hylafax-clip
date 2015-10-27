//var Hylafax = require('hylafax-clip');
var Hylafax = require('../HylafaxClient');
var util = require('util');


function dump( res )
{
	console.log( 'Data: %s', util.inspect(res) );
};

var options =
{
	host: 'myserver'
	,port: 4559
	,username: 'myusr'
	,password: 'mypwd'
};


var hylafax = new Hylafax( options );



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
.then( function( data )
{
	hylafax.disconnect();
},
function( err )
{
	console.log( 'Error occurred: %s', err );
	hylafax.disconnect();
});

