const axios = require('axios');
const fetch = require('node-fetch');
let accessToken = "BQA0ro6B7s53s-VT9DjxfsNv-8EtkqzXlO3TaDQSTo8u83z6TI2jfurvb6LrwfZSg-18BuFY0exEZmHsi-c";

function generateSpotifyToken(chatID) {
  axios({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    params: {grant_type: 'client_credentials'},
    headers: {
      'Accept':'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.SPOTIFY_CLIENT_ID,
      password: process.env.SPOTIFY_CLIENT_SECRET
    }
  }).then(response => {
    console.log(`successfully made a token!! yay`);
    console.log(response.data);
    accessToken = response.data.access_token;
  }).catch(tokenErr => {
    console.log(`axios err: ${tokenErr}`);
    bot.sendMessage(chatID, 'Failed to generate a new access token for some reason, look into it Kenford!!');
  });
}

module.exports = async function spotifyHandler(callbackQuery, bot) {
    const queryType = callbackQuery.data.slice(0, callbackQuery.data.indexOf(' '));
    const queryInput = callbackQuery.data.slice(callbackQuery.data.indexOf(' ') + 1);
    console.log(queryType);
  
    bot.sendMessage(callbackQuery.message.chat.id, `You queried for: ${queryType}`);
    
    const spotifyAPI = `https://api.spotify.com/v1/search?q=${(queryInput).toLowerCase()}&type=${(queryType).toLowerCase()}&limit=5&access_token=${accessToken}`
  
    try {
      const response = await fetch(spotifyAPI, {
        method: "GET",
        header: {"Content-Type": "application/json"}
      });
      const spotifyData = await response.json();
  
      if(spotifyData.error) {
        console.log('theres a spotify error!')
        console.log(spotifyData.error);
        let errResponseMsg;
  
        // 401 = access token expired, so generate new one. (they expire every hour)
        if(spotifyData.error.status === 401) {
          errResponseMsg = 'Spotify access token expired, generating a new one! Choto mottay and try again in a few seconds! '
          console.log('creating a new token!');
          generateSpotifyToken(callbackQuery.message.chat.id);
        } else {
          errResponseMsg = 'Failed to fetch song data, double check your query!';
        }
        bot.sendMessage(callbackQuery.message.chat.id, errResponseMsg);
      } 
      else {
        switch(queryType.replace(/\s/g, '')) {
          case 'Track': {
            bot.sendMessage(callbackQuery.message.chat.id, `
  Here's the track: ${spotifyData.tracks.items[0].external_urls.spotify} 
  Track album: ${spotifyData.tracks.items[0].album.name}, which has ${spotifyData.tracks.items[0].album.total_tracks} tracks
  Album release: ${spotifyData.tracks.items[0].album.release_date}
  If you don't have a spotify account, here's a preview fam dw: ${spotifyData.tracks.items[0].preview_url}
            `);
          } break;
          case 'Album': {
            bot.sendMessage(callbackQuery.message.chat.id, `
  Here's the album: ${spotifyData.albums.items[0].external_urls.spotify} 
  Album is called ${spotifyData.albums.items[0].name} has ${spotifyData.albums.items[0].total_tracks} tracks.
  Album release: ${spotifyData.albums.items[0].release_date}
            `);
          } break;
          case 'Artist': {
            bot.sendMessage(callbackQuery.message.chat.id, `
  Here's a profile: ${spotifyData.artists.items[0].external_urls.spotify} 
  ${spotifyData.artists.items[0].name} has ${spotifyData.artists.items[0].followers.total} followers! 
  Artist's genres: ${spotifyData.artists.items[0].genres.join(' ')} 
            `);
          } break;
          case 'Playlist': {
            bot.sendMessage(callbackQuery.message.chat.id, `
  Here's the playlist: ${spotifyData.playlists.items[0].external_urls.spotify} 
  Playlist is called: ${spotifyData.playlists.items[0].name}
  Created by: ${spotifyData.playlists.items[0].owner.display_name}
  You can view more of his/her stuff at: ${spotifyData.playlists.items[0].owner.external_urls.spotify}
            `);
          } break;
          default: bot.sendMessage(callbackQuery.message.chat.id, 'Something went wrong, try again oof'); break;
        }
      }
    } catch(fetchErr) {
      console.log(fetchErr);
    }
}