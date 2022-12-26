const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("buttons")
		.setDescription("Sets up embed and buttons for respective actions.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("submit-suggestion")
				.setDescription("Setup Submit Suggestion Application.")
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("Input the channel.")
						.setRequired(true)
				)
		),
	async execute(interaction, client) {
		await interaction.deferReply();
		if (interaction.user.id != "132784173311197184") {
			interaction.deleteReply();
			return;
		}
		const subCommand = interaction.options.getSubcommand();
		const channel = interaction.options.getChannel("channel");

		if (subCommand === "submit-suggestion") {
			const submitButton = new ButtonBuilder()
				.setCustomId("suggestionSubmit")
				.setLabel("Submit Suggestion")
				.setStyle(ButtonStyle.Success)
				.setEmoji("📝");

			const submitEmbed = new EmbedBuilder()
				.setTitle(`FEEDBACK HELP US IMPROVE THE GAME!`)
				.setDescription(
					`This is the channel where you submit the suggestions!\nOnce approved, suggestions will be shared in <#961887917255561226> for public voting!`
				)
				.setColor(`2596bE`);

			const submitRow = new ActionRowBuilder().addComponents([submitButton]);

			client.channels
				.fetch(channel.id)
				.then((channel) =>
					channel.send({ embeds: [submitEmbed], components: [submitRow] })
				);
		}
		await interaction.deleteReply();
	},
};
