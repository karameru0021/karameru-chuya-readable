// KARAMERU - メニュー・写真スライダー・背景演出

// ==========================================
// KARAMERU - 重力操作オープニング
// ==========================================

// 動きを減らす設定を確認
const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

// オープニング画面
const intro = document.getElementById('intro');

// 粒子と破片の配置場所
const gravityParticles = document.getElementById('gravityParticles');
const gravityDebris = document.getElementById('gravityDebris');

// 演出終了用
let introTimer;

// オープニングを終了する
function finishGravityIntro() {
    if (!intro) return;

    intro.classList.add('hide');

    // アニメーション終了後に要素を取り除く
    window.setTimeout(() => {
        intro.remove();
    }, 900);
}

// 粒子・破片を作る
function createGravityEffects() {

    if (reduced) return;
    if (!gravityParticles || !gravityDebris) return;

    // 赤い粒子を生成
    for (let i = 0; i < 45; i++) {

        const particle = document.createElement('span');

        particle.className = 'gravity-particle';

        particle.style.setProperty(
            '--x',
            Math.random() * 100 + '%'
        );

        particle.style.setProperty(
            '--y',
            Math.random() * 100 + '%'
        );

        particle.style.setProperty(
            '--size',
            (2 + Math.random() * 5) + 'px'
        );

        particle.style.setProperty(
            '--delay',
            (Math.random() * 0.7) + 's'
        );

        gravityParticles.appendChild(particle);
    }

    // 浮遊する破片を生成
    for (let i = 0; i < 18; i++) {

        const debris = document.createElement('span');

        debris.className = 'gravity-debris-piece';

        debris.style.setProperty(
            '--x',
            Math.random() * 100 + '%'
        );

        debris.style.setProperty(
            '--y',
            Math.random() * 100 + '%'
        );

        debris.style.setProperty(
            '--size',
            (5 + Math.random() * 14) + 'px'
        );

        debris.style.setProperty(
            '--delay',
            (Math.random() * 0.6) + 's'
        );

        gravityDebris.appendChild(debris);
    }
}

// オープニング開始
function startGravityIntro() {

    if (!intro) return;

    // アクセシビリティ設定を優先
    if (reduced) {
        finishGravityIntro();
        return;
    }

    createGravityEffects();

    // 3.6秒の演出後にサイトを表示
    introTimer = window.setTimeout(() => {
        finishGravityIntro();
    }, 3600);
}

// ページを開いたら開始
if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        startGravityIntro,
        { once: true }
    );

} else {

    startGravityIntro();

}

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=> {
    if(entry.isIntersecting) {
        entry.target.classList.add('visible');revealObserver.unobserve(entry.target)
    }
}
), {
    threshold:.08
}
);
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const progress=document.getElementById('progress');
let ticking=false;
addEventListener('scroll',()=> {
    if(ticking)return;ticking=true;requestAnimationFrame(()=> {
        const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';if(!reduced)document.documentElement.style.setProperty('--parallax',Math.min(scrollY*.12,110)+'px');ticking=false
    }
    )
}
, {
    passive:true
}
);
const menu=document.getElementById('menu'),menuBtn=document.getElementById('menuBtn');
function toggleMenu(open) {
    menu.classList.toggle('open',open);
    menu.setAttribute('aria-hidden',String(!open));
    menuBtn.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('lock',open);
    if(open)document.getElementById('closeMenu').focus();
    else menuBtn.focus()
}
menuBtn.setAttribute('aria-expanded','false');
menuBtn.onclick=()=>toggleMenu(true);
document.getElementById('closeMenu').onclick=()=>toggleMenu(false);
const veil=document.getElementById('veil');
let navigating=false;
function navigateTo(hash) {
    if(navigating)return;
    navigating=true;
    toggleMenu(false);
    veil.classList.add('active');
    setTimeout(()=> {
        document.querySelector(hash)?.scrollIntoView( {
            behavior:'instant'
        }
        );history.replaceState(null,'',hash);veil.classList.remove('active');setTimeout(()=>navigating=false,reduced?0:700)
    }
    ,reduced?0:650)
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=> {
    const hash=link.getAttribute('href');if(!document.querySelector(hash))return;event.preventDefault();navigateTo(hash)
}
));
const slider=document.getElementById('archiveSlider');
const filters=[...document.querySelectorAll('.filter')];
const visibleSlides=()=>[...slider.querySelectorAll('.slide:not([hidden])')];
function updateCount() {
    const slides=visibleSlides();
    if(!slides.length)return;
    const center=slider.scrollLeft+slider.clientWidth/2;
    let idx=0,best=Infinity;
    slides.forEach((el,i)=> {
        const distance=Math.abs(el.offsetLeft+el.offsetWidth/2-slider.offsetLeft-center);if(distance<best) {
            best=distance;idx=i
        }
    }
    );
    document.getElementById('slideCount').textContent=String(idx+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0')
}
filters.forEach(btn=>btn.addEventListener('click',()=> {
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));slider.querySelectorAll('.slide').forEach(slide=>slide.hidden=btn.dataset.filter!=='all'&&slide.dataset.character!==btn.dataset.filter);slider.scrollTo( {
        left:0,behavior:'instant'
    }
    );updateCount()
}
));
function moveSlide(dir) {
    const slides=visibleSlides();
    const center=slider.scrollLeft+slider.clientWidth/2;
    let idx=0,best=Infinity;
    slides.forEach((el,i)=> {
        const distance=Math.abs(el.offsetLeft+el.offsetWidth/2-slider.offsetLeft-center);if(distance<best) {
            best=distance;idx=i
        }
    }
    );
    slides[Math.max(0,Math.min(slides.length-1,idx+dir))]?.scrollIntoView( {
        behavior:reduced?'instant':'smooth',block:'nearest',inline:'center'
    }
    )
}
document.getElementById('prevSlide').onclick=()=>moveSlide(-1);
document.getElementById('nextSlide').onclick=()=>moveSlide(1);
slider.addEventListener('scroll',updateCount, {
    passive:true
}
);
addEventListener('resize',updateCount);
setTimeout(updateCount,300);
const lightbox=document.getElementById('lightbox'),lightboxImg=document.getElementById('lightboxImg');
let lastFocus=null;

