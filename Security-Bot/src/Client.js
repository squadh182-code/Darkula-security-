const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");

class SecurityBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
      ],

      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember
      ]
    });
  }
}

module.exports = SecurityBot;
