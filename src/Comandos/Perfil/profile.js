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

// FUNÇÃO DA BOX DINÂMICA
function drawStatBox(
    ctx,
    {
        text,
        x,
        y,
        textColor = '#ffffff',
        boxColor = 'rgba(15,15,15,0.72)',
        paddingX = 18,
        radius = 14,
        font = '28px Segoe UI Emoji'
    }
) {

    ctx.font = font

    const textWidth =
        ctx.measureText(text).width

    const boxWidth =
        textWidth + (paddingX * 2)

    const boxHeight = 50

    // SHADOW
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 18

    // BOX
    ctx.beginPath()

    ctx.moveTo(x + radius, y)

    ctx.lineTo(x + boxWidth - radius, y)

    ctx.quadraticCurveTo(
        x + boxWidth,
        y,
        x + boxWidth,
        y + radius
    )

    ctx.lineTo(
        x + boxWidth,
        y + boxHeight - radius
    )

    ctx.quadraticCurveTo(
        x + boxWidth,
        y + boxHeight,
        x + boxWidth - radius,
        y + boxHeight
    )

    ctx.lineTo(x + radius, y + boxHeight)

    ctx.quadraticCurveTo(
        x,
        y + boxHeight,
        x,
        y + boxHeight - radius
    )

    ctx.lineTo(x, y + radius)

    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    )

    ctx.closePath()

    ctx.fillStyle = boxColor

    ctx.fill()

    ctx.shadowBlur = 0

    // RETORNA POSIÇÃO DO TEXTO
    return {
        textX: x + paddingX,
        textY: y + 34
    }
}

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

            const __filename =
                fileURLToPath(import.meta.url)

            const __dirname =
                path.dirname(__filename)

            const user =
                interaction.options.getUser('usuario')
                || interaction.user

            if (user.bot) {

                return interaction.editReply({
                    content: `Infelizmente, Bots não podem ter perfis.`,
                    flags: 64
                })
            }

            let backprofile = await db.get(`profile_background_${user.id}`) || false
            
            let premium = await db.get(`premium_${user.id}`) || false
            let premiumshow = await db.get(`premiumover_${user.id}`) || true

            let verified = await db.get(`verified_${user.id}`)

            const money = await db.get(`florins_${user.id}`) || 0

            const bank = await db.get(`bank_${user.id}`) || 0

            const xp = await db.get(`xp_${user.id}`) || 0

            const level = await db.get(`level_${user.id}`) || 1

            const rep = await db.get(`rep_${user.id}`) || 0

            const Badges = await db.get(`badges_${user.id}`) || "Você ainda não tem nenhuma Badge😢"

            const canvas = Canvas.createCanvas(1200, 850)

            const ctx = canvas.getContext('2d')

            // FUNDO

if (backprofile !== false) { 
          const backgroundPath = path.join(__dirname, '../../Assets/ProfileBacks', `${backprofile}`, 'image.png') 
        const background = await Canvas.loadImage(backgroundPath) 
        const escala = Math.max(canvas.width / background.width, canvas.height / background.height) 
        const novaLargura = background.width * escala 
        const novaAltura = background.height * escala 
        const x = (canvas.width - novaLargura) / 2 
        const y = (canvas.height - novaAltura) / 2 
        ctx.drawImage(background, x, y, novaLargura, novaAltura)   
     } else { 
       ctx.fillStyle = '#0f0f0f'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

            //PREMIUM OVERLAY
            const PremiumOverPath = path.join(__dirname, '../../Assets/ProfileLayer/PremiumOver.png')
            
            if(premium === true) {
                if(premiumshow === true) {
                 const PremiumOver = await Canvas.loadImage(PremiumOverPath)
                 ctx.drawImage(PremiumOver, 0, 0, canvas.width, canvas.height)
                }
}

            // OVERLAY

            ctx.fillStyle =
                'rgba(0,0,0,0.1)'

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            )

            // AVATAR

            const avatar =
                await Canvas.loadImage(
                    user.displayAvatarURL({
                        extension: 'png',
                        size: 1024
                    })
                )

            ctx.save()

            ctx.beginPath()

            ctx.arc(
                150,
                150,
                130,
                0,
                Math.PI * 2,
                true
            )

            ctx.closePath()

            ctx.clip()

            ctx.drawImage(
                avatar,
                20,
                20,
                270,
                270
            )

            ctx.restore()

            // VERIFIED

            if (
                verified === true ||
                user.id === process.env.OWNER_ID
            ) {

                ctx.font =
                    '120px Segoe UI Emoji'

                await renderEmoji(
                    ctx,
                    `<:verified:1509411213652660325>`,
                    220,
                    80,
                    70
                )
            }

            // USERNAME BOX

            const usernameText =
                user.displayName

            const usernameBox =
                drawStatBox(ctx, {
                    text: usernameText,
                    x: 300,
                    y: 80,
                    textColor: '#ffffff'
                })

            ctx.fillStyle =
                '#ffffff'

            ctx.font =
                '40px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                usernameText,
                usernameBox.textX,
                usernameBox.textY
            )


            // LEVEL

            ctx.fillStyle =
                '#c300f4'

            ctx.font =
                '30px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                `⭐ Nível ${level}`,
                300,
                150
            )

            // XP

            const nextLevelXP =
                level * 1000

            ctx.fillStyle =
                '#ffffff'

            ctx.font =
                '24px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                `✨ ${xp} / ${nextLevelXP} XP`,
                300,
                250
            )

            // BARRA XP FUNDO

            ctx.fillStyle =
                '#1c1c1c'

            ctx.fillRect(
                300,
                290,
                750,
                35
            )

            // PROGRESSO XP

            const progress =
                Math.min(
                    (xp / nextLevelXP) * 750,
                    750
                )

            ctx.fillStyle =
                '#e600ff'

            ctx.fillRect(
                300,
                290,
                progress,
                35
            )

            // BADGES

            ctx.font =
                '60px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                `${Badges}`,
                20,
                380,
                60
            )

            // MONEY BOX

            const moneyText =
                `🌸 Florins: ${abbreviateNumber(money)}`

            const moneyBox =
                drawStatBox(ctx, {
                    text: moneyText,
                    x: 300,
                    y: 165,
                    textColor: '#57f287'
                })

            ctx.fillStyle =
                '#57f287'

            ctx.font =
                '28px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                moneyText,
                moneyBox.textX,
                moneyBox.textY
            )

            // BANK BOX

            const bankText =
                `🏦 Banco: ${abbreviateNumber(bank)}`

            const bankBox =
                drawStatBox(ctx, {
                    text: bankText,
                    x: 610,
                    y: 165,
                    textColor: '#f1c40f'
                })

            ctx.fillStyle =
                '#f1c40f'

            ctx.font =
                '28px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                bankText,
                bankBox.textX,
                bankBox.textY
            )

            // REP BOX

            const repText =
                `⭐ Estrelas: ${abbreviateNumber(rep)}`

            const repBox =
                drawStatBox(ctx, {
                    text: repText,
                    x: 860,
                    y: 165,
                    textColor: '#ff73fa'
                })

            ctx.fillStyle =
                '#ff73fa'

            ctx.font =
                '28px Segoe UI Emoji'

            await renderEmoji(
                ctx,
                repText,
                repBox.textX,
                repBox.textY
            )

            // ATTACHMENT

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

            if (
                interaction.deferred ||
                interaction.replied
            ) {

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