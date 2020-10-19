const admin = require("firebase-admin");
const embed = require("./embeds");
const serviceAccount = require("../config/firebase_key.json");
const { logger } = require("./logger");
const request = require("request");
const { sleep } = require("./sleep");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "YOUR_FIRE_BASE_URL",
});

const db = admin.firestore();
let memberList = db.collection("DB_COLLECTION_NAME");

async function createClanMember(msg, nickname, riot_id) {
  let isNickname = "";

  await memberList.get().then((doc) => {
    isNickname = doc.docs.find((nick) => {
      return nick.id === nickname;
    });
  });

  if (
    isNickname &&
    isNickname.data().riotID === riot_id &&
    isNickname.id !== nickname
  ) {
    return msg.reply(
      embed.resultEmbed(
        "등록 실패",
        `${nickname} 닉네임은 최근 닉네임을 변경한걸로 판단됩니다.
      !닉네임변경 명령어를 사용하여 바꾸어 주세요.`
      )
    );
  }

  if (isNickname) {
    return msg.reply(
      embed.resultEmbed(
        "등록 실패",
        `${nickname} 닉네임은 이미 클랜원으로 등록 되었습니다.`
      )
    );
  }

  await memberList
    .doc(nickname)
    .set({
      riotID: riot_id,
    })
    .then(function () {
      console.log(`Add ${nickname} member.`);
      logger.info(`Add ${nickname} member.`);
      return msg.reply(
        embed.resultEmbed(
          "등록 성공",
          `${nickname} 닉네임을 클랜원으로 등록했습니다!`
        )
      );
    })
    .catch((err) => {
      console.log(`Error createClanMember calls: ${err}`);
      logger.error(`Error createClanMember calls: ${err}`);
    });
}

async function updateClanMember(msg, beforeNickname, afterNickname, riot_id) {
  let isNickname = "";
  await memberList.get().then((doc) => {
    isNickname = doc.docs.find((nick) => {
      return nick.id === beforeNickname;
    });
  });

  if (!isNickname) {
    return msg.reply(
      embed.resultEmbed(
        "변경 실패",
        `${beforeNickname} 닉네임은 클랜원으로 등록되어 있지 않습니다.`
      )
    );
  }

  if (isNickname.data().riotID !== riot_id) {
    return msg.reply(
      embed.resultEmbed(
        "변경 실패",
        `${afterNickname} 닉네임은 ${beforeNickname} 닉네임을 사용하지 않은 계정입니다.`
      )
    );
  }

  await memberList
    .doc(beforeNickname)
    .delete()
    .then(() => {
      console.log(`Delete ${beforeNickname} data.`);
      logger.info(`Delete ${beforeNickname} data.`);
    })
    .catch((err) => {
      console.log(`Error updateClanMember class: ${err}`);
      logger.error(`Error updateClanMember class: ${err}`);
    });

  await memberList
    .doc(afterNickname)
    .set({
      riotID: riot_id,
    })
    .then(function () {
      console.log(`Add ${afterNickname} member.`);
      logger.info(`Add ${afterNickname} member.`);
      return msg.reply(
        embed.resultEmbed(
          "변경 성공",
          `${beforeNickname}에서 ${afterNickname}으로 닉네임 변경이 완료 되었습니다.`
        )
      );
    })
    .catch((err) => {
      console.log(`Error createClanMember calls: ${err}`);
      logger.error(`Error createClanMember calls: ${err}`);
    });
}

async function deleteClanMember(msg, nickname) {
  let isNickname = "";
  await memberList.get().then((doc) => {
    isNickname = doc.docs.find((nick) => {
      return nick.id === nickname;
    });
  });

  if (!isNickname) {
    return msg.reply(
      embed.resultEmbed(
        "삭제 실패",
        `${nickname} 닉네임은 클랜원으로 등록되어 있지 않습니다.`
      )
    );
  }

  await memberList
    .doc(nickname)
    .delete()
    .then(() => {
      console.log(`Delete ${nickname} data.`);
      logger.info(`Delete ${nickname} data.`);
      return msg.reply(
        embed.resultEmbed(
          "삭제 성공",
          `${nickname} 닉네임을 클랜 목록에서 삭제되었습니다.`
        )
      );
    })
    .catch((err) => {
      console.log(`Error updateClanMember class: ${err}`);
      logger.error(`Error updateClanMember class: ${err}`);
    });
}

