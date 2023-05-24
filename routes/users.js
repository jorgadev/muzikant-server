const User = require("../model/User");

const router = require("express").Router();

router.get("/", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.send(err);
    }
    res.send(users);
  });
});

module.exports = router;
