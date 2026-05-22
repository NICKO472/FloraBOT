import { Client, GatewayIntentBits, Partials, Collection, IntentsBitField } from 'discord.js'
import { config } from 'dotenv';
config({ quiet: true })
import Discord from 'discord.js'


const client = new Client({
  intents: [
    1, 512, 32768, 2, 128,
  IntentsBitField.Flags.DirectMessages,
  IntentsBitField.Flags.GuildInvites,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildPresences,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessageReactions,
  IntentsBitField.Flags.GuildEmojisAndStickers
],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.Reaction,
    Partials.Channel,
    Partials.GuildMember
  ]
});


client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();


async function initialize() {
    console.log('Ligando Flora🌷');
    
    // Carregar todos os módulos
    //await loadEvents();
   // await loadCommands();
    //await loadSlashCommands();
    
    //console.log('📊 Resumo do carregamento:');
    //console.log(`   • Eventos: ${client.events.size}`);
   // console.log(`   • Comandos Prefix: ${client.commands.size}`);
   // console.log(`   • Slash Commands: ${client.slashCommands.size}`);
    
    // Fazer login
    try {
        await client.login(process.env.TOKEN);
        console.log(`Logado`)
    } catch (error) {
        console.error('❌ Erro!:', error);
        process.exit(1);
    }
}

initialize()

export default client;


client.on('interactionCreate', (interaction) => {

  if (interaction.type === Discord.InteractionType.ApplicationCommand) {

    const cmd = client.slashCommands.get(interaction.commandName);

    if (!cmd) return interaction.reply(`Error`);

    interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

    cmd.run(client, interaction)

  }
})

import Handler from './Handler/index.js'
import Mention from './Events/Mention.js'

Handler(client)
Mention(client)