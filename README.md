#simple-monitor
Simple one-click access to monitor your delegate(s)

##Requirements
Before run the simple-monitor please install the following packages:<br>
    - npm install pg
    - npm install nodemailer

##Installation
Execute the following commands
```
cd ~/
git clone https://github.com/mrgrshift/simple-monitor
cd simple-monitor/
```
##Delegate(s) Configuration
Now you need to edit the file simple-monitor.js and change the following lines:
```
var missedBlocks_config = {
    "delegate1" : 10,
    "delegate2" : 1,
    "delegate3" : 5
}
```
Put your own delegate(s) in the list and the actual missed blocks.

And change to the port of your choice
`const PORT=8080`

When you miss a block, the monitor will change the green light to yellow and will tell you how many blocks you are missing.

After you correct your delegate and you seeing in green again in the explorer, you need to change again manually the variable missedBlocks_config to add the new missed blocks.

##Email configuration
Change the following lines so you can receive email:
```
var emailFrom = "youremail@gmail.com";  //insert your email where you will sent the email
var emailPass = "emailpassword"; //insert the email's password
var emailsmtp = "smtp.gmail.com"; //your smtp server of choice
var nameFrom = "Delegate Monitor"; //name of the sender mail

var emailTo = "youremailto@gmail.com"; //recipient's email

var subjectPrefix = "Alert - "; //Prefix for identifying all emails (besides the sender). Will concatenate after the actual date & hour
```
Change the lines as the comments indicate

##Your Time Zone
Configure according to your time zone. Remember the Date & Time is from your server, now you need to deduct the hour to get to your time zone.
Change the variable `offset`, remember the server's time zone is UTC.<br>
`var offset = -5;`

##Run the monitor
For the simple use, create a new screen with command:<br>
`screen -S serverMonitor`<br>
Inside the screen go to folder simple-monitor and execute:<br>
`node simple-monitor.js`<br>
Then go to your browser (PC or phone) and type the IP of your server and your chosen port.




####Notice
This monitor don't auto-reload/auto-refresh, for that please use the button `Refresh`. Remember to wait at least 27 seconds.
