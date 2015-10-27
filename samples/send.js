var Hylafax = require('hylafax-clip');
var fs = require('fs');

var faxfile = 'path_to_my_FAX.pdf';
var faxnum = '++phone_number+++';


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
	return hylafax.sendFax( { number: faxnum }, fs.createReadStream( faxfile ));
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


