require('./keep_alive.js');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client();

// الإعدادات
const GUILD_ID = '1264561928034975775';
const AFK_CHANNEL_ID = '1496674424693325844';
const ECON_CHANNEL_ID = '1505231947574546472';
const WAR_CHANNEL_ID = '1505231949629882508';
const EVENT_CHANNEL_ID = '1505231963919749193';
const POINTS_CHANNEL_ID = '1503150255594799205';
const DROP_BOT_ID = '1505226573400510464';
const TARGET_USER = '<@1505231949629882508>';

// نظام الطابور لمنع الباند
let queue = [];
let isProcessing = false;

const processQueue = () => {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;
    const task = queue.shift();
    task.channel.send(task.content).catch(() => {});
    setTimeout(() => {
        isProcessing = false;
        processQueue();
    }, 3500); 
};

const addToQueue = (channel, content) => {
    queue.push({ channel, content });
    processQueue();
};

// قفل لمنع التكرار لمدة 10 دقائق
let lastProcessedTime = 0;

client.on('ready', async () => {
    console.log(`تم التشغيل كـ ${client.user.tag}`);
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        joinVoiceChannel({ 
            channelId: AFK_CHANNEL_ID, 
            guildId: guild.id, 
            adapterCreator: guild.voiceAdapterCreator, 
            selfMute: true, 
            selfDeaf: false 
        });
    }

    // المهام الاقتصادية
    setInterval(() => {
        const chan = client.channels.cache.get(ECON_CHANNEL_ID);
        if (chan) { addToQueue(chan, "!جريمة"); addToQueue(chan, "!عمل"); }
    }, 3600000);

    // الحرب
    setInterval(() => {
        const chan = client.channels.cache.get(WAR_CHANNEL_ID);
        if (chan) addToQueue(chan, `!attack ${TARGET_USER}`);
    }, 1200000);

    // رسالة النقاط
    setInterval(() => {
        const chan = client.channels.cache.get(POINTS_CHANNEL_ID);
        if (chan) addToQueue(chan, "ياجماعه جمعو نقاط");
    }, 3000);
});

// الرقابة الدائمة للروم الصوتي
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id !== client.user.id) return;
    if (newState.channelId !== AFK_CHANNEL_ID) {
        const guild = newState.guild;
        joinVoiceChannel({ 
            channelId: AFK_CHANNEL_ID, 
            guildId: guild.id, 
            adapterCreator: guild.voiceAdapterCreator, 
            selfMute: true, 
            selfDeaf: false 
        });
    }
});

// مراقبة الدروب مع نظام القفل (10 دقائق)
client.on('messageCreate', (msg) => {
    const isDropBot = msg.author.id === DROP_BOT_ID;
    const hasAttachment = msg.attachments.size > 0;
    const timePassed = (Date.now() - lastProcessedTime) > 600000; // 10 دقائق

    if (msg.channel.id === EVENT_CHANNEL_ID && isDropBot && hasAttachment && timePassed) {
        lastProcessedTime = Date.now(); // تحديث وقت آخر عملية

        addToQueue(msg.channel, "!event join");
        setTimeout(() => addToQueue(msg.channel, "!event join"), 500);
        
        setTimeout(() => addToQueue(msg.channel, "!event claim"), 4000);
        setTimeout(() => addToQueue(msg.channel, "!event claim"), 4500);
        
        console.log(`تم رصد دروب، وسأتجاهل أي صور أخرى لمدة 10 دقائق.`);
    }
});

client.login(process.env.token);
