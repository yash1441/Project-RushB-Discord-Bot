const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Check the ping between the bot and you."),
	async execute(interaction, client) {
		await interaction.reply(
			`**Latency** ${
				Date.now() - interaction.createdTimestamp
			}ms\n**API Latency** ${Math.round(client.ws.ping)}ms`
		);
	},
};
