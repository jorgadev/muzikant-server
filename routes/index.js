const router = require("express").Router();

router.get("/", (req, res) => {
  res.send(`<div>
      <p>Routes: </p>
      <ul>
        <li>/users</li>
        <li>/user</li>
        <li>/spotify</li>
      </ul>
    </div>`);
});

module.exports = router;
