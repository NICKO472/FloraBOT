import twemoji from 'twemoji-parser'

export async function renderEmoji(
    ctx,
    text,
    x,
    y
) {

    const emojis = twemoji.parse(text)

    let textIndex = 0

    let currentX = x

    for (const emoji of emojis) {

        const emojiIndex =
            text.indexOf(emoji.text, textIndex)

        // Texto antes do emoji
        if (emojiIndex > textIndex) {

            const chunk =
                text.substring(
                    textIndex,
                    emojiIndex
                )

            ctx.fillText(
                chunk,
                currentX,
                y
            )

            currentX +=
                ctx.measureText(chunk).width
        }

        // Emoji
        const image = await loadEmojiImage(
            emoji.url
        )

        const size =
            parseInt(ctx.font) || 32

        ctx.drawImage(
            image,
            currentX,
            y - size + 8,
            size,
            size
        )

        currentX += size

        textIndex =
            emojiIndex + emoji.text.length
    }

    // Texto restante
    if (textIndex < text.length) {

        const chunk =
            text.substring(textIndex)

        ctx.fillText(
            chunk,
            currentX,
            y
        )
    }
}

async function loadEmojiImage(url) {

    const Canvas =
        await import('@napi-rs/canvas')

    return Canvas.loadImage(url)
}