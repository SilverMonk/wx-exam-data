/**
 * Module dependencies.
 */
var passport = require('passport-strategy'),
  util = require('util'),
  lookup = require('./utils').lookup;
var WXBizDataCrypt = require('../../WXBizDataCrypt');
const axios = require('axios');
const APPID = 'wx77cd94a900f9fc62';
const SECRET = '660fba8e0d0968e1169e2290694040a0';
/**
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) {
    throw new TypeError('Wx requires a verify callback');
  }

  this._codeField = options.codeField || 'code';

  passport.Strategy.call(this);
  this.name = 'wx';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = async function(req, options) {
  options = options || {};
  var code =
    lookup(req.body, this._codeField) || lookup(req.query, this._codeField);

  if (!code) {
    return this.fail(
      { message: options.badRequestMessage || 'Missing credentials' },
      400
    );
  }

  var self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    self.success(user, info);
  }
  const openid = await axios
    .get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`
    )
    .then(res => {
      let userinfo = {
        openid: res.data.openid
      };
      const encryptedData = req.body.encryptedData;
      const iv = req.body.iv;
      if (encryptedData && iv) {
        var pc = new WXBizDataCrypt(APPID, res.data.session_key);
        var data = pc.decryptData(encryptedData, iv);
        // console.log('解密后 data: ', data);
        userinfo.avatarUrl = data.avatarUrl;
        userinfo.city = data.city;
        userinfo.country = data.country;
        userinfo.gender = data.gender;
        userinfo.language = data.language;
        userinfo.nickName = data.nickName;
        userinfo.province = data.province;
      }

      try {
        if (self._passReqToCallback) {
          this._verify(req, userinfo, verified);
        } else {
          this._verify(userinfo, verified);
        }
      } catch (ex) {
        return self.error(ex);
      }
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
