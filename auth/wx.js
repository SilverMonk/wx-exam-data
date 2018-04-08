const axios = require('axios');
const APPID = 'wx77cd94a900f9fc62';
const SECRET = '660fba8e0d0968e1169e2290694040a0';
var WXBizDataCrypt = require('./WXBizDataCrypt');

module.exports = async function({ code, encryptedData, iv }) {
  if (!code) {
    console.log('缺少微信身份验证代码。');
    return {};
  }
  return await axios
    .get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`
    )
    .then(res => {
      let userinfo = { openid: res.data.openid };

      if (encryptedData && iv) {
        var pc = new WXBizDataCrypt(APPID, res.data.session_key);
        var data = pc.decryptData(encryptedData, iv);
        // console.log('解密后 data: ', data);
        userinfo.avatarUrl = data.avatarUrl;
        userinfo.openid = res.data.openid;
        userinfo.city = data.city;
        userinfo.country = data.country;
        userinfo.gender = data.gender;
        userinfo.language = data.language;
        userinfo.nickName = data.nickName;
        userinfo.province = data.province;
      }

      return userinfo;
    });
};
