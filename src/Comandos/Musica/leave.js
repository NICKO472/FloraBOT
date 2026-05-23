import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Desconecta o bot do canal de voz'),

    aliases: ['sair'],
    category: 'musica',
    cooldown: 3,

    async execute(interaction, client) {

        const channel = interaction.member.voice.channel

        if (!channel) {
            return interaction.reply({
                content: 'Você deve estar em um canal de voz para utilizar esse comando!',
                ephemeral: true
            })
        }

        const botChannel = interaction.guild.members.me.voice.channel

        if (!botChannel) {
            return interaction.reply({
                content: 'Eu preciso estar em um canal de voz!',
                ephemeral: true
            })
        }

        const connection = getVoiceConnection(interaction.guild.id)

        if (connection) {
            connection.destroy()
        }

        if (client.queue) {
            client.queue.delete(interaction.guild.id)
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('Fui desconectado!')
            .setColor('#FFFFFF')
            .setDescription(
                `${interaction.user} me desconectou`
            )

        await interaction.reply({
            embeds: [embed]
        })
    }
}