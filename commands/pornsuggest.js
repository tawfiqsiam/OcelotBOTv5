/**
 * Ported by Neil - 30/04/18
 */
const { getCode } = require('country-list');
const Discord = require('discord.js');

const request = require('request');
const orientations = [
    "straight",
    "gay",
    "tranny"
];
let naughtyRegex = /child|kid|baby|babies|toddler|1[0-7]|/gi;
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest <search>",
    commands: ["pornsuggest"],
    rateLimit: 50,
    nsfw: true,
    vote: true,
    requiredPermissions: ["ADD_REACTIONS", "MANAGE_MESSAGES"],
    categories: ["nsfw", "fun"],
    init: function(bot){

        let commandCounts = {};

        bot.bus.on("commandPerformed", async function pervertDetector(command, message){
            if(!message.guild)return;
            if(commandCounts[message.guild.id]){
                commandCounts[message.guild.id]++;
            }else{
                commandCounts[message.guild.id] = 1;
            }
            if((message.content.indexOf("pornsuggest") > -1 || message.content.indexOf("help nsfw")  > -1 || message.content.indexOf("sexydice")  > -1) && commandCounts[message.guild.id] < message.getSetting("pornsuggest.seriousThreshold")){
                await bot.database.setSetting(message.guild.id, "pornsuggest.serious", true);
                await bot.config.reloadCacheForServer(message.guild.id);
                bot.logger.log(`Set serious mode on for ${message.guild.name} (${message.guild.id})`);
            }
        });
    },
    run: function run(message, args, bot) {
        if(message.getSetting("pornsuggest.serious") && message.getSetting("pornsuggest.serious") === "1"){
            if(!args[1])
                return message.channel.send(":bangbang: You must enter a search term.");


            let search = message.cleanContent.substring(args[0].length+1);

            // if(naughtyRegex.test(search)){
            //     bot.logger.warn("Blocking query");
            //     let embed = new Discord.RichEmbed();
            //     embed.setTitle("Search Blocked");
            //     embed.setDescription("I'm not going to jail for your edgy joke");
            //     embed.setImage("https://i.imgur.com/iHZJOnG.jpg");
            //     return message.channel.send("", embed);
            // }


            request(`https://www.pornmd.com/straight/${encodeURIComponent(search)}?start=1&ajax=true&limit=20&format=json`, async function getPorn(err, resp, body){
                if(err)
                    return message.replyLang("GENERIC_ERROR");
                try{
                    let data = JSON.parse(body);
                    let images = data.videos;
                    if(images.length === 0)
                        return message.channel.send(":warning: No results.");
                    bot.util.standardPagination(message.channel, images, async function(page, index){
                        let embed = new Discord.RichEmbed();
                        embed.setAuthor(page.source);
                        embed.setTimestamp(new Date(page.pub_date));
                        embed.setTitle(page.title);
                        embed.setImage(page.thumb);
                        const url = "https://pornmd.com"+page.link;
                        embed.setURL(url);
                        embed.setDescription(`Rating: ${page.video_rating_str}\nDuration: ${page.duration}\n[Click here to watch](${url})`);
                        embed.setFooter(`Page ${index+1}/${images.length}`);
                        return embed;
                    }, true);
                }catch(e){
                    bot.raven.captureException(e);
                    console.log(e);
                    message.replyLang("GENERIC_ERROR");
                }
            });
            return;
        }
       const country = args[1] ? getCode(args[1]) || args[1] : "";
	   if(args[1] && args[1].length > 5){
		   message.replyLang("PORNSUGGEST_INVALID_COUNTRY");
        }else{
            request(`https://www.pornmd.com/getliveterms?country=${country}&orientation=${args[2] || bot.util.arrayRand(orientations)}`, function(err, resp, body){
                if(err){
					bot.raven.captureException(err);
                    message.replyLang("PORNSUGGEST_ERROR");
                    bot.logger.error(err.stack);
                }else{
                    try{
                        const names = JSON.parse(body);
                        if(names.length === 0){
                            message.replyLang("PORNSUGGEST_NO_TERMS");
                        }else{
							message.replyLang("PORNSUGGEST_RESPONSE", {phrase: bot.util.arrayRand(names).keyword});
                        }
                    }catch(e){
						bot.raven.captureException(e);
						message.replyLang("PORNSUGGEST_INVALID_RESPONSE");
                        bot.logger.error(e.stack);
                    }
                }
            });
        }
    }
};