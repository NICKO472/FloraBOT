export default {
    name: 'interactionCreate',
    
    async execute(interaction, client) {
        // Processar apenas slash commands
        if (!interaction.isChatInputCommand()) return;
        
        const command = client.Comandos.get(interaction.commandName);
        
        if (!command) {
            console.error(`❌ Slash command não encontrado: ${interaction.commandName}`);
            return;
        }
        
        try {
            // Log do comando
            console.log(`⚡ Slash command executado: /${interaction.commandName} | Usuário: ${interaction.user.tag} | Servidor: ${interaction.guild?.name || 'DM'}`);
            
            // Verificar cooldown
            if (command.cooldown) {
                const cooldowns = client.cooldowns || (client.cooldowns = new Map());
                const now = Date.now();
                const timestamps = cooldowns.get(command.data.name) || cooldowns.set(command.data.name, new Map()).get(command.data.name);
                const cooldownAmount = (command.cooldown || 3) * 1000;
                
                if (timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                    
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        const embed = client.createEmbed({
                            title: '⏰ Cooldown',
                            description: `Você precisa esperar ${timeLeft.toFixed(1)} segundos antes de usar este comando novamente.`,
                            color: client.config.errorColor
                        });
                        
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }
                
                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            }
            
            // Verificar se o comando é apenas para DM
            if (command.dmOnly && interaction.guild) {
                const embed = client.createEmbed({
                    title: '📧 Comando apenas por DM',
                    description: 'Este comando só pode ser usado em mensagem direta.',
                    color: client.config.errorColor
                });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            
            // Verificar se o comando é apenas para servidores
            if (command.guildOnly && !interaction.guild) {
                const embed = client.createEmbed({
                    title: '🏰 Comando apenas em servidores',
                    description: 'Este comando só pode ser usado em servidores.',
                    color: client.config.errorColor
                });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            
            // Verificar permissões do usuário
            if (command.permissions && interaction.guild) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if (!client.hasPermission(member, command.permissions)) {
                    const embed = client.createEmbed({
                        title: '🚫 Sem permissão',
                        description: `Você precisa da permissão \`${command.permissions}\` para usar este comando.`,
                        color: client.config.errorColor
                    });
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            
            // Verificar permissões do bot
            if (command.botPermissions && interaction.guild) {
                const botMember = interaction.guild.members.cache.get(client.user.id);
                if (!botMember.permissions.has(command.botPermissions)) {
                    const embed = client.createEmbed({
                        title: '🤖 Bot sem permissão',
                        description: `Eu preciso da permissão \`${command.botPermissions}\` para executar este comando.`,
                        color: client.config.errorColor
                    });
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            
            // Verificar se é comando apenas para owners
            if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
                const embed = client.createEmbed({
                    title: '👑 Comando restrito',
                    description: 'Este comando é apenas para desenvolvedores do bot.',
                    color: client.config.errorColor
                });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            
            // Executar comando
            await command.execute(interaction, client);
            
            // Tracking de uso
            client.trackCommand(command.data.name, interaction.user.id);
            
        } catch (error) {
            console.error(`❌ Erro ao executar slash command ${interaction.commandName}:`, error);
            client.logError(error, `Slash Command: ${interaction.commandName}`);
            
            const embed = client.createEmbed({
                title: '❌ Erro interno',
                description: 'Houve um erro ao executar este comando. Os desenvolvedores foram notificados.',
                color: client.config.errorColor,
                footer: `Comando: /${interaction.commandName} | Erro ID: ${Date.now()}`
            });
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [embed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } catch (replyError) {
                console.error('❌ Erro ao enviar resposta de erro:', replyError);
            }
        }
    }
};