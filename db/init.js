const db = require('./index');
async function user_init_fun() {
  return db.User.sync({
    force: true
  });
}

(async () => {
  //   await user_init_fun().catch(function(err) {
  //     console.log(err);
  //   });
  db.sequelize.sync({
    force: true
  });
  console.log('completed');
})();
