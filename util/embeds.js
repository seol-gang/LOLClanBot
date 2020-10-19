const Discord = require("discord.js");

function resultEmbed(resultTitle, resultMessage) {
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(resultTitle)
    .addField("결과", resultMessage, true)
    .setTimestamp();
}

module.exports = { resultEmbed };
