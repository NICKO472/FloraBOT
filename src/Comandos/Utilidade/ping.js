import Discord from 'discord.js'
import { QuickDB } from 'quick.db'
import fs from 'fs'
import { SlashCommandBuilder } from 'discord.js';

const db = new QuickDB()

const br = JSON.parse(fs.readFileSync('./src/Languages/br.json'))
const pt = JSON.parse(fs.readFileSync('./src/Languages/pt.json'))
const en = JSON.parse(fs.readFileSync('./src/Languages/en.json'))
const es = JSON.parse(fs.readFileSync('./src/Languages/es.json'))
const fr = JSON.parse(fs.readFileSync('./src/Languages/fr.json'))

const languages = {
    br,
    pt,
    en,
    es,
    fr
}


export default {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Mostra a latência do bot e da API'),
    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client)  {

        let lang
        let userlang = await db.get(`lang_${interaction.user.id}`)

        if (userlang === null) {
            lang = await db.get(`lang_${interaction.guild.id}`)

            if (lang === null) lang = 'br'
        } else {
            lang = userlang
        }

        const text = languages[lang] || languages.br

        const embed_1 = new Discord.EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${interaction.user} ${text.pingLoading}`)
            .setColor('#FFFFFF')

        await interaction.reply({
            embeds: [embed_1]
        })

        const ping = Math.round(client.ws.ping)

        const embed_2 = new Discord.EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${interaction.user} ${text.pingLoaded} \`${ping}ms\`.`)
            .setColor('#FFFFFF')

        setTimeout(() => {
            interaction.editReply({
                embeds: [embed_2]
            })
        }, 2000)
    }
}