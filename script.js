// KARAMERU - メニュー・写真スライダー・背景演出
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro=document.getElementById('intro');
window.addEventListener('load',()=>setTimeout(()=>intro.classList.add('hide'),reduced?0:1100));
setTimeout(()=>intro.classList.add('hide'),2800);
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