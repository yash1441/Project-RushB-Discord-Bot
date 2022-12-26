const {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	ChannelType,
	ActionRowBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
	ActivityType,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const request = require("request-promise");
const feishu = require("./feishu.js");
require("dotenv").config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

////////////////////
/// ADD COMMANDS ///
////////////////////

let files = fs.readdirSync("./"),
	file;

for (file of files) {
	if (file.startsWith("autoAdd")) {
		require("./" + file);
	}
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

////////////////////
//// BOT EVENTS ////
////////////////////

client.on("ready", () => {
	console.log("* Discord bot connected. *");
	client.user.setPresence({
		activities: [
			{
				name: `Project RushB`,
				type: ActivityType.Playing,
			},
		],
		status: `dnd`,
	});
});

client.login(process.env.DISCORD_TOKEN);
