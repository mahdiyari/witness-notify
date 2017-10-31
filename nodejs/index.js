const Eris = require("eris"); //Discord Bot
const http = require('http'); //Running on a Port
const steem = require('steem'); //Steem Lib
var request = require('request'); //sending Post Request
var url = require('url'); //Get params From URL

const hostname = '0.0.0.0';
const port = 444; // Script Will Listen to This Port 
var bot = new Eris("Token Here"); //Discord Bot Token

var channelid='Spicific Discord Channel ID for Sending Message'; // Change it
var channel-name = '#witness-blocks'; // Channel name in steemit.chat

var username = 'witness-notify'; // Steemit.chat Bot
var password = 'Super Secret Password'; // Steemit.chat Bot's Password

const server = http.createServer((req, res) => { // create Server
		var params = url.parse(req.url,true).query;
		var type;
		var block;
		var miss;
		var uname;
		var user;
		var userid;
		var mention;
		if(params.id == 1){ // Return top 200 Witnesses List
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			var last;
			var out={};
			var output=[];
			steem.api.getWitnessesByVote('', 100, function(err, result) { //Get First 100 Witnesses (1-100)
				last = result[99].owner;
				var k =0;
				for(i in result){
					output[k] = {'owner':result[i].owner,'miss':result[i].total_missed,'last_confirm':result[i].last_confirmed_block_num};
					k =k+1;
				}
				steem.api.getWitnessesByVote(last, 100, function(err, result) { // Get Second 100 Witnesses (100-200)
					for(i in result){
						output[k] = {'owner':result[i].owner,'miss':result[i].total_missed,'last_confirm':result[i].last_confirmed_block_num};
						k =k+1;
					}
					setTimeout(function(){res.end(JSON.stringify(output));},1000);
				});
			});
			
			
		}else if(params.id == 2){ // Send Message to Steemit.chat
			if(params){
				user = params.u;
				uname = params.uname;
				type = params.type;
				block = params.block;
				miss = params.miss;
			}
			if(uname != 0 && uname != null && uname != undefined){
				mention = '@'+uname;
			}else{
				mention = '';
			}
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/html');
			var time = new Date();
			
				var token;
				var userid;
				var options = {url: 'https://steemit.chat/api/v1/login/',method: 'POST',form: {'user':username,'password':password}}
				request(options, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						// Print out the response body
						var bod = JSON.parse(body);
						token = bod['data'].authToken;
						userid = bod['data'].userId;
						var headers = {'X-Auth-Token': token,'X-User-Id': userid,'Content-type': 'application/json'};
						if(type ==1){
							msg = mention+' Witness '+user+' Missed a Block. Total Miss= '+miss+'. '+time;
						}else{
							msg = mention+' Witness '+user+' Recovered on block \#'+block+'. Total Miss= '+miss;
						}
						var options1 = {url: 'https://steemit.chat/api/v1/chat.postMessage/',method: 'POST',headers: headers,form: {"channel": channel-name, "text": msg}};
						request(options1, function (error, response, body) {
							res.end('1');
						});
					}
				});
	
		}else{ // Send Message to Discord channel
			if(params){
				user = params.u;
				userid = params.id;
				type = params.type;
				block = params.block;
			}
			if(userid != 0 && userid != null && userid != undefined){
				mention = '<@'+userid+'>';
			}else{
				mention = '';
			}
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/html');
			var time = new Date();
			if(type == 1){
				setTimeout(function(){bot.createMessage(channelid,mention+' Witness @'+user+' Missed a Block. '+time)},1000);
				res.end('done');
			}else if(type == 2){
				setTimeout(function(){bot.createMessage(channelid,mention+' Witness @'+user+' Recovered on block \#'+block)},1000);
				res.end('done');
			}
		}
});

bot.connect(); 

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});