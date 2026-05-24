import {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ComponentType
} from 'discord.js'

import { QuickDB } from 'quick.db'

const db = new QuickDB()

export default {

    data: new SlashCommandBuilder()
        .setName('background')
        .setDescription('Sistema de backgrounds')
        .addStringOption(option =>
            option
                .setName('modo')
                .setDescription('Escolha entre loja ou inventário')
                .setRequired(true)
                .addChoices(
                    { name: '🛒 Loja', value: 'shop' },
                    { name: '🎨 Inventário', value: 'inventory' }
                )
        ),

    category: 'perfil',

    async execute(interaction) {

        await interaction.deferReply()

        const modo = interaction.options.getString('modo')

        const dispbacks = await db.get(`backgrounds`) || []

        const displista = dispbacks.length
            ? dispbacks.map((b, i) => `\`${i + 1}.\` ${b}`).join('\n')
            : 'Não há Backgrounds disponíveis na loja :('

        // =========================
        // LOJA
        // =========================
        if (modo === 'shop') {

            const menu = new StringSelectMenuBuilder()
                .setCustomId('bk-loja')
                .setPlaceholder('Selecionar página')
                .addOptions([
                    {
                        label: 'Página 1',
                        value: 'PG1'
                    }
                ])

            const row = new ActionRowBuilder()
                .addComponents(menu)

            const embedLoja = new EmbedBuilder()
                .setTitle('🛒 Loja de Backgrounds')
                .setDescription('Selecione uma página abaixo.')
                .setColor('#FFFFFF')

            const msg = await interaction.editReply({
                embeds: [embedLoja],
                components: [row]
            })

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 300000
            })

            collector.on('collect', async i => {

                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: 'Você não pode usar este menu.',
                        flags: 64
                    })
                }

                let embedMenu

                if (i.values[0] === 'PG1') {

                    embedMenu = new EmbedBuilder()
                        .setTitle('🛒 Loja de Backgrounds')
                        .setColor('#FFFFFF')
                        .setDescription(`**Backgrounds disponíveis:**\n\n${displista}`)
                }

                await i.update({
                    embeds: [embedMenu],
                    components: [row]
                })
            })

            return
        }

        // =========================
        // INVENTÁRIO
        // =========================
        const backs = await db.get(`profile_background_${interaction.user.id}`)

        const lista = backs?.length
            ? backs.map((b, i) => `\`**${i + 1}.**\` **${b}**`).join('\n')
            : '**Você não tem nenhum Background.**'

        const embed = new EmbedBuilder()
            .setTitle('🎨 Seus Backgrounds')
            .setDescription(lista)
            .setColor('#FFFFFF')

        return interaction.editReply({ embeds: [embed] })
    }
}