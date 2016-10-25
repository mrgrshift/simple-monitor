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

////Config email section
var emailFrom = "youremail@gmail.com";  //insert your email where you will sent the email
var emailPass = "emailpassword"; //insert the email's password
var emailsmtp = "smtp.gmail.com"; //your smtp server of choice
var nameFrom = "Delegate Monitor"; //name of the sender mail

var emailTo = "youremailto@gmail.com"; //recipient's email

var subjectPrefix = "Alert - "; //Prefix for identifying all emails (besides the sender). Will concatenate after the actual date & hour

//Configure according to your time zone. Remember the Date & Time is from your server, now you need to deduct the hour to get to your time zone
var offset = -5;
/////////////////////////////////

var actualDate = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
//ourput format "Tue, 25 Oct 2016 10:11:20"






//////css : green, yellow dots
var css = "<style>.green {  height: 10px;  width: 15px;  display: inline;  text-align: center;  vertical-align: middle;  border-radius: 50%;  background: #5cd65c;}"
css = css + " .yellow {  height: 10px;  width: 15px;  display: inline;  text-align: center;  vertical-align: middle;  border-radius: 50%;  background: yellow;}</style>";

var nodemailer = require('nodemailer');
var http = require('http');
var pg = require('pg');

var conString = 'postgres://shift:testing@localhost/shift_db';
var queryString = "select u_username, missedblocks from mem_accounts where u_username IN ";
var queryActualBlock = "select height from blocks order by height desc limit 1";
var transporter = nodemailer.createTransport('smtps://'+ emailFrom +':'+ emailPass +'@'+emailsmtp);

var monitor = "";
var resultDelegates = "";
var resultBlock = "";
var mailSent = {};
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

  var query2 = client.query(queryActualBlock);
      query2.on("row", function (row, result2) {
        result2.addRow(row);
      });

      query2.on("end", function (result2) {
        resultBlock = JSON.stringify(result2.rows, null, "    ");
        done();
      });
}



function sendMail(msgPlain, msgHTML){ //msgPlain for quick view. msgHTML full message
    actualDate = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
    var mailOptions = {
        from: '"'+ nameFrom +'" <'+ emailFrom +'>', // sender address
        to: emailTo, // list of receivers
        subject: subjectPrefix + actualDate, // Subject line
        text: msgPlain, // plaintext body
        html: msgHTML // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log(actualDate + ' - Message sent: ' + info.response);
    });
}


//Function check database every 27 seconds
setInterval(function() {
    var msg1 = "";
    var msg2 = "";
    
    pg.connect(conString, onConnect);

    setTimeout(function(){
         monitor = "<!DOCTYPE html><html><head>" + css + "</head><body><h1>Monitor<br>";
         if(resultBlock){
            var block = JSON.parse(resultBlock);
            monitor = monitor + "Actual block = " + block[0].height +"<br>";
         }

         if(resultDelegates){
            var json = JSON.parse(resultDelegates);
            for (var i = 0, len = json.length; i < len; i++) {
              if(missedBlocks_config[json[i].u_username] == json[i].missedblocks){
                monitor = monitor + "<span class=green>&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;";
              }else{
                monitor = monitor + "<span class=yellow>&nbsp;+" + (json[i].missedblocks - missedBlocks_config[json[i].u_username])+"&nbsp;</span>&nbsp; Missed by -> ";
                  //check if the mail has already been sent
                  if(mailSent[json[i].u_username] != undefined){
                      if(mailSent[json[i].u_username] != (json[i].missedblocks - missedBlocks_config[json[i].u_username])){
                          mailSent[json[i].u_username] = (json[i].missedblocks - missedBlocks_config[json[i].u_username]);
                          msg1 = "Delegate "+json[i].u_username+" missed "+ (json[i].missedblocks - missedBlocks_config[json[i].u_username]) +" blocks";
                          msg2 = msg2 + "Please check your delegate <b>"+json[i].u_username+"</b> missed "+ (json[i].missedblocks - missedBlocks_config[json[i].u_username]) +" blocks<br>";
                      }
                  }else{
                      mailSent[json[i].u_username] = (json[i].missedblocks - missedBlocks_config[json[i].u_username]);
                      msg1 = "Delegate "+json[i].u_username+" missed "+ (json[i].missedblocks - missedBlocks_config[json[i].u_username]) +" blocks";
                      msg2 = msg2 + "Please check your delegate <b>"+json[i].u_username+"</b> missed "+ (json[i].missedblocks - missedBlocks_config[json[i].u_username]) +" blocks<br>";
                  }
              }
              monitor = monitor + json[i].u_username +"<br>";
            }	
         }

         monitor = monitor + "<br><input type='button' value='Refresh' onclick='javascript:location.reload();'>";    
    
        if(msg1){
            //send email
            sendMail(msg1,msg2);
        }
    }, 3000);
}, 27000);



function handleRequest(request, response){
    response.end(monitor);
}

//Create a server
var server = http.createServer(handleRequest);

//Start our server
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});


