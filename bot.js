const Discord = require("discord.js");
const auth = require("./auth.json");
const client = new Discord.Client();
const start = require("CryptoSim");
const cc = require('cryptocompare')
//log ready message in console
client.on("ready", () => {
  console.log("CryptoSim ready!");
});
//cc.coinList().then(coinList => {
//  console.log(coinList).catch(console.error)});
// Usage:

start(client);
client.login(auth.token);
