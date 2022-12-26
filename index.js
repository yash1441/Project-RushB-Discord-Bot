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

client.on("interactionCreate", async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, client);
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: "There was an error while executing this command!",
			});
		}
	} else if (interaction.isButton()) {
		if (interaction.customId == "suggestionSubmit") {
			await interaction.deferReply({ ephemeral: true });
			const suggestionSelectMenu = new StringSelectMenuBuilder()
				.setCustomId("suggestionSelectMenu")
				.setPlaceholder("Suggestion Category")
				.addOptions(
					{
						label: "Vehicle",
						value: "Vehicle",
					},
					{
						label: "Building",
						value: "Building",
					},
					{
						label: "Weather",
						value: "Weather",
					},
					{
						label: "Chat",
						value: "Chat",
					},
					{
						label: "Shooting",
						value: "Shooting",
					},
					{
						label: "Clan",
						value: "Clan",
					},
					{
						label: "Game Modes",
						value: "Game Modes",
					},
					{
						label: "Progression",
						value: "Progression",
					},
					{
						label: "Customization",
						value: "Customization",
					},
					{
						label: "Others",
						value: "Others",
					}
				);

			let row = new ActionRowBuilder().addComponents(suggestionSelectMenu);

			await interaction.editReply({
				content: `**Select Suggestion Category**`,
				components: [row],
			});
		}
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId.startsWith("bug_")) {
			await interaction.deferReply({ ephemeral: true });
			let bPhone = interaction.fields.getTextInputValue("bugPhone");
			let bDetails = interaction.fields.getTextInputValue("bugDetails");
			let bUserId = interaction.user.id;
			let bRoleId = interaction.fields.getTextInputValue("bugRole");
			let bCategory = interaction.customId.substring(4);

			let file = `${interaction.user.id}-bug.jpg`;
			let tenantToken = await feishu.authorize(
				process.env.FEISHU_ID,
				process.env.FEISHU_SECRET
			);
			let response = await feishu.uploadToDrive(
				tenantToken,
				process.env.FEEDBACK_BASE,
				file,
				"bitable_image"
			);
			let file_token = JSON.parse(response).data.file_token;

			let bugs = {
				fields: {
					"Discord ID": bUserId,
					"Discord Name": interaction.user.tag,
					"Role ID": bRoleId,
					"Bug Details": bDetails,
					Source: "Discord",
					"Phone Model": bPhone,
					"Bug Type": bCategory,
					Screenshot: [{ file_token: file_token }],
				},
			};

			await feishu.createRecord(
				tenantToken,
				process.env.FEEDBACK_BASE,
				process.env.BUG_POOL,
				bugs
			);

			fs.unlinkSync(file);

			await interaction.editReply({
				content: "Your submission was received successfully!",
			});
		} else if (interaction.customId.startsWith("sug_")) {
			await interaction.deferReply({ ephemeral: true });

			let suggestionCategory = interaction.customId.substring(4);
			let suggestionDetails =
				interaction.fields.getTextInputValue("suggestionDetails");

			await interaction.editReply({
				content: "Your submission was received successfully!",
			});

			const suggestionEmbed = new EmbedBuilder()
				.setTitle(suggestionCategory)
				.setDescription(interaction.user.id)
				.setAuthor({ name: `Suggestion by ${interaction.user.tag}` })
				.addFields(
					{ name: "Feedback details", value: suggestionDetails },
					{
						name: "Players Region",
						value: interactionRegionRole(interaction),
					}
				)
				.setTimestamp();

			await client.channels
				.fetch("968998152009027615")
				.then((channel) => channel.send({ embeds: [suggestionEmbed] }))
				.then((sentMessage) => {
					sentMessage.react("✅").then(() => sentMessage.react("❌"));
				});
		}
	} else if (interaction.isStringSelectMenu()) {
		if (interaction.customId == "suggestionSelectMenu") {
			let category = interaction.values[0];
			const suggestionModal = new ModalBuilder().setCustomId("sug_" + category);
			suggestionModal.setTitle(category);
			const suggestionDetails = new TextInputBuilder()
				.setCustomId("suggestionDetails")
				.setLabel("Suggestion Details")
				.setPlaceholder("Explain the suggestion here.")
				.setStyle(TextInputStyle.Paragraph);

			let firstQuestion = new ActionRowBuilder().addComponents(
				suggestionDetails
			);

			suggestionModal.addComponents(firstQuestion);

			await interaction.showModal(suggestionModal);
			await interaction.followUp({
				content: `Selected **${category}**.`,
				components: [],
				ephemeral: true,
			});
		}
	}
});

client.login(process.env.DISCORD_TOKEN);
