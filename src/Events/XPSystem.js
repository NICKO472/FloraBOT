import { QuickDB } from "quick.db"
const db = new QuickDB()

export default async function XPSystem(client)  {
        client.on("interactionCreate", async (interaction) => {
            const xp = await db.get(`xp_${interaction.user.id}`) || 0
            const level = await db.get(`level_${interaction.user.id}`) || 1

            if (xp >= level * 1000) {

            await db.add(`level_${interaction.user.id}`, 1)

            interaction.reply({content: `🎉 ${interaction.user} subiu para o nível ${level + 1}!`, ephemeral: true})
}

            await db.set(`xp_${interaction.user.id}`, xp + Math.floor(Math.random() * 15) + 5)
        })
    
    
    }