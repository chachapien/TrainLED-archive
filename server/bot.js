import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let latestAnnouncement = {
    content: "",
    author: "",
    timestamp: null,
    messageId: null
};

async function updateAnnouncement() {
    if (!client.isReady()) {
        return;
    }

    try {
        const guild = await client.guilds.fetch(
            DISCORD_GUILD_ID
        );

        const channel = await guild.channels.fetch(
            DISCORD_CHANNEL_ID
        );

        if (!channel) {
            console.error(
                "Discordチャンネルが見つかりません。"
            );
            return;
        }

        if (!channel.isTextBased()) {
            console.error(
                "指定されたチャンネルはテキストチャンネルではありません。"
            );
            return;
        }

        const messages = await channel.messages.fetch({
            limit: 1
        });

        if (messages.size === 0) {
            latestAnnouncement = {
                content: "",
                author: "",
                timestamp: null,
                messageId: null
            };

            console.log(
                "お知らせチャンネルにメッセージがありません。"
            );

            return;
        }

        const message = messages.first();

        latestAnnouncement = {
            content: message.content || "",
            author: message.author
                ? message.author.username
                : "",
            timestamp: message.createdAt
                ? message.createdAt.toISOString()
                : null,
            messageId: message.id || null
        };

        console.log(
            "最新のお知らせ:",
            latestAnnouncement.content
        );

    } catch (error) {
        console.error(
            "お知らせ取得エラー:",
            error.message
        );
    }
}

client.once("clientReady", async () => {
    console.log("================================");
    console.log("Discord Bot起動完了");
    console.log("Bot名:", client.user.tag);
    console.log("サーバーID:", DISCORD_GUILD_ID);
    console.log("チャンネルID:", DISCORD_CHANNEL_ID);
    console.log("================================");

    await updateAnnouncement();

    setInterval(
        updateAnnouncement,
        30000
    );

    console.log(
        "Discordお知らせ取得準備完了"
    );
});

client.on("messageCreate", (message) => {
    if (
        message.channel.id !==
        DISCORD_CHANNEL_ID
    ) {
        return;
    }

    if (message.author.bot) {
        return;
    }

    latestAnnouncement = {
        content: message.content || "",
        author: message.author
            ? message.author.username
            : "",
        timestamp: message.createdAt
            ? message.createdAt.toISOString()
            : null,
        messageId: message.id || null
    };

    console.log(
        "新しいお知らせ:",
        latestAnnouncement.content
    );
});

app.get(
    "/api/announcement",
    (req, res) => {
        res.json({
            success: true,
            announcement: latestAnnouncement
        });
    }
);

const websiteDirectory = path.join(
    __dirname,
    ".."
);

app.use(
    express.static(
        websiteDirectory
    )
);

app.get(
    "/",
    (req, res) => {
        res.sendFile(
            path.join(
                websiteDirectory,
                "index.html"
            )
        );
    }
);

app.listen(
    PORT,
    () => {
        console.log(
            "Webサイト起動: http://localhost:" +
            PORT
        );
    }
);

if (!DISCORD_TOKEN) {
    console.error(
        "DISCORD_TOKENが設定されていません。"
    );
} else if (!DISCORD_GUILD_ID) {
    console.error(
        "DISCORD_GUILD_IDが設定されていません。"
    );
} else if (!DISCORD_CHANNEL_ID) {
    console.error(
        "DISCORD_CHANNEL_IDが設定されていません。"
    );
} else {
    client.login(
        DISCORD_TOKEN
    ).then(() => {
        console.log(
            "Discord Botへの接続に成功しました。"
        );
    }).catch((error) => {
        console.error(
            "Discordログインエラー:",
            error.message
        );
    });
}