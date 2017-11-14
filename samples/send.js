// var Hylafax = require('hylafax-clip');
var Hylafax = require('../HylafaxClient');
var fs = require('fs');

var faxfile = 'path_to_my_FAX.pdf';
// var faxnum = 'phone_num';
// var faxnum = 'phone_num_1;phone_num_2';
var faxnum = ['phone_num_1','phone_num_2'];


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
	console.log( 'Sending to %s document %s', faxnum, faxfile );
	return hylafax.sendFax( { number: faxnum }, fs.createReadStream( faxfile ));
})
.then( function( data )
{
	console.log( 'File sent: %s', data );
	hylafax.disconnect();
},
function( err )
{
	console.log( 'Error occurred: %s', err );
	hylafax.disconnect();
});


