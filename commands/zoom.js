module.exports = {
    name: "Zoom Image",
    usage: "zoom [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["zoom", "blur"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "motionBlur", [message.getSetting("zoom.radius"), message.getSetting("zoom.sigma")]);
    }
};