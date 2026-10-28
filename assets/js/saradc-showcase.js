(function () {
  'use strict';
  var explorer = document.querySelector('[data-sar-explorer]');
  if (!explorer) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var buttons = Array.from(explorer.querySelectorAll('[data-circuit]'));
  var stations = Array.from(explorer.querySelectorAll('.sar-station'));
  var scene = explorer.querySelector('.sar-scene');
  var replay = document.querySelector('[data-trace]');
  var status = document.querySelector('[data-trace-status]');
  var timer = null;
  var selection = 'comparator';
  var circuits = {
    comparator: {
      input: 'Transistor sizes', params: 'Widths & lengths', output: 'Decision speed', target: 'Propagation delay',
      question: 'How quickly will this comparator make a decision?',
      summary: 'Comparator: transistor sizes go in; estimated decision delay comes out.',
      symbol: 'M35 32 L35 80 L87 56 Z M20 43 H35 M20 69 H35 M87 56 H105 M25 39 V47 M21 43 H29 M21 69 H29',
      signal: 'M14 76 H48 V34 H108',
      guide: 'M14 88 H32 V46 H108'
    },
    bootstrap: {
      input: 'Device sizes', params: 'Transistors & capacitors', output: 'Sampling quality', target: 'Effective resolution · ENOB',
      question: 'How well will this sampling circuit preserve the signal?',
      summary: 'Bootstrap circuit: device sizes go in; estimated sampling quality comes out.',
      symbol: 'M15 40 H39 M39 40 L64 25 M65 40 H104 M78 40 V65 M64 65 H92 M64 73 H92 M78 73 V92 M65 92 H91',
      signal: 'M14 70 H29 V56 H45 V36 H61 V48 H77 V73 H93 V60 H108',
      guide: 'M14 70 C25 63 32 50 42 40 S57 37 64 48 S78 78 88 73 S99 62 108 60'
    },
    opamp: {
      input: 'Sizes & bias', params: 'Geometry & bias current', output: 'Amplifier response', target: 'Gain & bandwidth',
      question: 'How will this amplifier strengthen a changing signal?',
      summary: 'Op-amp: device sizes and bias go in; estimated gain and bandwidth come out.',
      symbol: 'M35 27 L35 85 L92 56 Z M16 41 H35 M16 71 H35 M92 56 H109 M24 37 V45 M20 41 H28 M20 71 H28 M61 40 V21 M61 72 V93',
      signal: 'M14 56 C22 56 26 23 38 23 S54 89 66 89 S82 23 94 23 S103 56 108 56',
      guide: 'M14 56 C22 56 26 45 38 45 S54 67 66 67 S82 45 94 45 S103 56 108 56'
    }
  };

  function stop() {
    window.clearTimeout(timer);
    timer = null;
    scene.classList.remove('is-replaying');
    stations.forEach(function (station) { station.classList.remove('is-tracing'); });
    replay.textContent = 'Trace the prediction →';
  }

  function trace() {
    stop();
    if (reduceMotion.matches) {
      stations[2].classList.add('is-tracing');
      status.textContent = circuits[selection].summary;
      return;
    }
    scene.classList.add('is-replaying');
    replay.textContent = 'Restart trace →';
    function step(index) {
      stations.forEach(function (station, i) { station.classList.toggle('is-tracing', i === index); });
      status.textContent = ['Start with a candidate circuit design.', 'Use the mapping learned from past SPICE simulations.', circuits[selection].summary][index];
      if (index < 2) timer = window.setTimeout(function () { step(index + 1); }, 650);
      else timer = window.setTimeout(function () {
        scene.classList.remove('is-replaying');
        replay.textContent = 'Trace the prediction →';
        timer = null;
      }, 650);
    }
    step(0);
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      stop();
      selection = button.dataset.circuit;
      var circuit = circuits[selection];
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      explorer.querySelector('[data-input-title]').textContent = circuit.input;
      explorer.querySelector('[data-input-params]').textContent = circuit.params;
      explorer.querySelector('[data-output-title]').textContent = circuit.output;
      explorer.querySelector('[data-output-target]').textContent = circuit.target;
      explorer.querySelector('[data-question]').textContent = circuit.question;
      explorer.querySelector('[data-circuit-symbol]').setAttribute('d', circuit.symbol);
      explorer.querySelector('[data-signal]').setAttribute('d', circuit.signal);
      explorer.querySelector('[data-signal-guide]').setAttribute('d', circuit.guide);
      status.textContent = circuit.summary;
      trace();
    });
  });
  replay.addEventListener('click', trace);
  reduceMotion.addEventListener('change', stop);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
}());
