import Discord from 'discord.js'
import { QuickDB } from 'quick.db'
import { SlashCommandBuilder } from 'discord.js'
import ms from 'parse-ms'

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
        .setName('daily')
        .setDescription('Pegue sua recompensa diária'),

    aliases: ['diario'],
    category: 'economia',
    cooldown: 3,

    async execute(interaction, client) {

await interaction.deferReply()

        const author = await db.get(`daily_${interaction.user.id}`)

        const timeout = 86400000

        if (author !== null && timeout - (Date.now() - author) > 0) {

            const time = ms(timeout - (Date.now() - author))

            const embed1 = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    `**|** Você já pegou seu daily recentemente!\n\nTente novamente em **${time.hours}h ${time.minutes}m ${time.seconds}s**`
                )

            return interaction.editReply({
                content: `${interaction.user}`,
                embeds: [embed1],
                ephemeral: true
            })
        }

        const vip = await db.get(`vip_${interaction.user.id}`)

        if (vip === 'Vip') {

            const dinheiro =
                Math.floor(Math.random() * 15000) + 26475

            const dinheiro2 = abbreviateNumber(dinheiro)

            const embed = new Discord.EmbedBuilder()
                .setDescription(
                    `***${interaction.user.tag}*** pegou seu daily: **\`${dinheiro2}\` moedas**`
                )
                .setColor('#FFFFFF')
                .setFooter({
                    text: 'Vip | 1.5x a mais recebido'
                })

            let a = await db.get(`transactions_${interaction.user.id}`)

            if (a === null) a = ``

            await db.add(`money_${interaction.user.id}`, dinheiro)

            await db.set(`daily_${interaction.user.id}`, Date.now())

            await db.set(
                `transactions_${interaction.user.id}`,
                `${a}
***${interaction.user.tag}*** pegou seu daily: ***\`${dinheiro2}\`*** **moedas**`
            )

            return interaction.editReply({
                embeds: [embed]
            })
        }

        const din =
            Math.floor(Math.random() * 10000) + 17650

        const dinheiro2 = abbreviateNumber(din)

        const embed = new Discord.EmbedBuilder()
            .setDescription(
                `***${interaction.user.tag}*** pegou seu daily: **\`${dinheiro2}\` moedas**`
            )
            .setColor('#FFFFFF')

        let a = await db.get(`transactions_${interaction.user.id}`)

        if (a === null) a = ``

        await db.add(`money_${interaction.user.id}`, din)

        await db.set(`daily_${interaction.user.id}`, Date.now())

        await db.set(
            `transactions_${interaction.user.id}`,
            `${a}
***${interaction.user.tag}*** pegou seu daily: ***\`${dinheiro2}\`*** **moedas**`
        )

        await interaction.editReply({
            embeds: [embed]
        })
    }
}