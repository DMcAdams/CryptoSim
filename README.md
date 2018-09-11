# CryptoSim

# Files:
run.bat - A simple bat file that starts the bot.

bot.js - The starting point for the bot. Handles Discord authentication
  and then moves everything over to the CryptoSim module.

auth.json - holds the bot's TOP SECERET token. Not included, will add a dummy one later.

./Images - I forgot to delete this.

./node_modules/node-fetch - a dependency used by CryptoSim to fetch data from the CryptoCompare API.

./node_modules/CryptoSim/main.js - The real meat and potatos of the bot.
  Will likely be merged with bot.js later, but I'm lazy. It's the main hub for handling commands and player interaction.

./node_modules/CryptoSim/src/players.js - Code for the Player object, which holds the player IDs, money, and coins.

./node_modules/CryptoSim/src/players.json Not used yet, will be used to store player info in case the bot goes offline.
