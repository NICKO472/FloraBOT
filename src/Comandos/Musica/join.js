import Discord from 'discord.js'
import { QuickDB } from 'quick.db'
import { SlashCommandBuilder } from 'discord.js'
import moment from 'moment'
import { joinVoiceChannel } from '@discordjs/voice'

const db = new QuickDB()

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Faz o bot entrar em um canal de voz'),

    category: 'musica',
    cooldown: 3,

    async execute(interaction, client) {

        const entry = await db.get(
            `joinvoice_${interaction.guild.id}_${client.user.id}`
        )

        if (entry !== null) {

            const ath = await db.get(
                `joinauthor_${interaction.guild.id}_${client.user.id}`
            )

            const chvoice = client.channels.cache.get(entry)

            const setauthor = client.users.cache.get(ath)

            const date = await db.get(
                `joindate_${interaction.guild.id}_${client.user.id}`
            )

            const date2 = moment(date).format(
                'DD/MMMM/YYYY [às] HH:mm'
            )

            joinVoiceChannel({
                channelId: chvoice.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            })

            const embed2 = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    `${interaction.user} entrei no canal ${chvoice} setado por ${setauthor} em ${date2}`
                )

            return interaction.reply({
                embeds: [embed2]
            })
        }

        const voiceChannel = interaction.member.voice.channel

        if (!voiceChannel) {
            return interaction.reply({
                content: `${interaction.user} Você precisa estar em um canal de voz para eu entrar!`,
                ephemeral: true
            })
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

        await db.set(
            `joinvoice_${interaction.guild.id}_${client.user.id}`,
            voiceChannel.id
        )

        await db.set(
            `joinauthor_${interaction.guild.id}_${client.user.id}`,
            interaction.user.id
        )

        await db.set(
            `joindate_${interaction.guild.id}_${client.user.id}`,
            Date.now()
        )

        const embed = new Discord.EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription(
                `${interaction.user} ${voiceChannel} será o canal que irei entrar toda vez que esse comando!`
            )

        await interaction.reply({
            embeds: [embed]
        })
    }
}