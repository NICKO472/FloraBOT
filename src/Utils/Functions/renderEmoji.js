import Canvas from '@napi-rs/canvas'

export async function renderEmoji(
    ctx,
    text,
    x,
    y,
    emojiSize = 32
) {

    const emojiRegex =
        /<a?:\w+:(\d+)>/g

    let currentX = x

    let lastIndex = 0

    const matches =
        [...text.matchAll(emojiRegex)]

    for (const match of matches) {

        const full = match[0]

        const id = match[1]

        const isAnimated =
            full.startsWith('<a:')

        const before =
            text.slice(lastIndex, match.index)

        // DESENHA TEXTO NORMAL
        if (before) {

            ctx.fillText(
                before,
                currentX,
                y
            )

            currentX +=
                ctx.measureText(before).width
        }

        // URL DO EMOJI
        const emojiURL =
            `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?size=96&quality=lossless`

        try {

            const emoji =
                await Canvas.loadImage(emojiURL)

            ctx.drawImage(
                emoji,
                currentX,
                y - emojiSize + 8,
                emojiSize,
                emojiSize
            )

            currentX += emojiSize + 6

        } catch {

            ctx.fillText(
                full,
                currentX,
                y
            )

            currentX +=
                ctx.measureText(full).width
        }

        lastIndex =
            match.index + full.length
    }

    // RESTO DO TEXTO
    const rest =
        text.slice(lastIndex)

    if (rest) {

        ctx.fillText(
            rest,
            currentX,
            y
        )
    }
}