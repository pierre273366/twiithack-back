var express = require("express");
var router = express.Router();

require("../models/connection");
const Tweet = require("../models/tweet");
const User = require("../models/users");

router.post("/post", (req, res) => {
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) {
      let listHashtag = [];
      let text = req.body.tweet;
      if (text.includes("#")) {
        //méthode pour récup #
        listHashtag = text.match(/(#\w+[^\s#]*)/g);
      }

      const newTweet = new Tweet({
        user: data._id,
        tweet: req.body.tweet,
        hashtag: listHashtag,
        creationDate: Date.now(),
        like: [],
      });
      newTweet.save().then((newtwee) => {
        res.json({ result: true });
      });
    }
  });
});

router.get("/wall", (req, res) => {
  Tweet.find()
    .populate("user")
    .populate("like")
    .then((data) => {
      res.json({ tweet: data });
    });
});

router.get("/hashtag", (req, res) => {
  Tweet.find({}, "hashtag").then((tweets) => {
    let allHashtags = [];
    tweets.forEach((Tweet) => {
      allHashtags = allHashtags.concat(Tweet.hashtag);
    });
    res.json({ succees: true, hashtag: allHashtags });
  });
});

router.post("/like", (req, res) => {
  //on va chercher l'utilisateur grace au token qu'on reçoit de la requete.
  User.findOne({ token: req.body.token }).then((user) => {
    if (user) {
      //si on trouve l'utilisateur, on va modifier Tweet, on retrouve le tweet grace à son ID
      Tweet.updateOne({ _id: req.body.id }, { $push: { like: user._id } }) //on push dans son tableau de like l'id de l'utilisateur
        .then(res.json({ result: true }));
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

router.post("/dislike", (req, res) => {
  //on va chercher l'utilisateur grace au token qu'on reçoit de la requete.
  User.findOne({ token: req.body.token }).then((user) => {
    if (user) {
      //si on trouve l'utilisateur, on va modifier Tweet, on retrouve le tweet grace à son ID
      Tweet.updateOne({ _id: req.body.id }, { $pull: { like: user._id } }) //on pull (supprime) du tableau de like l'id de l'utilisateur
        .then(res.json({ result: true }));
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

router.delete("/deleteTweet", (req, res) => {
  Tweet.deleteOne({ _id: req.body.id }).then((data) => {
    res.json({ result: true });
  });
});
module.exports = router;