async function lookupClanMember(msg) {
  let strings = "[클랜원 목록]\n\n";
  await memberList
    .get()
    .then((doc) => {
      doc.docs.forEach((nick, index) => {
        strings += `${index + 1}. ${nick.id}` + "\n";
      });
      return msg.reply(
        embed.resultEmbed(
          "조회 성공",
          "클랜원 목록은 아래와 같습니다.\n\n" + strings
        )
      );
    })
    .catch((err) => {
      console.log(`Error lookupClanMember function: ${err}`);
      logger.error(`Error lookupClanMember function: ${err}`);
      return msg.reply(
        embed.resultEmbed("조회 실패", "DB API 호출 중 오류가 발생 하였습니다.")
      );
    });
}

async function checkClanMemberMatch(msg, nickname, riot_id) {
  let clanIDList = [];
  let resultObj = { count: 0 };
  await memberList
    .get()
    .then((doc) => {
      doc.docs.forEach((nick) => {
        clanIDList.push({ nickname: nick.id, riotID: nick.data().riotID });
      });
    })
    .catch((error) => {
      return msg.reply(
        "수습확인 실패",
        `수습확인 하기위해 클랜원 데이터를 불러오는 중 오류가 발생하였습니다.
        Error:${error}`
      );
    });
  let matchList = await getMatchList(msg, nickname, riot_id);
  for (const item of matchList) {
    let res = await getCheckMatch(msg, nickname, riot_id, item, clanIDList);
    //await new Promise((resolve, reject) => setTimeout(resolve, 100));
    if (Object.keys(res).length !== 0) {
      for (let key in res) {
        if (!resultObj[key]) resultObj[key] = res[key];
        else resultObj[key] += res[key];
      }
      resultObj.count++;
    }
  }

  let message = "[" + nickname + " 닉네임의 수습 확인 결과입니다.]\n\n";
  for (let key in resultObj) {
    if (key === "count") continue;
    message +=
      "[" +
      key +
      "] 닉네임과 함께 [" +
      resultObj[key] +
      "]번 플레이 하였습니다.\n";
  }
  message +=
    "\n최근 20게임 중 클랜원들과 함께 " +
    resultObj.count +
    "게임을 진행하였습니다.\n";

  return msg.reply(embed.resultEmbed("수습 확인 결과", message));
}

function getMatchList(msg, nickname, checkRiotID) {
  const url =
    "https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/" +
    checkRiotID +
    "?endIndex=20&api_key=" +
    process.env.RIOT_API;

  return new Promise((resolve) => {
    request(url, (err, response, body) => {
      let matchID = [];
      if (response.statusCode === 200) {
        const info = JSON.parse(body);
        info["matches"].forEach((item) => {
          matchID.push(item["gameId"]);
        });
      } else {
        return msg.reply(
          embed.resultEmbed(
            "수습확인 실패",
            `${nickname} 닉네임의 전적을 불러오지 못했습니다.`
          )
        );
      }
      resolve(matchID);
    });
  });
}

function getCheckMatch(msg, nickname, checkRiotID, matchID, clanIDList) {
  const url =
    "https://kr.api.riotgames.com/lol/match/v4/matches/" +
    matchID +
    "?api_key=" +
    process.env.RIOT_API;

  return new Promise((resolve) => {
    request(url, (err, response, body) => {
      let result = {};
      if (response.statusCode === 200) {
        const info = JSON.parse(body);
        info["participantIdentities"].forEach((player) => {
          clanIDList.forEach((member) => {
            if (
              member.riotID === player["player"].accountId &&
              checkRiotID !== player["player"].accountId
            ) {
              if (!result[member.nickname]) result[member.nickname] = 1;
              else result[member.nickname]++;
            }
          });
        });
      } else {
        console.log(checkRiotID, matchID);
      }
      resolve(result);
    });
  });
}

module.exports = {
  createClanMember,
  updateClanMember,
  deleteClanMember,
  checkClanMemberMatch,
  lookupClanMember,
};
