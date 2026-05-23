import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila de músicas'),

    category: 'musica',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

        const channel = interaction.member.voice.channel

        if (!channel) {

            const embedError = new Discord.EmbedBuilder()
                .setTitle('Um erro foi encontrado!')
                .setColor('#FFFFFF')
                .setDescription(
                    'Você precisa estar em um canal de voz para digitar esse comando!'
                )

            return interaction.editReply({
                embeds: [embedError]
            })
        }

        const queue = client.queue.get(interaction.guild.id)

        if (!queue || !queue.songs.length) {

            const embedEmpty = new Discord.EmbedBuilder()
                .setTitle('Lista de músicas')
                .setColor('#FFFFFF')
                .setDescription('Não há nada na fila!')

            return interaction.editReply({
                embeds: [embedEmpty]
            })
        }

        const currentSong = queue.songs[0]

        const status = queue.songs
            .map((song, index) => {
                return `${index === 0 ? '🎶 Tocando agora:' : '•'} ${song.title}`
            })
            .join('\n')

        const embed = new Discord.EmbedBuilder()
            .setTitle('Lista de músicas')
            .setImage(currentSong.thumbnail)
            .setColor('#FFFFFF')
            .setDescription(status)

        await interaction.editReply({
            embeds: [embed]
        })
    }
}