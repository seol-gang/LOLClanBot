const { GuildMember } = require("discord.js");
const riot = require("../util/riotapi");
const embed = require("../util/embeds");

module.exports = {
  name: "수습확인",
  description: "수습 미션을 완료했는지 확인하는 명령어",
  guildOnly: true,
  execute(message, args) {
    let authorityID = message.member.guild.roles.cache.find((elem) => {
      return (
        elem.name === "기술자" || elem.name === "군주" || elem.name === "노예"
      );
    }).id;
    const hasRole = message.member._roles.find((elem) => {
      return elem === authorityID;
    });

    if (!hasRole) {
      return message.reply(
        embed.resultEmbed(
          "권한 없음",
          "이 명령어는 현재 권한으로 사용 할 수 없습니다!"
        )
      );
    }

    if (args.length !== 1) {
      return message.reply(
        embed.resultEmbed(
          "명령어 실패",
          "!수습확인 <닉네임> 으로 명령어를 사용하세요."
        )
      );
    }

    riot.checkClanMemberMatchList(message, args[0]);
  },
};
