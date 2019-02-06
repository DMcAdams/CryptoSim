//used for accessing CryptoCompare API
global.fetch = require('node-fetch');
//used to hold player info
let player = require("./src/players.js")
//used to make messages look pretty
const { Client, Attachment, RichEmbed } = require('discord.js');
//for I/O on json file
const fs = require("fs");

//URLs for currency thumbnails
const BITCOIN_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1024px-Bitcoin.svg.png";
const ETH_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/65px-Ethereum_logo_2014.svg.png";
const ETC_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Ethereum_Classic_Logo.svg/120px-Ethereum_Classic_Logo.svg.png";
const DOGE_URL = "https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Dogecoin_Logo.png/150px-Dogecoin_Logo.png";

module.exports = function (client, options) {
  //used to identify bot commands
  const Prefix = '!';
  //catch new messages in channel
  client.on('message', m => {
    //save message contents, remove extra spaces
    var msg = m;
    var content = m.content.trim();
    //gets the number of commands in a string
    var length = content.split(/[ \n]/).length;

    //if message starts with the command prefix
    if (content.toLowerCase().startsWith(Prefix.toLowerCase())){
      //if player not found in player.json
      if(!player[msg.member.id]){
        player[msg.member.id] = {
          name: msg.member.displayName,
          money: 10000,
          btc: 0.0,
          eth: 0.0,
          etc: 0.0,
          doge: 0.0
        };
      }
      fs.writeFile("./src/players.json", JSON.stringify(player), (err)=> {
        if (err) console.log(err);
      });
      //gets the first part of the command (buy, sell, ping, etc)
      var command = content.substring(Prefix.length).split(/[ \n]/)[0].toLowerCase().trim();

      //used to determine what command was entered
      switch(command) {
        case 'ping':
          //get list of currencies
          getList(msg).then((data) => {
            //send list to SendEmbed for output
            SendEmbed(msg, data);
          });
          break;
        case 'pong':
          //responds to !pong with !ping, triggering the !ping response
          msg.channel.send("!ping");
          break;
        //list player info
        case 'whoami':
          const whoami = new RichEmbed()
            .setTitle(msg.member.displayName)
            .setColor(0x019922)
            .setDescription('Here are your stats')
            .setThumbnail(msg.author.avatarURL)
            .addField("Money ", player[msg.member.id].money, true)
            .addField("Bitcoin ", player[msg.member.id].btc, true)
            .addField("Ethereum ", player[msg.member.id].eth, true)
            .addField("Ethereum Classic ", player[msg.member.id].etc, true)
            .addField("Dogecoin ", player[msg.member.id].doge, true)
            .setTimestamp();
          msg.channel.send(whoami);
          break;
        //command to purchase cryptocurrency with money
        case 'buy':
          //if wrong number of inputs given
          if (length != 3){
            msg.reply("Error: Wrong format");
          }

          //else continue as normal
          else{
            // Try/Catch for invalid inputs
            try{
              //get the name and amount of coin to purchase
              var name = content.substring(Prefix.length).split(/[ \n]/)[1].toLowerCase().trim();
              var amt = parseFloat(content.substring(Prefix.length).split(/[ \n]/)[2].toLowerCase().trim());
              //send to buy function
              buy(msg, name, amt);
            }
            catch(err){
              console.log(err);
              msg.channel.send("An unknown error has occured");
            }
          }
        break;
        //command to sell cryptocurrency for money
        case 'sell':

          //if wrong number of inputs given
          if (length != 3){
            msg.reply("Error: Wrong format");
          }

          //else continue as normal
          else{
            // Try/Catch for invalid inputs
            try{
              //get the name and amount of coin to purchase
              var name = content.substring(Prefix.length).split(/[ \n]/)[1].toLowerCase().trim();
              var amt = parseFloat(content.substring(Prefix.length).split(/[ \n]/)[2].toLowerCase().trim());
              //send to sell function
              sell(msg, name, amt);
            }
            catch(err){
              console.log(err);
              msg.channel.send("An unknown error has occured");
            }
          }
          break;

      }//end switch
    }//end if
  });
}

//get a list of cryptocurrencies
function getList(msg){
  const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,ETC,DOGE&tsyms=USD';

  //fetch data from CryptoCompare API
  return fetch(url)
  // Transform the data into json string
  .then((response) => {
   if(response.ok) {
     return response.json();
   } else {
     throw new Error('Server response wasn\'t OK');
   }
 })
  .then(function(data) {
     const list = data;
     return list;
  })
  //if error
  .catch(function(error){
    console.log(error);
  });
}

