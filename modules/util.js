const gm = require('gm');
const wrap = require('word-wrap');
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const twemoji = require('twemoji-parser');
const config = require('config');
module.exports = {
    name: "Utilities",
    init: function(bot){

        bot.util = {};

        //Someone is definitely going to tell me a different way of doing this
        bot.util.vowels = [ "a", "e", "i", "o", "u",
                            "ａ","ｅ","ｉ","ｏ","ｕ",
                            "Ａ","Ｅ","Ｉ","Ｏ","Ｕ",
                            "𝕒","𝕖","𝕚","𝕠","𝕦",
                            "ⓐ","ⓔ","ⓘ","ⓞ","ⓤ",
                            "🅐","🅔","🅘","🅞","🅤",
                            "𝐚","𝐞","𝐢","𝐨","𝐮",
                            "𝖆","𝖊","𝖎","𝖔","𝖚",
                            "𝒂","𝒆","𝒊","𝒐","𝒖",
                            "𝓪","𝓮","𝓲","𝓸","𝓾",
                            "𝖺","𝖾","𝗂","𝗈","𝗎",
                            "𝗮","𝗲","𝗶","𝗼","𝘂",
                            "𝙖","𝙚","𝙞","𝙤","𝙪",
                            "𝘢","𝘦","𝘪","𝘰","𝘶",
                            "⒜","⒠","⒤","⒪","⒰",
                            "🇦","🇪","🇮","🇴","🇺",
                            "🄰","🄴","🄸","🄾","🅄",
                            "🅰","🅴","🅸","🅾","🆄",
                            "A","ɘ","i","o","U",
                            "о"
        ];

        bot.util.months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        bot.util.voteTimeout = 43200000;
//59640014
        /**
         * Returns a random number between `min` and `max`
         * @param {Number} min
         * @param {Number} max
         * @returns {number}
         */
        bot.util.intBetween = function(min, max){
            return Math.round((Math.random() * (max - min))+min);
        };

        /**
        * Chooses a random object from `array`
        * @param {Array} array
        * @returns {*} A random object from the specified array
        */
        bot.util.arrayRand = function arrayRand(array){
            return array[Math.round(Math.random()*(array.length-1))];
        };

        /**
         * Fetch any amount of messages in 100 message chunks
         * @param {Discord.TextChannel} channel
         * @param {Number} amount
         * @returns {Promise<[Discord.Message]>}
         */
        bot.util.fetchMessages = async function(channel, amount){
            let iterations = Math.ceil(amount/100);
            let before;
            let messages = [];
            for(let i = 0; i < iterations; i++){
                let messageChunk = await channel.fetchMessages({before, limit: 100});
                messages = messages.concat(messageChunk.array());
                before = messageChunk.lastKey();
            }

            return messages;
        };

        /**
         *
         * @param {Function} callback The function called once the time is up
         * @param {Number} timeout_ms The amount of milliseconds until the time should be called
         */
        bot.util.setLongTimeout = function setLongTimeout(callback, timeout_ms){
            if(timeout_ms > 2147483646){
                setTimeout(function(){
                    setLongTimeout(callback, (timeout_ms - 2147483646));
                },2147483646);
            }
            else{
                setTimeout(callback, timeout_ms);
            }
        };

        /**
         * Returns the difference between two arrays
         * @param {Array} first
         * @param {Array} second
         * @returns {Array}
         */
        bot.util.arrayDiff = function(first, second) {
            return first.filter(function(i) {return second.indexOf(i) < 0;});
        };

        /**
         * Randomly shuffles an array
         * @param {Array} a
         */
        bot.util.shuffle = function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x
            }
        };

        /**
         *
         * @param {Array} data
         * @param {String} unit
         * @param {Number} value
         * @returns {Array}
         */
        bot.util.quantify = function quantify(data, unit, value) {
            if (value && value >= 1) {
                if (value > 1 || value < -1)
                    unit += 's';

                data.push(value + ' ' + unit);
            }

            return data;
        };

        /**
         * Parses a number of seconds as a proper time
         * @param {Number} seconds
         * @returns {String}
         */
        bot.util.prettySeconds = function prettySeconds(seconds) {
            seconds = parseInt(seconds);
            if(seconds < 1) return "less than a second";

            var prettyString = '',
                data = [];

            if (typeof seconds === 'number') {
                data = bot.util.quantify(data, 'day',    parseInt((seconds) / 86400));
                data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                var length = data.length,
                    i;

                for (i = 0; i < length; i++) {

                    if (prettyString.length > 0)
                        if (i == length - 1)
                            prettyString += ' and ';
                        else
                            prettyString += ', ';

                    prettyString += data[i];
                }
            }

            return prettyString;
        };

        bot.util.shortSeconds = function(totalSeconds){
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.round(totalSeconds % 60);

            if(minutes < 10)
                minutes = "0"+minutes;
            if(seconds < 10)
                seconds = "0"+seconds;

            if(hours >= 1) {
                if(hours < 10)
                    hours = "0"+hours;
                return `${hours}:${minutes}:${seconds}`
            }
            return `${minutes}:${seconds}`;
        };

        bot.util.progressBar = function(current, total, width = 50){
            let progress = width*(current/total);
            let output = "[";
            for(let i = 0; i < width; i++)
                output+= i < progress ? "█" :  "░";
            output += "]";
            return output;
        };

        /**
         * Format memory as a string
         * @param {Number} bytes The number of Bytes
         * @returns {string}
         */
        bot.util.prettyMemory = function prettyMemory(bytes){
            if(bytes < 1000)return bytes+" bytes"; //< 1kb
            if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
            if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
            if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
            if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
            return parseInt(bytes/1e+15)+"PB";
        };

        //Why is this here
        bot.bans = {
            user: [],
            channel: [],
            server: []
        };

        /**
         *
         * @param {Function} func
         * @param {Number} wait
         * @param {Boolean} immediate
         * @returns {Function}
         */
        bot.util.debounce = function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this
                    , args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args)
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow)
                    func.apply(context, args)
            }
        };

        /**
         *
         * @param {Function} fn
         * @param {Number} threshhold
         * @param {*} scope
         * @returns {Function}
         */
        bot.util.throttle = function throttle(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date
                    , args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args)
                    }, threshhold)
                } else {
                    last = now;
                    fn.apply(context, args)
                }
            }
        };

        /**
         * Separate an array into chunks
         * @param {Array} a
         * @param {Number} n
         * @param {Boolean} balanced
         * @returns {Array<Array>}
         */
        bot.util.chunkify = function chunkify(a, n, balanced) {

            if (n < 2)
                return [a];

            var len = a.length,
                out = [],
                i = 0,
                size;

            if (len % n === 0) {
                size = Math.floor(len / n);
                while (i < len) {
                    out.push(a.slice(i, i += size));
                }
            }

            else if (balanced) {
                while (i < len) {
                    size = Math.ceil((len - i) / n--);
                    out.push(a.slice(i, i += size));
                }
            }

            else {

                n--;
                size = Math.floor(len / n);
                if (len % size === 0)
                    size--;
                while (i < size * n) {
                    out.push(a.slice(i, i += size));
                }
                out.push(a.slice(size * n));

            }

            return out;
        };

        /**
         *
         * @param {Message} message
         * @param {Array<String>} args
         * @param {Number} x The x position of the text
         * @param {Number} y The y position of the text
         * @param {Number} textSize The Size of the text
         * @param {Number} textWidth The Width of the text lines
         * @param {String} fileName The name of the uploaded file
         * @param {String} filePath The path of the template
         */
        bot.util.processImageMeme = function processImageMeme(message, args, x, y, textSize, textWidth, fileName, filePath){
            if(!args[1]){
                message.replyLang("IMAGE_NO_TEXT");
                return;
            }

            bot.tasks.startTask("imageMeme", message.id);

            filePath = __dirname+"/../"+filePath;

            message.channel.startTyping();
            gm(filePath)
                .font(__dirname+"/../static/arial.ttf", textSize)
                .drawText(x, y, wrap(message.cleanContent.substring(args[0].length).substring(0,1010), {width: textWidth, indent: ''}))
                .toBuffer('PNG', function convertToPNG(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                    }else{
                        const attachment = new Discord.Attachment(buffer, fileName);
                        message.channel.send("", attachment);
                    }
                    bot.tasks.endTask("imageMeme", message.id);
                    message.channel.stopTyping();
                });
        };

        /**
         *
         * @param module The command module
         * @param message The input message
         * @param args The input arguments
         * @param filter The desired GM filter
         * @param input The input arguments
         * @param format The output format
         * @returns {Promise<*|void|Promise<*>>}
         */
        bot.util.processImageFilter = async function processImageFilter(module, message, args, filter, input, format = "PNG"){
            const url =  await bot.util.getImage(message, args);
            if(!url || !url.startsWith("http"))
                return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});

            bot.tasks.startTask("imageFilter", message.id);

            let loadingMessage = await message.channel.send("<a:ocelotload:537722658742337557> Processing...");

            bot.logger.log(url);
            if(message.getBool("imageFilter.useExternal")) {
                let response = await bot.rabbit.rpc("imageFilter", {url, filter, input, format});
                if(loadingMessage)
                    await loadingMessage.edit("<a:ocelotload:537722658742337557> Uploading...");
                if (response.err) {
                    console.log(response);
                    await loadingMessage.delete();
                    return message.channel.send(response.err);
                }
                let attachment = new Discord.Attachment(Buffer.from(response.image, 'base64'), response.name);
                await message.channel.send(attachment);
                await loadingMessage.delete();
                bot.tasks.endTask("imageFilter", message.id);
            }else {
                const fileName = `${__dirname}/../temp/${Math.random()}.png`;
                let shouldProcess = true;
                request(url)
                    .on("response", function requestResponse(resp) {
                        shouldProcess = !(resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf("image") === -1);
                        if (format !== "JPEG" && resp.headers && resp.headers['content-type'].toLowerCase() === "image/gif")
                            format = "GIF";
                    })
                    .on("error", function requestError(err) {
                        bot.raven.captureException(err);
                        bot.logger.log(err);
                        shouldProcess = false;
                    })
                    .on("end", function requestEnd() {
                        if (!shouldProcess) {
                            message.replyLang("GENERIC_NO_IMAGE_URL");
                            fs.unlink(fileName, function unlinkInvalidFile(err) {
                                if (err) {
                                    bot.logger.error(err);
                                    bot.tasks.endTask("imageFilter", message.id);
                                }
                            });
                            return;
                        }
                        const initialProcess = gm(fileName).autoOrient();
                        initialProcess[filter].apply(initialProcess, input)
                            .toBuffer(format, function toBuffer(err, buffer) {
                                if (err)
                                    return message.replyLang("GENERIC_CREATE_IMAGE_FAIL");
                                let name = filter + "." + (format.toLowerCase());
                                if (url.indexOf("SPOILER_") > -1)
                                    name = "SPOILER_" + name;
                                const attachment = new Discord.Attachment(buffer, name);
                                message.channel.send("", attachment).catch(function sendMessageError(e) {
                                    console.log(e);
                                    message.replyLang("GENERIC_UPLOAD_ERROR", {error: e});
                                });
                                bot.tasks.endTask("imageFilter", message.id);
                                fs.unlink(fileName, function unlinkCompletedFile(err) {
                                    if (err)
                                        bot.logger.error(err);
                                });
                            });
                    }).pipe(fs.createWriteStream(fileName));
            }
        };

        String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
            function () {
                "use strict";
                let str = this.toString();
                if (arguments.length) {
                    let t = typeof arguments[0];
                    let key;
                    let args = ("string" === t || "number" === t) ?
                        Array.prototype.slice.call(arguments)
                        : arguments[0];

                    for (key in args) {
                        str = str.replace(new RegExp("\\{{" + key + "\\}}", "gi"), args[key]);
                    }
                }

                return str;
            };

        /**
         * Get an image for use in meme templates
         * @param {Object} message The message object
         * @param {Array<String>} args
         * @param {Number} argument
         * @returns {Promise.<*>}
         */
        bot.util.getImage = async function getImage(message, args, argument){
            try {
                if(argument){
                    const arg = args[argument];
                    if(!arg)return null;
                    const user = bot.util.getUserFromMention(arg);
                    if(user) return user.avatarURL;
                    if(arg.startsWith("http"))return arg;
                    const emoji = bot.util.getEmojiURLFromMention(arg);
                    if(emoji)return emoji;
                }else if (message.mentions && message.mentions.users && message.mentions.users.size > 0) {
                    return message.mentions.users.first().avatarURL;
                } else if (args[2] && args[2].indexOf("http") > -1) {
                    return args[2]
                } else if (args[1] && args[1].indexOf("http") > -1) {
                    return args[1];
                }else if(args[1] && bot.util.getEmojiURLFromMention(args[1])){
                    return bot.util.getEmojiURLFromMention(args[1]);
                }else if(args[2] && bot.util.getEmojiURLFromMention(args[2])){
                    return bot.util.getEmojiURLFromMention(args[2]);
                }else {
                    message.channel.startTyping();
                    const result = bot.util.getImageFromPrevious(message);
                    message.channel.stopTyping();
                    return result;
                }
            }catch(e){
                bot.raven.captureException(e);
                return null;
            }
        };

        bot.util.getImageFromTenorURL = function(url){
            return new Promise(function(fulfill){
                 const urlSplit = url.split("-");
                 const id = urlSplit[urlSplit.length-1];
                 if(isNaN(id)) {
                     bot.logger.warn("Invalid tenor URL: "+url);
                     return fulfill(null);
                 }

                 request(`https://api.tenor.com/v1/gifs?ids=${id}&key=${config.get("Tenor.key")}`, function tenorResponse(err, resp, body){
                     if(err){
                         bot.raven.captureException(err);
                         return fulfill(null);
                     }
                     try {
                         let data = JSON.parse(body);
                         if(data.error || !data.results || data.results.length === 0 || !data.results[0].media){
                             bot.logger.warn("Malformed tenor URL "+url);
                             bot.logger.warn(body);
                             return fulfill(null);
                         }
                         fulfill(data.results[0].media[0].gif.url);
                     }catch(e){
                         bot.raven.captureException(e);
                         fulfill(null);
                     }


                 })
            });
        };

        /**
         * Get an image from previous messages
         * @param {Object} message
         * @returns {Promise.<*>}
         */
        bot.util.getImageFromPrevious = async function getImageFromPrevious(message){
            const previousMessages = (await message.channel.fetchMessages({limit: 50})).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            const targetMessage = previousMessages.find((previousMessage) =>{
                if(previousMessage.content.startsWith("http"))return true;
                if(previousMessage.attachments && previousMessage.attachments.size > 0)return true;
                return (previousMessage.embeds && previousMessage.embeds.length > 0 && previousMessage.embeds[0].image);
            });
            if(targetMessage){
                if(targetMessage.content.startsWith("http")) {
                    let url = targetMessage.content.split(" ")[0];
                    if(url.startsWith("https://tenor.com/"))
                        return await bot.util.getImageFromTenorURL(url);
                    return url;
                }else if(targetMessage.attachments && targetMessage.attachments.size > 0){
                    const targetAttachment = targetMessage.attachments.find((attachment)=>(attachment.url || attachment.proxyURL));
                    if(!targetAttachment)return null;
                    return targetAttachment.url || targetAttachment.proxyURL;
                }else if(targetMessage.embeds && targetMessage.embeds.length > 0){
                     const targetEmbed = targetMessage.embeds.find(function (embed) {
                         return embed.image && (embed.image.url || embed.image.proxyURL)
                    });
                     if(!targetEmbed)return null;
                     return targetEmbed.image.url || targetEmbed.image.proxyURL;
                }
                return null;
            }else{
                return null;
            }
        };

        Object.defineProperty(Array.prototype, 'chunk', {
            value: function(chunkSize) {
                var R = [];
                for (var i=0; i<this.length; i+=chunkSize)
                    R.push(this.slice(i,i+chunkSize));
                return R;
            }
        });

        /**
         * Get the prefix for numbers e.g 1st 2nd 3rd
         * @param {Number} i
         * @returns {string}
         */
        bot.util.getNumberPrefix = function getNumberPrefix(i){
            let j = i % 10,
                k = i % 100;
            if (j === 1 && k !== 11) {
                return i + "st";
            }
            if (j === 2 && k !== 12) {
                return i + "nd";
            }
            if (j === 3 && k !== 13) {
                return i + "rd";
            }
            return i + "th";
        };



        bot.util.permissionsMap = {
            ADMINISTRATOR: "Administrator",
            CREATE_INSTANT_INVITE: "Create Instant Invite",
            KICK_MEMBERS: "Kick Members",
            BAN_MEMBERS: "Ban Members",
            MANAGE_CHANNELS: "Manage Channels",
            MANAGE_GUILD: "Manage Server",
            ADD_REACTIONS: "Add Reactions",
            VIEW_AUDIT_LOG: "View Audit Log",
            PRIORITY_SPEAKER: "Priority Speaker",
            VIEW_CHANNEL: "Read Messages",
            READ_MESSAGES: "Read Messages",
            SEND_MESSAGES: "Send Messages",
            SEND_TTS_MESSAGES: "Send TTS",
            MANAGE_MESSAGES: "Manage Messages",
            EMBED_LINKS: "Embed Links",
            ATTACH_FILES: "Attach Files",
            READ_MESSAGE_HISTORY: "Read Message History",
            MENTION_EVERYONE: "Mention Everyone",
            USE_EXTERNAL_EMOJIS: "Use External Emojis",
            CONNECT: "Connect to Voice Channel",
            SPEAK: "Speak in Voice Channels",
            MUTE_MEMBERS: "Mute Members in Voice Channels",
            DEAFEN_MEMBERS: "Deafen Members in Voice Channels",
            MOVE_MEMBERS: "Move Members in Voice Channels",
            USE_VAD: "Use Voice Activity",
            CHANGE_NICKNAME: "Change Nickname",
            MANAGE_NICKNAMES: "Manage Nicknames",
            MANAGE_ROLES_OR_PERMISSIONS: "Manage Roles",
            MANAGE_WEBHOOKS: "Manage Webhooks",
            MANAGE_EMOJIS: "Manage Emojis"
        };


        const mainChannelRegex = /main|general|discussion|home|lobby/gi;
        const secondaryChannelRegex = /bot.*|spam|off-topic/gi;
        const requiredPermissions = ["SEND_MESSAGES", "READ_MESSAGES", "VIEW_CHANNEL"];

        /**
         * Attempt to find the main channel for a specified guild
         * @param {Discord.Guild} guild
         * @returns {Discord.TextChannel}
         */
        bot.util.determineMainChannel = function determineMainChannel(guild){
            if(guild.defaultChannel && guild.defaultChannel.type === "text" && guild.defaultChannel.permissionsFor(bot.client.user).has(requiredPermissions, true)){
                return guild.defaultChannel;
            }

            let channels = guild.channels;

            let mainChannel = channels.find(function(channel){
                return channel.type === "text" && channel.name.match(mainChannelRegex) && channel.permissionsFor(bot.client.user).has(requiredPermissions, true)
            });

            if(mainChannel)
                return mainChannel;

            let secondaryChannel = channels.find(function(channel){
                return channel.type === "text" && channel.name.match(secondaryChannelRegex) && channel.permissionsFor(bot.client.user).has(requiredPermissions, true)
            });

            if(secondaryChannel)
                return secondaryChannel;

            return channels.find(function(channel){
                return channel.type === "text" &&channel.permissionsFor(bot.client.user).has(requiredPermissions, true);
            });
        };

        /**
         * Find the user mentioned and return their probiel
         * @param {string} mention
         * @returns {Discord.User|null}
         */
        bot.util.getUserFromMention = function getUserFromMention(mention) {
            if (!mention) return null;
            if (mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);
                if(mention.startsWith('&'))
                    return null;
                if (mention.startsWith('!'))
                    mention = mention.slice(1);
                return bot.client.users.get(mention);
            }
            return null;
        };

        /**
         * Get the URL pointing to an emoji, including custom and animated ones.
         * @param {string} mention
         * @returns {string|null}
         */
        bot.util.getEmojiURLFromMention = function getEmojiURLFromMention(mention){
            if(!mention) return null;
            if(mention.startsWith("<:") && mention.endsWith(">")){
                let id = mention.substring(2).split(":")[1];
                if(!id)return null;
                id = id.substring(0,id.length-1);
                return `https://cdn.discordapp.com/emojis/${id}.png?v=1`;
            }

            if(mention.startsWith("<a:") && mention.endsWith(">")){
                let id = mention.substring(3).split(":")[1];
                if(!id)return null;
                id = id.substring(0,id.length-1);
                return `https://cdn.discordapp.com/emojis/${id}.gif?v=1`;
            }

            let parse = twemoji.parse(mention, { assetType: 'png' });
            if(parse[0])return parse[0].url;

            return null;
        };

        /**
         * The standard reaction pages used in most paginated commands
         * @param {TextChannel} channel Target Channel
         * @param {Array} pages The array of page data
         * @param {function} formatMessage The function for building the pages
         * @param {boolean} fullReactions Whether or not to use first/last page reactions
         * @param {Number} reactionTime
         * @param reactDict
         * @returns {Promise<void>}
         */
        bot.util.standardPagination = async function standardPagination(channel, pages, formatMessage, fullReactions = false, reactionTime = 120000, reactDict){
            let index = 0;
            let sentMessage;


            let buildPage = async function () {
               let output = await formatMessage(pages[index], index);
                if(sentMessage)
                    await sentMessage.edit(output);
                else
                    sentMessage = await channel.send(output);
            };

            await buildPage();

            bot.tasks.startTask("standardPagination", sentMessage.id);

            if(pages.length === 1 && !reactDict)
                return;

            (async function () {
                if(pages.length > 1) {
                    if (fullReactions)
                        await sentMessage.react("⏮");
                    await sentMessage.react("◀");
                    await sentMessage.react("▶");
                    if (fullReactions)
                        await sentMessage.react("⏭");
                }
                if(reactDict) {
                    Object.keys(reactDict).forEach(async function (react) {
                        await sentMessage.react(react);
                    });
                }
            })();

            await sentMessage.awaitReactions(async function (reaction, user) {
                if (user.id === bot.client.user.id) return false;
                if(reactDict) {
                    if (reactDict[reaction.emoji.name] !== undefined) {
                        await reactDict[reaction.emoji.name]();
                        await buildPage();

                    }
                    if(pages.length === 1) {
                        if(channel.guild)
                            reaction.remove(user);
                        return;
                    }
                }

                switch (reaction.emoji.name) {
                    case "⏮":
                        index = 0;
                        await buildPage();
                        break;
                    case "◀":
                        if (index > 0)
                            index--;
                        else
                            index = pages.length - 1;
                        await buildPage();
                        break;
                    case "▶":
                        if (index < pages.length - 1)
                            index++;
                        else
                            index = 0;
                        await buildPage();
                        break;
                    case "⏭":
                        index = pages.length - 1;
                        await buildPage();
                        break;
                }
                if(channel.guild)
                    reaction.remove(user);

            }, {time: reactionTime});
            if(!sentMessage.deleted) {
                bot.logger.info(`Reactions on ${sentMessage.id} have expired.`);
                sentMessage.clearReactions();
            }else{
                bot.logger.info(`${sentMessage.id} was deleted before the reactions expired.`);
            }
            bot.tasks.endTask("standardPagination", sentMessage.id);
        };


        bot.util.nestedCommands = {};

        bot.util.standardNestedCommandInit = function standardNestedCommandInit(id, directory = id){
            bot.logger.log(`Initialising nested commands for ${id}`);
            fs.readdir(`${__dirname}/../commands/${directory}`, function loadNestedCommands(err, files){
                if(err){
                    bot.raven.captureException(err);
                    bot.logger.warn(`Unable to read ${id} command dir (${directory})`);
                    bot.logger.log(err);
                }else{
                    bot.util.nestedCommands[id] = {};
                    for(let i = 0; i < files.length; i++){
                        try{
                            const command = require(`../commands/${directory}/${files[i]}`);
                            bot.logger.log(`Loaded ${id} command ${command.name}`);
                            for(let c = 0; c < command.commands.length; c++){
                                bot.util.nestedCommands[id][command.commands[c]] = command;
                                if(command.init){
                                    bot.logger.log(`Performing init for ${id} command ${command.name}`);
                                    command.init(bot);
                                }
                            }
                        }catch(e){
                            bot.raven.captureException(e);
                            bot.logger.log(`Error loading ${id} command for ${files[i]}: ${e}`);
                        }
                    }
                }
            });
        };

        bot.util.standardNestedCommand = function standardNestedCommand(message, args, bot, id, data, invalidUsageFunction, subCommandIndex = 1){
            const commandName = args[subCommandIndex] ? args[subCommandIndex].toLowerCase() : "help";
            const commandType = bot.util.nestedCommands[id];
            if(!commandType){
                bot.logger.warn(`No nested command init detected for ${id}!`);
                bot.client.shard.send({type: "warning", payload: {
                    id: "noNestedInit-"+id, message: `No nested command init for ${id}`
                }});
                return message.channel.send("No nested command init detected - Big P Screwed this up.");
            }
            const command = commandType[commandName];
            if(command){
                command.run(message, args, bot, data);
            }else if(commandName === "help"){
                let output = "";
                let usedAliases = [];
                for(let helpItemName in commandType){
                    if(!commandType.hasOwnProperty(helpItemName))continue;
                    const helpItem = commandType[helpItemName];
                    if(usedAliases.indexOf(helpItem.commands[0]) > -1)continue;
                    if(!helpItem.hidden)
                        output += `${helpItem.name} :: ${args[0]} ${helpItem.usage}\n`;
                    usedAliases.push.apply(usedAliases, helpItem.commands);
                }
                message.replyLang("COMMANDS", {commands: output});
            }else{
                if(invalidUsageFunction)
                    return invalidUsageFunction();
                message.replyLang("GENERIC_INVALID_USAGE", {arg: args[0]});
            }
        };


        bot.util.coolTextGenerator = function(message, args, bot, options){
            if(!args[1]){
                return message.replyLang("GENERIC_TEXT", {command: args[0]});
            }

            const text = message.cleanContent.substring(args[0].length+1);
            message.channel.startTyping();

            options.text = text;

            request.post({
                method: "POST",
                url: "https://cooltext.com/PostChange",
                headers: {
                    'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
                },
                form: options
            }, function(err, resp, body){
                if(err){
                    console.log(err);
                    bot.raven.captureException(err);
                    message.channel.stopTyping(true);
                    return message.replyLang("GENERIC_ERROR");
                }
                try{
                    let data = JSON.parse(body);
                    if(data.renderLocation) {
                        message.channel.send("", {
                            embed: {
                                image: {
                                    url: data.renderLocation.replace(/ /g, "%20") //STILL eat a dick!
                                }
                            }
                        });
                    }else {
                        message.replyLang("GENERIC_ERROR");
                        bot.logger.warn("Invalid Response?");
                        bot.logger.warn(body);
                    }
                }catch(e){
                    bot.raven.captureException(e);
                    bot.logger.error(e);
                    console.log(e);
                    console.log("Body:", body);
                    message.replyLang("GENERIC_ERROR");
                }finally{
                    message.channel.stopTyping();
                }
            })
        };

        let waitingUsers = {};
        bot.util.getUserInfo = function getUserInfo(userID){
            return new Promise(function getUserInfoPromise(fulfill){
                bot.client.shard.send({type: "getUserInfo", payload: userID});
                let timeout = setTimeout(fulfill, 200);
                waitingUsers[userID] = [fulfill, timeout];
            });
        };

        process.on("message", function (message){
            if(message.type === "getUserInfoResponse"){
                const waitingUser = waitingUsers[message.payload.id];
                if(waitingUser){
                    clearTimeout(waitingUser[1]);
                    waitingUser[0](message.payload);
                }
            }
        });


        bot.util.bots = {
            music: {
                "235088799074484224": "Rythm",
                "234395307759108106": "Groovy",
                "252128902418268161": "Rythm 2",
                "415062217596076033": "Rythm Canary",
                "239631525350604801": "Pancake",
                "472714545723342848": "Ear Tensifier",
                "155149108183695360": "Dyno"
            }
        };


        bot.util.swearRegex = /fuck|sh[i!1]t|cunt|n[i!1]g*(er|a|4|3r)|f[4a]g+[o0e3]t|p[i!1]ss|d[i!1]ck|[a4]ss+h[o0]le|cum/gi

        bot.util.timezoneRegex = /(UTC|GMT)([+\-][0-9]+)/i;

        //STILL fuck you joel
        bot.util.timezones = {ACDT: "10.5",
            ACST: "09.5",
            ACT: "-05",
            ACWST: "08.75",
            ADT: "-03",
            AEDT: "11",
            AEST: "10",
            AFT: "04.5",
            AKDT: "-08",
            AKST: "-09",
            AMST: "-03",
            AMT: "-04",
            ART: "-03",
            AST: "03",
            AWST: "08",
            AZOST: "0",
            AZOT: "-01",
            AZT: "04",
            BDT: "08",
            BIOT: "06",
            BIT: "-12",
            BOT: "-04",
            BRST: "-02",
            BRT: "-03",
            BST: "06",
            BTT: "06",
            CAT: "02",
            CCT: "06.5",
            CDT: "-05",
            CEST: "02",
            CET: "01",
            CHADT: "13.75",
            CHAST: "12.75",
            CHOT: "08",
            CHOST: "09",
            CHST: "10",
            CHUT: "10",
            CIST: "-08",
            CIT: "08",
            CKT: "-10",
            CLST: "-03",
            CLT: "-04",
            COST: "-04",
            COT: "-05",
            CST: "-06",
            CT: "08",
            CVT: "-01",
            CWST: "08.75",
            CXT: "07",
            DAVT: "07",
            DDUT: "10",
            DFT: "01",
            EASST: "-05",
            EAST: "-06",
            EAT: "03",
            ECT: "-04",
            EDT: "-04",
            EEST: "03",
            EET: "02",
            EGST: "0",
            EGT: "-01",
            EIT: "09",
            EST: "-05",
            FET: "03",
            FJT: "12",
            FKST: "-03",
            FKT: "-04",
            FNT: "-02",
            GALT: "-06",
            GAMT: "-09",
            GET: "04",
            GFT: "-03",
            GILT: "12",
            GIT: "-09",
            GMT: "00",
            GST: "-02",
            GYT: "-04",
            HDT: "-09",
            HAEC: "02",
            HST: "-10",
            HKT: "08",
            HMT: "05",
            HOVST: "08",
            HOVT: "07",
            ICT: "07",
            IDLW: "-12",
            IDT: "03",
            IOT: "03",
            IRDT: "04.5",
            IRKT: "08",
            IRST: "03.5",
            IST: "05.5",
            JST: "09",
            KGT: "06",
            KOST: "11",
            KRAT: "07",
            KST: "09",
            LHST: "10.5",
            LINT: "14",
            MAGT: "12",
            MART: "-09.5",
            MAWT: "05",
            MDT: "-06",
            MET: "01",
            MEST: "02",
            MHT: "12",
            MIST: "11",
            MIT: "-09.5",
            MMT: "06.5",
            MSK: "03",
            MST: "08",
            MUT: "04",
            MVT: "05",
            MYT: "08",
            NCT: "11",
            NDT: "-02.5",
            NFT: "11",
            NPT: "05.75",
            NST: "-03.5",
            NT: "-03.5",
            NUT: "-11",
            NZDT: "13",
            NZST: "12",
            OMST: "06",
            ORAT: "05",
            PDT: "-07",
            PET: "-05",
            PETT: "12",
            PGT: "10",
            PHOT: "13",
            PHT: "08",
            PKT: "05",
            PMDT: "-02",
            PMST: "-03",
            PONT: "11",
            PST: "-08",
            PYST: "-03",
            PYT: "-04",
            RET: "04",
            ROTT: "-03",
            SAKT: "11",
            SAMT: "04",
            SAST: "02",
            SBT: "11",
            SCT: "04",
            SDT: "-10",
            SGT: "08",
            SLST: "05.5",
            SRET: "11",
            SRT: "-03",
            SST: "-11",
            SYOT: "03",
            TAHT: "-10",
            THA: "07",
            TFT: "05",
            TJT: "05",
            TKT: "13",
            TLT: "09",
            TMT: "05",
            TRT: "03",
            TOT: "13",
            TVT: "12",
            ULAST: "09",
            ULAT: "08",
            USZ1: "02",
            UYST: "-02",
            UYT: "-03",
            UZT: "05",
            VET: "-04",
            VLAT: "10",
            VOLT: "04",
            VOST: "06",
            VUT: "11",
            WAKT: "12",
            WAST: "02",
            WAT: "01",
            WEST: "01",
            WIT: "07",
            WST: "08",
            YAKT: "09",
            YEKT: "05"};


    }
};