import {
    ActivityType
} from 'discord.js'

export default {

    name: 'clientReady',
    once: true,

    async execute(client) {

        const status = [

            {
                name: `🌸 Flora`,
                type: ActivityType.Playing
            },

            {
                name: `${client.guilds.cache.size} servidores`,
                type: ActivityType.Watching
            },

            {
                name: `${client.users.cache.size} usuários`,
                type: ActivityType.Watching
            },

            {
                name: `/profile`,
                type: ActivityType.Listening
            },

            {
                name: `Melhor bot de economia!`,
                type: ActivityType.Playing
            },

            {
                name: `Cuidando da plantação`,
                type: ActivityType.Competing
            }

        ]

        let index = 0

        async function updateStatus() {

            const current =
                status[index]

            client.user.setPresence({

                activities: [
                    {
                        name: current.name,
                        type: current.type
                    }
                ],

                status: 'online'
            })

            index++

            if (index >= status.length) {
                index = 0
            }
        }

        updateStatus()

        setInterval(
            updateStatus,
            15000
        )
    }
}