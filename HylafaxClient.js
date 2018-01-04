/*
	Derived from hylafax-client of Dan Jenkins <dan.jenkins@holidayextras.com> (www.dan-jenkins.co.uk)
	and module git://github.com/danjenkins/node-ftp.git
*/

var FTPClient = require('./lib/ftp');
var events = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');

var Promise = require('promise');

module.exports = HylafaxClient;

util.inherits(HylafaxClient, events);


function HylafaxClient(params){
	var self = this;
	var params = params || {};
	self.host = params.host || 'localhost';
	self.hostIp = params.host || '127.0.0.1';
	self.port = params.port || 4559;
	self.username = params.username || '';
	self.password = params.password || '';
	self.split_char = params.split_char || ';';

	//http://www.hylafax.org/man/6.0/hfaxd.1m.html
	//going to use the send functionality in this module and it's callback methodology
	var ftp_opts = { host: self.host, port: self.port };
	if( params.debug )
		ftp_opts.debug = params.debug;

	self.ftp = new FTPClient(ftp_opts);
	self.ftp.on('error', function(e)
	{
	   console.log( 'FTP Error: %s',e );
	});

}

HylafaxClient.prototype.connect = function()
{
	var self = this;

	var p = new Promise( function( resolve, reject )
	{
		self.ftp.on('connect', function() {
			self.ftp.send('USER', self.username, function(err, res){
				if( err ) {
					reject( err );
					return;
				}
				if(self.password != ''){
					self.ftp.send('PASS', self.password, function(error, response){
						if( error ){
							reject( error );
							return;
						}
						self.ftp._state = 'authorized';
						//self.emit('ready');
						resolve();
						return;
					});
				}else{
					//self.emit('ready');
					resolve();
					return;
				}
			});
		});
	   
		self.ftp.connect();
   });
   
   return p;
}

HylafaxClient.prototype.disconnect = function(){
  this.ftp.end();
	return Promise.resolve();
}

HylafaxClient.prototype._send = function( command, arg ){
	var self = this;
	return new Promise( function( resolve, reject ) {
		self.ftp.send(command, arg, function(err, res){
			if( err )
				reject( err );
			else
				resolve( res );
		});
	});
}


HylafaxClient.prototype.help = function(command){
	return this._send('HELP', command);
}


HylafaxClient.prototype.loginAdmin = function(pass){
	return this._send('ADMIN', pass);
};

function pipeSplit(data)
{
	return data.split('|');
}
function pipeJoin(data)
{
	return data.join('|');
}

function spaceSplit(data)
{
	return data.split(' ');
}


HylafaxClient.prototype.getRecievedFormat = function(){
  /*
  RcvFmt        The format string to use when returning status information for the -r option.  Formats are specified using printf(3S)-style  con-
  ventions but using the field identifiers listed below.  Each item can include field width, precision, left-justification, 0-fill-
  ing, etc. just as for printf; e.g. %-3b for a 3-character wide, left-justified,  blank-padded  field  containing  the  signalling
  rate.

  Format    Description
  Y         Extended representation of the time when the receive happened
  a         SubAddress received from sender (if any)
  b         Signalling rate used during receive
  d         Data format used during receive
  e         Error description if an error occurred during receive
  f         Document filename (relative to the recvq directory)
  h         Time spent receiving document (HH:MM:SS)
  i         CIDName value for received fax
  j         CIDNumber value for received fax
  l         Page length in mm
  m         Fax-style protection mode string (‘‘-rwxrwx’’)
  n         File size (number of bytes)
  o         File owner
  p         Number of pages in document
  q         UNIX-style protection flags
  r         Resolution of received data
  s         Sender identity (TSI)
  t         Compact representation of the time when the receive happened
  w         Page width in mm
  z         A ‘‘*’’ if receive is going on; otherwise ‘‘ ’’ (space)

  It  is  recommended  that  all items include a field width so that the width of column title strings can be constrained when con-
  structing headers from the format string.
  */

  	return this._send('RCVFMT');
};

HylafaxClient.prototype.setRecievedFormat = function(format){
	return this._send('RCVFMT', '"' + format + '"');
};

