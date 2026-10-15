document.addEventListener(
    "DOMContentLoaded",
    () =>
    {
        setupSmoothScroll();
        setupWorldCarousel();
        setupCharacterPage();
    }
);

function setupSmoothScroll()
{
    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach(
        link =>
        {
            link.addEventListener(
                "click",
                event =>
                {
                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        targetId == null ||
                        targetId === "#"
                    )
                    {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (target == null)
                    {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView(
                        {
                            behavior: "smooth"
                        }
                    );
                }
            );
        }
    );
}

function setupWorldCarousel()
{
    const ringWrap =
        document.getElementById(
            "worldRingWrap"
        );

    const items =
        Array.from(
            document.querySelectorAll(
                ".world-item"
            )
        );

    const glitchWrap =
        document.getElementById(
            "glitchWrap"
        );

    const selectedLabel =
        document.getElementById(
            "worldSelectedLabel"
        );

    if (
        ringWrap == null ||
        items.length === 0 ||
        glitchWrap == null ||
        selectedLabel == null
    )
    {
        return;
    }

    const total =
        items.length;

    const stepAngle =
        360 / total;

    let radius =
        window.innerWidth <= 760
            ? 220
            : 360;

    let currentRotation =
        0;

    let activeIndex =
        0;

    let isDragging =
        false;

    let dragMoved =
        false;

    let dragDistance =
        0;

    let lastX =
        0;

    function normalizeAngle(angle)
    {
        let result =
            angle % 360;

        if (result > 180)
        {
            result -= 360;
        }

        if (result < -180)
        {
            result += 360;
        }

        return result;
    }

    function updateRadius()
    {
        radius =
            window.innerWidth <= 760
                ? 220
                : 360;
    }

    function updateWorldRing()
    {
        items.forEach(
            (
                item,
                index
            ) =>
            {
                const baseAngle =
                    index * stepAngle;

                const angle =
                    baseAngle +
                    currentRotation;

                const normalized =
                    normalizeAngle(
                        angle
                    );

                const rad =
                    normalized *
                    Math.PI / 180.0;

                const x =
                    Math.sin(rad) * radius;

                const z =
                    Math.cos(rad) * radius;

                const y =
                    z * 0.18;

                const depth =
                    (z + radius) /
                    (radius * 2);

                const scale =
                    0.52 +
                    depth * 0.72;

                const opacity =
                    0.24 +
                    depth * 0.76;

                item.style.transform =
                    "translate3d(" +
                    x + "px, " +
                    y + "px, " +
                    z + "px) " +
                    "scale(" +
                    scale +
                    ")";

                item.style.opacity =
                    opacity;

                item.style.zIndex =
                    String(
                        Math.round(
                            z + radius
                        )
                    );

                if (
                    index === activeIndex
                )
                {
                    item.classList.add(
                        "is-active"
                    );
                }
                else
                {
                    item.classList.remove(
                        "is-active"
                    );
                }
            }
        );

        const activeItem =
            items[activeIndex];

        const colorName =
            activeItem.dataset.colorName ||
            "WORLD";

        selectedLabel.textContent =
            colorName + " WORLD";

        glitchWrap.classList.add(
            "show"
        );
    }

    function findNearestIndex()
    {
        let nearestIndex =
            0;

        let minDistance =
            Number.MAX_VALUE;

        items.forEach(
            (
                item,
                index
            ) =>
            {
                const baseAngle =
                    index * stepAngle;

                const angle =
                    normalizeAngle(
                        baseAngle +
                        currentRotation
                    );

                const distance =
                    Math.abs(angle);

                if (
                    distance < minDistance
                )
                {
                    minDistance =
                        distance;

                    nearestIndex =
                        index;
                }
            }
        );

        return nearestIndex;
    }

    function snapToIndex(index)
    {
        activeIndex =
            index;

        currentRotation =
            -index * stepAngle;

        updateWorldRing();
    }

    function handlePointerDown(event)
    {
        isDragging =
            true;

        dragMoved =
            false;

        dragDistance =
            0;

        lastX =
            event.clientX;

        ringWrap.classList.add(
            "dragging"
        );
    }

    function handlePointerMove(event)
    {
        if (!isDragging)
        {
            return;
        }

        const deltaX =
            event.clientX - lastX;

        lastX =
            event.clientX;

        dragDistance +=
            Math.abs(deltaX);

        if (dragDistance > 4)
        {
            dragMoved = true;
        }

        currentRotation +=
            deltaX * 0.36;

        activeIndex =
            findNearestIndex();

        updateWorldRing();

        event.preventDefault();
    }

    function handlePointerUp()
    {
        if (!isDragging)
        {
            return;
        }

        isDragging =
            false;

        ringWrap.classList.remove(
            "dragging"
        );

        activeIndex =
            findNearestIndex();

        currentRotation =
            -activeIndex * stepAngle;

        updateWorldRing();

        window.setTimeout(
            () =>
            {
                dragMoved = false;
            },
            40
        );
    }

    ringWrap.addEventListener(
        "pointerdown",
        handlePointerDown
    );

    window.addEventListener(
        "pointermove",
        handlePointerMove,
        { passive: false }
    );

    window.addEventListener(
        "pointerup",
        handlePointerUp
    );

    window.addEventListener(
        "pointercancel",
        handlePointerUp
    );

    items.forEach(
        item =>
        {
            item.addEventListener(
                "click",
                () =>
                {
                    if (dragMoved)
                    {
                        return;
                    }

                    const index =
                        Number(
                            item.dataset.index
                        );

                    const world =
                        item.dataset.world ||
                        "red";

                    if (
                        index === activeIndex
                    )
                    {
                        window.location.href =
                            "character.html?world=" +
                            encodeURIComponent(
                                world
                            );
                        return;
                    }

                    snapToIndex(index);
                }
            );
        }
    );

    window.addEventListener(
        "resize",
        () =>
        {
            updateRadius();
            updateWorldRing();
        }
    );

    updateRadius();
    snapToIndex(0);
}

function setupCharacterPage()
{
    const list =
        document.getElementById(
            "characterList"
        );

    const worldTitle =
        document.getElementById(
            "characterWorldTitle"
        );

    const intro =
        document.getElementById(
            "characterIntro"
        );

    const lead =
        document.getElementById(
            "characterPageLead"
        );

    if (
        list == null ||
        worldTitle == null ||
        intro == null ||
        lead == null
    )
    {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const worldKey =
        params.get("world") ||
        "red";

    const data =
        {
            red: {
                label: "RED WORLD",
                worldName: "赤の世界",
                characters: [
                    "加賀　莉愛"
                ]
            },
            orange: {
                label: "ORANGE WORLD",
                worldName: "橙の世界",
                characters: [
                    "一花　叶",
                    "星乃　清花",
                    "月雲　風斗",
                    "天乃　彩"
                ]
            },
            yellow: {
                label: "YELLOW WORLD",
                worldName: "黄の世界",
                characters: [
                    "如月　梨結",
                    "神岡　成海",
                    "順田　隆",
                    "雨野　雪"
                ]
            },
            green: {
                label: "GREEN WORLD",
                worldName: "緑の世界",
                characters: [
                    "夏目　桜"
                ]
            },
            water: {
                label: "WATER WORLD",
                worldName: "水の世界",
                characters: [
                    "柊　愛奈"
                ]
            },
            blue: {
                label: "BLUE WORLD",
                worldName: "青の世界",
                characters: [
                    "暁山　麻結"
                ]
            },
            purple: {
                label: "PURPLE WORLD",
                worldName: "紫の世界",
                characters: [
                    "有田　柚希"
                ]
            },
            pink: {
                label: "PINK WORLD",
                worldName: "ピンクの世界",
                characters: [
                    "井狩　百合"
                ]
            },
            clear: {
                label: "CLEAR WORLD",
                worldName: "透明の世界",
                characters: [
                    "ノワール"
                ]
            }
        };

    const worldData =
        data[worldKey] ||
        data.red;

    worldTitle.textContent =
        worldData.label;

    lead.textContent =
        worldData.worldName +
        "に属するキャラクター";

    intro.textContent =
        worldData.worldName +
        "に登場するキャラクター一覧です。";

    list.innerHTML = "";

    worldData.characters.forEach(
        (
            name,
            index
        ) =>
        {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "character-card";

            const chip =
                document.createElement(
                    "span"
                );

            chip.className =
                "character-chip";

            chip.textContent =
                worldData.worldName;

            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                name;

            const text =
                document.createElement(
                    "p"
                );

            text.textContent =
                worldData.worldName +
                "に属するキャラクター。" +
                "世界の色彩と物語を象徴する存在として描かれます。";

            card.appendChild(chip);
            card.appendChild(title);
            card.appendChild(text);

            list.appendChild(card);
        }
    );
}
