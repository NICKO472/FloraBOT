import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import { QuickDB } from 'quick.db'
import ms from 'parse-ms'

const db = new QuickDB()

export default {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabalhe para ganhar moedas'),

    category: 'economia',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

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

            const divDigits =
                length - (lengthThird || lengthThird + 3)

            const calc =
                '' + (number / (10 ** divDigits)).toFixed(precision)

            return number < 1000
                ? '' + number
                : (
                    calc.indexOf('.') === calc.length - 3
                        ? calc.replace(/\.00/, '')
                        : calc
                ) + suffsFromZeros[divDigits]
        }

        const author = await db.get(`work2_${interaction.user.id}`)

        const timeout = 20000

        if (
            author !== null &&
            timeout - (Date.now() - author) > 0
        ) {

            const time = ms(
                timeout - (Date.now() - author)
            )

            const embed = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(`
**|** Você já trabalhou recentemente!

Tente novamente em **${time.minutes}m ${time.seconds}s**
`)

            return interaction.editReply({
                content: `${interaction.user}`,
                embeds: [embed]
            })
        }

        const vip = await db.get(`vip_${interaction.user.id}`)

        if (vip === 'Vip') {

            const dinheiro =
                Math.floor(Math.random() * 1700) + 5865

            const dinheiro2 =
                abbreviateNumber(dinheiro)

            const embed = new Discord.EmbedBuilder()
                .setDescription(
                    `***${interaction.user.tag}*** trabalhou e ganhou: **\`${dinheiro2}\` moedas**`
                )
                .setColor('#FFFFFF')
                .setFooter({
                    text: 'Vip | Recebido 1.7x a mais'
                })

            let a = await db.get(
                `transactions_${interaction.user.id}`
            )

            if (a === null) a = ''

            await db.add(
                `money_${interaction.user.id}`,
                dinheiro
            )

            await db.set(
                `work2_${interaction.user.id}`,
                Date.now()
            )

            await db.set(
                `transactions_${interaction.user.id}`,
                `${a}
***${interaction.user.tag}*** **trabalhou e ganhou** ***\`${dinheiro2}\`*** **moedas**`
            )

            return interaction.editReply({
                embeds: [embed]
            })
        }

        const dinheiro =
            Math.floor(Math.random() * 1000) + 3450

        const dinheiro2 =
            abbreviateNumber(dinheiro)

        const embed = new Discord.EmbedBuilder()
            .setDescription(
                `***${interaction.user.tag}*** trabalhou e ganhou: **\`${dinheiro2}\` moedas**`
            )
            .setColor('#FFFFFF')

        let a = await db.get(
            `transactions_${interaction.user.id}`
        )

        if (a === null) a = ''

        await db.add(
            `money_${interaction.user.id}`,
            dinheiro
        )

        await db.set(
            `work2_${interaction.user.id}`,
            Date.now()
        )

        await db.set(
            `transactions_${interaction.user.id}`,
            `${a}
***${interaction.user.tag}*** **trabalhou e ganhou** ***\`${dinheiro2}\`*** **moedas**`
        )

        return interaction.editReply({
            embeds: [embed]
        })
    }
}