import { QuickDB } from "quick.db"

const db = new QuickDB()

export default async function XPSystem(interaction) {

    if (!interaction?.user) return

    const xp = Number(
        await db.get(`xp_${interaction.user.id}`)
    ) || 0

    const level = Number(
        await db.get(`level_${interaction.user.id}`)
    ) || 1

    const gainedXP =
        Math.floor(Math.random() * 15) + 5

    const newXP = xp + gainedXP

    await db.set(
        `xp_${interaction.user.id}`,
        newXP
    )

    const requiredXP =
        level * 1000

    if (newXP >= requiredXP) {

        const newLevel = level + 1

        await db.set(
            `level_${interaction.user.id}`,
            newLevel
        )

        await db.set(
            `xp_${interaction.user.id}`,
            newXP - requiredXP
        )

        try {

            await interaction.followUp({
                content:
                    `🎉 ${interaction.user} subiu para o nível **${newLevel}**!`, ephemeral: true
            })

        } catch (err) {
            console.log(
                "Erro ao enviar mensagem de level up:",
                err
            )
        }
    }
}