HylafaxClient.prototype.prepareRecievedFormat = function(format)
{
	var self = this;
	var fmt = [ '%j','%i','%a','%o','%e','%P','%D','%z','%s', '%J' ];
	var p = this.setRecievedFormat( pipeJoin( fmt ) ).then( function() { return fmt; });

	return p;
};

HylafaxClient.prototype.getJobFormat = function(){
  
  /*
  JobFmt        The  format  string  to  use  when  returning  job  status  information  for  the -s and -d options.  Formats are specified using
  printf(3S)-style conventions but using the field identifiers listed below.  Each item can include field width,  precision,  left-
  justification,  0-filling, etc. just as for printf; e.g. %-3j for a 3-character wide, left-justified, blank-padded field contain-
  ing the job state.

  Format    Description
  A         Destination SubAddress
  B         Destination Password
  C         Destination company name
  D         Total # dials/maximum # dials
  E         Desired signalling rate
  F         Client-specific tagline format string
  G         Desired min-scanline time
  H         Desired data format
  I         Client-specified scheduling priority
  J         Client-specified job tag string
  K         Desired use of ECM (one-character symbol)
  L         Destination geographic location
  M         Notification e-mail address
  N         Desired use of private tagline (one-character symbol)
  O         Whether to use continuation cover page (one-character symbol)
  P         # pages transmitted/total # pages to transmit
  Q         Client-specified minimum acceptable signalling rate
  R         Destination person (receiver)
  S         Sender’s identity
  T         Total # tries/maximum # tries
  U         Page chopping threshold (inches)
  V         Job done operation
  W         Communication identifier
  X         Job type (one-character symbol)
  Y         Scheduled date and time
  Z         Scheduled time in seconds since the UNIX epoch
  a         Job state (one-character symbol)
  b         # consecutive failed tries
  c         Client machine name
  d         Total # dials
  e         Public (external) format of dialstring
  f         # consecutive failed dials
  g         Group identifier
  h         Page chop handling (one-character symbol)
  i         Current scheduling priority
  j         Job identifier
  k         Job kill time
  l         Page length in mm
  m         Assigned modem
  n         E-mail notification handling (one-character symbol)
  o         Job owner
  p         # pages transmitted
  q         Job retry time (MM::SS)
  r         Document resolution in lines/inch
  s         Job status information from last failure
  t         Total # tries attempted
  u         Maximum # tries
  v         Client-specified dialstring
  w         Page width in mm
  x         Maximum # dials
  y         Total # pages to transmit
  z         Time to send job
  */


  return this._send('JOBFMT', null );
};

HylafaxClient.prototype.setJobFormat = function(format){
	return this._send('JOBFMT', '"' + format + '"');
};

HylafaxClient.prototype.prepareJobFormat = function(format)
{
	var self = this;
	var fmt = [ '%j','%i','%a','%o','%e','%P','%D','%z','%s','%M','%J','%T','%V','%Y','%d','%q'];
	var p = this.setJobFormat( pipeJoin( fmt ) ).then( function() { return fmt; });

	return p;
};

HylafaxClient.prototype.getFileFormat = function(){
  
  /*
  The format string to use when returning file status information with the -f option.  Formats are specified using printf(3S)-style conventions but using the field identifiers listed below.
  Each item can include field width, precision, left-justification, 0-filling, etc. just as for printf; e.g. %-8p for an 8-character wide, left-justified, blank-padded field containing the file protection flags.

  Format    Description
  a         Last access time
  c         Creation time
  d         Device number (octal)
  f         Filename
  g         Group identifier (decimal)
  i         Inode number (decimal)
  l         Link count (decimal)
  m         Last modification time
  o         Owner (based on file GID)
  p         Fax-style protection flags (no group bits)
  q         UNIX-style protection flags
  r         Root device number (octal)
  s         File size in bytes (decimal)
  u         User identifier (decimal)
  */

	return this._send('FILEFMT');
};

HylafaxClient.prototype.setFileFormat = function(format){
	return this._send('FILEFMT', '"' + format + '"');
};

HylafaxClient.prototype.prepareFileFormat = function(format)
{
	var self = this;
	var fmt = [ '%f','%l','%a','%c','%o','%s'];
	var p = this.setFileFormat( pipeJoin( fmt ) ).then( function() { return fmt; });

	return p;
};

