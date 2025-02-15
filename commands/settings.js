const bools = {
    "true": true,
    "false": false,
    "1": true,
    "0": false,
    "on": true,
    "off": false,
    "yes": true,
    "no": false,
    "allowed": true,
    "disallowed": false
};
module.exports = {
    name: "Bot Settings",
    usage: "settings help/set/list/enableCommand/disableCommand",
    categories: ["meta"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["settings", "config"],
    settings: {
        prefix: {
            name: "Prefix",
            help: "The character that goes before the command, e.g !settings (Default !)",
            setting: "prefix",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3]) {
                    //Idiot guard
                    if(args[3].toLowerCase() === "value")
                        return message.replyLang("SETTINGS_PREFIX_IDIOT", {arg: args[0]});

                    await bot.database.setSetting(message.guild.id, "prefix", args[3]);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang("SETTINGS_PREFIX_SET", {prefix: args[3]});
                }else{
                    message.replyLang("SETTINGS_PREFIX_NONE", {arg: args[0]});
                }
            }
        },
        wholesome: {
            name: "Wholesome mode",
            help: "Makes the  bot more wholesome",
            setting: "wholesome",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "wholesome", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);

                    message.channel.send((bool? "Enabled" : "Disabled")+" wholesome mode.");
                   // message.replyLang(`SETTINGS_NSFW_${bool ? "ENABLE":"DISABLE"}`);
                }else{
                    message.channel.send("You must enter a value either true or false.");
                    //message.replyLang("SETTINGS_NSFW_NONE", {arg: args[0]});
                }
            }
        },
        allownsfw: {
            name: "Allow NSFW",
            help: "Allow NSFW commands such as !pornsuggest",
            setting: "allownsfw",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "allowNSFW", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang(`SETTINGS_NSFW_${bool ? "ENABLE":"DISABLE"}`);
                }else{
                    message.replyLang("SETTINGS_NSFW_NONE", {arg: args[0]});
                }
            }
        },
        bypassnsfw: {
            name: "Bypass NSFW check",
            help: "Allow NSFW commands in any channel regardless of NSFW status",
            setting: "bypassnsfw",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "bypassNSFWCheck", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang(`SETTINGS_BYPASS_NSFW_${bool ? "ENABLE":"DISABLE"}`);
                }else{
                    message.replyLang("SETTINGS_BYPASS_NSFW_NONE", {arg: args[0]});
                }
            }
        },
        seriousporn: {
            name: "Serious Porn Suggest mode",
            help: "Give actual suggestions with !pornsuggest instead of joke ones.",
            setting: "seriousporn",
            value: "true or false",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bools[args[3].toLowerCase()] !== undefined) {
                    const bool = bools[args[3].toLowerCase()];
                    await bot.database.setSetting(message.guild.id, "pornsuggest.serious", bool);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang(`SETTINGS_SERIOUS_PORN_${bool ? "ENABLE":"DISABLE"}`);
                }else {
                    message.replyLang("SETTINGS_SERIOUS_PORN_NONE", {arg: args[0]});
                }
            }
        },
        lang: {
            name: "Bot Language",
            help: "Choose the language OcelotBOT should respond in. Check !languages for a list",
            setting: "lang",
            value: "language-code",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                if(args[3] && bot.lang.strings[args[3].toLowerCase()]) {
                    await bot.database.setSetting(message.guild.id, "lang", args[3].toLowerCase());
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang("SETTINGS_LANGUAGE_SET", {code: args[3], name: bot.lang.strings[args[3].toLowerCase()].LANGUAGE_NAME});
                }else{
                    message.replyLang("SETTINGS_LANGUAGE_NONE", {arg: args[0]});
                }
            }
        },
        role: {
            name: "Settings Role",
            help: "The role needed to use this command.",
            setting: "settings.role",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                let roleName = args[3];
                if(message.mentions.roles.size > 0)
                    roleName = message.mentions.roles.first().name;

                if(!roleName)
                    return message.replyLang("SETTINGS_ROLE_INVALID");

                await bot.database.setSetting(message.guild.id, "settings.role", roleName.toLowerCase());
                await bot.config.reloadCacheForServer(message.guild.id);
                message.replyLang("SETTINGS_ROLE_SET", {roleName});
            }
        },
        timezone: {
            name: "Timezone",
            help: "The timezone used for !time",
            setting: "time.zone",
            format: function(input){
                return `\`${input}\``
            },
            onSet: async function(message, args, bot){
                let timezone = args[3];
                if(bot.util.timezones[timezone] || bot.util.timezoneRegex.exec(timezone)){
                    await bot.database.setSetting(message.guild.id, "time.zone", timezone);
                    await bot.config.reloadCacheForServer(message.guild.id);
                    message.replyLang("SETTINGS_TIMEZONE_SET");
                }else{
                    message.replyLang("SETTINGS_TIMEZONE_NONE");
                }
            }
        }
    },
    init: function(bot){
        bot.util.standardNestedCommandInit('settings');
    },
    run: async function(message, args, bot){
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");
        if(!message.guild.available)
            return message.replyLang("GENERIC_GUILD_UNAVAILABLE");

        if(message.guild.ownerID === message.author.id || message.member.roles.find(function(role){
            return role.name.toLowerCase() === "bot master" || role.name.toLowerCase() === message.getSetting("settings.role").toLowerCase();
        })){
            let arg =  args[1] && args[1].toLowerCase();
            if(arg && arg === "help" && args[2]){
                if(module.exports.settings[args[2].toLowerCase()]){
                    const setting = module.exports.settings[args[2].toLowerCase()];
                    message.channel.send(`${setting.name}:\n${setting.help}`);
                }else{
                    message.replyLang("SETTINGS_HELP_SETTING");
                }
            }else {
                bot.util.standardNestedCommand(message, args, bot, 'settings', module.exports);
            }
        }else{
            message.replyLang("SETTINGS_NO_ROLE", {role: message.getSetting("settings.role")});
        }
    }
};