slider.addEventListener('click', (event) => {

    // タップされた写真を取得
    const photo = event.target.closest('[data-photo]');

    // 写真以外を押した場合は何もしない
    if (!photo || !slider.contains(photo)) {
        return;
    }

    // 元の写真を記憶
    lastFocus = photo;

    // 拡大する写真を設定
    lightboxImg.src = photo.dataset.photo;

    // 写真の説明を設定
    lightboxImg.alt =
        photo.dataset.caption || 'コスプレ写真';

    document.getElementById('lightboxCaption').textContent =
        photo.dataset.caption || '';

    // 拡大画面を表示
    lightbox.classList.add('open');

    // 背景のスクロールを停止
    document.body.classList.add('lock');

    // 閉じるボタンにフォーカス
    document.getElementById('closeLightbox').focus();

});

function closeLightbox() {
    if(!lightbox.classList.contains('open'))return;
    lightbox.classList.remove('open');
    document.body.classList.remove('lock');
    lightboxImg.removeAttribute('src');
    lastFocus?.focus()
}
document.getElementById('closeLightbox').onclick=closeLightbox;
lightbox.addEventListener('click',e=> {
    if(e.target===lightbox)closeLightbox()
}
);
addEventListener('keydown',e=> {
    if(e.key==='Escape') {
        if(lightbox.classList.contains('open'))closeLightbox();else if(menu.classList.contains('open'))toggleMenu(false)
    }
    if(e.key==='Tab'&&lightbox.classList.contains('open')) {
        e.preventDefault();document.getElementById('closeLightbox').focus()
    }
}
);
if(!reduced) {
    const ambient=document.getElementById('ambient');
    for(let i=0;i<27;i++) {
        const el=document.createElement('i');
        el.className=i%3===0?'petal':'spark';
        el.style.setProperty('--x',Math.random()*100+'%');
        el.style.setProperty('--duration',12+Math.random()*16+'s');
        el.style.setProperty('--delay',-Math.random()*25+'s');
        el.style.setProperty('--drift',(Math.random()*180-90)+'px');
        ambient.appendChild(el)
    }
    const holder=document.getElementById('particles');
    for(let i=0;i<18;i++) {
        const p=document.createElement('i');
        p.className='particle';
        p.style.left=Math.random()*100+'%';
        p.style.top=15+Math.random()*80+'%';
        p.style.animationDelay=-Math.random()*9+'s';
        holder.appendChild(p)
    }
}


// ==========================================
// KARAMERU / CINEMA MODE
// ==========================================

