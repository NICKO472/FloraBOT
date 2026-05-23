import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configurar variáveis de ambiente
config({ quiet: true })

// Obter diretório atual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Função para carregar todos os slash commands
async function loadSlashCommands() {
    try {
        const slashFolders = await readdir(join(__dirname, 'src/Comandos'));
        
        for (const folder of slashFolders) {
            const slashFiles = await readdir(join(__dirname, 'src/Comandos', folder));
            
            for (const file of slashFiles) {
                if (!file.endsWith('.js')) continue;
                
                const filePath = pathToFileURL(join(__dirname, 'src/Comandos', folder, file));
                const slashCommand = await import(filePath);
                
                if (slashCommand.default?.data) {
                    commands.push(slashCommand.default.data.toJSON());
                    console.log(`✅ Slash command carregado: ${slashCommand.default.data.name} (${folder})`);
                } else {
                    console.log(`⚠️ Slash command inválido: ${file}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar slash commands:', error);
        process.exit(1);
    }
}

// Função principal de deploy
async function deployCommands() {
    console.log('🚀 Iniciando deploy dos slash commands...');
    
    // Verificar variáveis de ambiente
    if (!process.env.TOKEN) {
        console.error('❌ TOKEN não definido no arquivo .env');
        process.exit(1);
    }
    
    if (!process.env.CLIENT_ID) {
        console.error('❌ CLIENT_ID não definido no arquivo .env');
        process.exit(1);
    }
    
    // Carregar comandos
    await loadSlashCommands();
    
    if (commands.length === 0) {
        console.error('❌ Nenhum slash command encontrado para registrar');
        process.exit(1);
    }
    
    // Configurar REST client
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
    try {
        console.log(`🔄 Registrando ${commands.length} slash commands...`);
        
        let data;
        
        if (process.env.GUILD_ID) {
            // Registrar apenas no servidor de teste (mais rápido)
            console.log(`📍 Registrando comandos no servidor: ${process.env.GUILD_ID}`);
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
        } else {
            // Registrar globalmente (pode levar até 1 hora para aparecer)
            console.log('🌍 Registrando comandos globalmente...');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
        }
        
        console.log('✅ Slash commands registrados com sucesso!');
        console.log(`📊 Total: ${data.length} comandos`);
        
        // Listar comandos registrados
        console.log('\n📋 Comandos registrados:');
        data.forEach((command, index) => {
            console.log(`   ${index + 1}. /${command.name} - ${command.description}`);
        });
        
        console.log('\n🎉 Deploy concluído com sucesso!');
        
        if (process.env.GUILD_ID) {
            console.log('💡 Dica: Os comandos já estão disponíveis no servidor de teste.');
        } else {
            console.log('💡 Dica: Comandos globais podem levar até 1 hora para aparecer em todos os servidores.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao registrar slash commands:', error);
        
        if (error.code === 50001) {
            console.error('💡 Erro: Bot não tem permissões suficientes. Verifique se o bot tem a permissão "applications.commands"');
        } else if (error.code === 10013) {
            console.error('💡 Erro: CLIENT_ID ou GUILD_ID inválido');
        } else if (error.code === 40001) {
            console.error('💡 Erro: Token inválido ou expirado');
        }
        
        process.exit(1);
    }
}

// Função para limpar comandos (útil para desenvolvimento)
async function clearCommands() {
    console.log('🗑️ Limpando slash commands...');
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
    try {
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] }
            );
            console.log('✅ Comandos do servidor limpos com sucesso!');
        } else {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            );
            console.log('✅ Comandos globais limpos com sucesso!');
        }
    } catch (error) {
        console.error('❌ Erro ao limpar comandos:', error);
    }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--clear') || args.includes('-c')) {
    clearCommands();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log('📚 Uso do deploy.js:');
    console.log('');
    console.log('  node deploy.js          - Registrar slash commands');
    console.log('  node deploy.js --clear  - Limpar todos os slash commands');
    console.log('  node deploy.js --help   - Mostrar esta ajuda');
    console.log('');
    console.log('🔧 Configuração necessária no .env:');
    console.log('  DISCORD_TOKEN - Token do bot');
    console.log('  CLIENT_ID     - ID do bot/aplicação');
    console.log('  GUILD_ID      - ID do servidor (opcional, para teste)');
} else {
    deployCommands();
}

// Handler para erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});