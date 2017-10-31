# witness-notify
Created by [@mahdiyari](https://steemit.com/@mahdiyari) for Sending Notification for Missed Blocks to [Discord Channel](https://discord.gg/QfRpwte) and [#witness-blocks](https://steemit.chat/channel/witness-blocks) Channel in steemit.chat
***
#### Install:
You must Change database.php file and Import database.sql to your database.
You must change index.js and run it on a VPS or etc. (nodejs)
you must change cronjob-1minute.php (channels name,channels id,user,password,bot token,Server URL)
you must change cronjob-24hour.php (Server URL)

Create Cronjobs for running cronjob-1minute.php every minutes and cronjob-24hour.php every 24 hours (Daily)
