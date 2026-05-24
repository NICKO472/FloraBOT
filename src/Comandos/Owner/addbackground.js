import {
    SlashCommandBuilder
} from 'discord.js'

import fs from 'fs'
import path from 'path'

// função para pegar próximo ID
function getNextBackgroundId(basePath) {

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true })
    }

    const folders = fs.readdirSync(basePath)

    let max = 0

    for (const folder of folders) {

        const match = folder.match(/Background_(\d+)/)

        if (match) {
            const num = Number(match[1])
            if (num > max) max = num
        }
    }

    return max + 1
}

export default {

    data: new SlashCommandBuilder()
        .setName('addbackground')
        .setDescription('Adiciona um background ao sistema')
        .addStringOption(option =>
            option
                .setName('nome')
                .setDescription('Nome do background')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('preco')
                .setDescription('Preço do background')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option
                .setName('imagem')
                .setDescription('Imagem do background')
                .setRequired(true)
        ),

    async execute(interaction) {

        // proteção owner
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                flags: 64
            })
        }

        await interaction.deferReply({ flags: 64 })

        const nome = interaction.options.getString('nome')
        const preco = interaction.options.getInteger('preco')
        const imagem = interaction.options.getAttachment('imagem')

        // caminho base
        const basePath = path.resolve('src/Assets/ProfileBacks')

        // cria ID automático
        const id = getNextBackgroundId(basePath)

        const folderName = `Background_${id}`
        const folderPath = path.join(basePath, folderName)

        // cria pasta do background
        fs.mkdirSync(folderPath, { recursive: true })

        // =========================
        // SALVAR IMAGEM
        // =========================
        const imagePath = path.join(folderPath, 'image.png')

        const response = await fetch(imagem.url)
        const buffer = Buffer.from(await response.arrayBuffer())

        fs.writeFileSync(imagePath, buffer)

        // =========================
        // CONFIG JSON
        // =========================
        const config = {
            id,
            name: nome,
            price: preco,
            file: 'image.png'
        }

        fs.writeFileSync(
            path.join(folderPath, 'config.json'),
            JSON.stringify(config, null, 2)
        )

        // =========================
        // RESPOSTA
        // =========================
        return interaction.editReply({
            content:
                `✅ Background criado com sucesso!\n` +
                `📦 ID: ${id}\n` +
                `📁 Pasta: ${folderName}\n` +
                `💰 Preço: ${preco}`
        })
    }
}