/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/04/2019
 * ╚════ ║   (ocelotbotv5) mirror
 *  ════╝
 */
module.exports = {
    name: "Mirror Image",
    usage: "mirror [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["mirror", "flipimage"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "flop", []);
    }
};