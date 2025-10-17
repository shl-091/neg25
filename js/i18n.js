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
      productDesc: "A calm-toned piece that matches your selected vibe.",
      tags: {
        personality: ["Minimal","Bold","Elegant","Casual","Artistic","Vintage","Modern","Playful","Romantic","Edgy","Zen","Classic"],
        style: ["Streetwear","Business","Athleisure","Boho","Chic","Preppy","Grunge","Y2K","Avant-garde","Smart Casual"],
        category: ["Necklace","Ring","Earrings","Bracelet","Brooch","Anklet","Hairpin"]
      }
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
      productDesc: "Une pièce aux tons calmes qui correspond à votre ambiance.",
      tags: {
        personality: ["Minimaliste","Audacieux","Élégant","Décontracté","Artistique","Vintage","Moderne","Ludique","Romantique","Énergique","Zen","Classique"],
        style: ["Streetwear","Business","Athleisure","Bohème","Chic","Preppy","Grunge","Y2K","Avant-garde","Smart Casual"],
        category: ["Collier","Bague","Boucles d’oreilles","Bracelet","Broche","Chevillière","Pince à cheveux"]
      }
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
      productDesc: "一款莫兰迪色调的单品，与您的风格相配。",
      tags: {
        personality: ["极简","大胆","优雅","休闲","艺术感","复古","现代","俏皮","浪漫","前卫","禅意","经典"],
        style: ["街头","通勤","运动休闲","波西米亚","简约","学院","颓废","Y2K","先锋","智慧休闲"],
        category: ["项链","戒指","耳环","手链","胸针","脚链","发夹"]
      }
    }
  };

  let current = 'en';
  const setLang = (lang) => {
    current = dict[lang] ? lang : 'en';
    document.documentElement.lang = current === 'zh' ? 'zh-Hans' : current;
    // 更新所有 data-i18n 文案
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const t = dict[current][k] || dict['en'][k] || k;
      el.textContent = t;
    });
    // 按钮文字
    const btn = document.getElementById("lang-toggle");
    if(btn) btn.textContent = current.toUpperCase();
    // 通知应用层：语言已切换（用于重建词云）
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: current }}));
  };

  const t = (key) => dict[current][key] || dict['en'][key] || key;
  const tags = (key) => (dict[current].tags && dict[current].tags[key]) ? dict[current].tags[key] : dict['en'].tags[key];

  return { setLang, t, tags, get current(){ return current; }, dict };
})();
