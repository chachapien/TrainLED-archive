document.addEventListener("DOMContentLoaded", function () {

    const displayList =
        document.getElementById("display-list");

    const searchInput =
        document.getElementById("search-input");

    const searchButton =
        document.getElementById("search-button");

    const clearButton =
        document.getElementById("clear-button");

    const resultCount =
        document.getElementById("result-count");


    let displays = [];


    /*
     * JSONを読み込む
     */

    fetch("./data/displays.json")

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "displays.jsonを読み込めませんでした。HTTPステータス：" +
                    response.status
                );

            }

            return response.json();

        })

        .then(function (data) {

            /*
             * JSONが配列の場合
             */

            if (Array.isArray(data)) {

                displays = data;

            }

            /*
             * companies形式の場合
             */

            else if (
                data &&
                Array.isArray(data.companies)
            ) {

                displays = [];


                data.companies.forEach(
                    function (company) {

                        if (
                            !Array.isArray(
                                company.types
                            )
                        ) {

                            return;

                        }


                        company.types.forEach(
                            function (type) {

                                if (
                                    !Array.isArray(
                                        type.series
                                    )
                                ) {

                                    return;

                                }


                                type.series.forEach(
                                    function (series) {

                                        if (
                                            !Array.isArray(
                                                series.displays
                                            )
                                        ) {

                                            return;

                                        }


                                        series.displays.forEach(
                                            function (display) {

                                                displays.push({

                                                    ...display,

                                                    company:
                                                        company.name ||
                                                        "",

                                                    vehicle:
                                                        display.vehicle ||
                                                        series.name ||
                                                        type.name ||
                                                        "",

                                                    line:
                                                        display.line ||
                                                        "",

                                                    destination:
                                                        display.destination ||
                                                        display.name ||
                                                        "",

                                                    type:
                                                        display.type ||
                                                        type.name ||
                                                        ""

                                                });

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }


            displayDisplays(
                displays
            );

        })

        .catch(function (error) {

            console.error(
                "方向幕データ読み込みエラー:",
                error
            );


            displayList.innerHTML = `

                <div class="display-item">

                    <h3>
                        データを読み込めませんでした
                    </h3>

                    <p>
                        方向幕データの読み込みに失敗しました。
                    </p>

                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>

                </div>

            `;

        });


    /*
     * 方向幕を表示
     */

    function displayDisplays(data) {

        displayList.innerHTML = "";


        if (
            data.length === 0
        ) {

            displayList.innerHTML = `

                <div class="display-item">

                    <h3>
                        方向幕が見つかりません
                    </h3>

                    <p>
                        条件に一致する方向幕はありませんでした。
                    </p>

                </div>

            `;


            resultCount.textContent =
                "0件";


            return;

        }


        resultCount.textContent =
            data.length +
            "件の方向幕";


        data.forEach(
            function(display) {


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "display-item";


                item.innerHTML = `

                    <img
                        src="${escapeAttribute(
                            normalizeImagePath(
                                display.image
                            )
                        )}"
                        alt="${escapeAttribute(
                            display.destination ||
                            display.name ||
                            ""
                        )}の方向幕"
                        class="display-image"
                    >

                    <h3>
                        ${escapeHtml(
                            display.vehicle ||
                            ""
                        )}
                    </h3>

                    <p>
                        <strong>路線：</strong>
                        ${escapeHtml(
                            display.line ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>行先：</strong>
                        ${escapeHtml(
                            display.destination ||
                            display.name ||
                            ""
                        )}
                    </p>

                    <p>
                        <strong>種別：</strong>
                        ${escapeHtml(
                            display.type ||
                            ""
                        )}
                    </p>

                    ${
                        display.ledSize
                            ? `
                                <p>
                                    <strong>LEDサイズ：</strong>
                                    ${escapeHtml(
                                        display.ledSize
                                    )}
                                </p>
                              `
                            : ""
                    }

                `;


                displayList.appendChild(
                    item
                );


                const image =
                    item.querySelector(
                        ".display-image"
                    );


                protectImage(
                    image
                );

            }
        );

    }


    /*
     * 検索
     */

    function searchDisplays() {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();


        if (
            keyword === ""
        ) {

            displayDisplays(
                displays
            );

            return;

        }


        const results =
            displays.filter(
                function(display) {

                    return (

                        String(
                            display.vehicle ||
                            ""
                        )
                        .toLowerCase()
                        .includes(keyword)

                        ||

                        String(
                            display.line ||
                            ""
                        )
                        .toLowerCase()
                        .includes(keyword)

                        ||

                        String(
                            display.destination ||
                            ""
                        )
                        .toLowerCase()
                        .includes(keyword)

                        ||

                        String(
                            display.type ||
                            ""
                        )
                        .toLowerCase()
                        .includes(keyword)

                        ||

                        String(
                            display.ledSize ||
                            ""
                        )
                        .toLowerCase()
                        .includes(keyword)

                    );

                }
            );


        displayDisplays(
            results
        );

    }


    /*
     * 検索ボタン
     */

    searchButton.addEventListener(
        "click",
        searchDisplays
    );


    /*
     * Enterキーでも検索
     */

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                searchDisplays();

            }

        }
    );


    /*
     * 検索クリア
     */

    clearButton.addEventListener(
        "click",
        function () {

            searchInput.value = "";

            displayDisplays(
                displays
            );

        }
    );


    /*
     * 画像URL補正
     */

    function normalizeImagePath(
        path
    ) {

        if (
            typeof path !== "string"
        ) {

            return "";

        }


        path =
            path.trim();


        if (
            !path
        ) {

            return "";

        }


        if (
            /^https?:\/\//i.test(path)
        ) {

            return path;

        }


        if (
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(
                path
            )
        ) {

            return path;

        }


        return path + ".png";

    }


    /*
     * ==================================================
     * 画像保護
     *
     * ブラウザ上での右クリック・画像ドラッグなどの
     * 簡単な画像保存操作を抑制します。
     *
     * ※ブラウザに画像を表示する以上、
     *   完全な取得防止はできません。
     * ==================================================
     */

    function protectImage(
        image
    ) {

        if (!image) {

            return;

        }


        /*
         * 画像のドラッグを無効化
         */

        image.draggable =
            false;

        image.setAttribute(
            "draggable",
            "false"
        );


        /*
         * 画像上の右クリックを無効化
         */

        image.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

            }
        );


        /*
         * 画像ドラッグを無効化
         */

        image.addEventListener(
            "dragstart",
            function(event) {

                event.preventDefault();

            }
        );


        /*
         * 画像選択を無効化
         */

        image.addEventListener(
            "selectstart",
            function(event) {

                event.preventDefault();

            }
        );


        /*
         * 右クリック用マウス操作を無効化
         */

        image.addEventListener(
            "mousedown",
            function(event) {

                if (
                    event.button === 2
                ) {

                    event.preventDefault();

                }

            }
        );

    }


    /*
     * HTMLエスケープ
     */

    function escapeHtml(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value;


        return div.innerHTML;

    }


    /*
     * 属性値エスケープ
     */

    function escapeAttribute(
        value
    ) {

        return escapeHtml(
            value
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#39;"
        );

    }

});