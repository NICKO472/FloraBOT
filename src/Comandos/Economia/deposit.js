import Discord from 'discord.js'
import { QuickDB } from 'quick.db'
import { SlashCommandBuilder } from 'discord.js'

const db = new QuickDB()

function abbreviateNumber(number, precision = 2) {
    const suffsFromZeros = {
        0: '',
        3: 'k',
        6: 'M',
        9: 'B',
        12: 'T'
    }

    const { length } = number.toString()

    const lengthThird = length % 3

    const divDigits = length - (lengthThird || lengthThird + 3)

    const calc = '' + (number / (10 ** divDigits)).toFixed(precision)

    return number < 1000
        ? '' + number
        : (
            calc.indexOf('.') === calc.length - 3
                ? calc.replace(/\.00/, '')
                : calc
        ) + suffsFromZeros[divDigits]
}

export default {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposite dinheiro no banco')
        .addStringOption(option =>
            option
                .setName('valor')
                .setDescription('Valor para depositar ou "all"')
                .setRequired(true)
        ),

    aliases: ['depositar'],
    category: 'economia',
    cooldown: 3,

    async execute(interaction, client) {

        let money = await db.get(`money_${interaction.user.id}`)

        if (money === null) money = 0

        if (money < 1) {
            return interaction.reply({
                content: `${interaction.user} Você não tem dinheiro!`,
                ephemeral: true
            })
        }

        const valor = interaction.options.getString('valor')

        if (valor === 'all') {

            const money2 = abbreviateNumber(money)

            const embed = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    `${interaction.user} Você transferiu ${money2} para o banco!`
                )
                .setTimestamp()

            await db.add(`bank_${interaction.user.id}`, money)

            await db.set(`money_${interaction.user.id}`, 0)

            return interaction.reply({
                embeds: [embed]
            })
        }

        if (!isNaN(valor)) {

            const valorNumero = Number(valor)

            if (valorNumero > money) {
                return interaction.reply({
                    content: `${interaction.user} Você não pode depositar um valor que você não tem!`,
                    ephemeral: true
                })
            }

            if (valorNumero < 1) {
                return interaction.reply({
                    content: `${interaction.user} Para depositar a quantia precisa ser maior que 0!`,
                    ephemeral: true
                })
            }

            const valor2 = abbreviateNumber(valorNumero)

            const embed2 = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    `${interaction.user} Você transferiu ${valor2} para o banco!`
                )
                .setTimestamp()

            await db.add(`bank_${interaction.user.id}`, valorNumero)

            await db.subtract(`money_${interaction.user.id}`, valorNumero)

            return interaction.reply({
                embeds: [embed2]
            })
        }

        const embed3 = new Discord.EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription(`
Para transferir faça da seguinte forma:

/deposit all
/deposit <valor>
`)
            .setTimestamp()

        await interaction.reply({
            embeds: [embed3],
            ephemeral: true
        })
    }
}