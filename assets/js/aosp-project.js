(() => {
  'use strict';

  const stack = document.getElementById('aosp-stack-map');
  const loop = document.getElementById('aosp-loop-canvas');
  if (!stack || !loop) return;

  const layerButtons = [...stack.querySelectorAll('[data-layer]')];
  const stepButtons = [...loop.querySelectorAll('[data-step]')];
  const layerDetail = document.getElementById('aosp-layer-detail');
  const stepDetail = document.getElementById('aosp-step-detail');
  const playButton = document.getElementById('aosp-play');
  const nextButton = document.getElementById('aosp-next');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 600px)');
  const layerCopy = [
    ['Build configuration', 'Align the build configuration with the selected compiler and platform.'],
    ['Target support', 'Generate code for LoongArch through LLVM/Clang target support.'],
    ['Library compatibility', 'Keep core libraries and runtime dependencies compatible with the toolchain.']
  ];
  const stepCopy = [
    ['01 / Compile', 'Build usable compiler components for the next integration step.'],
    ['02 / Update', 'Bring platform libraries and build dependencies into alignment.'],
    ['03 / Rebuild', 'Rebuild with the updated components, then repeat as needed.']
  ];
  let activeLayer = 0;
  let activeStep = 0;
  let playTimer = null;
  let replay = false;

  function updateDetail(container, copy) {
    container.querySelector('.aosp-detail-label').textContent = copy[0];
    container.querySelector('p').textContent = copy[1];
  }

  function selectLayer(index) {
    activeLayer = index;
    layerButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    updateDetail(layerDetail, layerCopy[index]);
    stack.querySelectorAll('[data-wire]').forEach(path => {
      const wire = path.dataset.wire;
      path.classList.toggle('is-active', wire === 'target' || wire === `stack-${Math.min(index, 1)}`);
    });
  }

  function selectStep(index) {
    activeStep = index;
    stepButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    updateDetail(stepDetail, stepCopy[index]);
    loop.querySelectorAll('[data-wire]').forEach(path => {
      path.classList.toggle('is-active', path.dataset.wire === (index === 2 ? 'loop-return' : `loop-${index}`));
    });
  }

  function setPlayLabel(label, symbol) {
    playButton.replaceChildren();
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = symbol;
    playButton.append(icon, document.createTextNode(` ${label}`));
    playButton.setAttribute('aria-label', `${label} the build loop walkthrough`);
  }

  function stopPlayback() {
    if (playTimer !== null) window.clearTimeout(playTimer);
    playTimer = null;
    loop.classList.remove('is-playing');
    setPlayLabel(motionPreference.matches ? 'Start loop' : (replay ? 'Replay loop' : 'Play loop'), '▶');
  }

  function playLoop() {
    if (playTimer !== null) {
      stopPlayback();
      return;
    }
    selectStep(0);
    if (motionPreference.matches) return;
    loop.classList.add('is-playing');
    setPlayLabel('Stop', '■');
    let next = 1;
    const advance = () => {
      if (next < stepButtons.length) {
        selectStep(next++);
        playTimer = window.setTimeout(advance, 1600);
      } else {
        replay = true;
        stopPlayback();
      }
    };
    playTimer = window.setTimeout(advance, 1600);
  }

  const point = (element, container, side) => {
    const r = element.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    return {
      x: r.left - c.left + (side === 'left' ? 0 : side === 'right' ? r.width : r.width / 2),
      y: r.top - c.top + (side === 'top' ? 0 : side === 'bottom' ? r.height : r.height / 2)
    };
  };

  function setPath(container, name, value) {
    container.querySelector(`[data-wire="${name}"]`).setAttribute('d', value);
  }

  function connect(container, name, start, end) {
    setPath(container, name, `M ${start.x} ${start.y} L ${end.x} ${end.y}`);
  }

  function drawWires() {
    const narrow = mobileLayout.matches;
    [stack, loop].forEach(container => {
      const r = container.getBoundingClientRect();
      container.querySelector('svg.aosp-wires').setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    });
    for (let i = 0; i < 2; i++) {
      connect(stack, `stack-${i}`, point(layerButtons[i], stack, narrow ? 'bottom' : 'right'), point(layerButtons[i + 1], stack, narrow ? 'top' : 'left'));
      connect(loop, `loop-${i}`, point(stepButtons[i], loop, narrow ? 'bottom' : 'right'), point(stepButtons[i + 1], loop, narrow ? 'top' : 'left'));
    }
    const source = point(layerButtons[narrow ? 2 : 1], stack, 'bottom');
    connect(stack, 'target', source, point(stack.querySelector('.aosp-target'), stack, 'top'));
    if (narrow) {
      const from = point(stepButtons[2], loop, 'right');
      const to = point(stepButtons[0], loop, 'right');
      const x = from.x + 20;
      setPath(loop, 'loop-return', `M ${from.x} ${from.y} H ${x} V ${to.y} H ${to.x}`);
    } else {
      const from = point(stepButtons[2], loop, 'bottom');
      const to = point(stepButtons[0], loop, 'bottom');
      const y = from.y + 30;
      setPath(loop, 'loop-return', `M ${from.x} ${from.y} V ${y} H ${to.x} V ${to.y}`);
    }
  }

  layerButtons.forEach((button, index) => button.addEventListener('click', () => selectLayer(index)));
  stepButtons.forEach((button, index) => button.addEventListener('click', () => { stopPlayback(); selectStep(index); }));
  nextButton.addEventListener('click', () => { stopPlayback(); selectStep((activeStep + 1) % stepButtons.length); });
  playButton.addEventListener('click', playLoop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
  motionPreference.addEventListener('change', stopPlayback);
  window.addEventListener('pagehide', stopPlayback);
  window.addEventListener('resize', drawWires);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(drawWires);
    observer.observe(stack);
    observer.observe(loop);
  }
  if (document.fonts) document.fonts.ready.then(drawWires);
  selectLayer(activeLayer);
  selectStep(activeStep);
  stopPlayback();
  drawWires();
})();
