import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pula a música atual'),

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

            const embed = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    'Nada está tocando no momento para eu poder pular!'
                )

            return interaction.editReply({
                embeds: [embed]
            })
        }

        if (queue.songs.length !== 0) {

            queue.player.stop()

            const embed = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription('⏭️ A música foi pulada!')

            return interaction.editReply({
                embeds: [embed]
            })
        }
    }
}