import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Mostra o avatar de um usuário')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Usuário para ver o avatar')
                .setRequired(false)
        ),

    aliases: ['ava'],
    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client) {

        const user =
            interaction.options.getUser('user') ||
            interaction.user

        const avatar = user.displayAvatarURL({
            extension: 'png',
            size: 1024,
            forceStatic: false
        })

        const embed = new Discord.EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle(`📷 Avatar de ${user.username}`)
            .setImage(avatar)
            .setFooter({
                text: `• Autor: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })

        await interaction.reply({
            embeds: [embed]
        })
    }
}