HylafaxClient.prototype.getModemFormat = function(){
  
  /*
  ModemFmt      The  format  string to use when returning modem status information.  Formats are specified using printf(3S)-style conventions but
  using the field identifiers listed below.  Each item can include field width, precision, left-justification, 0-filling, etc. just
  as  for  printf; e.g. %-8h for an 8-character wide, left-justified, blank-padded field containing the name of the host the server
  is running on.

  Format    Description
  h         Server hostname
  l         Local identifier string
  m         Canonical modem name
  n         FAX phone number
  r         Maximum pages that can be received in a single call
  s         Status information string
  t         Server and session tracing levels (xxxxx:yyyyy)
  v         Modem speaker volume as one-character symbol
  z         A ‘‘*’’ if a faxgetty(8C) process is running; otherwise ‘‘ ’’ (space)
  */

	return this._send('MDMFMT');
};

HylafaxClient.prototype.setModemFormat = function(format){
	return this._send('MDMFMT', '"' + format + '"');
};

HylafaxClient.prototype.prepareModemFormat = function(format)
{
	var self = this;
	var myFormat = ['%h','%l','%m','%n','%s','%t','%v','%z'];
	var p = this.setModemFormat( pipeJoin( myFormat ) ).then( function() { return myFormat; });
	return p;
};

var ModemFieldMap =
{
	'h': 'hostname'
	,'l': 'syslabel'
	,'m': 'name'
	,'n': 'number'
	,'r': 'max_pages' // do not work!
	,'s': 'status'
	,'t': 'trace'
	,'v': 'volume'
	,'z': 'can_recieve'
};

HylafaxClient.prototype._decodeModemFormat = function(format)
{
	var field_name = ModemFieldMap[format];
	return field_name;
};

HylafaxClient.prototype._decodeModemInfo = function(letter, value)
{
	if( letter == 'z' )
		return ( value === '*' ? true : false );
	else
		return value || '';
};

//-----------------------------
// JOBS
//-----------------------------
//{

HylafaxClient.prototype.getRecievedJobs = function(){
	var self = this;
	var p = this.prepareRecievedFormat().then( function(format) {
		return self._list('recvq').then( function(data){
			return self._processJobs(data, format, 'recieved');
		});
	});

	return p;
};

HylafaxClient.prototype.getArchivedJobs = function(){
	var self = this;
	var p = this.prepareJobFormat().then( function( format )
	{
		return self._list('archive').then( function(data){
			return self._processJobs(data, format, 'archived');
		});
    });
	return p;
};

HylafaxClient.prototype.getActiveJobs = function(){
	var self = this;
	var p = this.prepareJobFormat().then( function( format )
	{
		return self._list('sendq').then( function( data ) {
			return self._processJobs(data, format, 'active');
		});
	});
	
	return p;
};

