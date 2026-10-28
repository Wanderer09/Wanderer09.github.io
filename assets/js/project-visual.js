(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ns = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('[data-stepper]').forEach(function (section) {
    var nodes = Array.from(section.querySelectorAll('.pv-node'));
    var caption = section.querySelector('[data-caption]');
    var current = 0;
    function select(index) {
      current = index;
      nodes.forEach(function (node, i) { node.setAttribute('aria-pressed', String(i === index)); });
      caption.textContent = nodes[index].dataset.description;
    }
    nodes.forEach(function (node, index) { node.addEventListener('click', function () { select(index); }); });
    var next = section.querySelector('[data-next]');
    if (next) next.addEventListener('click', function () { select((current + 1) % nodes.length); });
    select(0);
  });

  document.querySelectorAll('.pv-map').forEach(function (map) {
    var svg = map.querySelector('.pv-wire');
    var nodes = Array.from(map.querySelectorAll('.pv-node'));
    function draw() {
      var rect = map.getBoundingClientRect();
      if (!rect.width) return;
      svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
      svg.replaceChildren();
      var boxes = nodes.map(function (node) {
        var r = node.getBoundingClientRect();
        return { x: r.left - rect.left, y: r.top - rect.top, w: r.width, h: r.height };
      });
      var vertical = boxes.length > 1 && Math.abs(boxes[0].y - boxes[1].y) > 10;
      function path(d, className) {
        var line = document.createElementNS(ns, 'path');
        line.setAttribute('d', d);
        if (className) line.setAttribute('class', className);
        svg.appendChild(line);
      }
      boxes.slice(0, -1).forEach(function (a, i) {
        var b = boxes[i + 1];
        var x, y;
        if (vertical) {
          x = a.x + a.w / 2; y = b.y - 4;
          path('M ' + x + ' ' + (a.y + a.h) + ' V ' + y + ' m -3 -4 l 3 4 l 3 -4');
        } else {
          x = b.x - 4; y = a.y + a.h / 2;
          path('M ' + (a.x + a.w) + ' ' + y + ' H ' + x + ' m -4 -3 l 4 3 l -4 3');
        }
      });
      if (map.hasAttribute('data-forward-map')) {
        var target = boxes[1];
        boxes.slice(2).forEach(function (source, i) {
          if (vertical) {
            var right = source.x + source.w + 10 + i * 7;
            var sy = source.y + source.h / 2;
            var ty = target.y + target.h / 2 + i * 5;
            path('M ' + (source.x + source.w) + ' ' + sy + ' H ' + right + ' V ' + ty + ' H ' + (target.x + target.w + 3) + ' m 4 -3 l -4 3 l 4 3', 'pv-return');
          } else {
            var bottom = source.y + source.h + 12 + i * 7;
            path('M ' + (source.x + source.w / 2) + ' ' + (source.y + source.h) + ' V ' + bottom + ' H ' + (target.x + target.w / 2 + i * 5) + ' V ' + (target.y + target.h + 3) + ' m -3 4 l 3 -4 l 3 4', 'pv-return');
          }
        });
      }
    }
    if (window.ResizeObserver) new ResizeObserver(draw).observe(map);
    else window.addEventListener('resize', draw);
    draw();
  });

  var modelSection = document.querySelector('[data-model-comparison]');
  if (modelSection) {
    var scores = { tabpfn: [.9893, .9698, .7854], mlp: [.9802, .9178, .7317] };
    var names = { tabpfn: 'TabPFN', mlp: 'Manual MLP' };
    var modelButtons = Array.from(modelSection.querySelectorAll('[data-model]'));
    modelButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.dataset.model;
        modelButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        modelSection.querySelectorAll('.pv-bar-row').forEach(function (row, i) {
          row.querySelector('.pv-bar').style.setProperty('--pv-value', (scores[key][i] * 100) + '%');
          row.querySelector('output').textContent = scores[key][i].toFixed(4);
        });
        modelSection.querySelector('[data-model-title]').textContent = names[key] + ' · circuit-family average R²';
        modelSection.querySelector('[data-model-status]').textContent = names[key] + ' selected. Comparator ' + scores[key][0].toFixed(4) + ', bootstrap ' + scores[key][1].toFixed(4) + ', op-amp ' + scores[key][2].toFixed(4) + '.';
      });
    });
  }

  var scheduler = document.querySelector('[data-scheduler]');
  if (scheduler) {
    var ready, running, blocked;
    var tasks = {};
    ['A', 'B', 'C'].forEach(function (name) {
      var task = document.createElement('span');
      task.className = 'pv-task'; task.textContent = name; task.setAttribute('aria-label', 'Task ' + name);
      tasks[name] = task;
    });
    function render(message) {
      var positions = {};
      Object.keys(tasks).forEach(function (name) { positions[name] = tasks[name].getBoundingClientRect(); });
      ['ready', 'running', 'blocked'].forEach(function (lane) {
        var list = scheduler.querySelector('[data-lane="' + lane + '"] .pv-task-list');
        list.replaceChildren();
        var names = lane === 'ready' ? ready : lane === 'blocked' ? blocked : (running ? [running] : []);
        names.forEach(function (name) { list.appendChild(tasks[name]); });
      });
      if (!reduceMotion.matches) Object.keys(tasks).forEach(function (name) {
        var before = positions[name], after = tasks[name].getBoundingClientRect();
        if (before.width && tasks[name].animate) tasks[name].animate([
          { transform: 'translate(' + (before.left - after.left) + 'px,' + (before.top - after.top) + 'px)' },
          { transform: 'translate(0,0)' }
        ], { duration: 280, easing: 'ease-out' });
      });
      scheduler.querySelector('[data-action="switch"]').disabled = !ready.length;
      scheduler.querySelector('[data-action="block"]').disabled = !running;
      scheduler.querySelector('[data-action="wake"]').disabled = !blocked.length;
      scheduler.querySelector('[data-state-status]').textContent = message;
    }
    function reset() { ready = ['B', 'C']; running = 'A'; blocked = []; render('Task A is running. B and C are ready.'); }
    scheduler.querySelectorAll('[data-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.dataset.action, previous = running, name;
        if (action === 'reset') { reset(); return; }
        if (action === 'switch' && ready.length) {
          if (running) ready.push(running);
          running = ready.shift();
          render('Task ' + running + ' is running.' + (previous ? ' Task ' + previous + ' returns to ready.' : ' The CPU leaves idle.'));
        }
        if (action === 'block' && running) {
          blocked.push(running); running = ready.shift() || null;
          render('Task ' + previous + ' blocks.' + (running ? ' Task ' + running + ' is now running.' : ' No task is ready; the CPU is idle.'));
        }
        if (action === 'wake' && blocked.length) {
          name = blocked.shift(); ready.push(name);
          render('Task ' + name + ' moves to ready. ' + (running ? 'Task ' + running + ' keeps running.' : 'Switch task to dispatch a ready task.'));
        }
      });
    });
    reset();
  }

  var hazardSection = document.querySelector('[data-hazards]');
  if (hazardSection) {
    hazardSection.querySelectorAll('[data-hazard]').forEach(function (button) {
      button.addEventListener('click', function () {
        var forwarding = button.dataset.hazard === 'forward';
        hazardSection.querySelectorAll('[data-hazard]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        hazardSection.querySelector('[data-forward-map]').classList.toggle('pv-forwarding', forwarding);
        hazardSection.querySelector('[data-feedback-label]').textContent = forwarding ? 'READY RESULTS → DECODE' : 'WAIT FOR WRITEBACK';
        hazardSection.querySelector('[data-hazard-caption]').textContent = forwarding ? 'Forwarding supplies ready results from later stages to decode, reducing waits for dependent instructions. Load-use dependencies still stall until the value is available.' : 'With stall-based hazard handling, a dependent instruction waits for its operand to be written back. The highlighted stage buttons explain the five-stage datapath.';
        document.querySelectorAll('[data-sim-mode]').forEach(function (row) { row.classList.toggle('is-highlighted', row.dataset.simMode === button.dataset.hazard); });
      });
    });
  }
}());
