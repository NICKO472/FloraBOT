import fs from 'fs'

export default async function Handler(client) {

    console.log("Handler iniciado")

    const SlashsArray = []

    fs.readdir('./src/Comandos', (error, folders) => {

        if (error) return console.log(error)

        folders.forEach(subfolder => {

            fs.readdir(`./src/Comandos/${subfolder}`, async (error, files) => {

                if (error) return console.log(error)

                for (const file of files) {

                    if (!file.endsWith('.js')) continue

                    const command = await import(`../Comandos/${subfolder}/${file}`)

                    const cmd = command.default

                    if (!cmd?.name) continue

                    client.Comandos.set(cmd.name, cmd)

                    SlashsArray.push(cmd)

                    console.log(`Comando carregado: ${cmd.name}`)

                }

            })

        })

    })

    client.on('clientReady', async () => {

        client.guilds.cache.forEach(guild => {
            guild.commands.set(SlashsArray)
        })

    })

}