const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Permet la gestion des serveurs de jeux multijoueurs. (hors Minecraft)')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Phrase to search for')
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const ApiPath = 'https://api.antredesloutres.fr/serveurs/actifs/jeu/Others';
        try {
            // console.log('Fetching data for autocomplete...');
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(ApiPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Data fetched successfully:', data);

            const choices = data.map(element => ({
                name: element.nom_serv,
                value: element.id_serv
            }));

            // console.log('Responding to interaction with choices:', choices);
            await interaction.respond(choices);
        } catch (error) {
            console.error('Error fetching data for autocomplete:', error);
            await interaction.respond([
                {
                    name: 'Error',
                    value: 'There was an error while processing the autocomplete!'
                }
            ]).catch(err => console.error('Error responding to interaction:', err));
        }
    },
    async execute(interaction) {
        // Ecrit le résultat de la commande en fonction du choix de l'utilisateur
        const id_serv = interaction.options.getString('query');

        // Récupére le token_client de l'API
        const { token_api } = require('../../config.json');

        try {
            if (!id_serv) {
                await interaction.reply('Veuillez choisir un serveur.');
                return;
            }
        
            // Fait une requête POST à l'API pour démarrer le serveur
            const ApiPath = 'https://api.antredesloutres.fr/serveurs/start';
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(ApiPath, {
                method: 'POST',
                body: JSON.stringify({ id_serv: id_serv, client_token: token_api }),
                headers: { 'Content-Type': 'application/json' }
            });
        
            // Vérifie le statut de la réponse
            if (!response.ok) {
                throw new Error(`Failed to start server: ${response.status} ${response.statusText}`);
            }
        
            // Récupère les données de la réponse
            const data = await response.json();
            console.log('Résultat de la requête:', data);
        
            // Envoie la réponse à l'utilisateur en fonction des données reçues
            if (data.status === "0") {
                await interaction.reply('Le serveur est déjà démarré.');
            } else {
                await interaction.reply('Le serveur est en cours de démarrage.');
            }
        } catch (error) {
            console.error('Erreur lors de la requête API:', error);
            await interaction.reply('Erreur lors du démarrage du serveur.');
        }
    }
};
