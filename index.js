const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
require('./keep_alive.js');

const client = new Client();

// آيدي السيرفر
const GUILD_ID = '1264561928034975775';
// آيدي الروم الذي تدخل فيه لكي يقوم Temp Voice بإنشاء روم جديد لك
const JOIN_TO_CREATE_ID = '1496674843184074945'; 

client.on('ready', async () => {
    console.log(`تم التشغيل كـ ${client.user.tag}`);

    const findAndJoinMyRoom = async () => {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return console.log("السيرفر غير موجود!");

        // 1. الدخول لروم الـ Join to Create
        joinVoiceChannel({
            channelId: JOIN_TO_CREATE_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });

        // 2. الانتظار قليلاً ليقوم بوت Temp Voice بإنشاء الروم الخاص بك
        setTimeout(() => {
            // البحث عن الروم الذي يحتوي على البوت الخاص بك حالياً
            const myRoom = guild.channels.cache.find(c => 
                c.type === 2 && c.members.has(client.user.id) && c.id !== JOIN_TO_CREATE_ID
            );

            if (myRoom) {
                console.log(`تم العثور على الروم الجديد: ${myRoom.name}`);
                
                // الانتقال للروم الجديد
                joinVoiceChannel({
                    channelId: myRoom.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });

                // إرسال الرسالة
                myRoom.send("مرحبا كيفك اخي").catch(err => console.log("لا يمكن الإرسال في هذا الروم"));
            }
        }, 5000); // زدنا الوقت لـ 5 ثواني لضمان أن الروم قد أُنشئ فعلاً
    };

    findAndJoinMyRoom();
    setInterval(findAndJoinMyRoom, 60000); // يكرر العملية كل دقيقة للتأكد
});

client.login(process.env.token);
