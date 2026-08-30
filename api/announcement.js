export default async function handler(request, response) {

    /*
     * GitHub Pagesからのアクセスを許可
     */
    response.setHeader(
        "Access-Control-Allow-Origin",
        "https://chachapien.github.io"
    );

    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    /*
     * OPTIONSリクエスト
     */
    if (request.method === "OPTIONS") {

        response.status(204).end();

        return;
    }


    /*
     * GET以外は受け付けない
     */
    if (request.method !== "GET") {

        response.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });

        return;
    }


    /*
     * 環境変数
     *
     * これらはGitHubには保存しません。
     * VercelのEnvironment Variablesに設定します。
     */
    const DISCORD_TOKEN =
        process.env.DISCORD_TOKEN;

    const DISCORD_CHANNEL_ID =
        process.env.DISCORD_CHANNEL_ID;


    /*
     * 環境変数チェック
     */
    if (
        !DISCORD_TOKEN ||
        !DISCORD_CHANNEL_ID
    ) {

        console.error(
            "Discordの環境変数が設定されていません。"
        );

        response.status(500).json({
            success: false,
            error: "Discordの設定がありません。"
        });

        return;
    }


    /*
     * Discord API
     *
     * 指定チャンネルの最新メッセージを1件取得
     */
    const discordUrl =
        "https://discord.com/api/v10/channels/" +
        encodeURIComponent(
            DISCORD_CHANNEL_ID
        ) +
        "/messages?limit=1";


    try {

        const discordResponse =
            await fetch(
                discordUrl,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bot " +
                            DISCORD_TOKEN,

                        "Content-Type":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        /*
         * Discord APIエラー
         */
        if (!discordResponse.ok) {

            const errorText =
                await discordResponse.text();

            console.error(
                "Discord APIエラー:",
                discordResponse.status,
                errorText
            );


            response.status(500).json({
                success: false,
                error:
                    "Discordからお知らせを取得できませんでした。"
            });

            return;
        }


        /*
         * DiscordからJSON取得
         */
        const messages =
            await discordResponse.json();


        /*
         * メッセージがない場合
         */
        if (
            !Array.isArray(messages) ||
            messages.length === 0
        ) {

            response.status(200).json({
                success: true,

                announcement: {
                    content: "",
                    author: "",
                    timestamp: null,
                    messageId: null
                }
            });

            return;
        }


        /*
         * 最新メッセージ
         */
        const message =
            messages[0];


        /*
         * メッセージ本文
         */
        const content =
            typeof message.content === "string"
                ? message.content.trim()
                : "";


        /*
         * 投稿者名
         */
        const author =
            message.author
                ? (
                    message.author.global_name ||
                    message.author.username ||
                    ""
                )
                : "";


        /*
         * お知らせを返す
         */
        response.status(200).json({

            success: true,

            announcement: {

                content: content,

                author: author,

                timestamp:
                    message.timestamp || null,

                messageId:
                    message.id || null

            }

        });

    }
    catch (error) {

        console.error(
            "お知らせ取得エラー:",
            error
        );


        response.status(500).json({

            success: false,

            error:
                "お知らせを取得できませんでした。"

        });

    }

}