import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import moment from 'moment'

moment.locale('pt-BR')

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informações do servidor'),

    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

        const membros = interaction.guild.members.cache

        const emojis = interaction.guild.emojis.cache

        const texto = interaction.guild.channels.cache.filter(
            ch => ch.type === Discord.ChannelType.GuildText
        )

        const voz = interaction.guild.channels.cache.filter(
            ch => ch.type === Discord.ChannelType.GuildVoice
        )

        const embed = new Discord.EmbedBuilder()
            .setTitle(`Infos do server ${interaction.guild.name}`)
            .setColor('#FFFFFF')
            .setThumbnail(
                interaction.guild.iconURL({ dynamic: true })
            )
            .addFields(
                {
                    name: 'Nome:',
                    value: `${interaction.guild.name}`,
                    inline: true
                },
                {
                    name: 'ID:',
                    value: `${interaction.guild.id}`,
                    inline: true
                },
                {
                    name: 'Membros:',
                    value: `${interaction.guild.memberCount}`,
                    inline: true
                },
                {
                    name: 'Criação:',
                    value: `${moment(interaction.guild.createdTimestamp).format('ll')}`,
                    inline: true
                },
                {
                    name: 'Humanos:',
                    value: `${membros.filter(member => !member.user.bot).size}`,
                    inline: true
                },
                {
                    name: 'Bots:',
                    value: `${membros.filter(member => member.user.bot).size}`,
                    inline: true
                },
                {
                    name: 'Emojis:',
                    value: `${emojis.size}`,
                    inline: true
                },
                {
                    name: 'Canais de Texto:',
                    value: `${texto.size}`,
                    inline: true
                },
                {
                    name: 'Canais de Voz:',
                    value: `${voz.size}`,
                    inline: true
                }
            )

        await interaction.editReply({
            embeds: [embed]
        })
    }
}