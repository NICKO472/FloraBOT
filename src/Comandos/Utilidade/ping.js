import Discord from 'discord.js'

export default {
    name: 'ping',
    description: 'Pong!',

    run: async (client, interaction) => {

        const embed_1 = new Discord.EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`Olá ${interaction.user}, calculando ping...`)
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
            .setDescription(`Olá ${interaction.user}, meu ping está em \`${ping}ms\`.`)
            .setColor('#FFFFFF')

        setTimeout(() => {
            interaction.editReply({
                embeds: [embed_2]
            })
        }, 2000)

    }
}