import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js'
import { config } from 'dotenv';
config({ quiet: true })


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ],
})



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




