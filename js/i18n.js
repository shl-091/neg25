
window.I18N = (function(){
  const dict = {
    en: {
      tapAnywhere: "Tap / Click anywhere to start",
      pickPersonality: "Pick your vibe",
      pickStyle: "Pick your style",
      pickCategory: "Pick accessory type",
      skip: "Skip",
      next: "Next",
      previous: "Previous",
      seeResult: "See Recommendation",
      buyShopify: "Buy on Shopify",
      restart: "Restart",
      productTitle: "Curated for you",
      productDesc: "A calm-toned piece that matches your selected vibe."
    },
    fr: {
      tapAnywhere: "Touchez / Cliquez n'importe où pour commencer",
      pickPersonality: "Choisissez votre ambiance",
      pickStyle: "Choisissez votre style",
      pickCategory: "Choisissez le type d'accessoire",
      skip: "Ignorer",
      next: "Suivant",
      previous: "Précédent",
      seeResult: "Voir la recommandation",
      buyShopify: "Acheter sur Shopify",
      restart: "Recommencer",
      productTitle: "Sélectionné pour vous",
      productDesc: "Une pièce aux tons calmes qui correspond à votre ambiance."
    },
    zh: {
      tapAnywhere: "点击任意位置开始",
      pickPersonality: "选择你的个性",
      pickStyle: "选择你的穿衣风格",
      pickCategory: "选择饰品类别",
      skip: "跳过",
      next: "下一步",
      previous: "上一页",
      seeResult: "查看推荐",
      buyShopify: "去 Shopify 购买",
      restart: "重新开始",
      productTitle: "为你精选",
      productDesc: "一款莫兰迪色调的单品，与您的风格相配。"
    }
  };

  let current = 'en';
  const setLang = (lang) => {
    current = dict[lang] ? lang : 'en';
    document.documentElement.lang = current === 'zh' ? 'zh-Hans' : current;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const t = dict[current][k] || dict['en'][k] || k;
      el.textContent = t;
    });
    const btn = document.getElementById("lang-toggle");
    if(btn) btn.textContent = current.toUpperCase();
  };

  const t = (key) => dict[current][key] || dict['en'][key] || key;

  return { setLang, t, get current(){ return current; }, dict };
})();
