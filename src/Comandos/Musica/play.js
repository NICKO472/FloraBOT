import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'

import {
    useMainPlayer
} from 'discord-player'

import {
    isInVoiceChannel
} from '../../Utils/voicechannel.js'

export default {

    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Nome ou link da música')
                .setRequired(true)
        ),

    category: 'Musica',

    cooldown: 3,

async execute(interaction) {
    try {

        const inVoiceChannel = isInVoiceChannel(interaction)
        if (!inVoiceChannel) return

        await interaction.deferReply()

        const player = useMainPlayer()

        const query = interaction.options.getString('query')

        if (!query || typeof query !== 'string') {
            return interaction.editReply({
                content: '❌ Você precisa informar uma música válida!'
            })
        }

        const voiceChannel = interaction.member.voice.channel

        if (!voiceChannel) {
            return interaction.editReply({
                content: '❌ Você precisa estar em um canal de voz!'
            })
        }

        const result = await player.play(voiceChannel, query, {
            nodeOptions: {
                metadata: {
                    channel: interaction.channel,
                    requestedBy: interaction.user
                },
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: false,
                volume: 10
            }
        })

        const track = result.track ?? result

        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('🎶 Tocando Agora')
            .setThumbnail(track.thumbnail)
            .setDescription(`
**[${track.title}](${track.url})**

👤 • Pedido por ${interaction.user}
⏰ • Duração: \`${track.duration}\`
🎤 • Canal: \`${track.author}\`
`)

        return await interaction.editReply({
            embeds: [embed]
        })

    } catch (error) {
        console.log(error)

        const msg = error instanceof Error ? error.message : String(error)

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: `❌ Ocorreu um erro:\n\`${msg}\``
            })
        }
    }
}
}