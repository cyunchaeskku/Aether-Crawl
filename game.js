// game.js — Legacy shim (refactored)
// This project now uses ES modules via src/main.js. This shim keeps a small
// non-module entry for older pages that referenced game.js.

(function loadModuleEntry() {
  var script = document.createElement('script');
  script.type = 'module';
  script.src = 'src/main.js';
  document.head.appendChild(script);
})();