//this function outputs currency info using Discord's RichEmbed to format the outputs
//tl;dr: Embeds look pretty
function SendEmbed(msg, data){

  //Bitcoin Embed
  const BTC_Embed = new RichEmbed()
  .setTitle("Bitcoin")
  .setColor(0x00AE86)
  .setDescription('Symbol: BTC\nPrice: $' + data.BTC.USD)
  .setThumbnail(BITCOIN_URL)
  .setTimestamp();

  //Ethereum Embed
  const ETH_Embed = new RichEmbed()
  .setTitle("Ethereum")
  .setColor(0x00AE86)
  .setDescription('\tSymbol: ETH\nPrice: $' + data.ETH.USD)
  .setThumbnail(ETH_URL)
  .setTimestamp();

  //Ethereum Classic Embed
  const ETC_Embed = new RichEmbed()
  .setTitle("Ethereum Classic")
  .setColor(0x00AE86)
  .setDescription('Symbol: ETC\nPrice: $' + data.ETC.USD)
  .setThumbnail(ETC_URL)
  .setTimestamp();

  //All hail the Dogecoin
  const DOGE_Embed = new RichEmbed()
  .setTitle("DogeCoin")
  .setColor(0x00AE86)
  .setDescription('Symbol: DOGE\nPrice: $' + data.DOGE.USD)
  .setThumbnail(DOGE_URL)
  .setTimestamp();

  //post the embeds into the channel
  msg.channel.send(BTC_Embed);
  msg.channel.send(ETH_Embed);
  msg.channel.send(ETC_Embed);
  msg.channel.send(DOGE_Embed);
}
//function handles purchasing bitcoin.
function buy (msg, name, amt){
  //check for invalid inputs
  if (amt <= 0){
    msg.reply("Error: Please enter a number greater than zero.");
    return;
  }

  //get list of currencies
  getList(msg).then((data) => {

    //holds price of desired currency
    var price;
    //holds the final total of desired currency
    var total;
    //get current market price of coin per dollar
    switch(name){
      case 'btc':
        price = amt * data.BTC.USD;
        break;
      case 'eth':
        price = amt * data.ETH.USD;
        break;
      case 'etc':
        price = amt * data.ETC.USD;
        break;
      case 'doge':
        price = amt * data.DOGE.USD;
        break;
        //if currency not found
      default:
        msg.channel.send("Error: Currency not found");
        return;
        break;
    } //end switch
    //round purchase amt
    var price = Math.round(price*100)/100
    //make sure player has enough money
    if (price > player[msg.member.id].money){
      msg.reply("Error: Not enough money :\(");
      return;
    }

    //take the money
    player[msg.member.id].money = player[msg.member.id].money - price
    //add the appropriate coin
    switch(name){
      case 'btc':
        player[msg.member.id].btc = player[msg.member.id].btc + amt;
        total = player[msg.member.id].btc;
        break;
      case 'eth':
        player[msg.member.id].eth = player[msg.member.id].eth + amt;
        total = player[msg.member.id].eth;
        break;
      case 'etc':
        player[msg.member.id].etc = player[msg.member.id].etc + amt;
        total = [msg.member.id].etc;
        break;
      case 'doge':
        player[msg.member.id].doge = player[msg.member.id].doge + amt;
        total = player[msg.member.id].doge;
        break;
        //if currency not found
      default:
        msg.channel.send("Error: Currency not found");
        return;
        break;
    }
    //update the JSON file
    fs.writeFile("./src/players.json", JSON.stringify(player), (err)=> {
      if (err) console.log(err);
    });

    //success message
    msg.reply("Congratulations! You have bought " + amt + " " + name + " for a total of $" + price + "\nCurrent total: " + total + "\nMoney: $" + player[msg.member.id].money);
  });
}



function sell(msg, name, amt){
  //check for a valid amount to sell
  if (amt <= 0){
    msg.reply("Please enter a number greater than 0");
  }
  //get list of currencies
  getList(msg).then((data) => {
    //holds price of desired currency
    var price;
    //holds the final total of desired currency
    var total;
    //get current market price of coin per US dolla
    switch(name){
      case 'btc':
        //if player does not have enough coins
        if (amt > player[msg.member.id].btc){
          //error message
          msg.reply("Error: Not enough coins.");
          //'exits' the transaction
          return;
        }
        //else player has enough coins
        //get subtract coins from player's account
        player[msg.member.id].btc -= amt;
        //get total leftover coins
        total = player[msg.member.id].btc;
        //get value of the coins
        price = amt * data.BTC.USD;
        break;
      case 'eth':
        //if player does not have enough coins
        if (amt > player[msg.member.id].eth){
          //error message
          msg.reply("Error: Not enough coins.");
          //'exits' the transaction
          return;
        }
        //else player has enough coins
        //get subtract coins from player's account
        player[msg.member.id].eth -= amt;
        //get total leftover coins
        total = player[msg.member.id].eth;
        //get value of the coins
        price = amt * data.ETH.USD;
        break;
      case 'etc':
        //if player does not have enough coins
        if (amt > player[msg.member.id].etc){
          //error message
          msg.reply("Error: Not enough coins.");
          //'exits' the transaction
          return;
        }
        //else player has enough coins
        //get subtract coins from player's account
        player[msg.member.id].etc -= amt;
        //get total leftover coins
        total = player[msg.member.id].etc;
        //get value of the coins
        price = amt * data.ETC.USD;
          break;
      case 'doge':
        //if player does not have enough coins
        if (amt > player[msg.member.id].doge){
          //error message
          msg.reply("Error: Not enough coins.");
          //'exits' the transaction
          return;
        }
        //else player has enough coins
        //get subtract coins from player's account
        player[msg.member.id].doge -= amt;
        //get total leftover coins
        total = player[msg.member.id].doge;
        //get value of the coins
        price = amt * data.DOGE.USD;
        break;
      //if currency not found
      default:
        msg.channel.send("Error: Currency not found");
        return;
        break;
  } //end switch

  //give player their money
  player[msg.member.id].money += price;
  //print message
  msg.reply("You have sold " + amt + " " + name + " for a total of $" + price + ".\nCoins left: " + total + "\nMoney: $" + player[msg.member.id].money);

});//end promise
}
/*
I might use this later to make the messages look pretty
function wrap(text) {

}
*/