HylafaxClient.prototype._transformJobFormat = function(format){
  var trans = '';
  switch(format){
    case 'A':
      trans = 'dest_sub_address';
      break;
    case 'B':
      trans = 'dest_password';
      break;
    case 'C':
      trans = 'dest_company_name';
      break;
    case 'D':
      trans = 'dials_vs_max_dials';
      break;
    case 'E':
      trans = 'desired_signalling_rate';
      break;
    case 'F':
      trans = 'client_tagline_format';
      break;
    case 'G':
      trans = 'desired_min_scanline_time';
      break;
    case 'H':
      trans = 'desired_data_format';
      break;
    case 'I':
      trans = 'client_priority';
      break;
    case 'J':
      trans = 'client_job_tag';
      break;
    case 'K':
      trans = 'desired_ecm';
      break;
    case 'L':
      trans = 'dest_geo_location';
      break;
    case 'M':
      trans = 'noti_email';
      break;
    case 'N':
      trans = 'desired_private_tagline';
      break;
    case 'O':
      trans = 'continuation_cover_page';
      break;
    case 'P':
      trans = 'pages_transmitted_vs_tota';
      break;
    case 'Q':
      trans = 'client_min_acceptable_signalling';
      break;
    case 'R':
      trans = 'dest_receiver';
      break;
    case 'S':
      trans = 'sender_identity';
      break;
    case 'T':
      trans = 'tries_vs_max_tries';
      break;
    case 'U':
      trans = 'page_chopping_threshold_inches';
      break;
    case 'V':
      trans = 'job_done';
      break;
    case 'W':
      trans = 'comms_identifier';
      break;
    case 'X':
      trans = 'job_type';
      break;
    case 'Y':
      trans = 'scheduled_date_time';
      break;
    case 'Z':
      trans = 'scheduled_unixtime';
      break;
    case 'a':
      trans = 'job_state';
      break;
    case 'b':
      trans = 'consec_failed_reties';
      break;
    case 'c':
      trans = 'client_machine_name';
      break;
    case 'd':
      trans = 'total_dials';
      break;
    case 'e':
      trans = 'public_dialstring';
      break;
    case 'f':
      trans = 'consec_failed_dials';
      break;
    case 'g':
      trans = 'group';
      break;
    case 'h':
      trans = 'page_chop_handling';
      break;
    case 'i':
      trans = 'current_priority';
      break;
    case 'j':
      trans = 'job_id';
      break;
    case 'k':
      trans = 'job_kill_time';
      break;
    case 'l':
      trans = 'page_length';
      break;
    case 'm':
      trans = 'modem';
      break;
    case 'n':
      trans = 'noti_email_handling';
      break;
    case 'o':
      trans = 'owner';
      break;
    case 'p':
      trans = 'pages_transmitted';
      break;
    case 'q':
      trans = 'job_retry_time';
      break;
    case 'r':
      trans = 'doc_resolution';
      break;
    case 's':
      trans = 'job_status_from_failure';
      break;
    case 't':
      trans = 'total_tries';
      break;
    case 'u':
      trans = 'max_tries';
      break;
    case 'v':
      trans = 'client_dialstring';
      break;
    case 'w':
      trans = 'page_width';
      break;
    case 'x':
      trans = 'max_dials';
      break;
    case 'y':
      trans = 'total_pages_to_send';
      break;
    case 'z':
      trans = 'time_to_send_job';
      break;
    default:
      trans = 'undefined';
      break;
  }
  return trans;
}

HylafaxClient.prototype._transformJobResponse = function(letter, value){
    switch(letter){
      case 'K':
        switch(value){
          case 'D':
            value = 'disabled';
            break;
          case '':
            value = 'enabled';
            break;
          case 'H':
            value = 'T.30 Annex C half duplex';
            break;
          case 'F':
            value = 'T.30 Annex C full duplex';
            break;
        }
        break;
      case 'N':
        /*
  The  N  format produces: ‘‘ ’’ (space) if the system-wide tagline format is to be used or ‘‘P’’ if a private tagline format is to
  be used.
        */
        break;
      case 'O':
  /*
  The O format produces: ‘‘N’’ if no continuation cover page is to be used or ‘‘ ’’ (space) if the system default 
  handling for continuation cover pages is to be used.
  */
        break;
      case 'X':
        switch(value){
          case 'F':
            value = 'fax';
            break;
          case 'P':
            value = 'pager';
            break;
        }
        break;
      case 'a':
        switch(value){
          case '?':
            value = 'undefined state';
            break;
          case 'T':
            value = 'suspended';
            break;
          case 'P':
            value = 'pending';
            break;
          case 'S':
            value = 'sleeping';
            break;
          case 'B':
            value = 'blocked';
            break;
          case 'W':
            value = 'waiting';
            break;
          case 'R':
            value = 'running';
            break;
          case 'D':
            value = 'done';
            break;
          case 'F':
            value = 'failed';
            break;
        }
        break;
      case 'h':
  /*
    The  h  format  produces: ‘‘D’’ if page chopping is disabled, ‘‘ ’’ (space) for the system default page chop handling, ‘‘A’’ when
  all pages are to be chopped, or ‘‘L’’ if only the last page is to be chopped.
  */
        break;
      case 'n':
        /*
  The n format produces: ‘‘ ’’ (space) when no notification messages are to be delivered, ‘‘D’’ when notification  is  to  be  sent
  when  the  job  is done, ‘‘Q’’ when notification is to be sent each time the job is requeued, or ‘‘A’’ when notification is to be
  sent for either the job completing or being requeued.
        */
        break;

    }
  return value;
};

