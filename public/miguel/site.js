
(() => {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
    }));
  }

  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let x = t;
      x = Math.imul(x ^ x >>> 15, x | 1);
      x ^= x + Math.imul(x ^ x >>> 7, x | 61);
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeField(el) {
    const seed = Number(el.dataset.seed || 1);
    const density = Number(el.dataset.density || 62);
    const hotEvery = Math.max(8, Number(el.dataset.hot || 17));
    const random = rng(seed * 7919 + 17);
    const w = 1000, h = 650;
    const anchors = [
      {x: 210 + random()*130, y: 140 + random()*120},
      {x: 490 + random()*150, y: 270 + random()*110},
      {x: 760 + random()*100, y: 420 + random()*100}
    ];
    const points = [];
    for (let i=0;i<density;i++) {
      const phase = i/(density-1);
      const anchor = anchors[Math.min(2, Math.floor(phase*3))];
      const drift = (random()-.5)*210;
      const x = 90 + phase*820 + drift*.32;
      const y = anchor.y + (phase-.5)*170 + (random()-.5)*260;
      points.push({x,y,r:1.3+random()*3.2});
    }

    let svg = '<svg viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    anchors.forEach((a,i) => {
      const y2 = 60 + i*180 + random()*80;
      svg += '<line class="f-stem" x1="'+a.x.toFixed(1)+'" y1="'+Math.max(30,a.y-200).toFixed(1)+'" x2="'+a.x.toFixed(1)+'" y2="'+Math.min(620,a.y+230).toFixed(1)+'"/>';
      svg += '<line class="f-line" x1="'+Math.max(20,a.x-115).toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+Math.min(980,a.x+150).toFixed(1)+'" y2="'+y2.toFixed(1)+'"/>';
    });

    points.forEach((p,i) => {
      const nearest = anchors.reduce((best,a) => {
        const d = (a.x-p.x)*(a.x-p.x)+(a.y-p.y)*(a.y-p.y);
        return d < best.d ? {a,d} : best;
      }, {a:anchors[0], d:Infinity}).a;
      if (i % 3 === 0) {
        svg += '<line class="f-line" x1="'+p.x.toFixed(1)+'" y1="'+p.y.toFixed(1)+'" x2="'+nearest.x.toFixed(1)+'" y2="'+nearest.y.toFixed(1)+'"/>';
      }
      const cls = i % hotEvery === 0 ? 'f-point f-hot' : (i % (hotEvery+5) === 0 ? 'f-point f-mint' : 'f-point');
      svg += '<circle class="'+cls+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+p.r.toFixed(1)+'"/>';
    });

    for (let i=0;i<9;i++) {
      const x = 115 + random()*760;
      const y = 70 + random()*500;
      const len = 45 + random()*130;
      svg += '<line class="f-stem" x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+Math.min(620,y+len).toFixed(1)+'"/>';
    }
    svg += '</svg>';
    el.innerHTML = svg;
  }

  document.querySelectorAll('.field[data-seed]').forEach(makeField);

  const filters = document.querySelectorAll('[data-pub-filter]');
  const rows = document.querySelectorAll('[data-pub-row]');
  if (filters.length && rows.length) {
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.pubFilter;
      rows.forEach(row => {
        row.hidden = key !== 'all' && row.dataset.type !== key;
      });
    }));
  }
})();
