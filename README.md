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
The options to sendFax are the following:

Option|Description|Default Value
------|-----------|-------------
user|Username of the client|'NodeJS Hylafax Client'
dial_attempts|The maximum number of times to dial the phone|3
tries|The maximum number of times to retry sending a job once connection is established|3
notification_address|email adress where to send notifications|root@localhost
notify|Controls the email notification messages from the server. Possible values: "none" - notify if error only, "done" - notify when done, "requeue" - notify if job is re-queued, "done+requeue"|none
information|client job tag| 'Hylafax Client Information'
last_time|Kill the job if not successfully sent after this much time in 'DDHHSS' format||'000259' (three hours)
scheduled_priority|The scheduling priority to assign to the job|127
vres|Set the vertical resolution in lines/inch to use when transmitting facsimile. High resolution equals to "196", low resolution equals to "98"|196
page_width|Set the transmitted page width in millimeters|209
page_length|Set the transmitted page length in millimeters|296
