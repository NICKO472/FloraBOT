import fs from 'fs'
import path from 'path'

export function getNextBackgroundId(basePath) {

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true })
    }

    const folders = fs.readdirSync(basePath)

    let max = 0

    for (const folder of folders) {

        const match = folder.match(/Background_(\d+)/)

        if (match) {
            const num = Number(match[1])
            if (num > max) max = num
        }
    }

    return max + 1
}