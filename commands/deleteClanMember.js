const { GuildMember } = require("discord.js");
const db = require("../util/databaseControl");
const embeds = require("../util/embeds");

module.exports = {
  name: "삭제",
  description: "클랜원 삭제 할 때 쓰는 명령어",
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
        embeds.resultEmbed(
          "삭제 실패",
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
      db.deleteClanMember(message, nickname);
    });
  },
};
