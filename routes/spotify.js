const router = require("express").Router();
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const Track = require("../model/Track");
const Playlist = require("../model/Playlist");
const { convertToSlug } = require("../lib/functions");

require("dotenv").config();

const clientId = process.env.SPOTIFY_API_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;
const userId = process.env.SPOTIFY_API_USER_ID;

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
});

const setAccessToken = async (req, res, next) => {
  try {
    const response = await axios({
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      params: {
        grant_type: "client_credentials",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    spotifyApi.setAccessToken(response.data.access_token);
    next();
  } catch (err) {
    res.status(400).send("Couldn't get access token!");
  }
};

router.get("/update-tracks", setAccessToken, async (req, res) => {
  try {
    // Get user playlists from Spotify API
    const response = await spotifyApi.getUserPlaylists(userId);
    const promises = response.body.items.map(async (playlist) => {
      // Get tracks for each playlist
      const response = await spotifyApi.getPlaylistTracks(playlist.id);

      const tracks = response.body.items.map((track) => ({
        id: track.track.id,
        playlist_id: playlist.id,
        name: track.track.name,
        artists: track.track.artists.map((artist) => artist.name),
        url: track.track.preview_url,
      }));

      return {
        id: playlist.id,
        name: playlist.name,
        tracks,
      };
    });

    const data = await Promise.all(promises);

    let tracksInserted = [];
    let tracksNotInserted = [];
    await Playlist.deleteMany();
    await Track.deleteMany();

    for (const playlist of data) {
      const newPlaylist = new Playlist({
        id: playlist.id,
        name: playlist.name,
        slug: convertToSlug(playlist.name),
        tracks: playlist.tracks.map((track) => track.id),
        type: playlist.tracks.length >= 15 ? "category" : "artist",
      });
      await newPlaylist.save();

      for (const track of playlist.tracks) {
        if (track.url) {
          const newTrack = new Track({
            id: track.id,
            playlist_id: playlist.id,
            name: track.name,
            artists: track.artists,
            url: track.url,
          });
          await newTrack.save();
          tracksInserted.push(track);
        } else {
          tracksNotInserted.push(track);
        }
      }
    }

    res.send({
      message: "Database updated successfully!",
      inserted: tracksInserted,
      not_inserted: tracksNotInserted,
    });
  } catch (err) {
    console.error(err);
  }
});

router.get("/playlists", setAccessToken, async (req, res) => {
  try {
    const response = await Playlist.find(
      {},
      { id: 1, name: 1, slug: 1, type: 1, _id: 0 }
    );
    res.send(response);
  } catch (err) {
    console.error(err);
  }
});

router.get("/playlist/:playlistId", setAccessToken, async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    const response = await Track.aggregate([
      { $match: { playlist_id: playlistId } },
      { $sample: { size: 10 } },
      {
        $project: {
          id: 1,
          _id: 0,
          name: 1,
          artists: 1,
          url: 1,
        },
      },
    ]);

    res.send(response);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
