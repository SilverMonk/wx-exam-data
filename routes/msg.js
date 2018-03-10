class ErrMsg {
  constructor(errCode, errMsg) {
    this.errCode = errCode || 0;
    this.errMsg = errMsg || '';
  }
}

module.exports = { ErrMsg };
