import { EmbedBuilder } from "discord.js";

export default async function Handler(client) {
    console.log("Sistema de menção carregado")

  client.on("messageCreate", (msg) =>{
    if(msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>`) {

     const embed = new EmbedBuilder()
     .setDescription(`**Olá, <@${msg.author.id}>!**
        
> **Digite** ***/help***, **para ver os meus comandos!**`)
     .setColor(`#FFFFFF`)


      msg.reply({embeds: [embed], ephemeral: true})
    }
  });


}