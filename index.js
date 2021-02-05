const request = require('request')
const fs = require('fs');
const axios = require('axios').default;
const { getVideoDurationInSeconds } = require('get-video-duration');
var config = require('./config.json')


require ('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();


const YT_API_KEY= process.env.YT_API_KEY;
const BOT_ID=process.env.BOT_ID;
const BOT_SECRET = process.env.BOT_SECRET;


var channel_id=process.env.CHANNEL_ID;

const TIEMPO = process.env.TIEMPO;




client.login(BOT_SECRET);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {

   /* if(msg.member.id !== BOT_ID && msg.channel_id !== channel_id){
        console.log(`Mensaje en server: ${msg.guild.name} /  Mensaje: ${msg.content}`);
    }*/



   if(msg.channel.id===channel_id && msg.content==='Kat32 ping'){
        msg.reply("pong");
    }

    if(msg.content.startsWith('Kat32 setChannel')){
        msg.reply("si");
        let splited = msg.content.split("Kat32 setChannel")
        if(splited.length === 2){
            let channel_id_for_set = splited[1];
            config.channel_id=channel_id_for_set;
            fs.writeFileSync('config.json',JSON.stringify(config));
            channel_id= config.channel_id;
        }
    }
    
    if(msg.channel.id===channel_id && msg.member.id !== BOT_ID){
        hazmeReirChannelMsg(msg)
    }

    

});

function hazmeReirChannelMsg(msg){
    let attachments = msg.attachments.array();
        if(attachments.length){
            let video = attachments[0].attachment;
            getVideoDurationInSeconds(video).then((duration)=> {

                checkDuration(msg,duration);
                
            }).catch(error=>{
                msg.reply("Solo se pueden enviar VIDEOS por link de youtube o subidos y con duracion de "+TIEMPO+" segundos o menos! 🤙🏼 ")
                msg.delete();
            });
        }
        else{
            let link = msg.content;

            let id = video_id(link);

            if(id){
                getDataFromYT(id).then(duration=>{
                    checkDuration(msg,duration);
                })
            }
            else{
                msg.reply("Tenés que enviar el link de youtube o subirlo al canal, de forma correcta y con duracion menor a "+TIEMPO+" segundos 🤙🏼")
                msg.delete();
            }
            
        }
}

function video_id(url){
    var yt_video_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var video = url.match(yt_video_regex);
    return (video && video[7].length==11 ) ? video[7] : false;
}

function convert_time_to_seconds(duration) {
    var a = duration.match(/\d+/g);

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}


async function getDataFromYT(id){
    let resp = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${YT_API_KEY}`)

    let duration = convert_time_to_seconds(resp.data.items[0].contentDetails.duration)
    return duration;

}

function checkDuration(msg,duration){
    if (duration > TIEMPO ){
        msg.reply("El video que mandaste dura mas de "+TIEMPO+" segundos, busca uno mas corto 😕 ")
        msg.delete();
    }
    else{
        msg.reply("Esperemos que haga reir a Uni. Suerte 😂")
    }
}