(() => {

    // 5秒ごとに写真を切り替える
    const CINEMA_INTERVAL = 5000;

    // 各要素を取得
    const cinema = document.getElementById("cinemaMode");
    const openButton = document.getElementById("cinemaOpen");
    const closeButton = document.getElementById("cinemaClose");

    const photo = document.getElementById("cinemaPhoto");
    const counter = document.getElementById("cinemaCounter");
    const title = document.getElementById("cinemaTitle");

    const prevButton = document.getElementById("cinemaPrev");
    const playButton = document.getElementById("cinemaPlay");
    const nextButton = document.getElementById("cinemaNext");
    const progressBar = document.getElementById("cinemaProgressBar");

    // HTMLが揃っていない場合は実行しない
    if (
        !cinema || !openButton || !closeButton ||
        !photo || !counter || !title ||
        !prevButton || !playButton || !nextButton ||
        !progressBar
    ) {
        return;
    }

    // ギャラリーから写真を取得
    function getCinemaPhotos() {

        const slides = document.querySelectorAll(
            ".slide img"
        );

        return Array.from(slides)
            .filter(img => img.getAttribute("src"))
            .map(img => {

                const slide = img.closest(".slide");

                return {
                    src: slide?.dataset.photo ||
                         img.getAttribute("src"),

                    title:
                        slide?.dataset.caption ||
                        img.alt ||
                        "COSPLAY"
                };
            });
    }

    let photos = [];
    let currentIndex = 0;

    let timer = null;
    let transitionTimer = null;
    let isPlaying = true;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // 進行バーを最初に戻す
    function resetProgress() {

        progressBar.style.transition = "none";
        progressBar.style.width = "0%";

        if (!isPlaying || reducedMotion) return;

        // 次の描画タイミングで進行開始
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressBar.style.transition =
                    `width ${CINEMA_INTERVAL}ms linear`;

                progressBar.style.width = "100%";
            });
        });
    }

    // 写真を表示
    function showCinemaPhoto(index) {

        if (photos.length === 0) return;

        currentIndex =
            (index + photos.length) % photos.length;

        const next = photos[currentIndex];

        // 前の切り替え処理をキャンセル
        clearTimeout(transitionTimer);

        photo.classList.add("is-changing");

        transitionTimer = setTimeout(() => {

            photo.src = next.src;
            photo.alt = next.title;

            counter.textContent =
                `${String(currentIndex + 1).padStart(2, "0")} / ` +
                `${String(photos.length).padStart(2, "0")}`;

            title.textContent = next.title;

            // ズーム演出を再スタート
            photo.style.animation = "none";
            void photo.offsetWidth;
            photo.style.animation = "";

            photo.classList.remove("is-changing");

        }, reducedMotion ? 0 : 350);

        resetProgress();
    }

    // 自動再生を止める
    function stopAutoPlay() {

        clearInterval(timer);
        timer = null;

        progressBar.style.transition = "none";
    }

    // 自動再生を開始
    function startAutoPlay() {

        stopAutoPlay();

        if (!isPlaying || photos.length < 2) return;

        resetProgress();

        timer = setInterval(() => {
            showCinemaPhoto(currentIndex + 1);
        }, CINEMA_INTERVAL);
    }

    // 再生ボタンの表示更新
    function updatePlayButton() {

        playButton.textContent = isPlaying ? "❚❚" : "▶";

        playButton.setAttribute(
            "aria-label",
            isPlaying ? "一時停止" : "再生"
        );
    }

    // 映画館モードを開く
    function openCinema() {

        photos = getCinemaPhotos();

        if (photos.length === 0) {
            alert("ギャラリーに写真がありません。");
            return;
        }

        currentIndex = 0;
        isPlaying = true;

        cinema.hidden = false;
        cinema.setAttribute("aria-hidden", "false");

        document.body.classList.add("cinema-active");

        showCinemaPhoto(currentIndex);
        updatePlayButton();
        startAutoPlay();

        closeButton.focus();
    }

    // 映画館モードを閉じる
    function closeCinema() {

        stopAutoPlay();
        clearTimeout(transitionTimer);

        cinema.hidden = true;
        cinema.setAttribute("aria-hidden", "true");

        document.body.classList.remove("cinema-active");

        openButton.focus();
    }

    // 前の写真
    prevButton.addEventListener("click", () => {

        showCinemaPhoto(currentIndex - 1);
        startAutoPlay();

    });

    // 次の写真
    nextButton.addEventListener("click", () => {

        showCinemaPhoto(currentIndex + 1);
        startAutoPlay();

    });

    // 再生・一時停止
    playButton.addEventListener("click", () => {

        isPlaying = !isPlaying;

        updatePlayButton();

        if (isPlaying) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }

    });

    // 開く・閉じる
    openButton.addEventListener("click", openCinema);
    closeButton.addEventListener("click", closeCinema);

    // ESCキーで閉じる
    document.addEventListener("keydown", event => {

        if (cinema.hidden) return;

        if (event.key === "Escape") {
            closeCinema();
        }

        if (event.key === "ArrowRight") {
            nextButton.click();
        }

        if (event.key === "ArrowLeft") {
            prevButton.click();
        }

    });

})();

