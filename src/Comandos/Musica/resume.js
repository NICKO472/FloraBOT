import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Retoma a música pausada'),

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
                        .setDescription(
                            'Não há nada tocando para eu poder resumir!'
                        )
                ]
            })
        }

        if (queue.player) {
            queue.player.unpause()
        }

        const embed = new Discord.EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription('▶️ A música voltou a tocar!')

        await interaction.editReply({
            embeds: [embed]
        })

        const message = await interaction.fetchReply()

        await message.react('▶️')
    }
}