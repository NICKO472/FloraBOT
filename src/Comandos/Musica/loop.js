import Discord from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Ativa ou desativa o loop da música'),

    category: 'musica',
    cooldown: 3,

    async execute(interaction, client) {

        await interaction.deferReply()

        const channel = interaction.member.voice.channel

        if (!channel) {
            return interaction.editReply({
                content: 'Você precisa estar em um canal de voz para utilizar esse comando!'
            })
        }

        const serverQueue = client.queue.get(interaction.guild.id)

        try {

            if (!serverQueue) {
                return interaction.editReply({
                    content: 'Nada está tocando no momento!'
                })
            }

            if (
                interaction.guild.members.me.voice.channel.id !==
                interaction.member.voice.channel.id
            ) {
                return interaction.editReply({
                    content: 'Você tem que estar no mesmo canal que eu para utilizar esse comando!'
                })
            }

            if (!serverQueue.loop) {

                serverQueue.loop = true

                const embed = new Discord.EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setDescription(`
Pronto, agora irei tocar as músicas em loop!

🔊 - Tocando no momento **[${serverQueue.songs[0].title}](https://youtube.com/watch?v=${serverQueue.songs[0].id})**
`)

                return interaction.editReply({
                    embeds: [embed]
                })
            }

            serverQueue.loop = false

            const embed = new Discord.EmbedBuilder()
                .setColor('#FFFFFF')
                .setDescription(
                    'Pronto, não irei tocar mais em loop!'
                )

            return interaction.editReply({
                embeds: [embed]
            })

        } catch (err) {

            console.log(err)

            if (serverQueue?.connection) {
                serverQueue.connection.destroy()
            }

            client.queue.delete(interaction.guild.id)

            return interaction.editReply({
                content: 'Ocorreu um erro, tente novamente!'
            })
        }
    }
}