HylafaxClient.prototype.getCompletedJobs = function(){
	var self = this;
	var p = this.prepareJobFormat().then( function( format )
	{
		return self._list('doneq').then( function( data ) {
			return self._processJobs(data, format, 'completed');
		});
	});
	return p;
}

HylafaxClient.prototype._processJobs = function(data, format, status)
{
	var self = this;
	var items = {};
	for( var j=0; j<data.length; j++ )
	{
		var line = data[j];
		var infos = pipeSplit(line);
		if( infos.lenght != format.lenght )
			continue;

		var item = {};
		for(i = 0; i < format.length; i++)
		{
			var letter = /[A-Za-z]/.exec(format[i])[0];
			var info = infos[i];
			if( !info ) continue;

			var value = info.replace(/^\s\s*/, '').replace(/\s\s*$/, '');//trim
			var fieldName = self._transformJobFormat(letter);
			if( !fieldName ) continue;
			item[fieldName] = self._transformJobResponse(letter, value);
		}
		items[item.job_id] = item;
		items.job_status = status;
  }

  return Promise.resolve(items);
};

HylafaxClient.prototype.checkJob = function(jobId)
{
	var self = this;
	function getmyjob( jobs )
	{
		return jobs[jobId];
	}
	
	//check active jobs first
	var p = self.getActiveJobs().then( getmyjob )
	.then( function(job)
	{
		//if we still haven't got the job go to completed jobs
		return job || self.getCompletedJobs().then( getmyjob );
	}).then( function( job )
	{
		//if we still haven't got the job go to archived jobs
		return job || self.getArchivedJobs().then( getmyjob );
	}).then( function( job )
	{
		return job || Promise.reject( new Error('Job not found in Hylafax') );
	});

	return p;
}

//}

//-----------------------------
// 
//-----------------------------



HylafaxClient.prototype.getDocs = function(){
	return this._list('docq');
};

HylafaxClient.prototype.getExtraServerInfo = function(){
	return this._send('RETR', 'status/any.info');
};

HylafaxClient.prototype.setTimezoneToLocal = function(){
  //can be GMT or LOCAL
  return this._send('TZONE', 'LOCAL');
};

HylafaxClient.prototype._list = function(type){
	var self = this;
	return new Promise( function( resolve, reject ) {
		self.ftp.list(type, function(err, res){
			if( err )
				reject( err );
			else
				resolve( res );
		});
	});
}


//-----------------------------
// MODEM
//-----------------------------
//{
HylafaxClient.prototype._processModems = function(data, format)
{
	var self = this;
	var items = {};
	for( var j=1; j<data.length; j++ )
	{
		var line = data[j];
		var infos = pipeSplit(line);
		if( infos.lenght != format.lenght )
			continue;

		var item = {};
		for(i = 0; i < format.length; i++)
		{
			var letter = /[A-Za-z]/.exec(format[i])[0];
			var info = infos[i];
			if( !info ) continue;

			var value = info.replace(/^\s\s*/, '').replace(/\s\s*$/, '');//trim
			var fieldName = self._decodeModemFormat(letter);
			if( !fieldName ) continue;
			item[fieldName] = self._decodeModemInfo(letter, value);
		}
		items[item.name] = item;
  }
  
  return Promise.resolve(items);
};



HylafaxClient.prototype.getModemStatus = function(){
	var self = this;

	var p = this.prepareModemFormat().then( function( format )
	{
		return self._list('status').then( function( data )
		{
			return self._processModems( data, format );
		});
	});

	return p;
};

//}

HylafaxClient.prototype.sendType = function(type){
	return this._send('TYPE', type );
};

HylafaxClient.prototype.sendMode = function(mode){
	return this._send('MODE', mode );
};


HylafaxClient.prototype.sendFile = function( stream ) {
	var self = this;
	return new Promise( function( resolve, reject )
	{
		self.ftp.temp_put(stream, function(err, res) {
			if(err) {
				reject(err);
				return;
			}

			file = /\(FILE:\s([\/A-Za-z0-9.]+)\)/.exec(res);
			if(!file) {
				reject( new Error('No temporary file uploaded: ' +  res) );
				return;
			}

			var tempFileName = file[1];
			resolve( tempFileName );
		});
	});
};

