import { EmbedBuilder } from "discord.js";
import { QuickDB } from "quick.db";
import fs from "fs";

const db = new QuickDB();

const br = JSON.parse(fs.readFileSync("./src/Languages/br.json"));
const pt = JSON.parse(fs.readFileSync("./src/Languages/pt.json"));
const en = JSON.parse(fs.readFileSync("./src/Languages/en.json"));
const es = JSON.parse(fs.readFileSync("./src/Languages/es.json"));
const fr = JSON.parse(fs.readFileSync("./src/Languages/fr.json"));

const languages = {
    br,
    pt,
    en,
    es,
    fr
};

export default async function Handler(client) {

    console.log("Sistema de menção carregado");

    client.on("messageCreate", async (msg) => {

        if (msg.author.bot) return;

        if (
            msg.content === `<@${client.user.id}>` ||
            msg.content === `<@!${client.user.id}>`
        ) {

            let lang;
            let userlang = await db.get(`lang_${msg.author.id}`);

            if (userlang === null) {

                lang = await db.get(`lang_${msg.guild.id}`);

                if (lang === null) lang = "br";

            } else {
                lang = userlang;
            }

            const text = languages[lang] || languages.br;

            const embed = new EmbedBuilder()
                .setDescription(`**${text.mentionHello}, <@${msg.author.id}>!**
        
> **${text.mentionHelp}** ***/help***, **${text.mentionCommands}**`)
                .setColor("#FFFFFF");

            msg.reply({
                embeds: [embed]
            });
        }
    });
}