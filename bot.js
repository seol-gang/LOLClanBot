const fs = require("fs");
const { logger } = require("./util/logger");
const Discord = require("discord.js");
const embeds = require("./util/embeds");
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandsFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith("js"));

for (const file of commandsFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  logger.info("Start 아라 봇...");
  console.log(`${client.user.tag} 봇에 로그인 하였습니다!`);
  client.user.setActivity("설강이가 만들었다!", { type: "WATCHING" });
});

client.on("message", (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice("!".length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  logger.info(`${message.member.displayName} using "${command}" commands`);

  if (!client.commands.has(command)) return;
  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply(
      embeds.resultEmbed("실패", "서버 전용 명령어 입니다!")
    );
  }

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    logger.error(`Using "${command}" commands error: ${error}`);
    message.reply(
      embeds.resultEmbed(
        "실패",
        `${command}명령어 사용 중 오류가 발생하였습니다!`
      )
    );
  }
});

client.login(process.env.TOKEN);