HylafaxClient.prototype.newJob = function(options, dest, fileName) {
	var self = this;
	return self._send('JNEW')
		.then( function() { return self._send('JPARM', 'FROMUSER "' + options.user + '"'); })
		.then( function() { return self._send('JPARM', 'LASTTIME "' + options.last_time + '"'); })
		.then( function() { return self._send('JPARM', 'MAXDIALS "' + options.dial_attempts + '"'); })
		.then( function() { return self._send('JPARM', 'MAXTRIES "' + options.tries + '"'); })
		.then( function() { return self._send('JPARM', 'SCHEDPRI "' + options.scheduled_priority + '"'); })
		.then( function() { return self._send('JPARM', 'DIALSTRING "' + dest + '"'); })
		.then( function() { return self._send('JPARM', 'NOTIFYADDR "' + options.notification_address + '"'); })
		.then( function() { return self._send('JPARM', 'JOBINFO "' + options.information + '"'); })
		.then( function() { return self._send('JPARM', 'VRES "' + options.vres + '"'); })
		.then( function() { return self._send('JPARM', 'PAGEWIDTH "' + options.page_width + '"'); })
		.then( function() { return self._send('JPARM', 'PAGELENGTH "' + options.page_length + '"'); })
		.then( function() { return self._send('JPARM', 'NOTIFY "' + options.notify + '"'); })
		.then( function() { return self._send('JPARM', 'PAGECHOP "' + options.page_chop + '"'); })
		.then( function() { return self._send('JPARM', 'CHOPTHRESHOLD "' + options.chop_threshold + '"'); })
		.then( function() { return self._send('JPARM', 'DOCUMENT "' + fileName + '"'); })
		.then( function() { return self._send('JSUBM'); } )
		.then( function(response) {
			var jobid = /\d+/.exec(response)/1;
			return jobid;
		});
};

HylafaxClient.prototype.sendFax = function(options, stream){

	if(!stream){
		return Promise.reject( new Error('No file stream') );
	}

	if(!options){
		return Promise.reject( new Error('No options object'));
	}

	if(!options.number){
		return Promise.reject( new Error('No number to fax'));
	}

	var numbers = options.number;
	if( typeof(numbers) == 'string' ) {
		numbers = numbers.split( this.split_char );
	}
	else if( !Array.isArray( numbers ) ) {
		return Promise.reject( new Error('Wrong destination format') );
	}

	var opt = {};
	opt.user = options.user || 'NodeJS Hylafax Client';
	opt.dial_attempts = options.dial_attempts || 3;
	opt.tries = options.tries || 3;
	opt.notification_address = options.notification_address || 'root@localhost';
	opt.information = options.information || 'Hylafax Client Information';
	opt.last_time = options.last_time || '000259';
	opt.scheduled_priority = options.scheduled_priority || '127';
	opt.vres = options.vres || '196';
	opt.page_width = options.page_width || '209';
	opt.page_length = options.page_length || '296';
	opt.notify = options.notify || 'none';
	opt.page_chop = options.page_chop || 'default';
	opt.chop_threshold = options.chop_threshold || '';

	var self = this;
	var fileName = stream;
	//figure out what data we have, is it a string? is it an image in a buffer?
	//var zip = false;
	/*actions.push(function(cb){
	self.sendMode('Z', function(err, response){
	  zip = true;
	  cb(err, response);
	})
	});*/

	//console.log( 'HFaxCLI: sending fax to %s', options.number );

	return self.sendType('I').then( function() {

		if( typeof( fileName ) != 'string' ) {
			return self.sendFile( fileName );
		}
		else {
			return Promise.resolve( fileName );
		}
	})
	.then( function( fname ) {

		return numbers.reduce( function( p, dest ) {
			return p.then( function( jobs ) {
				return self.newJob( opt, dest, fname ).then( function( jobid ) {
					jobs.push( jobid );
					return jobs;
				});
			});

		}, Promise.resolve( [] ) );
	});
};

HylafaxClient.prototype.killFax = function(job_id, adminPass)
{
	if(!job_id)
	{
		return Promise.reject( new Error('No job specified'));
	}

	var self = this;
	var p = null;

	console.log( 'killing job %s', job_id );

	if( adminPass )
		p = this.loginAdmin( adminPass );
	else
		p = Promise.resolve();
		
	p = p.then( function() { return self._send('JKILL', job_id); });
	return p;
};
