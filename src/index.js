require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes
} = require("discord.js");

const config =
  require("./config/config");

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

    // Required for /join to detect the user's voice channel
    GatewayIntentBits.GuildVoiceStates
  ],

  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.User
  ]
});

// Ready event
require("./events/ready")(client);

// Security events
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

// Register slash commands
client.once("ready", async () => {
  const rest = new REST({
    version: "10"
  }).setToken(
    process.env.DISCORD_TOKEN
  );

  const commandData =
    [...commands.values()].map(
      command => command.data.toJSON()
    );

  try {
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
      "✅ Slash commands registered."
    );
  } catch (error) {
    console.error(
      "❌ Slash command registration failed:",
      error
    );
  }
});

// Environment checks
if (!process.env.DISCORD_TOKEN) {
  console.error(
    "❌ DISCORD_TOKEN is missing."
  );

  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error(
    "❌ CLIENT_ID is missing."
  );

  process.exit(1);
}

// Login
client.login(
  process.env.DISCORD_TOKEN
);
