import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa a música atual'),

    category: 'musica',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

        const channel = interaction.member.voice.channel

        if (!channel) {
            return interaction.editReply({
                content: 'Você deve estar em um canal de voz para utilizar esse comando!'
            })
        }

        const queue = client.queue.get(interaction.guild.id)

        if (!queue) {
            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor('#FFFFFF')
                        .setDescription('Nenhuma música está tocando atualmente!')
                ]
            })
        }

        if (queue.playing !== false) {
            queue.connection.dispatcher.pause()
        }

        const embed = new Discord.EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription(
                '⏸ Pausei a música!'
            )

        await interaction.editReply({
            embeds: [embed]
        })

        const message = await interaction.fetchReply()

        await message.react('⏸')
    }
}