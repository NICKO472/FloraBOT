import { GuildMember } from "discord.js";

export const isInVoiceChannel = async (interaction) => {

    if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel
    ) {

        await interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true
        });

        return false;
    }

    if (
        interaction.guild.members.me?.voice.channelId &&
        interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
    ) {

        await interaction.reply({
            content: 'You are not in my voice channel!',
            ephemeral: true
        });

        return false;
    }

    return true;
};