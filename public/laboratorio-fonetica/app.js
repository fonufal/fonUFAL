(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-navigation');
  if (menuButton && mobileNav) {
    const close = () => { menuButton.setAttribute('aria-expanded', 'false'); mobileNav.classList.remove('open'); };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('open', open);
    });
    mobileNav.addEventListener('click', e => { if(e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  }
  const osc = document.querySelector('.osc[data-wave]');
  if (osc) {
    let d = 'M0 45';
    for(let x = 0; x <= 280; x += 2) {
      const burst = Math.exp(-Math.pow((x - 140)/88, 2));
      const s = Math.sin(x*.47) * Math.cos(x*.13);
      const amplitude = (8+23*Math.abs(Math.sin(x*.031))) * burst;
      d += ` L${x} ${45 + s*amplitude}`;
    }
    osc.setAttribute('d', d);
  }
})();
