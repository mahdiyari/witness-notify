
const steem = require('steem'); //Steem Lib
var request = require('request'); //sending Post Request
var mysql = require('mysql');
var cloudscraper = require('cloudscraper');
const Eris = require("eris"); //Discord Bot

var con = mysql.createConnection({host: "127.0.0.1",user: "user",password: "1234",database: "witnesses"});
steem.api.setOptions({ url: 'ws://NODE' });

steem.api.streamBlockNumber(function (err1, newestblock) {
    console.log(newestblock);
});


//discord
var bot = new Eris("discord_token"); //Discord Bot Token
var channelid='discord_channel_id'; // Change it

//steemit.chat
var channelname = '#witness-blocks'; // Channel name in steemit.chat
var botname = 'Username'; // Steemit.chat Bot
var botpass = '1234'; // Steemit.chat Bot's Password

function getallwitnesses(){
	steem.api.getWitnessesByVote('', 100, function(err, result) { //Get First 100 Witnesses (1-100)
		var last = result[99].owner;
		for(i in result){
			add(result[i].owner,result[i].total_missed);
		}
		steem.api.getWitnessesByVote(last, 100, function(err, result) { // Get Second 100 Witnesses (100-200)
			for(i in result){
				add(result[i].owner,result[i].total_missed);
			}
		});
	});
	return 1;
}

getallwitnesses();

setInterval(function(){ //add new witnesses to database
	getallwitnesses();
},43200000);

function add(witness,total_missed){ //checking and adding
	con.query('SELECT EXISTS(SELECT * FROM `witnesses` WHERE `user`="'+witness+'")', function (error, results, fields) {	
		for(k in results){
			for(j in results[k]){
				var x = results[k][j];
				if(x == 0){
					con.query('INSERT INTO `witnesses`(`user`,`totalmiss`) VALUES ("'+witness+'","'+total_missed+'")', function (error, results, fields) {
					});
				}
			}
		}
	});
	
	return 1;
}

setInterval(function(){//checking for missed blocks or recovered blocks
	con.query('SELECT EXISTS(SELECT * FROM `witnesses`)', function (error, results, fields) {
		for(k in results){
			for(j in results[k]){
				var x = results[k][j];
				if(x == 1){
					con.query('SELECT * FROM `witnesses`', function (error, results, fields) {
						if(!error){
							for(i in results){
								var witness = results[i].user;
								var mention = results[i].mention;
								var totalmiss = results[i].totalmiss;
								var lastconfirm = results[i].lastconfirm;
								var missed = results[i].missed;
								if(mention == 1){
									var username = results[i].username;
								}else{
									var username = 0;
								}
								check(witness,mention,totalmiss,lastconfirm,missed,username);
							}
						}
					});
				}
			}
		}
	});
},120000);

var delay = 0;
function check(witness,mention,totalmiss,lastconfirm,missed,username){ //checking function
	delay = delay+1;
	setTimeout(function(){
		steem.api.getWitnessByAccount(witness, function(err, result) {
			if(!err && result){
				if(result.total_missed > totalmiss){
					var newmissed = result.total_missed - totalmiss;
					printmissed(witness,mention,username,result.total_missed,result.last_confirmed_block_num,newmissed);
				}else if(missed == 1){
					if(result.last_confirmed_block_num > lastconfirm){
						printrecovered(witness,mention,username,result.last_confirmed_block_num,result.total_missed);
					}
				}
			}
			
		});
		delay=delay-1;
	},100*delay);
	return 1;
}

function printmissed(witness,mention,username,total_missed,last_confirmed,newmissed){ // printing missed blocks
	var d = new Date();
	var time = d.getFullYear()+'-'+parseInt(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+' (UTC)';
	var token;
	var userid;
	if(mention){
		var ment = '@'+username;
	}else{
		var ment = '';
	}
	var options = {url: 'https://steemit.chat/api/v1/login/',method: 'POST',form: {'user':botname,'password':botpass}}
	cloudscraper.request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body
			var bod = JSON.parse(body);
			token = bod['data'].authToken;
			userid = bod['data'].userId;
			var headers = {'X-Auth-Token': token,'X-User-Id': userid,'Content-type': 'application/json'};
			var msg = ment+' Witness '+witness+' missed '+newmissed+' block. total miss= '+total_missed+'. '+time;
			var msg1 = 'Witness '+witness+' missed '+newmissed+' block. total miss= '+total_missed+'. '+time;
			var options1 = {url: 'https://steemit.chat/api/v1/chat.postMessage/',method: 'POST',headers: headers,form: {"channel": channelname, "text": msg}};
			cloudscraper.request(options1, function (error, response, body) {
				con.query('UPDATE `witnesses` SET `totalmiss`="'+total_missed+'" ,`missed`="1",`lastconfirm`="'+last_confirmed+'" WHERE `user`="'+witness+'"', function (error, results, fields) {
				});
				//send message in discord
				setTimeout(function(){bot.createMessage(channelid,msg1)},1000);
			});
			
		}
	});
	
	return 1;
}

function printrecovered(witness,mention,username,last_confirmed,total_missed){ //print recovered blocks
	var d = new Date();
	var time = d.getFullYear()+'-'+parseInt(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+' (UTC)';
	var token;
	var userid;
	if(mention){
		var ment = '@'+username;
	}else{
		var ment = '';
	}
	var options = {url: 'https://steemit.chat/api/v1/login/',method: 'POST',form: {'user':botname,'password':botpass}}
	cloudscraper.request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body
			var bod = JSON.parse(body);
			token = bod['data'].authToken;
			userid = bod['data'].userId;
			var headers = {'X-Auth-Token': token,'X-User-Id': userid,'Content-type': 'application/json'};
			var msg = ment+' Witness '+witness+' recovered on block '+last_confirmed+', total miss= '+total_missed+'. '+time;
			var msg1 = 'Witness '+witness+' recovered on block '+last_confirmed+', total miss= '+total_missed+'. '+time;
			var options1 = {url: 'https://steemit.chat/api/v1/chat.postMessage/',method: 'POST',headers: headers,form: {"channel": channelname, "text": msg}};
			cloudscraper.request(options1, function (error, response, body) {
				con.query('UPDATE `witnesses` SET `missed`="0", `totalmiss`="'+total_missed+'" WHERE `user`="'+witness+'"', function (error, results, fields) {
				});
				//send message in discord
				setTimeout(function(){bot.createMessage(channelid,msg1)},1000);
			});
		}
	});
	
	return 1;
}

bot.connect(); //discord bot connect

setInterval(function () { //keep connection alive
	con.query('SELECT 1', function (error, results, fields) {});
}, 5000);
