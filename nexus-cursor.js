(function initGlobalCursor() {
  let cur = document.getElementById('entCur');
  let ring = document.getElementById('entRing');

  if (!cur) {
    cur = document.createElement('div');
    cur.id = 'entCur';
    cur.className = 'ent-cur';
    document.body.appendChild(cur);
  }

  if (!ring) {
    ring = document.createElement('div');
    ring.id = 'entRing';
    ring.className = 'ent-curring';
    document.body.appendChild(ring);
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });

  function animate() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .nx-tile, .demo-card, input, select')) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .nx-tile, .demo-card, input, select')) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();