const { GuildMember } = require("discord.js");
const riot = require("../util/riotapi");
const embed = require("../util/embeds");

module.exports = {
  name: "등록",
  description: "클랜원 등록 하는 명령어",
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
        embed.addEmbed(
          "권한 없음",
          "이 명령어는 현재 권한으로 사용 할 수 없습니다!"
        )
      );
    }

    if (args.length === 0) {
      return message.reply(
        embed.addEmbed("명령어 실패", "1명 이상의 닉네임을 입력해주세요!")
      );
    }

    args.forEach((nickname) => {
      riot.addClanMember(message, nickname);
    });
  },
};
