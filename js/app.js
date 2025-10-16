
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const screens = {
    landing: $("#screen-landing"),
    step1: $("#screen-step1"),
    step2: $("#screen-step2"),
    step3: $("#screen-step3"),
    result: $("#screen-result")
  };

  const langToggle = $("#lang-toggle");
  const langMenu = $("#lang-menu");
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langMenu.classList.toggle('show');
    langToggle.setAttribute('aria-expanded', String(open));
  });
  langMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-lang]');
    if(!li) return;
    I18N.setLang(li.dataset.lang);
    langMenu.classList.remove('show');
    langToggle.setAttribute('aria-expanded', 'false');
  });

  screens.landing.addEventListener('click', () => show('step1'));
  screens.landing.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' ') show('step1');
  });

  const personalityTags = [
    "Minimal", "Bold", "Elegant", "Casual", "Artistic", "Vintage", "Modern", "Playful", "Romantic", "Edgy", "Zen", "Classic"
  ];
  const styleTags = [
    "Streetwear", "Business", "Athleisure", "Boho", "Chic", "Preppy", "Grunge", "Y2K", "Avant-garde", "Smart Casual"
  ];
  const categoryTags = [
    "Necklace", "Ring", "Earrings", "Bracelet", "Brooch", "Anklet", "Hairpin"
  ];

  const state = {
    selections: { personality:null, style:null, category:null }
  };

  function show(name){
    Object.values(screens).forEach(sc => sc.classList.remove('active'));
    screens[name].classList.add('active');
    // Build the cloud for the screen we just showed (wait a frame for layout)
    requestAnimationFrame(()=>{
      if(name === 'step1') makeRippleCloud(document.getElementById('cloud1'), personalityTags, 'personality');
      if(name === 'step2') makeRippleCloud(document.getElementById('cloud2'), styleTags, 'style');
      if(name === 'step3') makeRippleCloud(document.getElementById('cloud3'), categoryTags, 'category');
    });
  }

  // ---------------- Ripple Rings Cloud ----------------
  // Tags spawn at center, rings expand outward with stagger per ring, then settle (no visible circle)
  function makeRippleCloud(container, items, key){
    container.innerHTML = "";
    const rect = container.getBoundingClientRect();
    const cx = rect.width/2;
    const cy = rect.height/2 + 10; // slight down shift

    // parameters
    const maxR = Math.min(rect.width, rect.height) * 0.38;
    const minR = Math.min(rect.width, rect.height) * 0.14;
    const ringGap = 100; // px gap between rings (approx; will be clamped by maxR)
    const rings = Math.max(1, Math.floor((maxR - minR) / ringGap) + 1);
    const ringDelay = 120; // ms delay between rings
    const moveDuration = 800; // ms animation per tag
    const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out

    // distribute items across rings: try to keep per-ring density balanced
    const perRing = Array.from({length:rings}, ()=>[]);
    items.forEach((txt, i)=> perRing[i % rings].push(txt));

    // build tags at center first
    const meta = [];
    perRing.forEach((list, ri)=>{
      const r = minR + ri * ((maxR - minR) / Math.max(1, rings-1));
      const count = Math.max(1, list.length);
      list.forEach((text, idxInRing) => {
        const el = document.createElement('button');
        el.className = 'tag';
        el.type = 'button';
        el.setAttribute('aria-pressed','false');
        const globalIndex = meta.length;
        const size = globalIndex % 7 === 0 ? "l" : (globalIndex % 3 === 0 ? "m" : "s");
        el.dataset.size = size;
        el.innerHTML = `<span>${text}</span><span class="dot" aria-hidden="true"></span>`;
        container.appendChild(el);

        // start position (center)
        el.style.left = (cx - el.offsetWidth/2) + "px";
        el.style.top  = (cy - el.offsetHeight/2) + "px";

        // compute a target angle with minimum spacing, add small jitter
        const baseAngle = (idxInRing / count) * Math.PI*2;
        const jitter = (Math.random()*0.28 - 0.14); // +- ~8 deg
        const theta = baseAngle + jitter;

        // small radial jitter to avoid perfect ring
        const rJitter = r + (Math.random()*16 - 8);

        const tx = cx + rJitter * Math.cos(theta);
        const ty = cy + rJitter * Math.sin(theta);

        // schedule animation with ring-based delay (ripple)
        const delay = ri * ringDelay;

        meta.push({ el, key, text, tx, ty, delay, start:null });
      });
    });

    function animate(now){
      let running = false;
      meta.forEach(m => {
        const startTime = (m.start ?? (m.start = now + m.delay));
        const t = (now - startTime) / moveDuration;
        if (t < 1){
          if (t >= 0){
            const p = ease(t);
            // interpolate from center to target
            const x = cx + (m.tx - cx) * p;
            const y = cy + (m.ty - cy) * p;
            m.el.style.left = (x - m.el.offsetWidth/2) + "px";
            m.el.style.top  = (y - m.el.offsetHeight/2) + "px";
            // subtle scale pop near end
            const s = 0.96 + 0.08 * p;
            m.el.style.transform = `translateZ(0) scale(${s})`;
          }
          running = true;
        }else{
          // settle at target
          m.el.style.left = (m.tx - m.el.offsetWidth/2) + "px";
          m.el.style.top  = (m.ty - m.el.offsetHeight/2) + "px";
          m.el.style.transform = 'translateZ(0)';
        }
      });
      if(running) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // select behavior (single-choice per cloud)
    container.addEventListener('click', (e)=>{
      const tag = e.target.closest('.tag');
      if(!tag) return;
      $$('.tag', container).forEach(t=>{
        t.classList.remove('selected');
        t.setAttribute('aria-pressed','false');
      });
      tag.classList.add('selected');
      tag.setAttribute('aria-pressed','true');
      state.selections[key] = tag.textContent.trim();
    });
  }

  // Build clouds only for the active screen
  function buildActive(){
    if(screens.step1.classList.contains('active')) makeRippleCloud(document.getElementById('cloud1'), personalityTags, 'personality');
    if(screens.step2.classList.contains('active')) makeRippleCloud(document.getElementById('cloud2'), styleTags, 'style');
    if(screens.step3.classList.contains('active')) makeRippleCloud(document.getElementById('cloud3'), categoryTags, 'category');
  }
  const ro = new ResizeObserver(buildActive);
  ro.observe(document.body);

  // nav buttons
  $$(".skip").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.skip;
    if(step === "1") show('step2');
    else if(step === "2") show('step3');
    else if(step === "3") { renderResult(); show('result'); }
  }));
  $$(".next").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.next;
    if(step === "1") show('step2');
    else if(step === "2") show('step3');
    else if(step === "3") { renderResult(); show('result'); }
  }));
  $$(".back").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.back;
    if(step === "2") show('step1');
    else if(step === "3") show('step2');
  }));

  $("#restart").addEventListener('click', ()=>{
    state.selections = { personality:null, style:null, category:null };
    $$(".tag.selected").forEach(t=>t.classList.remove('selected'));
    show('step1');
  });

  const productMap = {
    "Necklace": { img: "assets/products/necklace1.svg", title: "Morandi Necklace" },
    "Ring": { img: "assets/products/ring1.svg", title: "Calm Blue Ring" },
    "Earrings": { img: "assets/products/earrings1.svg", title: "Muted Drop Earrings" },
    "Bracelet": { img: "assets/products/necklace1.svg", title: "Soft Sand Bracelet" },
    "Brooch": { img: "assets/products/earrings1.svg", title: "Vintage Rose Brooch" },
    "Anklet": { img: "assets/products/ring1.svg", title: "Coastal Anklet" },
    "Hairpin": { img: "assets/products/earrings1.svg", title: "Skyline Hairpin" },
  };

  function renderResult(){
    const category = state.selections.category || "Necklace";
    const meta = productMap[category] || productMap["Necklace"];
    $("#result-img").src = meta.img;
    $("#result-title").textContent = meta.title;
    $("#result-desc").textContent = I18N.t("productDesc");
    $("#shopify-link").href = "#";
  }

  I18N.setLang('en');

  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.lang-switch')){
      langMenu.classList.remove('show');
      langToggle.setAttribute('aria-expanded','false');
    }
  });
})();
