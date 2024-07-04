const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,  // Change this to false because it should handle multiple interactions
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
                try {
                    await interaction.respond([{ name: 'Error', value: 'There was an error while processing the autocomplete!' }]);
                } catch (respondError) {
                    console.error('Error responding to autocomplete interaction:', respondError);
                }
            }
        }
    },
};
