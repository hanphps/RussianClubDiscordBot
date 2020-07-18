const DISCORD = require('discord.js');
const CONFIG = require('./config.json');
const CLIENT = new DISCORD.Client();

/*

    TODO:
        Error logging
        Switch to cron job than scheduled event
        Better test dictionary with english translation, part of speech, example
        More developer friendly code -> all settings to json
        More user friendly -> work from discord w/o access to code

*/

//Localized Settings
var SETTINGS = {
    source : 'russian-words.json', //File name for dailies
    primary : 'CHANNEL-ID', //Primary channel, haha silly goose I'm not giving you our tokens ;)
    schedule : '10:00', //24 Hour Format
    logs : [] //Indexes of source used, if len(logs)==len(source) => reset
};

const LOCAL = require('./'+SETTINGS.source);

const DAY = 1000*60*60*24;

// Parse Date-Time
function parseTimer(){
    var date = new Date();
    var str = SETTINGS.schedule.split(':')
    return (-date + date.setHours(str[0],[1],0,0)) 
}

//  Word Time
function randomized(dict){
    var i = Math.floor(Math.random()*dict.length);

    if (SETTINGS.logs.length == dict.length){
        SETTINGS.logs = []
    }

    if (SETTINGS.logs.includes(i)) {
        randomized(dict)
    } else {
        SETTINGS.logs.push(i);
        return dict[i]
    }
}

function randomWord(dict){ //Not hinged by logs
    var i = Math.floor(Math.random()*dict.length);
    return dict[i]
}

//Logging

// Handling 
CLIENT.once('ready',()=>{
    console.log('Bot online')
})

CLIENT.on('message', msg => {
  if (msg.content === '!word'){
      try {
        msg.channel.send(randomWord(LOCAL))
      } catch(err) {
        console.log(err)
      }
  }  
})

CLIENT.on('ready',()=>{

    setTimeout(function(){
        CLIENT.channels.fetch(SETTINGS.primary)
            .then(chnl => chnl.send('Word of the day: '+randomized(LOCAL)))
            .catch(console.error)


            setInterval(function(){
                CLIENT.channels.fetch(SETTINGS.primary)
                    .then(chnl => chnl.send('Word of the day: '+randomized(LOCAL)))
                    .catch(console.error)
            }, DAY)

    },parseTimer())
})

CLIENT.login(CONFIG.token);