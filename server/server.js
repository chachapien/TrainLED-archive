import "dotenv/config";

import express from "express";

import path from "path";

import { fileURLToPath } from "url";

import {
    Client,
    GatewayIntentBits,
    ChannelType
} from "discord.js";


/* ==================================================
   基本設定
   ================================================== */

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


/* ==================================================
   環境変数
   ================================================== */

const DISCORD_TOKEN =
    process.env.DISCORD_TOKEN;

const DISCORD_GUILD_ID =
    process.env.DISCORD_GUILD_ID;

const DISCORD_CHANNEL_ID =
    process.env.DISCORD_CHANNEL_ID;

const PORT =
    Number(process.env.PORT) || 3000;


/* ==================================================
   設定チェック
   ================================================== */

if (!DISCORD_TOKEN) {

    console.error(
        "DISCORD_TOKEN が設定されていません。"
    );

    process.exit(1);

}


if (!DISCORD_CHANNEL_ID) {

    console.error(
        "DISCORD_CHANNEL_ID が設定されていません。"
    );

    process.exit(1);

}


/* ==================================================
   Discord Bot
   ================================================== */

const client =
    new Client({

        intents: [

            GatewayIntentBits.Guilds,

            GatewayIntentBits.GuildMessages,

            GatewayIntentBits.MessageContent

        ]

    });


/* ==================================================
   最新お知らせ
   ================================================== */

let latestAnnouncement = {

    content: "",

    author: "",

    timestamp: null,

    messageId: null

};


/* ==================================================
   メッセージを保存
   ================================================== */

function setLatestAnnouncement(message) {

    if (!message) {

        return;

    }


    if (message.channelId !== DISCORD_CHANNEL_ID) {

        return;

    }


    /*
     * Bot自身が送ったメッセージは
     * お知らせとして扱わない
     */

    if (message.author?.bot) {

        return;

    }


    const content =
        message.content?.trim() || "";


    /*
     * 文字がないメッセージは無視
     */

    if (!content) {

        return;

    }


    latestAnnouncement = {

        content: content,

        author:
            message.author?.displayName ||
            message.author?.username ||
            "",

        timestamp:
            message.createdAt
                ? message.createdAt.toISOString()
                : null,

        messageId:
            message.id || null

    };


    console.log(
        "最新お知らせ:",
        latestAnnouncement.content
    );

}


/* ==================================================
   Bot起動
   ================================================== */

client.once(
    "ready",
    async function() {

        console.log(
            `Discord Bot起動: ${client.user.tag}`
        );


        try {

            /*
             * 指定サーバーを取得
             */

            let guild = null;


            if (DISCORD_GUILD_ID) {

                guild =
                    await client.guilds.fetch(
                        DISCORD_GUILD_ID
                    );

            }


            /*
             * 指定チャンネルを取得
             */

            const channel =
                await client.channels.fetch(
                    DISCORD_CHANNEL_ID
                );


            if (!channel) {

                throw new Error(
                    "指定されたチャンネルが見つかりません。"
                );

            }


            /*
             * テキストチャンネルか確認
             */

            if (
                channel.type !==
                ChannelType.GuildText
            ) {

                throw new Error(
                    "指定したチャンネルが通常のテキストチャンネルではありません。"
                );

            }


            /*
             * サーバーIDが設定されている場合、
             * チャンネルのサーバーも確認
             */

            if (
                guild &&
                channel.guildId !== guild.id
            ) {

                throw new Error(
                    "指定したサーバーIDとチャンネルIDが一致していません。"
                );

            }


            /*
             * 最新メッセージを1件取得
             */

            const messages =
                await channel.messages.fetch({
                    limit: 1
                });


            const latestMessage =
                messages.first();


            if (latestMessage) {

                setLatestAnnouncement(
                    latestMessage
                );

            } else {

                console.log(
                    "お知らせチャンネルにメッセージがありません。"
                );

            }


            console.log(
                "Discordお知らせ取得準備完了"
            );

        } catch (error) {

            console.error(
                "Discordチャンネル取得エラー:",
                error
            );

        }

    }
);


/* ==================================================
   新しいメッセージ
   ================================================== */

client.on(
    "messageCreate",
    function(message) {

        setLatestAnnouncement(
            message
        );

    }
);


/* ==================================================
   Discord Botログイン
   ================================================== */

client.login(
    DISCORD_TOKEN
);


/* ==================================================
   Express
   ================================================== */

const app =
    express();


/* ==================================================
   API
   ================================================== */

app.get(
    "/api/announcement",
    function(request, response) {

        response.json({

            success: true,

            announcement:
                latestAnnouncement

        });

    }
);


/* ==================================================
   API確認用
   ================================================== */

app.get(
    "/api/status",
    function(request, response) {

        response.json({

            success: true,

            botReady:
                client.isReady(),

            channelId:
                DISCORD_CHANNEL_ID,

            hasAnnouncement:
                Boolean(
                    latestAnnouncement.content
                )

        });

    }
);


/* ==================================================
   Webサイト
   ================================================== */

const websiteRoot =
    path.resolve(
        __dirname,
        ".."
    );


app.use(
    express.static(
        websiteRoot
    )
);


/* ==================================================
   トップページ
   ================================================== */

app.get(
    "/",
    function(request, response) {

        response.sendFile(
            path.join(
                websiteRoot,
                "index.html"
            )
        );

    }
);


/* ==================================================
   サーバー起動
   ================================================== */

app.listen(
    PORT,
    function() {

        console.log(
            `Webサイト起動: http://localhost:${PORT}`
        );

        console.log(
            "このURLから行先表示の広場を開いてください。"
        );

    }
);