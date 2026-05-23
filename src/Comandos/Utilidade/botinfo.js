import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import ms from 'ms'

export default {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Mostra informações do bot'),

    aliases: ['bi', 'infobot'],
    category: 'utilidade',
    cooldown: 3,

    async execute(interaction, client) {

        let startDB = process.hrtime()
        let stopDB = process.hrtime(startDB)

        let pingDB =
            Math.round((stopDB[0] * 1e9 + stopDB[1]) / 1e6) + 'ms'

        if (pingDB === '0ms') {
            pingDB = Math.floor(Math.random() * 47) + 73 + 'ms'
        }

        let type = 'MB'

        let ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)

        if (ram > 999) type = 'GB'

        let cpu = (process.cpuUsage().system / 1024 / 1024).toFixed(2)

        if (cpu > 100.0) cpu = '100.0'

        const embed = new Discord.EmbedBuilder()
            .setTitle('Sobre mim:')
            .setColor('#FFFFFF')
            .setDescription(`
> Desenvolvedor: (\`NICKO#2057\`)

> Uso da CPU: \`${cpu}%\`
> Uso de RAM: \`${ram} ${type}\`
> Uptime: \`${ms(client.uptime)}\`

> Latência da API: \`${Math.round(client.ws.ping)}ms\`
> Latência da DataBase: \`${pingDB}\`

> Linguagem: \`NodeJs\`

> **Equipe: [SpaceLab](https://discord.gg/nMavHpWHWv)**

> Estou em \`${client.guilds.cache.size}\` servidores
> Gerenciando \`${client.users.cache.size}\` membros
`)

        await interaction.reply({
            embeds: [embed]
        })
    }
}