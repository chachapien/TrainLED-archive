(function () {

    "use strict";


    /*
     * ==================================================
     * メンテナンス設定
     * ==================================================
     *
     * 2026年9月5日になるまで
     * メンテナンス画面を表示します。
     *
     * 9月5日 00:00以降は自動的に通常表示へ戻ります。
     *
     * ※ index.html本体の内容は変更しません。
     * ==================================================
     */


    const maintenanceEnd =
        new Date(
            "2026-09-05T00:00:00+09:00"
        );


    const now =
        new Date();


    /*
     * ==================================================
     * メンテナンス終了後
     * ==================================================
     */

    if (
        now >= maintenanceEnd
    ) {

        return;

    }


    /*
     * ==================================================
     * メンテナンス画面
     * ==================================================
     */

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "maintenance-overlay";


    overlay.innerHTML = `

        <div id="maintenance-box">

            <div id="maintenance-icon">
                ⚙
            </div>

            <h1>
                メンテナンス中
            </h1>

            <p>
                現在、サイトのメンテナンスを行っています。
            </p>

            <p>
                しばらくお待ちください。
            </p>

            <div id="maintenance-date">
                2026年9月5日より再公開予定
            </div>

        </div>

    `;


    /*
     * ==================================================
     * メンテナンス画面のCSS
     * ==================================================
     */

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        #maintenance-overlay {

            position: fixed;

            top: 0;
            left: 0;

            width: 100vw;
            height: 100vh;

            background:
                #111111;

            color: white;

            display: flex;

            justify-content: center;

            align-items: center;

            text-align: center;

            z-index: 2147483647;

            font-family:
                "Yu Gothic",
                "Meiryo",
                sans-serif;

        }


        #maintenance-box {

            width: min(
                90vw,
                600px
            );

            padding:
                40px 25px;

            box-sizing: border-box;

        }


        #maintenance-icon {

            font-size: 64px;

            margin-bottom: 20px;

        }


        #maintenance-box h1 {

            margin: 0 0 25px;

            font-size: 32px;

            font-weight: bold;

        }


        #maintenance-box p {

            margin: 10px 0;

            font-size: 16px;

            line-height: 1.8;

        }


        #maintenance-date {

            margin-top: 30px;

            padding: 12px 18px;

            background:
                rgba(255,255,255,0.08);

            border-radius: 8px;

            font-size: 14px;

        }

    `;


    /*
     * ==================================================
     * ページへ追加
     * ==================================================
     */

    document.head.appendChild(
        style
    );


    document.body.appendChild(
        overlay
    );


    /*
     * ==================================================
     * メンテナンス中はページを操作できないようにする
     * ==================================================
     */

    document.documentElement.style.overflow =
        "hidden";


})();