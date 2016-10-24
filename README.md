#simple-monitor
Simple one-click access to monitor your delegate(s)

##Installation & Usage
Execute the following commands
```
cd ~/
git clone https://github.com/mrgrshift/simple-monitor
cd simple-monitor/
```
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


###Run the monitor
For the simple use, create a new screen with command:
`screen -S serverMonitor`
Inside the screen go to folder simple-monitor and execute:
`node simple-monitor.js`
Then go to your browser (PC or phone) and type the IP of your server and your chosen port.


