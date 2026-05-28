import Discord from 'discord.js'
import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra o painel de ajuda'),

    aliases: ['ajuda', 'comandos', 'comando'],
    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client) {

        const menu = new StringSelectMenuBuilder()
            .setCustomId('help-menu')
            .setPlaceholder('Meus comandos')
            .addOptions([
                {
                    label: 'Página Inicial',
                    emoji: '📓',
                    value: 'Primeiro'
                },
                {
                    label: 'Administração',
                    emoji: '⚙',
                    value: 'Segundo',
                    description: 'Comandos de Administração!'
                },
                {
                    label: 'Utilidade',
                    emoji: '🔒',
                    value: 'Terceiro',
                    description: 'Comandos de Utilidade!'
                },
                {
                    label: 'Diversão',
                    emoji: '🍕',
                    value: 'Quarto',
                    description: 'Comandos de Diversão!'
                },
                {
                    label: 'Economia',
                    emoji: '💵',
                    value: 'Quinto',
                    description: 'Comandos de Economia!'
                },
                {
                    label: 'Informação',
                    emoji: '🔎',
                    value: 'Sexto',
                    description: 'Comandos de Informação!'
                },
                {
                    label: 'Botlists',
                    emoji: '🔬',
                    value: 'Setimo',
                    description: 'Comandos de Botlists!'
                },
                {
                    label: 'Música',
                    emoji: '🎶',
                    value: 'Oitavo',
                    description: 'Comandos de Música!'
                }
            ])

        const row = new ActionRowBuilder()
            .addComponents(menu)

        const embed = new EmbedBuilder()
            .setTitle('Meus comandos')
            .setColor('#FFFFFF')
            .setDescription('Selecione uma categoria abaixo.')

        await interaction.editReply({
            embeds: [embed],
            components: [row]
        })

        const message = await interaction.fetchReply()

        const collector = message.createMessageComponentCollector({
            time: 300000
        })

        collector.on('collect', async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'Você não pode usar este menu.',
                    ephemeral: true
                })
            }

            let embedMenu

            if (i.values[0] === 'Primeiro') {

                embedMenu = new EmbedBuilder()
                    .setTitle('Meus comandos')
                    .setColor('#FFFFFF')
                    .setDescription('Selecione uma categoria abaixo.')
            }

            if (i.values[0] === 'Segundo') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/setprefix
/config
`)
            }

            if (i.values[0] === 'Terceiro') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/help
/ping
/avatar
/serverinfo
/userinfo
/servericon
/uptime
/reportbug
`)
            }

            if (i.values[0] === 'Quarto') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/perfil
`)
            }

            if (i.values[0] === 'Quinto') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/work
/atm
/deposit
/sacar
/daily
/transactions
`)
            }

            if (i.values[0] === 'Sexto') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/botinfo
/invite
`)
            }

            if (i.values[0] === 'Setimo') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/addbot
/aprovar
/reprovar
/botlist
`)
            }

            if (i.values[0] === 'Oitavo') {

                embedMenu = new EmbedBuilder()
                    .setTitle('__Painel de Ajuda__')
                    .setColor('#FFFFFF')
                    .setTimestamp()
                    .setDescription(`
/play
/queue
/leave
/pause
/resume
/skip
/volume
`)
            }

            await i.update({
                embeds: [embedMenu],
                components: [row]
            })
        })
    }
}