import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'

import { QuickDB } from 'quick.db'

import {
    abbreviateNumber
} from '../../Utils/Functions/Abbrev.js'

const db = new QuickDB()

export default {

    data: new SlashCommandBuilder()

        .setName('sacar')

        .setDescription(
            'Saque dinheiro do banco'
        )

        .addStringOption(option =>

            option
                .setName('valor')
                .setDescription(
                    'Valor para sacar ou all'
                )
                .setRequired(true)
        ),

    category: 'economia',

    cooldown: 3,

    async execute(interaction) {

        const valor =
            interaction.options.getString(
                'valor'
            )

        const userId =
            interaction.user.id

        let bank =
            await db.get(
                `bank_${userId}`
            ) || 0

        if (bank < 1) {

            return interaction.reply({
                content:
                    '❌ Você não tem dinheiro no banco!'
            })
        }

        // =========================
        // SACAR TUDO
        // =========================

        if (
            valor.toLowerCase() === 'all'
        ) {

            const moneyFormatted =
                abbreviateNumber(bank)

            await db.add(
                `money_${userId}`,
                bank
            )

            await db.set(
                `bank_${userId}`,
                0
            )

            const embed =
                new EmbedBuilder()

                    .setColor('#2f3136')

                    .setDescription(
                        `💸 ${interaction.user} você retirou \`${moneyFormatted}\` do banco!`
                    )

                    .setTimestamp()

            return interaction.reply({
                embeds: [embed]
            })
        }

        // =========================
        // VALIDAR NÚMERO
        // =========================

        if (isNaN(valor)) {

            const embed =
                new EmbedBuilder()

                    .setColor('#2f3136')

                    .setDescription(`
Use da seguinte forma:

\`/sacar all\`
\`/sacar <valor>\`
`)

                    .setTimestamp()

            return interaction.reply({
                embeds: [embed]
            })
        }

        const amount =
            parseInt(valor)

        // =========================
        // VALOR INVÁLIDO
        // =========================

        if (amount < 1) {

            return interaction.reply({
                content:
                    '❌ O valor precisa ser maior que 0!'
            })
        }

        // =========================
        // SEM DINHEIRO
        // =========================

        if (amount > bank) {

            return interaction.reply({
                content:
                    '❌ Você não possui esse valor no banco!'
            })
        }

        // =========================
        // SACAR
        // =========================

        await db.add(
            `money_${userId}`,
            amount
        )

        await db.sub(
            `bank_${userId}`,
            amount
        )

        const amountFormatted =
            abbreviateNumber(amount)

        const embed =
            new EmbedBuilder()

                .setColor('#2f3136')

                .setDescription(
                    `💸 ${interaction.user} você sacou \`${amountFormatted}\` do banco!`
                )

                .setTimestamp()

        return interaction.reply({
            embeds: [embed]
        })
    }
}