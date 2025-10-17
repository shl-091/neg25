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

  // 语言菜单
  const langToggle = $("#lang-toggle");
  const langMenu = $("#lang-menu");
  if(langToggle){
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = langMenu.classList.toggle('show');
      langToggle.setAttribute('aria-expanded', String(open));
    });
  }
  if(langMenu){
    langMenu.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-lang]');
      if(!li) return;
      I18N.setLang(li.dataset.lang);
      langMenu.classList.remove('show');
      langToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // 首屏进入 Step1
  if(screens.landing){
    screens.landing.addEventListener('click', () => show('step1'));
    screens.landing.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') show('step1');
    });
  }

  // 选择状态（多选）
  const state = {
    selections: { personality:[], style:[], category:[] }
  };

  // 切屏：激活后再构建词云（避免 display:none 尺寸为 0）
  function show(name){
    Object.values(screens).forEach(sc => sc.classList.remove('active'));
    screens[name].classList.add('active');
    requestAnimationFrame(()=>{
      if(name === 'step1') makeRippleCloud(document.getElementById('cloud1'), I18N.tags('personality'), 'personality');
      if(name === 'step2') makeRippleCloud(document.getElementById('cloud2'), I18N.tags('style'), 'style');
      if(name === 'step3') makeRippleCloud(document.getElementById('cloud3'), I18N.tags('category'), 'category');
    });
  }

  // 语言改变时，重建当前页词云
  document.addEventListener('langchange', () => buildActive());

  // 生成“涟漪圈扩”的词云（多选 & 黄金角分布）
