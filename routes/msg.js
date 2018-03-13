class ErrMsg {
  constructor(errCode, errMsg, data) {
    this.errCode = errCode || 0;
    this.errMsg = errMsg || '';
    this.data = data || null;
  }
}

module.exports = { ErrMsg };
