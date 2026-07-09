const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');

const client = new Client();

client.on('ready', () => {
    console.log(`تم تسجيل الدخول: ${client.user.tag}`);
    const channelId = '1496674843184074945';

    const playNoise = () => {
        const channel = client.channels.cache.get(channelId);
        if (!channel) return;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false // يجب أن تكون false ليظهر نشاط الصوت
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(path.join(__dirname, 'noise.opus')); // ملف الصوت الخاص بك

        player.play(resource);
        connection.subscribe(player);

        // تكرار الصوت تلقائياً عند انتهائه
        player.on(AudioPlayerStatus.Idle, () => {
            player.play(resource);
        });
    };

    playNoise();
    setInterval(playNoise, 60000); // للتأكد من بقاء البوت في الروم
});

client.login(process.env.token);