function makeRippleCloud(container, items, key){
    container.innerHTML = "";
    const rect = container.getBoundingClientRect();

    // === 新增：为头/脚留出安全边距，避免落在遮挡区域 ===
    const TOP_GUARD = 120;     // 视你的标题高度，96~140都可以，先试120
    const BOTTOM_GUARD = 120;  // 视你的底部按钮区高度，100~140
    const usableWidth  = rect.width;
    const usableHeight = Math.max(0, rect.height - TOP_GUARD - BOTTOM_GUARD);

    const cx = usableWidth / 2;
    const cy = TOP_GUARD + usableHeight / 2;

    // 半径用“可用高度/宽度”的较小值来计算
    const maxR = Math.min(usableWidth, usableHeight) * 0.48;
    const minR = Math.min(usableWidth, usableHeight) * 0.18;
    // === 原来用 rect.width/height 的地方，全部替换成上面的 usableWidth/usableHeight/cx/cy ===

    const ringCount = Math.max(1, Math.round((maxR - minR) / 90) + 1);
    const ringDelay = 120;
    const moveDuration = 800;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    // 每圈半径 + 按半径权重分配数量（近似按周长）
    const ringRadii = Array.from({length: ringCount}, (_, i) => minR + i * ((maxR - minR) / Math.max(1, ringCount-1)));
    const ringWeights = ringRadii.map(r => Math.max(1, r));
    const totalWeight = ringWeights.reduce((a,b)=>a+b,0);

    let remaining = items.length;
    const ringCounts = ringWeights.map(w => {
      const c = Math.round(items.length * (w / totalWeight));
      remaining -= c;
      return Math.max(0, c);
    });
    // 修正四舍五入误差
    let idxFix = 0;
    while(remaining !== 0){
      const k = idxFix % ringCounts.length;
      ringCounts[k] += (remaining > 0 ? 1 : -1);
      remaining += (remaining > 0 ? -1 : 1);
      idxFix++;
    }

    // 分配 items 到各圈
    const perRingItems = [];
    let cursor = 0;
    for(let ri=0; ri<ringCount; ri++){
      perRingItems[ri] = items.slice(cursor, cursor + ringCounts[ri]);
      cursor += ringCounts[ri];
    }
    if(cursor < items.length){
      const rest = items.slice(cursor);
      perRingItems[ringCount-1] = (perRingItems[ringCount-1]||[]).concat(rest);
    }

    // 构建元素：中心生成 → 动画扩散到目标位
    const meta = [];
    perRingItems.forEach((list, ri)=>{
      const r = ringRadii[ri];
      const baseRot = Math.random() * Math.PI*2; // 每圈随机相位，避免几何图形感
      list.forEach((text, j) => {
        const el = document.createElement('button');
        el.className = 'tag';
        el.type = 'button';
        el.setAttribute('aria-pressed','false');
        const globalIndex = meta.length;
        const size = globalIndex % 7 === 0 ? "l" : (globalIndex % 3 === 0 ? "m" : "s");
        el.dataset.size = size;
        el.innerHTML = `<span>${text}</span><span class="dot" aria-hidden="true"></span>`;
        container.appendChild(el);

        // 初始：中心
        el.style.left = (cx - el.offsetWidth/2) + "px";
        el.style.top  = (cy - el.offsetHeight/2) + "px";

        // 目标角度：黄金角序列 + 轻微角/径向抖动
        const theta = baseRot + (j * GOLDEN_ANGLE) % (Math.PI*2);
        const rJitter = r + (Math.random()*18 - 9);
        const tJitter = theta + (Math.random()*0.18 - 0.09);

        const tx = cx + rJitter * Math.cos(tJitter);
        const ty = cy + rJitter * Math.sin(tJitter);
        const delay = ri * ringDelay + Math.round(Math.random()*40);

        meta.push({ el, key, text, tx, ty, delay, start:null });
      });
    });

    // 多选 toggle
    container.onclick = (e) => {
      const tag = e.target.closest('.tag');
      if(!tag || !container.contains(tag)) return;
      const label = tag.querySelector('span')?.textContent.trim() || tag.textContent.trim();
      const arr = state.selections[key];
      const idx = arr.indexOf(label);
      if(idx >= 0){
        arr.splice(idx,1);
        tag.classList.remove('selected');
        tag.setAttribute('aria-pressed','false');
      }else{
        arr.push(label);
        tag.classList.add('selected');
        tag.setAttribute('aria-pressed','true');
      }
    };


    // 语言切换后保留仍存在的选项（不存在的清理）
    state.selections[key] = state.selections[key].filter(v => items.includes(v));
    // 标记已选
    $$(`.tag`, container).forEach(t=>{
      const label = t.querySelector('span')?.textContent.trim() || t.textContent.trim();
      if(state.selections[key].includes(label)){
        t.classList.add('selected'); t.setAttribute('aria-pressed','true');
      }
    });

    // 动画
    function animate(now){
      let running = false;
      meta.forEach(m => {
        const startTime = (m.start ?? (m.start = now + m.delay));
        const t = (now - startTime) / moveDuration;
        if (t < 1){
          if (t >= 0){
            const p = ease(t);
            const x = cx + (m.tx - cx) * p;
            const y = cy + (m.ty - cy) * p;
            m.el.style.left = (x - m.el.offsetWidth/2) + "px";
            m.el.style.top  = (y - m.el.offsetHeight/2) + "px";
            const s = 0.96 + 0.08 * p;
            m.el.style.transform = `translateZ(0) scale(${s})`
          }
          running = true;
        }else{
          m.el.style.left = (m.tx - m.el.offsetWidth/2) + "px";
          m.el.style.top  = (m.ty - m.el.offsetHeight/2) + "px";
          m.el.style.transform = 'translateZ(0)';
        }
      });
      if(running) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // 仅重建当前可见屏的词云
  function buildActive(){
    if(screens.step1.classList.contains('active')) makeRippleCloud(document.getElementById('cloud1'), I18N.tags('personality'), 'personality');
    if(screens.step2.classList.contains('active')) makeRippleCloud(document.getElementById('cloud2'), I18N.tags('style'), 'style');
    if(screens.step3.classList.contains('active')) makeRippleCloud(document.getElementById('cloud3'), I18N.tags('category'), 'category');
  }
  const ro = new ResizeObserver(buildActive);
  ro.observe(document.body);

  // 导航按钮
  $$(".skip").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.skip;
    if(step === "1") show('step2');
    else if(step === "2") show('step3');
    else if(step === "3") { gatherAndShowResult(); }
  }));
  $$(".next").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.next;
    if(step === "1") show('step2');
    else if(step === "2") show('step3');
    else if(step === "3") { gatherAndShowResult(); }
  }));
  $$(".back").forEach(btn => btn.addEventListener('click', (e)=>{
    const step = e.currentTarget.dataset.back;
    if(step === "2") show('step1');
    else if(step === "3") show('step2');
  }));

  // 重新开始
  document.getElementById("restart")?.addEventListener('click', ()=>{
    state.selections = { personality:[], style:[], category:[] };
    $$(".tag.selected").forEach(t=>t.classList.remove('selected'));
    show('step1');
  });

  // 选中标签 → 旋转汇聚到中心 → 展示推荐
  function gatherAndShowResult(){
    const centerX = window.innerWidth/2;
    const centerY = window.innerHeight/2;
    const liveTags = $$(".tag.selected");
    if(liveTags.length === 0){
      renderResult(); show('result'); return;
    }
    const ghosts = liveTags.map((t, i) => {
      const r = t.getBoundingClientRect();
      const g = t.cloneNode(true);
      g.classList.add('ghost-tag');
      g.style.width = r.width + "px";
      g.style.height = r.height + "px";
      g.style.left = r.left + "px";
      g.style.top = r.top + "px";
      g.style.opacity = "1";
      document.body.appendChild(g);
      const tagCenterX = r.left + r.width/2;
      const tagCenterY = r.top + r.height/2;
      const dx = centerX - tagCenterX;
      const dy = centerY - tagCenterY;
      const rot = (Math.random()*40 - 20);
      const scale = 0.5 + Math.random()*0.2;
      const delay = i * 60; // 逐个错峰
      setTimeout(()=>{
        g.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`;
        g.style.opacity = "0.0";
      }, delay);
      return g;
    });
    const totalDelay = (ghosts.length-1)*60 + 800;
    setTimeout(()=>{
      ghosts.forEach(g => g.remove());
      renderResult();
      show('result');
    }, Math.max(800, totalDelay));
  }

  // 简单推荐映射（支持多语言标签 → 产品）
  const productMap = {
    "Necklace": { img: "assets/products/necklace1.svg", title: "Morandi Necklace" },
    "Ring": { img: "assets/products/ring1.svg", title: "Calm Blue Ring" },
    "Earrings": { img: "assets/products/earrings1.svg", title: "Muted Drop Earrings" },
    "Bracelet": { img: "assets/products/necklace1.svg", title: "Soft Sand Bracelet" },
    "Brooch": { img: "assets/products/earrings1.svg", title: "Vintage Rose Brooch" },
    "Anklet": { img: "assets/products/ring1.svg", title: "Coastal Anklet" },
    "Hairpin": { img: "assets/products/earrings1.svg", title: "Skyline Hairpin" },
    // 中文
    "项链": { img: "assets/products/necklace1.svg", title: "Morandi Necklace" },
    "戒指": { img: "assets/products/ring1.svg", title: "Calm Blue Ring" },
    "耳环": { img: "assets/products/earrings1.svg", title: "Muted Drop Earrings" },
    "手链": { img: "assets/products/necklace1.svg", title: "Soft Sand Bracelet" },
    "胸针": { img: "assets/products/earrings1.svg", title: "Vintage Rose Brooch" },
    "脚链": { img: "assets/products/ring1.svg", title: "Coastal Anklet" },
    "发夹": { img: "assets/products/earrings1.svg", title: "Skyline Hairpin" },
    // 法文
    "Collier": { img: "assets/products/necklace1.svg", title: "Collier Morandi" },
    "Bague": { img: "assets/products/ring1.svg", title: "Bague Bleu Calme" },
    "Boucles d’oreilles": { img: "assets/products/earrings1.svg", title: "Boucles Tombe Muted" },
    "Bracelet": { img: "assets/products/necklace1.svg", title: "Bracelet Sable Doux" },
    "Broche": { img: "assets/products/earrings1.svg", title: "Broche Vintage Rose" },
    "Chevillière": { img: "assets/products/ring1.svg", title: "Chevillière Côtière" },
    "Pince à cheveux": { img: "assets/products/earrings1.svg", title: "Pince Skyline" }
  };

  function renderResult(){
    // 简单策略：优先使用最后一个选中的“类别”作为推荐类别
    const catArr = state.selections.category;
    const chosenCat = catArr.length ? catArr[catArr.length-1] : "Necklace";
    const meta = productMap[chosenCat] || productMap["Necklace"];
    document.getElementById("result-img").src = meta.img;
    document.getElementById("result-title").textContent = meta.title;
    document.getElementById("result-desc").textContent = I18N.t("productDesc");
    document.getElementById("shopify-link").href = "#";
  }

  // 初始语言
  I18N.setLang('en');

  // 点击页面其他位置收起语言菜单
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.lang-switch')){
      langMenu?.classList.remove('show');
      langToggle?.setAttribute('aria-expanded','false');
    }
  });
})();
