export default {
    name: 'interactionCreate',

    async execute(interaction, client) {

        // =========================
        // AUTOCOMPLETE
        // =========================

        if (interaction.isAutocomplete()) {

            const command =
                client.Comandos.get(
                    interaction.commandName
                )

            if (!command?.autocomplete) return

            try {

                await command.autocomplete(
                    interaction,
                    client
                )

            } catch (error) {

                console.error(
                    'Erro no autocomplete:',
                    error
                )
            }

            return
        }

        // =========================
        // SLASH COMMAND
        // =========================

        if (!interaction.isChatInputCommand()) return

        const command =
            client.Comandos.get(
                interaction.commandName
            )

        if (!command) {

            console.error(
                `❌ Slash command não encontrado: ${interaction.commandName}`
            )

            return
        }

        try {

            console.log(
                `⚡ Slash command executado: /${interaction.commandName} | Usuário: ${interaction.user.tag} | Servidor: ${interaction.guild?.name || 'DM'} ⚡`
            )

            // =========================
            // COOLDOWN
            // =========================

            if (command.cooldown) {

                if (!client.cooldowns) {
                    client.cooldowns = new Map()
                }

                const now = Date.now()

                const timestamps =
                    client.cooldowns.get(command.data.name)
                    || new Map()

                client.cooldowns.set(
                    command.data.name,
                    timestamps
                )

                const cooldownAmount =
                    command.cooldown * 1000

                if (
                    timestamps.has(interaction.user.id)
                ) {

                    const expirationTime =
                        timestamps.get(interaction.user.id)
                        + cooldownAmount

                    if (now < expirationTime) {

                        const timeLeft =
                            (
                                expirationTime - now
                            ) / 1000

                        return interaction.reply({
                            content:
                                `⏰ Espere ${timeLeft.toFixed(1)}s para usar novamente.`,
                            flags: 64
                        })
                    }
                }

                timestamps.set(
                    interaction.user.id,
                    now
                )

                setTimeout(() => {

                    timestamps.delete(
                        interaction.user.id
                    )

                }, cooldownAmount)
            }

            // =========================
            // AUTO DEFER
            // =========================

            if (
                !interaction.deferred &&
                !interaction.replied
            ) {

                await interaction.deferReply()
            }

            // =========================
            // EXECUTAR COMANDO
            // =========================

            await command.execute(
                interaction,
                client
            )

        } catch (error) {

            console.error(
                `❌ Erro ao executar ${interaction.commandName}:`,
                error
            )

            try {

                if (
                    interaction.deferred &&
                    !interaction.replied
                ) {

                    await interaction.editReply({
                        content:
                            '❌ Ocorreu um erro ao executar este comando!'
                    })

                } else if (!interaction.replied) {

                    await interaction.reply({
                        content:
                            '❌ Ocorreu um erro ao executar este comando!',
                        flags: 64
                    })
                }

            } catch (replyError) {

                console.error(
                    'Erro ao responder interação:',
                    replyError
                )
            }
        }
    }
}