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
        .setName('carteira')
        .setDescription('Show your wallet balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view the balance')
                .setRequired(false)
        ),

    category: 'economy',
    cooldown: 3,

    async execute(interaction, client) {

        const user =
            interaction.options.getUser('user') ||
            interaction.user

        let money = await db.get(`florins_${user.id}`)
        if (money === null) money = 0.00

        const money2 = abbreviateNumber(money)

        const simplemoney = new Intl.NumberFormat('pt-BR').format(money)
        console.log(Number.parseFloat(money))

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: `Saldo de ${user.tag}`,
                iconURL: user.displayAvatarURL()
            })
            .setDescription(`
 Atualmente você tem ***${money2}*** 🌸Florins! **(${simplemoney})**`)
            .setColor('#FFFFFF')

        await interaction.editReply({
            embeds: [embed]
        })
    }
}