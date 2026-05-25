import { QuickDB } from 'quick.db'
import Discord, { User } from 'discord.js'
const db = new QuickDB()
import { config } from 'dotenv';
config({ quiet: true })
const args = process.argv.slice(2);

//Set Badges: 

if(args.includes("--setbadges")) {
    try {
    await db.set(`badges_${process.env.OWNER_ID}`, `<:1138434843894616164:1508586282002157619> <:1193545036810440734:1508586268487974952>`)
   console.log(`Badges setadas com sucesso!`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}

if(args.includes("--delbadges")) {
    try {
    await db.delete(`badges_${process.env.OWNER_ID}`, `<:1138434843894616164:1508586282002157619> <:1193545036810440734:1508586268487974952>`)
   console.log(`Badges deletadas com sucesso!`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}