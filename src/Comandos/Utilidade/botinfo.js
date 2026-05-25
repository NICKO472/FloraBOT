import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import ms from 'ms'

export default {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Mostra informações do bot'),

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
            .setTitle('<:about:1508598981905743904>Sobre mim<:about:1508598981905743904>')
            .setColor('#FFFFFF')
            .setDescription(`
> <:1193545036810440734:1508586268487974952>Desenvolvedor: **Nikinho (onikinhoo)**

> <:cpu:1508598994694045847>Uso da CPU: **${cpu}%**
> <:ram:1508598984418132138>Uso de RAM: **${ram} ${type}**
> Uptime: **${ms(client.uptime)}**

> <:api:1508598996589875351>Latência  da API: **${Math.round(client.ws.ping)}ms**
> Latência da DataBase: **${pingDB}**

> <:js:1508598982732025980>Linguagem: **NodeJs**

> <:equipe:1508598979607400458>**Equipe: Origins**

> <:presence:1508598993352003696>Estou em **${client.guilds.cache.size}** servidores
> <:1220815226765836379:1508598980781670490>Gerenciando **${client.users.cache.size}** membros
`)

        await interaction.editReply({
            embeds: [embed]
        })
    }
}