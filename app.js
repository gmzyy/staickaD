/* ==========================================================================
   STAICKA — Interactive Logic v5 (Full Purchase & Activation Simulation)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ═══ 3D Isometric Scene ═══
  const scene = document.getElementById('isoScene');
  if (scene) {
    const cubes = [
      [0,    0,    0,  65, 0.1,  '#1B3A9C','#0A1E6E','#000D4A'],
      [70,   0,    0,  65, 0.2,  '#1B3A9C','#0A1E6E','#000D4A'],
      [45,  -70,   0,  65, 0.35, '#2548B0','#1230A0','#0A1E6E'],
      [115, -70,   0,  65, 0.45, '#2548B0','#1230A0','#0A1E6E'],
      [90,  -140,  0,  65, 0.6,  '#3B6FF0','#2548B0','#1B3A9C'],
      [160, -140,  0,  65, 0.7,  '#3B6FF0','#2548B0','#1B3A9C'],
      [135, -210,  0,  65, 0.85, '#5588FF','#3B6FF0','#2548B0'],
      [0,    0,   65,  65, 0.3,  '#2548B0','#1230A0','#0A1E6E'],
      [70,  -70,  65,  65, 0.5,  '#3B6FF0','#2548B0','#1B3A9C'],
      [115, -140, 65,  65, 0.75, '#5588FF','#3B6FF0','#2548B0'],
      [185, -70,   0,  42, 0.55, '#1B3A9C','#0A1E6E','#000D4A'],
      [-45, -70,   0,  42, 0.4,  '#1B3A9C','#0A1E6E','#000D4A'],
    ];

    cubes.forEach(([x, y, z, s, delay, ct, cf, cr], i) => {
      const cube = document.createElement('div');
      cube.className = 'iso-cube';
      cube.style.cssText = `--x:${x}px;--y:${y}px;--z:${z}px;--s:${s}px;--c-top:${ct};--c-front:${cf};--c-right:${cr};--pulse-d:${i*0.4}s;animation-delay:${delay}s;`;
      cube.innerHTML = '<div class="face top"></div><div class="face front"></div><div class="face right"></div>';
      scene.appendChild(cube);
    });

    let angle = -45, dir = 1;
    (function animate() {
      angle += 0.012 * dir;
      if (angle > -40 || angle < -50) dir *= -1;
      scene.style.transform = `rotateX(55deg) rotateZ(${angle}deg)`;
      requestAnimationFrame(animate);
    })();
  }

  // ═══ Badge Counter ═══
  const badgeEl = document.getElementById('badgeCount');
  if (badgeEl) {
    let c = 2847;
    setInterval(() => { c += Math.floor(Math.random()*3)+1; badgeEl.textContent = c.toLocaleString(); }, 3000);
  }

  // ═══ Scroll Reveal ═══
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const siblings = e.target.parentElement.querySelectorAll('.reveal');
        const idx = Array.from(siblings).indexOf(e.target);
        e.target.style.transitionDelay = (idx * 0.07) + 's';
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ═══ Navbar Scroll ═══
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ═══ Mobile Menu ═══
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileClose = document.getElementById('mobileMenuClose');

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      closeMobileMenu();
      if (link.id === 'mobileCartLink') {
        e.preventDefault();
        setTimeout(openCart, 200);
      }
    });
  });

  // ═══ Cart State & Purchase Flow ═══
  const cart = [];
  const cartBody = document.getElementById('cartBody');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartTotal = document.getElementById('cartTotal');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const goToCheckout = document.getElementById('goToCheckout');
  const activePortalBanner = document.getElementById('activePortalBanner');

  function openCart() {
    showCartStep(1);
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function renderCart() {
    cartCount.textContent = cart.length;
    cartCount.classList.toggle('has-items', cart.length > 0);
    goToCheckout.disabled = cart.length === 0;

    if (!cart.length) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--slate-light)" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span style="font-weight:600;">El carrito esta vacio</span>
          <p style="font-size:0.78rem;color:var(--slate-light);">Haz clic en cualquier modulo para agregarlo o simula una compra rapida.</p>
          <button id="quickAddSimBtn" class="btn-main" style="font-size:0.75rem;padding:0.5rem 1.2rem;margin-top:0.5rem;">
            Simular Seleccion Popular
          </button>
        </div>`;

      document.getElementById('quickAddSimBtn')?.addEventListener('click', () => {
        const popularIds = ['viewer', 'branding', 'approval'];
        popularIds.forEach(id => {
          const card = document.querySelector(`.bento-card[data-id="${id}"]`);
          if (card && !cart.find(i => i.id === id)) {
            cart.push({ id, name: card.dataset.name, price: parseInt(card.dataset.price) });
            const btn = card.querySelector('.add-to-cart-btn');
            btn.textContent = 'Agregado';
            btn.style.background = '#059669';
            btn.style.color = '#fff';
          }
        });
        renderCart();
      });

      cartSubtotal.textContent = '$0';
      cartTax.textContent = '$0';
      cartTotal.textContent = '$0';
      return;
    }

    let sub = 0;
    cartBody.innerHTML = cart.map(item => {
      sub += item.price;
      return `<div class="cart-item-row">
        <div class="cart-item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price-tag">$${item.price.toLocaleString()} MXN /mes</div>
        </div>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
    }).join('');

    const tax = Math.round(sub * 0.16);
    cartSubtotal.textContent = '$' + sub.toLocaleString();
    cartTax.textContent = '$' + tax.toLocaleString();
    cartTotal.textContent = '$' + (sub + tax).toLocaleString();
  }

  window.removeFromCart = function(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) {
      cart.splice(idx, 1);
      const card = document.querySelector(`.bento-card[data-id="${id}"]`);
      if (card) {
        const btn = card.querySelector('.add-to-cart-btn');
        btn.textContent = 'Agregar';
        btn.style.background = '';
        btn.style.color = '';
        if (card.classList.contains('featured')) {
          btn.style.background = '#fff';
          btn.style.color = 'var(--navy)';
        }
      }
      renderCart();
    }
  };

  renderCart();

  window.addToCart = function(id) {
    const card = document.querySelector(`.bento-card[data-id="${id}"]`);
    if (!card) return;
    if (cart.find(i => i.id === id)) {
      openCart();
      return;
    }
    cart.push({ id, name: card.dataset.name, price: parseInt(card.dataset.price) });
    const btn = card.querySelector('.add-to-cart-btn');
    if (btn) {
      btn.textContent = 'Agregado';
      btn.style.background = '#059669';
      btn.style.color = '#fff';
    }
    renderCart();
    openCart();
  };

  document.querySelectorAll('.bento-card').forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector('.add-to-cart-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.addToCart(id);
      });
    }
    card.addEventListener('click', () => {
      window.addToCart(id);
    });
  });

  // ═══ Cart Steps ═══
  function showCartStep(n) {
    document.querySelectorAll('.cart-step').forEach(s => s.classList.remove('active'));
    document.getElementById('cartStep' + n).classList.add('active');
  }

  goToCheckout.addEventListener('click', () => {
    let sub = 0;
    const summaryEl = document.getElementById('checkoutSummary');
    summaryEl.innerHTML = cart.map(item => {
      sub += item.price;
      return `<div class="checkout-summary-item">
        <span>${item.name}</span>
        <span style="font-weight:700;">$${item.price.toLocaleString()} MXN</span>
      </div>`;
    }).join('');
    const tax = Math.round(sub * 0.16);
    document.getElementById('checkoutTotal').textContent = '$' + (sub + tax).toLocaleString() + ' MXN';
    showCartStep(2);
  });

  document.getElementById('backToCart').addEventListener('click', () => showCartStep(1));

  document.getElementById('placeOrderBtn').addEventListener('click', async () => {
    const nameInp = document.getElementById('cName');
    const emailInp = document.getElementById('cEmail');
    const companyInp = document.getElementById('cCompany');

    // Auto fill defaults if user leaves empty during quick test
    if (!nameInp.value.trim()) nameInp.value = "Estudio Creativo Alpha";
    if (!emailInp.value.trim()) emailInp.value = "contacto@alpha.com";
    if (!companyInp.value.trim()) companyInp.value = "Alpha Design Group";

    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Procesando pago seguro...`;

    // Simulate 1.2s network/bank verification
    await new Promise(r => setTimeout(r, 1200));

    btn.disabled = false;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Confirmar pedido</span>`;

    // Generate Order Ticket Details
    const orderNum = 'STK-2026-' + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    const totalAmount = document.getElementById('checkoutTotal').textContent;
    const purchasedItemsCount = cart.length;

    const receiptBox = document.getElementById('orderReceiptBox');
    receiptBox.innerHTML = `
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:1.25rem;text-align:left;margin:1rem 0;font-size:0.8rem;">
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:0.5rem;margin-bottom:0.75rem;">
          <strong style="color:var(--navy);font-family:var(--font-mono);">${orderNum}</strong>
          <span style="color:var(--slate);">${dateStr}</span>
        </div>
        <p style="margin-bottom:0.25rem;"><strong>Cliente:</strong> ${companyInp.value}</p>
        <p style="margin-bottom:0.5rem;"><strong>Email:</strong> ${emailInp.value}</p>
        <div style="border-top:1px dashed var(--border);padding-top:0.5rem;margin-top:0.5rem;">
          <p style="font-weight:700;color:var(--navy);margin-bottom:0.25rem;">Modulos Activados (${purchasedItemsCount}):</p>
          <ul style="list-style:none;padding-left:0;color:var(--slate);">
            ${cart.map(i => `<li>• ${i.name} — <span style="font-family:var(--font-mono);font-size:0.75rem;">$${i.price.toLocaleString()}</span></li>`).join('')}
          </ul>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:0.75rem;padding-top:0.5rem;border-top:1px solid var(--navy);font-size:0.9rem;font-weight:800;color:var(--navy);">
          <span>Total Pagado</span>
          <span>${totalAmount}</span>
        </div>
      </div>
    `;

    showCartStep(3);

    // Show Active Portal Notification Banner
    if (activePortalBanner) {
      activePortalBanner.style.display = 'flex';
      document.getElementById('activePortalText').textContent = `Portal Activado para ${companyInp.value} (${purchasedItemsCount} modulos en linea)`;
    }

    // Reset cart state
    cart.length = 0;
    document.querySelectorAll('.add-to-cart-btn').forEach(b => {
      b.textContent = 'Agregar';
      b.style.background = '';
      b.style.color = '';
      const card = b.closest('.bento-card');
      if (card && card.classList.contains('featured')) {
        b.style.background = '#fff';
        b.style.color = 'var(--navy)';
      }
    });
    renderCart();
  });

  document.getElementById('closeAfterOrder').addEventListener('click', () => {
    closeCart();
    document.getElementById('checkoutForm').reset();
    setTimeout(() => showCartStep(1), 400);
  });

  // ═══ Viewer Tabs ═══
  document.querySelectorAll('.vtab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.viewer-pane').forEach(p => p.classList.remove('active'));
      document.querySelector(`[data-pane="${this.dataset.viewer}"]`).classList.add('active');
    });
  });

  // ═══ Blueprint Canvas ═══
  const canvas = document.getElementById('blueprintCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let currentFloor = 1;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 320;
    }
    resizeCanvas();

    function drawBlueprint(floor) {
      currentFloor = floor;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(59,111,240,0.28)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      const plans = {
        1: () => {
          ctx.strokeRect(w*0.08, h*0.1, w*0.84, h*0.8);
          ctx.beginPath();
          ctx.moveTo(w*0.42, h*0.1); ctx.lineTo(w*0.42, h*0.55);
          ctx.moveTo(w*0.42, h*0.55); ctx.lineTo(w*0.92, h*0.55);
          ctx.moveTo(w*0.68, h*0.1); ctx.lineTo(w*0.68, h*0.55);
          ctx.stroke();
          ctx.setLineDash([4,4]);
          ctx.beginPath(); ctx.arc(w*0.42, h*0.55, Math.min(30, w*0.06), -Math.PI/2, 0); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(59,111,240,0.5)';
          ctx.font = `600 ${Math.max(9, Math.min(11, w*0.018))}px Inter, sans-serif`;
          ctx.fillText('SALA', w*0.2, h*0.38);
          ctx.fillText('COCINA', w*0.5, h*0.32);
          ctx.fillText('ESTUDIO', w*0.73, h*0.32);
          ctx.fillText('TERRAZA', w*0.55, h*0.75);
          ctx.fillStyle = 'rgba(59,111,240,0.28)';
          ctx.font = `400 ${Math.max(8, Math.min(9, w*0.014))}px "Space Mono", monospace`;
          ctx.fillText('12.5m', w*0.45, h*0.06);
          ctx.fillText('8.2m', w*0.02, h*0.5);
        },
        2: () => {
          ctx.strokeRect(w*0.1, h*0.12, w*0.8, h*0.76);
          ctx.beginPath();
          ctx.moveTo(w*0.5, h*0.12); ctx.lineTo(w*0.5, h*0.88);
          ctx.moveTo(w*0.1, h*0.48); ctx.lineTo(w*0.5, h*0.48);
          ctx.stroke();
          ctx.fillStyle = 'rgba(59,111,240,0.5)';
          ctx.font = `600 ${Math.max(9, Math.min(11, w*0.018))}px Inter, sans-serif`;
          ctx.fillText('RECAMARA PRINCIPAL', w*0.15, h*0.35);
          ctx.fillText('VESTIDOR', w*0.2, h*0.65);
          ctx.fillText('RECAMARA 2', w*0.58, h*0.5);
        },
        3: () => {
          ctx.strokeRect(w*0.12, h*0.15, w*0.76, h*0.7);
          ctx.setLineDash([6,4]);
          ctx.strokeRect(w*0.18, h*0.28, w*0.22, h*0.35);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(59,111,240,0.5)';
          ctx.font = `600 ${Math.max(9, Math.min(11, w*0.018))}px Inter, sans-serif`;
          ctx.fillText('TERRAZA ABIERTA', w*0.5, h*0.5);
          ctx.fillText('JACUZZI', w*0.24, h*0.48);
          ctx.fillStyle = 'rgba(59,111,240,0.28)';
          ctx.font = `400 ${Math.max(8, Math.min(9, w*0.014))}px "Space Mono", monospace`;
          ctx.fillText('Area: 42m2', w*0.58, h*0.68);
        }
      };
      (plans[floor] || plans[1])();
    }
    drawBlueprint(1);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeCanvas(); drawBlueprint(currentFloor); }, 150);
    });

    document.querySelectorAll('.cad-sidebar-item').forEach(f => {
      f.addEventListener('click', function() {
        document.querySelectorAll('.cad-sidebar-item').forEach(el => el.classList.remove('active-file'));
        this.classList.add('active-file');
        drawBlueprint(parseInt(this.dataset.floor));
      });
    });

    let zoom = 100;
    document.getElementById('cadCanvas').addEventListener('wheel', e => {
      e.preventDefault();
      zoom = Math.max(50, Math.min(200, zoom + (e.deltaY > 0 ? -8 : 8)));
      canvas.style.transform = `scale(${zoom/100})`;
      document.getElementById('cadZoom').textContent = zoom + '%';
    }, { passive: false });
  }

  // ═══ Brand Palette ═══
  const palette = document.getElementById('brandPalette');
  if (palette) {
    [
      { hex: '#000D4A', n: 'Deep' },
      { hex: '#0A1E6E', n: 'Navy' },
      { hex: '#1B3A9C', n: 'Royal' },
      { hex: '#3B6FF0', n: 'Glow' },
      { hex: '#F8F7F4', n: 'Cream' },
      { hex: '#6B7280', n: 'Slate' },
    ].forEach(c => {
      const el = document.createElement('div');
      el.style.cssText = 'cursor:pointer;text-align:center;';
      el.innerHTML = `<div style="width:42px;height:42px;border-radius:10px;background:${c.hex};border:1px solid rgba(0,0,0,0.05);margin-bottom:0.25rem;transition:transform 0.2s;"></div>
        <span style="font-family:var(--font-mono);font-size:0.55rem;color:var(--slate);">${c.hex}</span>`;
      el.addEventListener('mouseenter', () => el.firstElementChild.style.transform = 'scale(1.12)');
      el.addEventListener('mouseleave', () => el.firstElementChild.style.transform = '');
      el.addEventListener('click', () => {
        navigator.clipboard.writeText(c.hex);
        el.querySelector('span').textContent = 'Copied!';
        setTimeout(() => el.querySelector('span').textContent = c.hex, 1200);
      });
      palette.appendChild(el);
    });
  }

  // ═══ Digital Signature ═══
  const signBtn = document.getElementById('signBtn');
  if (signBtn) {
    signBtn.addEventListener('click', async function() {
      this.innerHTML = 'Firmando...';
      this.disabled = true;
      const data = new TextEncoder().encode('NDA-REV-3.2-' + Date.now());
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
      setTimeout(() => {
        const r = document.getElementById('signResult');
        r.style.display = 'block';
        r.innerHTML = `<strong style="color:#059669;">Firma verificada</strong><br>SHA-256: ${hex}`;
        this.innerHTML = 'Firmado';
        this.style.background = '#059669';
      }, 900);
    });
  }

  // ═══ ROI Calculator ═══
  const slider = document.getElementById('roiSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      const c = parseInt(this.value);
      document.getElementById('roiVal').textContent = c;
      tweenNum('roiHours', Math.round(c * 1.6));
      tweenNum('roiSavings', Math.round(c * 640), '$');
      document.getElementById('roiPercent').textContent = Math.round((c * 640 / 4200) * 100) + '%';
    });
  }

  function tweenNum(id, target, prefix = '') {
    const el = document.getElementById(id);
    const cur = parseInt(el.textContent.replace(/[$,]/g, '')) || 0;
    const diff = target - cur;
    let step = 0;
    const total = 10;
    const iv = setInterval(() => {
      step++;
      el.textContent = prefix + Math.round(cur + diff * (step / total)).toLocaleString();
      if (step >= total) clearInterval(iv);
    }, 16);
  }

});
