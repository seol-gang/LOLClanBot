const { GuildMember } = require("discord.js");
const riot = require("../util/riotapi");
const embeds = require("../util/embeds");

module.exports = {
  name: "닉네임변경",
  description: "클랜원이 닉네임을 변경 했을 때 사용",
  guildOnly: true,
  execute(message, args) {
    if (args.length !== 2) {
      return message.reply(
        embeds.resultEmbed(
          "변경 실패",
          "명령어는 !닉네임변경 <이전 닉네임> <변경 닉네임> 입니다."
        )
      );
    }

    riot.updateClanMember(message, args[0], args[1]);
  },
};
