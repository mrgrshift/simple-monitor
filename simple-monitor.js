/////// simple-monitor
////// simple one clic access to monitor your delegate(s)

//configure your own delegate(s) with your actual missed cycles
var missedBlocks_config = {
        "delegate1" : 10,
        "delegate2" : 1,
        "delegate3" : 5
        }

//Define a port you want to listen to
const PORT=8080;


//////css : green, yellow dots
var css = "<style>.green {  height: 10px;  width: 15px;  display: inline;  text-align: center;  vertical-align: middle;  border-radius: 50%;  background: #5cd65c;}"
css = css + " .yellow {  height: 10px;  width: 15px;  display: inline;  text-align: center;  vertical-align: middle;  border-radius: 50%;  background: yellow;}</style>";

var http = require('http');
var pg = require('pg');

var conString = 'postgres://shift:testing@localhost/shift_db';
var queryString = "select u_username, missedblocks from mem_accounts where u_username IN ";
var queryActualBlock = "select height from blocks order by height desc limit 1";

var monitor = "<html>"+ css +"<body><h1>";
var resultDelegates = "";
var resultBlock = "";

//Extract delegates to monitor
var fi = true; //flag for first iteration
for (var mbc in missedBlocks_config){
    if ( missedBlocks_config.hasOwnProperty(mbc)) {
	if(fi){ queryString = queryString + "('"+ mbc +"'"; fi = false;}
	else queryString = queryString + ",'"+ mbc +"'";
    }
}
queryString = queryString + ")"; //end of the query


function onConnect(err, client, done) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var query = client.query(queryString);
  query.on("row", function (row, result) {
    result.addRow(row);
  });

  query.on("end", function (result) {
    resultDelegates = JSON.stringify(result.rows, null, "    ");
    done();
  });
}

function onBlock(err, client, done) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var query = client.query(queryActualBlock);
  query.on("row", function (row, result) {
    result.addRow(row);
  });

  query.on("end", function (result) {
    resultBlock = JSON.stringify(result.rows, null, "    ");
    done();
  });
}


//We need a function which handles requests and send response
function handleRequest(request, response){
 monitor = "<!DOCTYPE html><html><head>" + css + "</head><body><h1>Monitor<br>";
 pg.connect(conString, onConnect); 
 if(resultDelegates){
    var json = JSON.parse(resultDelegates);
	for (var i = 0, len = json.length; i < len; i++) {
	  if(missedBlocks_config[json[i].u_username] == json[i].missedblocks){
		monitor = monitor + "<span class=green>&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;";
	  }else{
		monitor = monitor + "<span class=yellow>&nbsp;+" + (json[i].missedblocks - missedBlocks_config[json[i].u_username])+"&nbsp;</span>&nbsp; Missed by -> ";
	  }
	  monitor = monitor + json[i].u_username +"<br>";
	}	
 }

 pg.connect(conString, onBlock);
 if(resultBlock){
	var block = JSON.parse(resultBlock);
	monitor = monitor + "Actual block = " + block[0].height;
 }

 monitor = monitor + "<br><input type='button' value='Refresh' onclick='javascript:location.reload();'>";
 response.end(monitor);
}

//Create a server
var server = http.createServer(handleRequest);

//Start our server
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});