// ==========================================
// MINI GALLERY
// 自動スクロール＋スワイプ＋写真拡大
// ==========================================

(() => {

    const gallery = document.querySelector(".mini-gallery");
    const track = document.getElementById("miniGalleryTrack");

    if (!gallery || !track) return;

    // 上のギャラリーに登録された写真
    const slides = Array.from(
        document.querySelectorAll(".slide")
    ).filter(slide => slide.querySelector("img"));

    if (slides.length === 0) return;

    // 写真を3セット並べて無限ループさせる
    for (let repeat = 0; repeat < 3; repeat++) {

        slides.forEach(slide => {

            const img = slide.querySelector("img");

            const button = document.createElement("button");
            button.type = "button";
            button.className = "mini-gallery-item";
            button.setAttribute(
                "aria-label",
                `${img.alt || "コスプレ写真"}を拡大`
            );

            const miniImg = document.createElement("img");
            miniImg.src = img.getAttribute("src");
            miniImg.alt = "";
            miniImg.className = "mini-gallery-photo";
            miniImg.loading = "lazy";
            miniImg.draggable = false;

            button.appendChild(miniImg);

            // タップで既存の拡大画面を開く
            button.addEventListener("click", () => {
                if (suppressClick) return;
                slide.click();
            });

            track.appendChild(button);
        });
    }

    // 動きを減らす設定
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1セット分の横幅
    let setWidth = 0;

    // 現在の移動位置
    let position = 0;

    // 自動で流れる速さ（px/秒）
    const AUTO_SPEED = reducedMotion ? 0 : 28;

    // スワイプの状態
    let dragging = false;
    let startX = 0;
    let startPosition = 0;
    let moved = false;
    let suppressClick = false;

    // サイズを計算
    function measure() {
        setWidth = track.scrollWidth / 3;

        if (setWidth > 0) {
            position = -setWidth;
        }
    }

    // 位置をループ範囲内に収める
    function wrapPosition() {
        if (setWidth <= 0) return;

        while (position <= -2 * setWidth) {
            position += setWidth;
        }

        while (position > -setWidth) {
            position -= setWidth;
        }
    }

    // 画面上の位置を更新
    function render() {
        track.style.transform =
            `translate3d(${position}px, 0, 0)`;
    }

    // 最初のサイズ計算
    measure();
    render();

    // 画面サイズが変わったとき
    window.addEventListener("resize", () => {
        measure();
        render();
    });

    // 自動スクロール
    let lastTime = 0;

    function animate(time) {

        if (!lastTime) lastTime = time;

        const delta = Math.min(
            (time - lastTime) / 1000,
            0.05
        );

        lastTime = time;

        // 触っている間は自動移動を止めず、
        // 指の動きを優先する
        if (!dragging) {
            position -= AUTO_SPEED * delta;
        }

        wrapPosition();
        render();

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // スワイプ開始
    gallery.addEventListener("pointerdown", event => {

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        dragging = true;
        moved = false;
        suppressClick = false;

        startX = event.clientX;
        startPosition = position;

        gallery.classList.add("is-dragging");
    });

    // スワイプ中
    gallery.addEventListener("pointermove", event => {

        if (!dragging) return;

        const distance = event.clientX - startX;

        if (Math.abs(distance) > 8) {
            moved = true;
        }

        position = startPosition + distance;

        wrapPosition();
        render();
    });

    // スワイプ終了
    function endDrag() {

        if (!dragging) return;

        dragging = false;
        gallery.classList.remove("is-dragging");

        if (moved) {
            suppressClick = true;

            // スワイプ直後の誤タップを防ぐ
            setTimeout(() => {
                suppressClick = false;
            }, 150);
        }
    }

    gallery.addEventListener("pointerup", endDrag);
    gallery.addEventListener("pointercancel", endDrag);

    // ギャラリーの外で指を離した場合
    window.addEventListener("pointerup", endDrag);

})();
