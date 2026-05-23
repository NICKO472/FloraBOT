import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Mostra o tempo online do bot'),

    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

        let totalSeconds = client.uptime / 1000

        let days = Math.floor(totalSeconds / 86400)

        let hours = Math.floor(totalSeconds / 3600)

        totalSeconds %= 3600

        let minutes = Math.floor(totalSeconds / 60)

        let seconds = Math.floor(totalSeconds % 60)

        let uptime =
            `${days} Dias, ${hours} Horas, ${minutes} Minutos e ${seconds} Segundos`

        const embed = new Discord.EmbedBuilder()
            .setTitle('⏱️ Uptime')
            .setColor('#FFFFFF')
            .setDescription(
                `Estou acordado há ${uptime} gerenciando ${client.users.cache.size} usuários`
            )

        await interaction.editReply({
            embeds: [embed]
        })
    }
}