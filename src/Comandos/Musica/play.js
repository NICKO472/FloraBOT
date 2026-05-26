import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'

import {
    useMainPlayer
} from 'discord-player' 

export default {

    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Nome ou link da música')
                .setRequired(true)
        ),

    category: 'Musica',

    cooldown: 3,

async execute(interaction) {
    interaction.editReply(`Comando em manutenção!`)
}
}