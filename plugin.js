(function () {
  'use strict';

  try {
    if (window.__DesignAIPluginLoaded) return;
    window.__DesignAIPluginLoaded = true;

    var CFG = (window.DesignAIConfig || {});
    var SERVER_URL = (CFG.serverUrl || 'http://localhost:3001').replace(/\/+$/, '');
    var COMPANY = CFG.companyName || 'DesignAI';

    var MATERIALS = [
      { id: 1, name: 'Aerolite Coffee Grey', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Aerolite_COFFEE_grey.jpg' },
      { id: 2, name: 'Roman Pillar Milan Red', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Roman_pillar_milan_red.jpg' },
      { id: 3, name: 'Marble Bianco Carara', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Marble_Bianco_Carara.png' }
    ];

    // ---------- fonts ----------
    try {
      var l1 = document.createElement('link');
      l1.rel = 'preconnect'; l1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(l1);
      var l2 = document.createElement('link');
      l2.rel = 'preconnect'; l2.href = 'https://fonts.gstatic.com'; l2.crossOrigin = '';
      document.head.appendChild(l2);
      var l3 = document.createElement('link');
      l3.rel = 'stylesheet';
      l3.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
      document.head.appendChild(l3);
    } catch (e) {}

    // ---------- three.js loader ----------
    function loadThree() {
      return new Promise(function (resolve) {
        if (window.THREE) return resolve(window.THREE);
        var s = document.createElement('script');
        s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
        s.onload = function () { resolve(window.THREE); };
        s.onerror = function () { resolve(null); };
        document.head.appendChild(s);
      });
    }

    // ---------- styles (LIGHT THEME, compact) ----------
    var CSS = '' +
    '._dai_root,._dai_root *{box-sizing:border-box;font-family:"Manrope","Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +

    /* ===== FAB / Floating widget — light theme, compact ===== */
    '._dai_fab{position:fixed;right:32px;bottom:32px;z-index:999990;display:inline-flex;align-items:center;gap:11px;padding:9px 18px 9px 92px;width:64px;height:64px;border-radius:999px;cursor:pointer;background:transparent;border:1px solid transparent;color:#0e1116;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;font-family:"Manrope",sans-serif;text-align:left;transition:width .8s cubic-bezier(.34,1.56,.64,1),padding .8s cubic-bezier(.34,1.56,.64,1),background .5s ease,box-shadow .5s ease,border-color .5s ease,backdrop-filter .5s ease;}' +
    '._dai_fab._dai_expanded{width:295px;background:rgba(255,255,255,0.78);border-color:rgba(255,255,255,0.9);box-shadow:0 16px 32px -12px rgba(20,25,40,0.22),0 6px 14px -6px rgba(20,25,40,0.16),inset 0 1px 0 rgba(255,255,255,0.85);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);}' +

    '._dai_orb_ring{position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:92px;height:92px;border-radius:50%;pointer-events:none;z-index:2;}' +
    '._dai_orb_ring::before,._dai_orb_ring::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid #d4a85a;box-shadow:0 0 12px #d4a85a,0 0 24px #ffd98a,inset 0 0 8px rgba(255,255,255,0.25);animation:_dai_ringPulse 3.2s ease-in-out infinite;}' +
    '._dai_orb_ring::after{border-color:#ffd98a;animation-delay:-1.6s;opacity:.6;transform:scale(1.03);}' +
    '._dai_fab:hover ._dai_orb_ring::before,._dai_fab:hover ._dai_orb_ring::after{animation-duration:1.4s;}' +
    '@keyframes _dai_ringPulse{0%,100%{opacity:.85;transform:scale(1);}50%{opacity:1;transform:scale(1.015);}}' +

    '._dai_orb_canvas{position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:92px;height:92px;border-radius:50%;-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 58%,transparent 60%);mask-image:radial-gradient(circle at 50% 50%,#000 58%,transparent 60%);z-index:3;pointer-events:auto;cursor:pointer;}' +

    '._dai_orb_fallback{position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:92px;height:92px;border-radius:50%;-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 58%,transparent 60%);mask-image:radial-gradient(circle at 50% 50%,#000 58%,transparent 60%);z-index:3;cursor:pointer;background:radial-gradient(circle at 35% 30%,#f7f1e6 0%,#d9c8a9 35%,#a8855a 65%,#5a3e22 90%,#2a1d10 100%);animation:_dai_orbSpin 18s linear infinite;}' +
    '@keyframes _dai_orbSpin{from{filter:hue-rotate(0deg);}to{filter:hue-rotate(360deg);}}' +

    '._dai_fab_text{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:4px;line-height:1;z-index:2;opacity:0;transform:translateX(-10px);pointer-events:none;transition:opacity .4s ease,transform .55s cubic-bezier(.34,1.56,.64,1);}' +
    '._dai_fab._dai_expanded ._dai_fab_text{opacity:1;transform:translateX(0);pointer-events:auto;transition-delay:.32s;}' +
    '._dai_fab_title{font-family:"Unbounded","Manrope",sans-serif;font-size:12px;font-weight:700;letter-spacing:.01em;text-transform:uppercase;line-height:1.1;white-space:nowrap;color:#0e1116;text-align:left;}' +
    '._dai_fab_sub{font-family:"Manrope",sans-serif;font-size:9px;font-weight:500;line-height:1.3;opacity:.55;letter-spacing:.02em;white-space:nowrap;color:#0e1116;text-align:left;}' +

    '._dai_fab_icon{margin-left:auto;width:24px;height:24px;flex-shrink:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(20,25,40,0.04);border:1px solid rgba(20,25,40,0.1);position:relative;z-index:2;color:#0e1116;opacity:0;transform:translateX(-10px);pointer-events:none;transition:opacity .4s ease,transform .55s cubic-bezier(.34,1.56,.64,1);}' +
    '._dai_fab._dai_expanded ._dai_fab_icon{opacity:1;transform:translateX(0);pointer-events:auto;transition-delay:.46s;}' +
    '._dai_fab._dai_expanded:hover ._dai_fab_icon{transform:rotate(-6deg) scale(1.08);}' +
    '._dai_fab_icon svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}' +

    /* ===== Modal / Overlay — light ===== */
    '._dai_overlay{position:fixed;inset:0;background:rgba(232,228,220,0.7);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);z-index:999991;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .4s ease;pointer-events:none;}' +
    '._dai_overlay._dai_open{opacity:1;pointer-events:auto;}' +
    '._dai_modal{width:100%;max-width:560px;max-height:92vh;background:#ffffff;color:#0e1116;border:1px solid rgba(20,25,40,0.06);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;transform:scale(.94) translateY(28px);transition:transform .5s cubic-bezier(.34,1.56,.64,1);box-shadow:0 40px 100px -20px rgba(20,25,40,0.25),0 16px 36px -12px rgba(20,25,40,0.14);}' +
    '._dai_overlay._dai_open ._dai_modal{transform:scale(1) translateY(0);}' +

    '._dai_header{display:flex;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid rgba(20,25,40,0.06);}' +
    '._dai_h_icon{width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f7f1e6 0%,#d9c8a9 50%,#5a3e22 100%);box-shadow:0 0 0 1px rgba(212,168,90,0.4),0 0 12px rgba(212,168,90,0.3);}' +
    '._dai_h_title{font-family:"Unbounded","Manrope",sans-serif;font-weight:600;font-size:11px;letter-spacing:.18em;text-transform:uppercase;flex:0 0 auto;color:#0e1116;}' +
    '._dai_dots{display:flex;gap:8px;margin-left:12px;flex:1;}' +
    '._dai_dot{height:2.5px;flex:1;max-width:50px;border-radius:999px;background:rgba(20,25,40,0.1);transition:background .4s ease,box-shadow .4s ease;}' +
    '._dai_dot._dai_active{background:#d4a85a;box-shadow:0 0 10px rgba(212,168,90,0.5);}' +
    '._dai_dot._dai_done{background:rgba(212,168,90,0.45);}' +
    '._dai_close{background:rgba(20,25,40,0.04);border:1px solid rgba(20,25,40,0.08);color:#0e1116;font-size:12px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;opacity:.7;transition:opacity .2s ease,background .2s ease,transform .2s ease;}' +
    '._dai_close:hover{opacity:1;background:rgba(20,25,40,0.08);transform:rotate(90deg);}' +

    '._dai_body{padding:20px 22px;overflow-y:auto;scrollbar-width:thin;}' +
    '._dai_body::-webkit-scrollbar{width:6px;}' +
    '._dai_body::-webkit-scrollbar-thumb{background:rgba(212,168,90,0.3);border-radius:8px;}' +

    '._dai_footer{display:flex;justify-content:space-between;gap:8px;padding:13px 18px;border-top:1px solid rgba(20,25,40,0.06);}' +
    '._dai_footer._dai_hidden{display:none;}' +

    '._dai_btn{border:0;border-radius:999px;padding:9px 18px;font-size:11px;font-weight:600;letter-spacing:.04em;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),opacity .2s ease,background .2s ease,box-shadow .3s ease;font-family:inherit;}' +
    '._dai_btn:disabled{opacity:.35;cursor:not-allowed;}' +
    '._dai_btn_ghost{background:rgba(20,25,40,0.04);color:#0e1116;border:1px solid rgba(20,25,40,0.1);}' +
    '._dai_btn_ghost:hover:not(:disabled){background:rgba(20,25,40,0.07);transform:translateY(-1px);}' +
    '._dai_btn_gold{background:linear-gradient(180deg,#e8c98e 0%,#d4a85a 100%);color:#1a1410;box-shadow:0 6px 18px -6px rgba(212,168,90,0.5);}' +
    '._dai_btn_gold:hover:not(:disabled){transform:translateY(-2px) scale(1.02);box-shadow:0 10px 26px -8px rgba(212,168,90,0.7);}' +

    '._dai_step_title{font-family:"Unbounded","Manrope",sans-serif;font-size:18px;font-weight:700;margin:0 0 5px;color:#0e1116;letter-spacing:.005em;text-transform:uppercase;line-height:1.1;}' +
    '._dai_step_sub{color:rgba(14,17,22,0.55);font-size:12px;margin:0 0 18px;line-height:1.45;max-width:420px;}' +

    /* ===== Step 1: material grid ===== */
    '._dai_grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}' +
    '@media (max-width:520px){._dai_grid{grid-template-columns:1fr 1fr;}}' +
    '._dai_card{position:relative;border:1px solid rgba(20,25,40,0.08);border-radius:12px;overflow:hidden;cursor:pointer;background:#fafaf8;transition:border-color .3s ease,transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease;}' +
    '._dai_card:hover{transform:translateY(-3px);border-color:rgba(212,168,90,0.4);}' +
    '._dai_card._dai_selected{border-color:#d4a85a;box-shadow:0 0 0 1px #d4a85a,0 8px 22px -8px rgba(212,168,90,0.4);}' +
    '._dai_card img{display:block;width:100%;height:108px;object-fit:cover;background:#f0ebe0;}' +
    '._dai_card_name{padding:9px 11px;font-size:11px;font-weight:600;color:#0e1116;letter-spacing:.01em;}' +
    '._dai_check{position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;background:#d4a85a;color:#ffffff;display:none;align-items:center;justify-content:center;font-weight:800;font-size:11px;box-shadow:0 0 10px rgba(212,168,90,0.5);}' +
    '._dai_card._dai_selected ._dai_check{display:flex;}' +

    /* ===== Step 2: drop zone ===== */
    '._dai_drop{border:1.5px dashed rgba(212,168,90,0.45);border-radius:14px;padding:32px 18px;text-align:center;background:rgba(212,168,90,0.04);cursor:pointer;transition:background .3s ease,border-color .3s ease,transform .3s ease;}' +
    '._dai_drop:hover,._dai_drop._dai_hover{background:rgba(212,168,90,0.08);border-color:#d4a85a;transform:scale(1.005);}' +
    '._dai_drop_icon{width:36px;height:36px;border-radius:50%;background:rgba(212,168,90,0.12);border:1px solid rgba(212,168,90,0.3);display:inline-flex;align-items:center;justify-content:center;margin-bottom:11px;color:#a8854a;}' +
    '._dai_drop_icon svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}' +
    '._dai_drop_title{font-size:13px;color:#0e1116;font-weight:700;margin:0 0 5px;letter-spacing:.01em;}' +
    '._dai_drop_sub{font-size:10px;color:rgba(14,17,22,0.5);margin:0;font-family:"JetBrains Mono",monospace;letter-spacing:.05em;}' +
    '._dai_cam_row{display:flex;gap:8px;margin-top:11px;flex-wrap:wrap;}' +
    '._dai_cam_row ._dai_btn{flex:1;min-width:120px;}' +
    '._dai_preview{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(20,25,40,0.08);background:#f0ebe0;}' +
    '._dai_preview img{display:block;width:100%;max-height:320px;object-fit:contain;}' +
    '._dai_preview_actions{display:flex;justify-content:center;margin-top:11px;}' +

    /* ===== Step 3: generation ===== */
    '._dai_gen{display:flex;flex-direction:column;align-items:center;padding:24px 10px 12px;}' +
    '._dai_gen_orb{width:88px;height:88px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f7f1e6 0%,#d9c8a9 25%,#a8855a 55%,#5a3e22 80%,#2a1d10 100%);box-shadow:0 0 0 2px rgba(212,168,90,0.5),0 0 22px rgba(212,168,90,0.4),0 0 44px rgba(255,217,138,0.25),inset 0 0 20px rgba(0,0,0,0.4);animation:_dai_genSpin 8s linear infinite,_dai_genPulse 2.4s ease-in-out infinite;margin-bottom:20px;}' +
    '@keyframes _dai_genSpin{from{filter:hue-rotate(0deg);}to{filter:hue-rotate(360deg);}}' +
    '@keyframes _dai_genPulse{0%,100%{box-shadow:0 0 0 2px rgba(212,168,90,0.5),0 0 22px rgba(212,168,90,0.4),0 0 44px rgba(255,217,138,0.25),inset 0 0 20px rgba(0,0,0,0.4);}50%{box-shadow:0 0 0 2px rgba(212,168,90,0.8),0 0 34px rgba(212,168,90,0.6),0 0 70px rgba(255,217,138,0.4),inset 0 0 20px rgba(0,0,0,0.4);}}' +
    '._dai_progress{width:100%;max-width:320px;height:3px;background:rgba(20,25,40,0.06);border-radius:999px;overflow:hidden;margin-bottom:14px;}' +
    '._dai_progress_bar{height:100%;width:0%;background:linear-gradient(90deg,#d4a85a,#ffd98a);transition:width .5s ease;box-shadow:0 0 10px rgba(212,168,90,0.5);}' +
    '._dai_stage{color:#0e1116;font-size:12px;font-weight:700;min-height:18px;letter-spacing:.02em;text-transform:uppercase;}' +
    '._dai_stage_hint{color:rgba(14,17,22,0.4);font-size:9px;margin-top:5px;font-family:"JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;}' +
    '._dai_tip{margin-top:18px;max-width:380px;width:100%;padding:14px 16px;background:linear-gradient(135deg,rgba(212,168,90,0.06),rgba(255,217,138,0.04));border:1px solid rgba(212,168,90,0.18);border-radius:12px;text-align:center;transition:opacity .5s ease;}' +
    '._dai_tip_label{font-family:"JetBrains Mono",monospace;font-size:9px;color:#a8854a;letter-spacing:.18em;text-transform:uppercase;margin-bottom:6px;font-weight:600;}' +
    '._dai_tip_text{font-size:12px;color:rgba(14,17,22,0.78);line-height:1.5;font-weight:500;}' +
    '._dai_error{margin-top:14px;padding:12px 14px;background:rgba(220,80,80,0.06);border:1px solid rgba(220,80,80,0.2);color:#a83232;border-radius:10px;font-size:11px;text-align:center;}' +

    /* ===== Step 4: result ===== */
    '._dai_result_grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}' +
    '@media (max-width:520px){._dai_result_grid{grid-template-columns:1fr;}}' +
    '._dai_result_box{border:1px solid rgba(20,25,40,0.08);border-radius:12px;overflow:hidden;background:#fafaf8;position:relative;}' +
    '._dai_result_box._dai_after{border-color:rgba(212,168,90,0.5);box-shadow:0 0 0 1px rgba(212,168,90,0.35),0 8px 22px -10px rgba(212,168,90,0.3);}' +
    '._dai_result_box img{display:block;width:100%;max-height:280px;object-fit:contain;}' +
    '._dai_result_cap{padding:9px 12px;font-size:9px;color:rgba(14,17,22,0.65);border-top:1px solid rgba(20,25,40,0.06);text-align:center;font-family:"JetBrains Mono",monospace;letter-spacing:.18em;text-transform:uppercase;}' +
    '._dai_result_cap._dai_gold{color:#a8854a;font-weight:600;}' +
    '._dai_meta{margin-top:12px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;color:rgba(14,17,22,0.55);font-size:10px;font-family:"JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;background:rgba(20,25,40,0.02);border:1px solid rgba(20,25,40,0.06);border-radius:10px;}' +
    '._dai_meta b{color:#0e1116;font-weight:600;}' +
    '._dai_result_actions{display:flex;justify-content:center;margin-top:14px;gap:8px;flex-wrap:wrap;}' +
    '';

    try {
      var style = document.createElement('style');
      style.id = '_dai_styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    } catch (e) {}

    // ---------- state ----------
    var state = {
      step: 1,
      selectedMaterial: null,
      clientImageBase64: null,
      clientImageMime: null,
      clientImageDataUrl: null,
      clientImageWidth: 0,
      clientImageHeight: 0,
      resultDataUrl: null,
      generationTimeMs: 0
    };

    // ---------- helpers ----------
    function el(tag, props, children) {
      var e = document.createElement(tag);
      if (props) {
        for (var k in props) {
          if (k === 'class') e.className = props[k];
          else if (k === 'style') e.style.cssText = props[k];
          else if (k === 'html') e.innerHTML = props[k];
          else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), props[k]);
          else e.setAttribute(k, props[k]);
        }
      }
      if (children) {
        if (!Array.isArray(children)) children = [children];
        for (var i = 0; i < children.length; i++) {
          var c = children[i];
          if (c == null) continue;
          e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        }
      }
      return e;
    }

    function loadHeic2any() {
      return new Promise(function (resolve, reject) {
        if (window.heic2any) return resolve(window.heic2any);
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
        s.onload = function () { resolve(window.heic2any); };
        s.onerror = function () { reject(new Error('Не удалось загрузить конвертер HEIC')); };
        document.head.appendChild(s);
      });
    }

    function maybeConvertHeic(file) {
      var isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name || '');
      if (!isHeic) return Promise.resolve(file);
      return loadHeic2any().then(function (heic2any) {
        return heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      }).then(function (blob) {
        var out = Array.isArray(blob) ? blob[0] : blob;
        return new File([out], (file.name || 'photo').replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      });
    }

    function fileToBase64(file) {
      return maybeConvertHeic(file).then(function (converted) {
        return new Promise(function (resolve, reject) {
          var r = new FileReader();
          r.onload = function () {
            var s = r.result || '';
            var img = new Image();
            img.onload = function () {
              var maxDim = 1024;
              var w = img.width, h = img.height;
              if (w > maxDim || h > maxDim) {
                var ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
              }
              var canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              var outMime = 'image/jpeg';
              var outUrl = canvas.toDataURL(outMime, 0.82);
              var m = /^data:([^;]+);base64,(.*)$/.exec(outUrl);
              if (!m) return reject(new Error('Canvas encode failed'));
              resolve({ dataUrl: outUrl, mime: m[1], base64: m[2], width: w, height: h });
            };
            img.onerror = function () { reject(new Error('Image decode failed')); };
            img.src = s;
          };
          r.onerror = function () { reject(new Error('Read error')); };
          r.readAsDataURL(converted);
        });
      });
    }

    // ---------- Three.js Morphing Orb (light theme) ----------
    function initOrb(canvas) {
      var THREE = window.THREE;
      if (!THREE || !canvas) return null;

      var W = canvas.clientWidth;
      var H = canvas.clientHeight;
      var DPR = Math.min(window.devicePixelRatio || 1, 2);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(DPR);
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
      camera.position.set(0, 0, 3.2);

      var vertexShader = [
        'varying vec3 vN;',
        'varying vec3 vPos;',
        'varying vec3 vViewDir;',
        'void main(){',
        '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
        '  vPos = position;',
        '  vN = normalize(normalMatrix * normal);',
        '  vViewDir = normalize(-mv.xyz);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n');

      var fragmentShader = [
        'precision highp float;',
        'varying vec3 vN; varying vec3 vPos; varying vec3 vViewDir;',
        'uniform float uTime; uniform vec4 uMix; uniform float uHover; uniform vec3 uRim;',
        'float hash(vec3 p){p=fract(p*vec3(443.8975,397.2973,491.1871));p+=dot(p,p.yzx+19.19);return fract((p.x+p.y)*p.z);}',
        'float vnoise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);',
        ' float n000=hash(i),n100=hash(i+vec3(1,0,0)),n010=hash(i+vec3(0,1,0)),n110=hash(i+vec3(1,1,0));',
        ' float n001=hash(i+vec3(0,0,1)),n101=hash(i+vec3(1,0,1)),n011=hash(i+vec3(0,1,1)),n111=hash(i+vec3(1,1,1));',
        ' return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);}',
        'float fbm(vec3 p){float a=0.5,s=0.0;for(int i=0;i<5;i++){s+=a*vnoise(p);p*=2.02;a*=0.5;}return s;}',
        'vec3 marble(vec3 p){float v=fbm(p*2.2);float sw=sin((p.x+p.y*0.7)*4.0+v*6.0);float m=smoothstep(0.35,0.75,sw*0.5+0.5+v*0.3);vec3 b=mix(vec3(0.97,0.95,0.90),vec3(0.82,0.79,0.72),m);float ve=smoothstep(0.45,0.5,abs(sw*0.5+v*0.4-0.5));return mix(b,vec3(0.45,0.42,0.36),1.0-ve);}',
        'vec3 wood(vec3 p){float r=fbm(p*1.4)*6.0+length(p.xy)*10.0;float g=sin(r)*0.5+0.5;g=mix(g,fbm(p*14.0),0.3);vec3 w=mix(vec3(0.92,0.72,0.46),vec3(0.55,0.34,0.18),g);float st=smoothstep(0.55,0.6,fbm(p*vec3(30.0,3.0,3.0)));return mix(w,w*0.7,st*0.6);}',
        'vec3 brick(vec3 p){vec2 uv=vec2(atan(p.z,p.x),p.y*1.8);uv.x*=4.0;float row=floor(uv.y);uv.x+=mod(row,2.0)*0.5;vec2 f=fract(uv);vec2 e=smoothstep(vec2(0.0),vec2(0.05),f)*smoothstep(vec2(0.0),vec2(0.05),1.0-f);float mt=e.x*e.y;float n=fbm(p*8.0);vec3 bc=mix(vec3(0.65,0.32,0.24),vec3(0.85,0.50,0.38),n);bc=mix(bc,bc*0.65,smoothstep(0.4,0.7,fbm(p*3.0)));return mix(vec3(0.32,0.27,0.22),bc,mt);}',
        'vec3 stone(vec3 p){float n=fbm(p*3.5);float br=sin(p.y*120.0+n*6.0)*0.5+0.5;vec3 c=mix(vec3(0.78,0.74,0.68),vec3(0.92,0.88,0.80),br*0.4+n*0.3);c+=vec3(0.05,0.03,0.01)*smoothstep(0.6,0.9,n);return c;}',
        'void main(){',
        ' vec3 N=normalize(vN); vec3 V=normalize(vViewDir);',
        ' vec3 sp=vPos; float a=uTime*0.08; mat2 R=mat2(cos(a),-sin(a),sin(a),cos(a)); sp.xz=R*sp.xz;',
        ' vec3 cM=marble(sp); vec3 cW=wood(sp+vec3(2.3)); vec3 cB=brick(sp+vec3(5.7)); vec3 cK=stone(sp+vec3(9.1));',
        ' vec4 w=uMix; float s=max(w.x+w.y+w.z+w.w,0.0001); w/=s;',
        ' vec3 albedo=cM*w.x+cW*w.y+cB*w.z+cK*w.w;',
        ' float rough=0.25*w.x+0.55*w.y+0.85*w.z+0.40*w.w;',
        ' vec3 L1=normalize(vec3(0.6,0.8,0.7)); vec3 L2=normalize(vec3(-0.7,0.2,-0.5));',
        ' float d1=max(dot(N,L1),0.0); float d2=max(dot(N,L2),0.0)*0.4;',
        ' vec3 col1=vec3(1.0,0.95,0.85); vec3 col2=vec3(0.9,0.85,0.75);',
        ' vec3 diffuse=albedo*(d1*col1+d2*col2+0.28);',
        ' vec3 H=normalize(L1+V); float spec=pow(max(dot(N,H),0.0),mix(90.0,12.0,rough)); spec*=mix(0.9,0.15,rough);',
        ' diffuse+=spec*col1;',
        ' float fres=pow(1.0-max(dot(N,V),0.0),2.4); float pulse=0.75+0.25*sin(uTime*1.8);',
        ' vec3 rim=uRim*fres*(1.2+uHover*0.8)*pulse;',
        ' vec3 color=diffuse+rim;',
        ' float vg=smoothstep(1.3,0.3,length(vPos)); color*=mix(0.9,1.05,vg);',
        ' color=pow(color,vec3(1.0/2.2));',
        ' gl_FragColor=vec4(color,1.0);',
        '}'
      ].join('\n');

      var uniforms = {
        uTime:  { value: 0 },
        uMix:   { value: new THREE.Vector4(1, 0, 0, 0) },
        uHover: { value: 0 },
        uRim:   { value: new THREE.Color(0xffd98a) }
      };

      var geo = new THREE.SphereGeometry(1, 96, 96);
      var mat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms });
      var orb = new THREE.Mesh(geo, mat);
      scene.add(orb);

      var current = 0, target = 1, blendT = 0, hold = 0;
      var hoverT = 0, hoverTarget = 0;

      var clock = new THREE.Clock();
      function animate() {
        var dt = clock.getDelta();
        uniforms.uTime.value = clock.elapsedTime;
        hoverT += (hoverTarget - hoverT) * Math.min(1, dt * 6);
        uniforms.uHover.value = hoverT;
        orb.rotation.y += dt * (0.35 + hoverT * 0.9);
        orb.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.12;

        hold += dt;
        if (hold > 2.2 && blendT >= 1) {
          current = target; target = (target + 1) % 4; blendT = 0; hold = 0;
        }
        var speed = 0.22 * (1 + hoverT * 1.8);
        blendT = Math.min(1, blendT + dt * speed);
        var ease = blendT < 0.5 ? 2 * blendT * blendT : 1 - Math.pow(-2 * blendT + 2, 2) / 2;
        var ws = [0, 0, 0, 0]; ws[current] = 1 - ease; ws[target] = ease;
        uniforms.uMix.value.set(ws[0], ws[1], ws[2], ws[3]);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();

      return {
        setHover: function (v) { hoverTarget = v ? 1 : 0; },
        squish: function () { orb.scale.setScalar(0.9); setTimeout(function () { orb.scale.setScalar(1); }, 160); }
      };
    }

    // ---------- FAB ----------
    var fab, orbCanvas, orbHandle, fabCollapseTimer, isFabExpanded = false;
    function buildFab() {
      orbCanvas = el('canvas', { class: '_dai_orb_canvas', width: 260, height: 260 });
      var ring = el('span', { class: '_dai_orb_ring' });
      var fallback = el('span', { class: '_dai_orb_fallback' });

      var iconSvg = '<svg viewBox="0 0 24 24"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/><path d="M18.5 6.2l.8-1.6M20.8 8l1.6-.8"/></svg>';

      fab = el('button', { class: '_dai_root _dai_fab', 'aria-label': 'Примерьте фасад по фото' }, [
        ring,
        fallback,
        orbCanvas,
        el('div', { class: '_dai_fab_text' }, [
          el('span', { class: '_dai_fab_title', html: 'Примерьте<br>фасад по фото' }),
          el('span', { class: '_dai_fab_sub' }, 'Весь каталог на Вашем помещении')
        ]),
        el('div', { class: '_dai_fab_icon', html: iconSvg })
      ]);

      function autoExpand() {
        if (!isFabExpanded) {
          isFabExpanded = true;
          fab.classList.add('_dai_expanded');
          if (orbHandle) orbHandle.squish();
        }
        clearTimeout(fabCollapseTimer);
        fabCollapseTimer = setTimeout(autoCollapse, 5000);
      }
      function autoCollapse() {
        if (isFabExpanded) {
          isFabExpanded = false;
          fab.classList.remove('_dai_expanded');
        }
        clearTimeout(fabCollapseTimer);
        fabCollapseTimer = setTimeout(autoExpand, 5000);
      }

      function toggleFab(e) {
        e.stopPropagation();
        clearTimeout(fabCollapseTimer);
        isFabExpanded = !isFabExpanded;
        fab.classList.toggle('_dai_expanded', isFabExpanded);
        if (orbHandle) orbHandle.squish();
        fabCollapseTimer = setTimeout(isFabExpanded ? autoCollapse : autoExpand, 5000);
      }
      orbCanvas.addEventListener('click', toggleFab);
      fallback.addEventListener('click', toggleFab);

      fab.addEventListener('click', function (e) {
        if (e.target === orbCanvas || e.target === fallback) return;
        if (!isFabExpanded) return;
        openModal();
      });

      fab.addEventListener('mouseenter', function () { if (orbHandle) orbHandle.setHover(true); });
      fab.addEventListener('mouseleave', function () { if (orbHandle) orbHandle.setHover(false); });

      document.body.appendChild(fab);

      loadThree().then(function (THREE) {
        if (THREE) {
          orbHandle = initOrb(orbCanvas);
          if (orbHandle) fallback.style.display = 'none';
        }
      });

      // Looping cycle: 3s spin → expand → 5s open → collapse → 5s closed → expand → ...
      fabCollapseTimer = setTimeout(autoExpand, 3000);
    }

    // ---------- Modal ----------
    var overlay, modal, bodyEl, dotsEl, footerEl, backBtn, nextBtn;
    function buildModal() {
      overlay = el('div', { class: '_dai_root _dai_overlay', onclick: function (e) { if (e.target === overlay) closeModal(); } });
      dotsEl = el('div', { class: '_dai_dots' });
      for (var i = 0; i < 4; i++) dotsEl.appendChild(el('div', { class: '_dai_dot' }));

      var header = el('div', { class: '_dai_header' }, [
        el('span', { class: '_dai_h_icon' }),
        el('span', { class: '_dai_h_title' }, COMPANY),
        dotsEl,
        el('button', { class: '_dai_close', 'aria-label': 'Закрыть', onclick: closeModal, html: '&#10005;' })
      ]);

      bodyEl = el('div', { class: '_dai_body' });

      backBtn = el('button', { class: '_dai_btn _dai_btn_ghost', onclick: onBack }, '← Назад');
      nextBtn = el('button', { class: '_dai_btn _dai_btn_gold', onclick: onNext }, 'Далее →');
      footerEl = el('div', { class: '_dai_footer' }, [backBtn, nextBtn]);

      modal = el('div', { class: '_dai_modal', onclick: function (e) { e.stopPropagation(); } }, [header, bodyEl, footerEl]);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    function openModal() {
      state.step = 1;
      render();
      requestAnimationFrame(function () { overlay.classList.add('_dai_open'); });
    }
    function closeModal() {
      overlay.classList.remove('_dai_open');
    }

    function setDots() {
      var dots = dotsEl.children;
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('_dai_active', '_dai_done');
        if (i + 1 < state.step) dots[i].classList.add('_dai_done');
        else if (i + 1 === state.step) dots[i].classList.add('_dai_active');
      }
    }

    function onBack() {
      if (state.step === 1) { closeModal(); return; }
      if (state.step === 4) { state.step = 1; state.clientImageBase64 = null; state.clientImageMime = null; state.clientImageDataUrl = null; state.resultDataUrl = null; render(); return; }
      state.step -= 1;
      render();
    }
    function onNext() {
      if (state.step === 1) {
        if (!state.selectedMaterial) return;
        state.step = 2; render(); return;
      }
      if (state.step === 2) {
        if (!state.clientImageBase64) return;
        state.step = 3; render(); runGeneration(); return;
      }
    }

    function render() {
      bodyEl.innerHTML = '';
      setDots();

      if (state.step === 1) renderStep1();
      else if (state.step === 2) renderStep2();
      else if (state.step === 3) renderStep3();
      else if (state.step === 4) renderStep4();

      if (state.step === 3 || state.step === 4) footerEl.classList.add('_dai_hidden');
      else footerEl.classList.remove('_dai_hidden');

      if (state.step === 1) {
        backBtn.textContent = 'Закрыть';
        nextBtn.textContent = 'Далее →';
        nextBtn.disabled = !state.selectedMaterial;
      } else if (state.step === 2) {
        backBtn.textContent = '← Назад';
        nextBtn.textContent = 'Сгенерировать →';
        nextBtn.disabled = !state.clientImageBase64;
      }
    }

    // ---------- Step 1 ----------
    function renderStep1() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Выберите материал'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Коллекция премиальных отделочных материалов — выберите, что хотите примерить'));

      var grid = el('div', { class: '_dai_grid' });
      MATERIALS.forEach(function (m) {
        var card = el('div', {
          class: '_dai_card' + (state.selectedMaterial && state.selectedMaterial.id === m.id ? ' _dai_selected' : ''),
          onclick: function () {
            state.selectedMaterial = m;
            render();
          }
        }, [
          el('img', { src: m.imageUrl, alt: m.name, loading: 'lazy' }),
          el('div', { class: '_dai_card_name' }, m.name),
          el('div', { class: '_dai_check', html: '&#10003;' })
        ]);
        grid.appendChild(card);
      });
      bodyEl.appendChild(grid);
    }

    // ---------- Step 2 ----------
    function renderStep2() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Загрузите фото'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Снимок фасада или интерьера — ИИ распознает поверхности и наложит выбранный материал'));

      if (state.clientImageDataUrl) {
        var prev = el('div', { class: '_dai_preview' }, [ el('img', { src: state.clientImageDataUrl, alt: 'Превью' }) ]);
        var actions = el('div', { class: '_dai_preview_actions' }, [
          el('button', {
            class: '_dai_btn _dai_btn_ghost',
            onclick: function () {
              state.clientImageBase64 = null; state.clientImageMime = null; state.clientImageDataUrl = null;
              render();
            }
          }, 'Изменить фото')
        ]);
        bodyEl.appendChild(prev);
        bodyEl.appendChild(actions);
        return;
      }

      var fileInput = el('input', { type: 'file', accept: 'image/*,.heic,.heif', style: 'display:none;' });
      fileInput.addEventListener('change', function (e) { handleFile(e.target.files && e.target.files[0]); });
      var camInput = el('input', { type: 'file', accept: 'image/*,.heic,.heif', capture: 'environment', style: 'display:none;' });
      camInput.addEventListener('change', function (e) { handleFile(e.target.files && e.target.files[0]); });

      var dropIcon = '<svg viewBox="0 0 24 24"><path d="M12 16V4M12 4l-5 5M12 4l5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>';

      var drop = el('div', {
        class: '_dai_drop',
        onclick: function () { fileInput.click(); },
        ondragover: function (e) { e.preventDefault(); drop.classList.add('_dai_hover'); },
        ondragleave: function () { drop.classList.remove('_dai_hover'); },
        ondrop: function (e) {
          e.preventDefault(); drop.classList.remove('_dai_hover');
          var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (f) handleFile(f);
        }
      }, [
        el('div', { class: '_dai_drop_icon', html: dropIcon }),
        el('h4', { class: '_dai_drop_title' }, 'Перетащите фото или нажмите для выбора'),
        el('p', { class: '_dai_drop_sub' }, 'JPG · PNG · HEIC · до 10 МБ')
      ]);

      var camRow = el('div', { class: '_dai_cam_row' }, [
        el('button', { class: '_dai_btn _dai_btn_ghost', onclick: function () { fileInput.click(); } }, 'Выбрать файл'),
        el('button', { class: '_dai_btn _dai_btn_gold', onclick: function () { camInput.click(); } }, 'Открыть камеру')
      ]);

      bodyEl.appendChild(drop);
      bodyEl.appendChild(camRow);
      bodyEl.appendChild(fileInput);
      bodyEl.appendChild(camInput);
    }

    function handleFile(file) {
      if (!file) return;
      var isImage = /^image\//i.test(file.type) || /\.(heic|heif|jpe?g|png|webp|gif)$/i.test(file.name || '');
      if (!isImage) return;
      fileToBase64(file).then(function (r) {
        state.clientImageBase64 = r.base64;
        state.clientImageMime = r.mime;
        state.clientImageDataUrl = r.dataUrl;
        state.clientImageWidth = r.width;
        state.clientImageHeight = r.height;
        render();
      }).catch(function (err) {
        alert('Не удалось обработать фото: ' + (err && err.message ? err.message : 'неизвестная ошибка'));
      });
    }

    // ---------- Step 3 ----------
    var STAGES = [
      'Анализ фото',
      'Обработка текстуры',
      'Создание визуализации',
      'Финальная обработка'
    ];

    var TIPS = [
      'Тёплые тона визуально расширяют пространство, холодные — успокаивают и собирают',
      'Гибкий камень тоньше керамической плитки в 5 раз и весит в 3 раза меньше',
      'Мрамор Bianco Carrara использовали ещё в Древнем Риме — в скульптурах Микеланджело',
      'Правило двух фактур: один материал на стенах, другой на полу — и интерьер собирается',
      'Бежевый + тёплый дуб — классическая итальянская гамма, никогда не выйдет из моды',
      'Серый камень + зелень растений — современный скандинавский стиль',
      'Один и тот же материал при тёплом и холодном свете воспринимается на 30–40% иначе',
      'Текстура натурального камня уникальна — двух одинаковых плит не существует',
      'Тёплый красный кирпич идеален для индустриального лофта и винтажных интерьеров',
      'Контрастные материалы создают акценты — главное правило: не более трёх в одной зоне',
      'Аэролит — материал из вулканической пыли, его делают по итальянской технологии',
      'Отделка фасада камнем повышает стоимость дома на 15–25% при перепродаже',
      'Травертин и известняк "дышат" — регулируют влажность лучше синтетики',
      'Для маленькой комнаты выбирайте материал светлее пола — добавит высоты',
      'Получается отлично — ИИ уже видит, как материал ложится на стены...',
      'Ещё немного — финализируем тени и свет, чтобы выглядело реалистично',
      'AI-визуализация ускоряет выбор материала в 10 раз — без выезда дизайнера'
    ];

    var genTimers = [];
    var tipInterval = null;
    function clearGenTimers() {
      genTimers.forEach(function (t) { clearTimeout(t); });
      genTimers = [];
      if (tipInterval) { clearInterval(tipInterval); tipInterval = null; }
    }

    function renderStep3() {
      var wrap = el('div', { class: '_dai_gen' });
      var orbVis = el('div', { class: '_dai_gen_orb' });
      var prog = el('div', { class: '_dai_progress' }, [ el('div', { class: '_dai_progress_bar' }) ]);
      var stage = el('div', { class: '_dai_stage' }, STAGES[0]);
      var hint = el('div', { class: '_dai_stage_hint' }, '20–60 секунд · ИИ работает');

      var tipBox = el('div', { class: '_dai_tip' }, [
        el('div', { class: '_dai_tip_label' }, 'А вы знали?'),
        el('div', { class: '_dai_tip_text' }, TIPS[0])
      ]);

      wrap.appendChild(orbVis);
      wrap.appendChild(prog);
      wrap.appendChild(stage);
      wrap.appendChild(hint);
      wrap.appendChild(tipBox);
      bodyEl.appendChild(wrap);

      state._ui = { progressBar: prog.firstChild, stage: stage, wrap: wrap, tipBox: tipBox };

      var steps = [
        { at: 0, pct: 10, text: STAGES[0] },
        { at: 1500, pct: 35, text: STAGES[1] },
        { at: 3500, pct: 65, text: STAGES[2] },
        { at: 12000, pct: 88, text: STAGES[3] }
      ];
      clearGenTimers();
      steps.forEach(function (s) {
        genTimers.push(setTimeout(function () {
          if (!state._ui) return;
          state._ui.progressBar.style.width = s.pct + '%';
          state._ui.stage.textContent = s.text;
        }, s.at));
      });

      // Rotate tips
      var tipIndex = Math.floor(Math.random() * TIPS.length);
      var tipTextEl = tipBox.querySelector('._dai_tip_text');
      tipTextEl.textContent = TIPS[tipIndex];
      tipInterval = setInterval(function () {
        if (!state._ui || !state._ui.tipBox) return;
        var nextEl = state._ui.tipBox.querySelector('._dai_tip_text');
        if (!nextEl) return;
        nextEl.style.opacity = '0';
        setTimeout(function () {
          tipIndex = (tipIndex + 1) % TIPS.length;
          nextEl.textContent = TIPS[tipIndex];
          nextEl.style.opacity = '1';
        }, 350);
      }, 5500);
    }

    function showGenerationError(msg) {
      clearGenTimers();
      if (!state._ui || !state._ui.wrap) return;
      state._ui.stage.textContent = 'Не удалось сгенерировать';
      state._ui.progressBar.style.width = '100%';
      state._ui.progressBar.style.background = '#a94444';
      var errBox = el('div', { class: '_dai_error' }, msg || 'Неизвестная ошибка');
      var actions = el('div', { class: '_dai_result_actions' }, [
        el('button', { class: '_dai_btn _dai_btn_ghost', onclick: function () { state.step = 2; render(); } }, '← Назад'),
        el('button', { class: '_dai_btn _dai_btn_gold', onclick: function () { render(); runGeneration(); } }, 'Попробовать снова')
      ]);
      state._ui.wrap.appendChild(errBox);
      state._ui.wrap.appendChild(actions);
    }

    function runGeneration() {
      var started = Date.now();
      var payload = {
        clientImageBase64: state.clientImageBase64,
        clientImageMime: state.clientImageMime,
        clientImageWidth: state.clientImageWidth || 0,
        clientImageHeight: state.clientImageHeight || 0,
        materialImageUrl: state.selectedMaterial.imageUrl,
        materialName: state.selectedMaterial.name
      };
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = setTimeout(function () { if (controller) controller.abort(); }, 600000);

      fetch(SERVER_URL + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (r) {
          clearTimeout(timeoutId);
          if (!r.ok || !r.data || r.data.error || !r.data.resultDataUrl) {
            showGenerationError((r.data && r.data.error) ? r.data.error : 'Ошибка сервера');
            return;
          }
          state.resultDataUrl = r.data.resultDataUrl;
          state.generationTimeMs = r.data.generationTime || (Date.now() - started);
          clearGenTimers();
          if (state._ui) {
            state._ui.progressBar.style.width = '100%';
            state._ui.stage.textContent = 'Готово';
          }
          setTimeout(function () {
            state.step = 4;
            render();
          }, 400);
        })
        .catch(function (err) {
          clearTimeout(timeoutId);
          showGenerationError((err && err.message) ? err.message : 'Сеть недоступна');
        });
    }

    // ---------- Step 4 ----------
    function renderStep4() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Готово'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Сравните оригинал и результат с выбранным материалом'));

      var grid = el('div', { class: '_dai_result_grid' }, [
        el('div', { class: '_dai_result_box' }, [
          el('img', { src: state.clientImageDataUrl, alt: 'Оригинал' }),
          el('div', { class: '_dai_result_cap' }, 'Ваш объект')
        ]),
        el('div', { class: '_dai_result_box _dai_after' }, [
          el('img', { src: state.resultDataUrl, alt: 'Результат' }),
          el('div', { class: '_dai_result_cap _dai_gold' }, '✦ После')
        ])
      ]);
      bodyEl.appendChild(grid);

      var secs = Math.max(1, Math.round((state.generationTimeMs || 0) / 1000));
      var meta = el('div', { class: '_dai_meta' }, [
        el('div', {}, [ document.createTextNode('Материал: '), el('b', {}, state.selectedMaterial.name) ]),
        el('div', {}, [ document.createTextNode('Время: '), el('b', {}, secs + ' с') ])
      ]);
      bodyEl.appendChild(meta);

      var actions = el('div', { class: '_dai_result_actions' }, [
        el('button', {
          class: '_dai_btn _dai_btn_ghost',
          onclick: function () {
            state.step = 1;
            state.clientImageBase64 = null;
            state.clientImageMime = null;
            state.clientImageDataUrl = null;
            state.resultDataUrl = null;
            state.generationTimeMs = 0;
            render();
          }
        }, 'Другой материал'),
        el('button', {
          class: '_dai_btn _dai_btn_gold',
          onclick: closeModal
        }, 'Закрыть')
      ]);
      bodyEl.appendChild(actions);
    }

    // ---------- init ----------
    function init() {
      try {
        buildFab();
        buildModal();
      } catch (e) { console && console.error && console.error('DesignAI init error:', e); }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    try { console.error('DesignAI plugin failed:', e); } catch (_) {}
  }
})();
