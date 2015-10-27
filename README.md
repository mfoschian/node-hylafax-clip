# node-hylafax-clip
Hylafax client module with Promise interface

based on work of Dan Jenkins <dan.jenkins@holidayextras.com> (www.dan-jenkins.co.uk)

and module git://github.com/danjenkins/node-ftp.git

# Installing
```
npm install hylafax-clip
```

# Usage

<a name="sendFax" />
## sendFax( options, stream )

```js

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
```

### options
options.user = options.user || 'NodeJS Hylafax Client';
options.dial_attempts = options.dial_attempts || 3;
options.tries = options.tries || 3;
options.notification_address = options.notification_address || 'root@localhost';
options.information = options.information || 'Hylafax Client Information';
options.last_time = options.last_time || '000259';
options.scheduled_priority = options.scheduled_priority || '127';
options.vres = options.vres || '196';
options.page_width = options.page_width || '209';
options.page_length = options.page_length || '296';
options.notify = options.notify || 'none';
options.page_chop = options.page_chop || 'default';
options.chop_threshold = options.chop_threshold || '';
