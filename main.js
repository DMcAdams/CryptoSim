const Discord = require("discord.js");
const auth = require("./auth.json");
const start = require("./cryptosim.js");

const client = new Discord.Client();

//log ready message in console
client.on("ready", () => {
  console.log("CryptoSim ready!");
});

//pass off bot to CryptoSim
start(client);

//for authentication
client.login(auth.token);
