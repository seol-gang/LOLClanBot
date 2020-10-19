const db = require("./databaseControl");
const embed = require("./embeds");
const request = require("request");
const urlencode = require("urlencode");

function addClanMember(msg, nickname) {
  const url =
    "https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
    urlencode(nickname) +
    "?api_key=" +
    process.env.RIOT_API;

  request(url, (err, response, body) => {
    if (response.statusCode === 200) {
      const info = JSON.parse(body);
      db.createClanMember(msg, nickname, info["accountId"]);
    } else {
      return msg.reply(
        embed.resultEmbed(
          "등록 실패",
          `${nickname} 닉네임은 게임상에 존재하지 않는 닉네임 입니다.`
        )
      );
    }
  });
}

function updateClanMember(msg, beforeNickname, afterNickname) {
  const url =
    "https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
    urlencode(afterNickname) +
    "?api_key=" +
    process.env.RIOT_API;

  request(url, (err, response, body) => {
    if (response.statusCode === 200) {
      const info = JSON.parse(body, beforeNickname, afterNickname);
      db.updateClanMember(
        msg,
        beforeNickname,
        afterNickname,
        info["accountId"]
      );
    } else {
      return msg.reply(
        embed.resultEmbed(
          "변경 실패",
          `${afterNickname} 닉네임은 게임상에 존재하지 않는 닉네임 입니다.`
        )
      );
    }
  });
}

function checkClanMemberMatchList(msg, nickname) {
  const url =
    "https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
    urlencode(nickname) +
    "?api_key=" +
    process.env.RIOT_API;

  request(url, (err, response, body) => {
    if (response.statusCode === 200) {
      const info = JSON.parse(body);
      db.checkClanMemberMatch(msg, nickname, info["accountId"]);
    } else {
      return msg.reply(
        embed.resultEmbed(
          "수습확인 실패",
          `${nickname} 닉네임은 게임상에 존재하지 않는 닉네임 입니다.`
        )
      );
    }
  });
}

module.exports = {
  addClanMember,
  updateClanMember,
  checkClanMemberMatchList,
};
