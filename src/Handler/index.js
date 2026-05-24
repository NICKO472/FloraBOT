import fs from 'fs'

export default async function Handler(client) {

    console.log('Handler iniciado')

    const SlashsArray = []

    const folders = fs.readdirSync('./src/Comandos')

    for (const subfolder of folders) {

        const files = fs
            .readdirSync(`./src/Comandos/${subfolder}`)
            .filter(file => file.endsWith('.js'))

        for (const file of files) {

            const command = await import(`../Comandos/${subfolder}/${file}`)

            const cmd = command.default

            if (!cmd?.data?.name) continue

            client.Comandos.set(cmd.data.name, cmd)

            SlashsArray.push(cmd.data.toJSON())
        }
    }
}