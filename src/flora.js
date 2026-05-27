import { Client, GatewayIntentBits, Partials, Collection, IntentsBitField } from 'discord.js'
import { config } from 'dotenv';
config({ quiet: true })
import Discord from 'discord.js'
let database = process.env
import chalk from 'chalk';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



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


client.Comandos = new Collection();
client.events = new Collection();

client.commandStats = new Map();
client.errorLogs = [];

client.warnings = new Map();

client.queue = new Map()

client.config = {
    ownerIds: process.env.OWNER_ID ? process.env.OWNER_ID.split(',') : [],
    embedColor: '#ffffff',
    errorColor: '#ed4245',
    successColor: '#57f287'
};

import { Player } from 'discord-player'
import { DefaultExtractors } from '@discord-player/extractor'
const player = new Player(client)

await player.extractors.loadMulti(DefaultExtractors)

client.player = player


async function loadEvents() {
    try {
        const eventFiles = await readdir(join(__dirname, 'Events'));
        
        for (const file of eventFiles) {
            if (!file.endsWith('.js')) continue;
            
            const filePath = pathToFileURL(join(__dirname, 'Events', file));
            const event = await import(filePath);
            
            if (event.default?.name) {
                const eventFunction = event.default;
                
                if (eventFunction.once) {
                    client.once(eventFunction.name, (...args) => eventFunction.execute(...args, client));
                } else {
                    client.on(eventFunction.name, (...args) => eventFunction.execute(...args, client));
                }
                
                client.events.set(eventFunction.name, eventFunction);
                console.log(`✅ Evento carregado: ${eventFunction.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
    }
}

async function loadSlashCommands() {
    try {
        const slashFolders = await readdir(join(__dirname, 'Comandos'));
        
        for (const folder of slashFolders) {
            const slashFiles = await readdir(join(__dirname, 'Comandos', folder));
            
            for (const file of slashFiles) {
                if (!file.endsWith('.js')) continue;
                
                const filePath = pathToFileURL(join(__dirname, 'Comandos', folder, file));
                const slashCommand = await import(filePath);
                
                if (slashCommand.default?.data) {
                    const cmd = slashCommand.default;
                    cmd.category = folder;
                    client.Comandos.set(cmd.data.name, cmd);
                    console.log(`✅ Slash command carregado: ${cmd.data.name} (${folder})`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar slash commands:', error);
    }
}

client.getStats = function() {
    return {
        guilds: this.guilds.cache.size,
        users: this.users.cache.size,
        channels: this.channels.cache.size,
        commands: this.commands.size,
        slashCommands: this.slashCommands.size,
        uptime: this.uptime,
        shardId: this.shard?.ids?.[0] ?? 0,
        ping: this.ws.ping,
        memoryUsage: process.memoryUsage()
    };
};

// Função para log de erros
client.logError = function(error, context = 'Unknown') {
    const errorLog = {
        timestamp: new Date(),
        context,
        error: error.message,
        stack: error.stack
    };
    
    this.errorLogs.push(errorLog);
    
    // Manter apenas os últimos 100 erros
    if (this.errorLogs.length > 100) {
        this.errorLogs.shift();
    }
    
    console.error(`❌ [${context}] ${error.message}`);
};

// Função para tracking de comandos
client.trackCommand = function(commandName, userId) {
    const key = `${commandName}-${userId}`;
    const current = this.commandStats.get(key) || 0;
    this.commandStats.set(key, current + 1);
};


async function initialize() {
  setTimeout(() => {

 
    console.log(chalk.bgGreen(`Olá ${chalk.white(database.OWRNAME)}`));
setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos.`))//console.log("Carregando processos.");
      setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos..`));
        setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos...`));
    setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos.`));
      setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos..`));
        setTimeout(() => {
    console.log(chalk.bgWhite(`Carregando processos...`));
    console.log(chalk.bgMagenta(`Flora🌸 sendo Carregada.`))//console.log(`Flora🌸 sendo Carregada.`)
        }, 500)
      }, 500)
}, 500);
        }, 500)
      }, 500)
}, 500);
 }, 1500)
    
    // Carregar todos os módulos
    await loadEvents();
    await loadSlashCommands();
    
    //console.log('📊 Resumo do carregamento:');
    //console.log(`   • Eventos: ${client.events.size}`);
   // console.log(`   • Comandos Prefix: ${client.commands.size}`);
   // console.log(`   • Slash Commands: ${client.slashCommands.size}`);
    
    // Fazer login
    try {
        await client.login(process.env.TOKEN);
        setTimeout(() => {
         console.log(`\n\n\n${chalk.magenta(`🌸Flora🌸`)}\n` + chalk.bgCyanBright(`Ligada em ${client.user.tag} (ID: ${client.user.id}) \nDados:
   • Servidores: ${client.guilds.cache.size}
   • Usuários: ${client.users.cache.size}
   • Eventos: ${client.events.size}
   • Slash Commands: ${client.Comandos.size}`))
        }, 5100)
        
    } catch (error) {
      setTimeout(() => {
        console.error('❌ Erro!:', error);
        }, 5100)
        process.exit(1);
    }
}

client.on('warn', (warning) => {
    console.warn('⚠️ Client Warning:', warning);
});

client.on('guildCreate', (guild) => {
    console.log(`Fui adicionada à uma Guilda!`)
})

initialize()

client.on("")

export default client;

import Handler from './Handlers/index.js'
import Mention from './Events/Mention.js'
import XPSystem from './Events/XPSystem.js';

Handler(client)
Mention(client)
XPSystem(client)

