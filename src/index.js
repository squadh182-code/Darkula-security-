require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes
} = require("discord.js");

const config = require("./config/config");

const {
  commands
} = require("./events/interactionCreate");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates
  ],

  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.User
  ]
});

require("./events/ready")(client);

client.on(
  "guildMemberAdd",
  require("./events/guildMemberAdd")
);

client.on(
  "messageCreate",
  require("./events/messageCreate")
);

client.on(
  "interactionCreate",
  require("./events/interactionCreate")
);

client.on(
  "guildAuditLogEntryCreate",
  require("./events/guildAuditLogEntryCreate")
);

client.once("ready", async () => {
  console.log("🔄 Refreshing slash commands...");

  const rest = new REST({
    version: "10"
  }).setToken(process.env.DISCORD_TOKEN);

  const commandData = [...commands.values()].map(
    command => command.data.toJSON()
  );

  try {
    // Clear old guild commands
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        config.guildId
      ),
      {
        body: []
      }
    );

    console.log("🗑️ Old slash commands cleared.");

    // Register fresh commands
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        config.guildId
      ),
      {
        body: commandData
      }
    );

    console.log(
      `✅ ${commandData.length} slash commands registered fresh.`
    );

  } catch (error) {
    console.error(
      "❌ Slash command refresh failed:",
      error
    );
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing.");
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error("❌ CLIENT_ID is missing.");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
