import {
    SlashCommandBuilder,
    AttachmentBuilder
} from 'discord.js'

import path from 'path'

import { fileURLToPath } from 'url'

import Canvas from '@napi-rs/canvas'

import { QuickDB } from 'quick.db'

import { renderEmoji } from '../../Utils/Functions/renderEmoji.js'
import { abbreviateNumber } from '../../Utils/Functions/Abbrev.js'
Canvas.GlobalFonts.registerFromPath(
  path.join(process.cwd(), 'Assets/Fonts/segoeui.ttf'),
  'Segoe UI Emoji'
)

const db = new QuickDB()

export default {

    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Mostra o perfil de um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário para ver o perfil')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {

        const __filename = fileURLToPath(import.meta.url)

        const __dirname = path.dirname(__filename)

        const user =
            interaction.options.getUser('usuario') || interaction.user

        if(user.bot) {
            return interaction.reply({ content: `Infelizmente, Bots não podem ter perfis.`, flags: 64})
        }

        let backprofile = await db.get(`profile_background_${user.id}`) || "Background_BDS"
        let verified = await db.get(`verified_${user.id}`)// || false

        const money = await db.get(`money_${user.id}`) || 0

        const bank = await db.get(`bank_${user.id}`) || 0

        const xp = await db.get(`xp_${user.id}`) || 0

        const level = await db.get(`level_${user.id}`) || 1

        const rep = await db.get(`rep_${user.id}`) || 0

        const Badges = await db.get(`badges_${user.id}`) || "Você ainda não tem nenhuma Badge😢"

        const canvas = Canvas.createCanvas(1200, 850);

        const ctx = canvas.getContext('2d');
        

        // Fundo


        if (!backprofile) {
            ctx.fillStyle = '#0f0f0f'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else {
            const backgroundPath = path.join(__dirname, '../../Assets/ProfileBacks', `${backprofile}`, 'image.png')

            const background = await Canvas.loadImage(backgroundPath)

            // ALGORITMO COVER: Impede a distorção da imagem de fundo
            const escala = Math.max(canvas.width / background.width, canvas.height / background.height)
            
            const novaLargura = background.width * escala
            const novaAltura = background.height * escala
            
            const x = (canvas.width - novaLargura) / 2
            const y = (canvas.height - novaAltura) / 2

            ctx.drawImage(background, x, y, novaLargura, novaAltura)
        }
        // Overlay

        ctx.fillStyle = 'rgba(24, 24, 24, 0.25)'

        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Barra XP fundo

        ctx.fillStyle = '#2b2b2b'

        ctx.fillRect(
            320,
            290,
            750,
            35
        )

        // Barra XP progresso

        const nextLevelXP =
            level * 1000

        const progress =
            Math.min(
                (xp / nextLevelXP) * 750,
                750
            )

        ctx.fillStyle = '#00b0f4'

        ctx.fillRect(
            320,
            290,
            progress,
            35
        )

        // Avatar

        const avatar =
            await Canvas.loadImage(
                user.displayAvatarURL({
                    extension: 'png',
                    size: 512
                })
            )

        ctx.save()

        ctx.beginPath()

        ctx.arc(130, 130, 110, 0, Math.PI * 2,true)

        ctx.closePath()

        ctx.clip()

        ctx.drawImage(avatar, 20, 20, 220, 220)

        ctx.restore()

        //VERIFIED
        if(verified === true || user.id === process.env.OWNER_ID) {
        ctx.fillStyle = '#ffffff'
        ctx.font = '120px Segoe UI Emoji'
        await renderEmoji(ctx, `<:verified:1509411213652660325>`, 185, 80, 70)
        }

        // Username

        ctx.fillStyle = '#ffffff'

        ctx.font = '40px Segoe UI Emoji'

        await renderEmoji(
            ctx,
            user.displayName,
            300,
            100
        )

        // Level

        ctx.fillStyle = '#00b0f4'

        ctx.font = '30px Segoe UI Emoji'

        await renderEmoji(
            ctx,
            `⭐ Nível ${level}`,
            300,
            150
        )

        // XP

        ctx.fillStyle = '#ffffff'

        ctx.font = '24px Segoe UI Emoji'

        await renderEmoji(ctx, `✨ ${xp} / ${nextLevelXP} XP`, 300, 250)

        //BADGES
        ctx.font = '60px Segoe UI Emoji'

await renderEmoji(
    ctx,
    `${Badges}`,
    20,
    380,
    60
)

        // Money

        ctx.fillStyle = '#57f287'

        ctx.font = '28px Segoe UI Emoji'

        await renderEmoji(
            ctx,
            `💵 Carteira: ${abbreviateNumber(money)}`,
            300,
            200
        )

        // Bank

        ctx.fillStyle = '#f1c40f'

        ctx.font = '28px Segoe UI Emoji'

        await renderEmoji(
            ctx,
            `🏦 Banco: ${abbreviateNumber(bank)}`,
            600,
            200
        )

        // Rep
        ctx.fillStyle = '#1c1c1c'
       ctx.fillRect(855, 165, 270, 50)
        ctx.fillStyle = '#ff73fa'

        ctx.font = '28px Segoe UI Emoji'

        await renderEmoji(
            ctx,
            `⭐ Estrelas: ${abbreviateNumber(rep)}`, //rep
            860,
            200
        )



        const attachment =
            new AttachmentBuilder(
                await canvas.encode('png'),
                {
                    name: 'perfil.png'
                }
            )

        await interaction.editReply({
            files: [attachment]
        })

    
    } catch (error) {

        console.error(error)

        if (interaction.deferred || interaction.replied) {

            await interaction.editReply({
                content: 'Ocorreu um erro ao gerar o perfil.'
            }).catch(() => {})

        } else {

            await interaction.reply({
                content: 'Ocorreu um erro ao gerar o perfil.',
                ephemeral: true
            }).catch(() => {})
        }
    }
}
}