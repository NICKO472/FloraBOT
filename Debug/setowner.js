import { QuickDB } from 'quick.db'
import Discord, { User } from 'discord.js'
const db = new QuickDB()
import { config } from 'dotenv';
config({ quiet: true })
const args1 = process.argv.slice(2);
const args2 = process.argv[3];
const args3 = process.argv[4];

if(args1.includes("--setbackprofile")) {
    try {
    await db.set(`profile_background_${args2}`, `Background_${args3}`)
   console.log(`Background ${args3} setado!\n${args1} | ${args2} | ${args3}`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}

if(args1.includes("--addpremium")) {
    try {
    await db.set(`premium_${args2}`, true)
   console.log(`premium adicionado!`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}


if(args1.includes("--setbadges")) {
    try {
    await db.set(`badges_${process.env.OWNER_ID}`, `<:1138434843894616164:1508586282002157619> <:1193545036810440734:1508586268487974952>`)
   console.log(`Badges setadas com sucesso!`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}

if(args1.includes("--delbadges")) {
    try {
    await db.delete(`badges_${process.env.OWNER_ID}`, `<:1138434843894616164:1508586282002157619> <:1193545036810440734:1508586268487974952>`)
   console.log(`Badges deletadas com sucesso!`)    
} catch (err) {
    console.log(`Erro!!!!!\n\n\n\n`, err)
}
}