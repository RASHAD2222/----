/**
 * Valorant Crosshair Studio - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('crosshairCanvas');
  const codeDisplay = document.getElementById('crosshairCode');
  const copyBtn = document.getElementById('copyCodeBtn');
  const importBtn = document.getElementById('importCodeBtn');
  const importModal = document.getElementById('importModal');
  const importInput = document.getElementById('importInput');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportPngBtn = document.getElementById('exportPngBtn');
  const testFireBtn = document.getElementById('testFireBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const toast = document.getElementById('toast');

  // UI Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Background buttons
  const bgButtons = document.querySelectorAll('.bg-btn');

  // Zoom buttons
  const zoomButtons = document.querySelectorAll('.zoom-btn');

  // Presets container & filters
  const presetsGrid = document.getElementById('presetsGrid');
  const presetCategoryBtns = document.querySelectorAll('.preset-cat-btn');
  const presetSearchInput = document.getElementById('presetSearchInput');

  // Saved crosshairs container & save form
  const savedGrid = document.getElementById('savedGrid');
  const saveNameInput = document.getElementById('saveNameInput');
  const saveCrosshairBtn = document.getElementById('saveCrosshairBtn');
  const noSavedMsg = document.getElementById('noSavedMsg');

  // Initialize Canvas Renderer
  const renderer = new CrosshairRenderer(canvas);
  let currentSettings = cloneSettings(DEFAULT_SETTINGS);

  // Sound Synthesizer (Web Audio API)
  let soundEnabled = true;
  let audioCtx = null;

  function playGunshotSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Synthesize a punchy gunshot sound
      const bufferSize = audioCtx.sampleRate * 0.12;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Decaying noise + crackle
        const decay = Math.exp(-i / (audioCtx.sampleRate * 0.025));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      // Filter for deep thump
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);

      // Gain Envelope
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.65, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message, type = 'success') {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    toastTimer = setTimeout(() => {
      toast.className = 'toast';
    }, 2800);
  }

  // Two-way code generation & updating
  function updateCodeAndRenderer() {
    const code = generateValorantCode(currentSettings);
    codeDisplay.value = code;
    renderer.setSettings(currentSettings);
  }

  // Bind Form Controls to Current Settings
  const formControls = {
    // Color
    colorRadios: document.querySelectorAll('input[name="color"]'),
    customColorInput: document.getElementById('customColorInput'),

    // Outlines
    outlines: document.getElementById('outlinesToggle'),
    outlineOpacity: document.getElementById('outlineOpacity'),
    outlineOpacityVal: document.getElementById('outlineOpacityVal'),
    outlineThickness: document.getElementById('outlineThickness'),
    outlineThicknessVal: document.getElementById('outlineThicknessVal'),

    // Center Dot
    centerDot: document.getElementById('centerDotToggle'),
    centerDotOpacity: document.getElementById('centerDotOpacity'),
    centerDotOpacityVal: document.getElementById('centerDotOpacityVal'),
    centerDotSize: document.getElementById('centerDotSize'),
    centerDotSizeVal: document.getElementById('centerDotSizeVal'),
    overrideFiringError: document.getElementById('overrideFiringError'),

    // Inner Lines
    innerShow: document.getElementById('innerShowToggle'),
    innerOpacity: document.getElementById('innerOpacity'),
    innerOpacityVal: document.getElementById('innerOpacityVal'),
    innerLength: document.getElementById('innerLength'),
    innerLengthVal: document.getElementById('innerLengthVal'),
    innerVerticalLength: document.getElementById('innerVerticalLength'),
    innerVerticalLengthVal: document.getElementById('innerVerticalLengthVal'),
    innerSeparateLengths: document.getElementById('innerSeparateLengths'),
    innerVerticalGroup: document.getElementById('innerVerticalGroup'),
    innerThickness: document.getElementById('innerThickness'),
    innerThicknessVal: document.getElementById('innerThicknessVal'),
    innerOffset: document.getElementById('innerOffset'),
    innerOffsetVal: document.getElementById('innerOffsetVal'),
    innerFiringError: document.getElementById('innerFiringError'),
    innerMovementError: document.getElementById('innerMovementError'),

    // Outer Lines
    outerShow: document.getElementById('outerShowToggle'),
    outerOpacity: document.getElementById('outerOpacity'),
    outerOpacityVal: document.getElementById('outerOpacityVal'),
    outerLength: document.getElementById('outerLength'),
    outerLengthVal: document.getElementById('outerLengthVal'),
    outerVerticalLength: document.getElementById('outerVerticalLength'),
    outerVerticalLengthVal: document.getElementById('outerVerticalLengthVal'),
    outerSeparateLengths: document.getElementById('outerSeparateLengths'),
    outerVerticalGroup: document.getElementById('outerVerticalGroup'),
    outerThickness: document.getElementById('outerThickness'),
    outerThicknessVal: document.getElementById('outerThicknessVal'),
    outerOffset: document.getElementById('outerOffset'),
    outerOffsetVal: document.getElementById('outerOffsetVal'),
    outerFiringError: document.getElementById('outerFiringError'),
    outerMovementError: document.getElementById('outerMovementError')
  };

  // Sync state to UI controls
  function syncStateToUI(s) {
    // Color
    let matchedColor = false;
    formControls.colorRadios.forEach(radio => {
      const isMatch = parseInt(radio.value, 10) === s.color;
      radio.checked = isMatch;
      if (isMatch) matchedColor = true;
    });

    if (s.color === 8 || !matchedColor) {
      const customRadio = document.getElementById('colorCustom');
      if (customRadio) customRadio.checked = true;
      formControls.customColorInput.value = s.customColor || '#00ffaa';
      formControls.customColorInput.parentElement.classList.remove('hidden');
    } else {
      formControls.customColorInput.parentElement.classList.add('hidden');
    }

    // Outlines
    formControls.outlines.checked = s.outlines;
    formControls.outlineOpacity.value = s.outlineOpacity;
    formControls.outlineOpacityVal.textContent = Number(s.outlineOpacity).toFixed(2);
    formControls.outlineThickness.value = s.outlineThickness;
    formControls.outlineThicknessVal.textContent = s.outlineThickness;

    // Center Dot
    formControls.centerDot.checked = s.centerDot;
    formControls.centerDotOpacity.value = s.centerDotOpacity;
    formControls.centerDotOpacityVal.textContent = Number(s.centerDotOpacity).toFixed(2);
    formControls.centerDotSize.value = s.centerDotSize;
    formControls.centerDotSizeVal.textContent = s.centerDotSize;
    formControls.overrideFiringError.checked = s.overrideFiringError;

    // Inner Lines
    formControls.innerShow.checked = s.innerLines.show;
    formControls.innerOpacity.value = s.innerLines.opacity;
    formControls.innerOpacityVal.textContent = Number(s.innerLines.opacity).toFixed(2);
    formControls.innerLength.value = s.innerLines.length;
    formControls.innerLengthVal.textContent = s.innerLines.length;
    formControls.innerVerticalLength.value = s.innerLines.verticalLength;
    formControls.innerVerticalLengthVal.textContent = s.innerLines.verticalLength;
    formControls.innerSeparateLengths.checked = s.innerLines.separateLengths;
    if (s.innerLines.separateLengths) {
      formControls.innerVerticalGroup.classList.remove('hidden');
    } else {
      formControls.innerVerticalGroup.classList.add('hidden');
    }
    formControls.innerThickness.value = s.innerLines.thickness;
    formControls.innerThicknessVal.textContent = s.innerLines.thickness;
    formControls.innerOffset.value = s.innerLines.offset;
    formControls.innerOffsetVal.textContent = s.innerLines.offset;
    formControls.innerFiringError.checked = s.innerLines.firingError;
    formControls.innerMovementError.checked = s.innerLines.movementError;

    // Outer Lines
    formControls.outerShow.checked = s.outerLines.show;
    formControls.outerOpacity.value = s.outerLines.opacity;
    formControls.outerOpacityVal.textContent = Number(s.outerLines.opacity).toFixed(2);
    formControls.outerLength.value = s.outerLines.length;
    formControls.outerLengthVal.textContent = s.outerLines.length;
    formControls.outerVerticalLength.value = s.outerLines.verticalLength;
    formControls.outerVerticalLengthVal.textContent = s.outerLines.verticalLength;
    formControls.outerSeparateLengths.checked = s.outerLines.separateLengths;
    if (s.outerLines.separateLengths) {
      formControls.outerVerticalGroup.classList.remove('hidden');
    } else {
      formControls.outerVerticalGroup.classList.add('hidden');
    }
    formControls.outerThickness.value = s.outerLines.thickness;
    formControls.outerThicknessVal.textContent = s.outerLines.thickness;
    formControls.outerOffset.value = s.outerLines.offset;
    formControls.outerOffsetVal.textContent = s.outerLines.offset;
    formControls.outerFiringError.checked = s.outerLines.firingError;
    formControls.outerMovementError.checked = s.outerLines.movementError;

    updateCodeAndRenderer();
  }

  // Setup Event Listeners on Form Controls
  // Color selection
  formControls.colorRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      currentSettings.color = val;
      if (val === 8) {
        formControls.customColorInput.parentElement.classList.remove('hidden');
        currentSettings.customColor = formControls.customColorInput.value;
      } else {
        formControls.customColorInput.parentElement.classList.add('hidden');
      }
      updateCodeAndRenderer();
    });
  });

  formControls.customColorInput.addEventListener('input', (e) => {
    currentSettings.color = 8;
    currentSettings.customColor = e.target.value;
    updateCodeAndRenderer();
  });

  // Outlines
  formControls.outlines.addEventListener('change', (e) => {
    currentSettings.outlines = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.outlineOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentSettings.outlineOpacity = val;
    formControls.outlineOpacityVal.textContent = val.toFixed(2);
    updateCodeAndRenderer();
  });
  formControls.outlineThickness.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.outlineThickness = val;
    formControls.outlineThicknessVal.textContent = val;
    updateCodeAndRenderer();
  });

  // Center Dot
  formControls.centerDot.addEventListener('change', (e) => {
    currentSettings.centerDot = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.centerDotOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentSettings.centerDotOpacity = val;
    formControls.centerDotOpacityVal.textContent = val.toFixed(2);
    updateCodeAndRenderer();
  });
  formControls.centerDotSize.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.centerDotSize = val;
    formControls.centerDotSizeVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.overrideFiringError.addEventListener('change', (e) => {
    currentSettings.overrideFiringError = e.target.checked;
    updateCodeAndRenderer();
  });

  // Inner Lines
  formControls.innerShow.addEventListener('change', (e) => {
    currentSettings.innerLines.show = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.innerOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentSettings.innerLines.opacity = val;
    formControls.innerOpacityVal.textContent = val.toFixed(2);
    updateCodeAndRenderer();
  });
  formControls.innerLength.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.innerLines.length = val;
    if (!currentSettings.innerLines.separateLengths) {
      currentSettings.innerLines.verticalLength = val;
      formControls.innerVerticalLength.value = val;
      formControls.innerVerticalLengthVal.textContent = val;
    }
    formControls.innerLengthVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.innerVerticalLength.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.innerLines.verticalLength = val;
    formControls.innerVerticalLengthVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.innerSeparateLengths.addEventListener('change', (e) => {
    currentSettings.innerLines.separateLengths = e.target.checked;
    if (e.target.checked) {
      formControls.innerVerticalGroup.classList.remove('hidden');
    } else {
      formControls.innerVerticalGroup.classList.add('hidden');
      currentSettings.innerLines.verticalLength = currentSettings.innerLines.length;
      formControls.innerVerticalLength.value = currentSettings.innerLines.length;
      formControls.innerVerticalLengthVal.textContent = currentSettings.innerLines.length;
    }
    updateCodeAndRenderer();
  });
  formControls.innerThickness.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.innerLines.thickness = val;
    formControls.innerThicknessVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.innerOffset.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.innerLines.offset = val;
    formControls.innerOffsetVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.innerFiringError.addEventListener('change', (e) => {
    currentSettings.innerLines.firingError = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.innerMovementError.addEventListener('change', (e) => {
    currentSettings.innerLines.movementError = e.target.checked;
    updateCodeAndRenderer();
  });

  // Outer Lines
  formControls.outerShow.addEventListener('change', (e) => {
    currentSettings.outerLines.show = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.outerOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentSettings.outerLines.opacity = val;
    formControls.outerOpacityVal.textContent = val.toFixed(2);
    updateCodeAndRenderer();
  });
  formControls.outerLength.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.outerLines.length = val;
    if (!currentSettings.outerLines.separateLengths) {
      currentSettings.outerLines.verticalLength = val;
      formControls.outerVerticalLength.value = val;
      formControls.outerVerticalLengthVal.textContent = val;
    }
    formControls.outerLengthVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.outerVerticalLength.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.outerLines.verticalLength = val;
    formControls.outerVerticalLengthVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.outerSeparateLengths.addEventListener('change', (e) => {
    currentSettings.outerLines.separateLengths = e.target.checked;
    if (e.target.checked) {
      formControls.outerVerticalGroup.classList.remove('hidden');
    } else {
      formControls.outerVerticalGroup.classList.add('hidden');
      currentSettings.outerLines.verticalLength = currentSettings.outerLines.length;
      formControls.outerVerticalLength.value = currentSettings.outerLines.length;
      formControls.outerVerticalLengthVal.textContent = currentSettings.outerLines.length;
    }
    updateCodeAndRenderer();
  });
  formControls.outerThickness.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.outerLines.thickness = val;
    formControls.outerThicknessVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.outerOffset.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSettings.outerLines.offset = val;
    formControls.outerOffsetVal.textContent = val;
    updateCodeAndRenderer();
  });
  formControls.outerFiringError.addEventListener('change', (e) => {
    currentSettings.outerLines.firingError = e.target.checked;
    updateCodeAndRenderer();
  });
  formControls.outerMovementError.addEventListener('change', (e) => {
    currentSettings.outerLines.movementError = e.target.checked;
    updateCodeAndRenderer();
  });

  // Action Buttons
  // 1. Copy Code
  copyBtn.addEventListener('click', () => {
    const code = codeDisplay.value;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      showToast('✓ تم نسخ كود الكروس هير للحافظة! الصقه مباشرة في فالورانت');
    }).catch(() => {
      codeDisplay.select();
      document.execCommand('copy');
      showToast('✓ تم نسخ الكود بنجاح!');
    });
  });

  // 2. Import Code Modal
  importBtn.addEventListener('click', () => {
    importModal.classList.add('active');
    importInput.value = '';
    importInput.focus();
  });

  cancelImportBtn.addEventListener('click', () => {
    importModal.classList.remove('active');
  });

  importModal.addEventListener('click', (e) => {
    if (e.target === importModal) {
      importModal.classList.remove('active');
    }
  });

  confirmImportBtn.addEventListener('click', () => {
    const rawCode = importInput.value.trim();
    if (!rawCode) {
      showToast('يرجى لصق كود فالورانت صالح أولاً', 'error');
      return;
    }

    try {
      const parsed = parseValorantCode(rawCode);
      currentSettings = parsed;
      syncStateToUI(currentSettings);
      importModal.classList.remove('active');
      showToast('✓ تم استيراد وتحليل كود الكروس هير بنجاح!');
    } catch (err) {
      showToast('تعذر استيراد الكود! تأكد من صحة الصيغة', 'error');
    }
  });

  // 3. Reset to Default
  resetBtn.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية؟')) {
      currentSettings = cloneSettings(DEFAULT_SETTINGS);
      syncStateToUI(currentSettings);
      showToast('تمت استعادة الإعدادات الافتراضية بنجاح');
    }
  });

  // 4. Export PNG
  exportPngBtn.addEventListener('click', () => {
    // Render on transparent high-res canvas (512x512 with 4x scale)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 512;
    exportCanvas.height = 512;
    const eCtx = exportCanvas.getContext('2d');
    eCtx.clearRect(0, 0, 512, 512);

    CrosshairRenderer.drawCrosshair(eCtx, 256, 256, currentSettings, 4, 0);

    const link = document.createElement('a');
    link.download = `valorant_crosshair_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('✓ تم تصدير وتحميل صورة الكروس هير (PNG شفاف)');
  });

  // 5. Test Fire
  function triggerFire() {
    renderer.triggerShoot();
    playGunshotSound();
  }

  testFireBtn.addEventListener('click', triggerFire);
  canvas.addEventListener('click', triggerFire);

  // Spacebar test fire when not typing in text fields
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      triggerFire();
    }
  });

  // Sound toggle
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.classList.toggle('active', soundEnabled);
    soundToggleBtn.setAttribute('title', soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت');
    showToast(soundEnabled ? 'تم تفعيل صوت إطلاق النار' : 'تم كتم الصوت');
  });

  // Background Selection
  bgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bgButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const bg = btn.dataset.bg;
      renderer.setBackground(bg);
    });
  });

  // Zoom Selection
  zoomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      zoomButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const zoom = parseInt(btn.dataset.zoom, 10);
      renderer.setZoom(zoom);
    });
  });

  // Tabs Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.dataset.tab;
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // If switching to presets tab, ensure cards rendered
      if (targetTab === 'presetsTab') {
        renderPresets(currentPresetCategory, presetSearchInput.value);
      } else if (targetTab === 'savedTab') {
        renderSavedCrosshairs();
      }
    });
  });

  // ================= PRESETS LOGIC =================
  let currentPresetCategory = 'all';

  function renderPresets(category = 'all', searchQuery = '') {
    presetsGrid.innerHTML = '';
    const query = searchQuery.trim().toLowerCase();

    const filtered = PRESETS_DATA.filter(preset => {
      const matchesCat = (category === 'all' || preset.category === category);
      const matchesQuery = !query ||
        preset.name.toLowerCase().includes(query) ||
        preset.description.toLowerCase().includes(query) ||
        (preset.tags && preset.tags.some(t => t.toLowerCase().includes(query)));
      return matchesCat && matchesQuery;
    });

    if (filtered.length === 0) {
      presetsGrid.innerHTML = `<div class="empty-state">لم يتم العثور على أي كروس هير يطابق بحثك.</div>`;
      return;
    }

    filtered.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';

      // Mini Canvas
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      miniCanvas.className = 'preset-canvas';

      const pCtx = miniCanvas.getContext('2d');
      // Draw dark background
      pCtx.fillStyle = '#121820';
      pCtx.fillRect(0, 0, 120, 120);

      // Sub-grid
      pCtx.strokeStyle = 'rgba(255,255,255,0.05)';
      pCtx.lineWidth = 1;
      pCtx.beginPath();
      pCtx.moveTo(60, 0); pCtx.lineTo(60, 120);
      pCtx.moveTo(0, 60); pCtx.lineTo(120, 60);
      pCtx.stroke();

      const parsedSettings = parseValorantCode(preset.code);
      CrosshairRenderer.drawCrosshair(pCtx, 60, 60, parsedSettings, 2, 0);

      // Card Content
      const info = document.createElement('div');
      info.className = 'preset-info';

      const title = document.createElement('h3');
      title.className = 'preset-title';
      title.textContent = preset.name;

      const desc = document.createElement('p');
      desc.className = 'preset-desc';
      desc.textContent = preset.description;

      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'preset-tags';
      if (preset.tags) {
        preset.tags.forEach(t => {
          const tag = document.createElement('span');
          tag.className = 'preset-tag';
          tag.textContent = t;
          tagsWrap.appendChild(tag);
        });
      }

      // Actions
      const actions = document.createElement('div');
      actions.className = 'preset-actions';

      const applyBtn = document.createElement('button');
      applyBtn.className = 'btn btn-primary btn-sm';
      applyBtn.innerHTML = '⚡ تطبيق';
      applyBtn.addEventListener('click', () => {
        currentSettings = cloneSettings(parsedSettings);
        syncStateToUI(currentSettings);
        // Switch to editor tab
        document.querySelector('[data-tab="designerTab"]').click();
        showToast(`✓ تم تطبيق كروس هير: ${preset.name}`);
      });

      const copyPBtn = document.createElement('button');
      copyPBtn.className = 'btn btn-secondary btn-sm';
      copyPBtn.innerHTML = '📋 نسخ الكود';
      copyPBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(preset.code).then(() => {
          showToast(`✓ تم نسخ كود ${preset.name} للحافظة!`);
        });
      });

      actions.appendChild(applyBtn);
      actions.appendChild(copyPBtn);

      info.appendChild(title);
      info.appendChild(desc);
      info.appendChild(tagsWrap);
      info.appendChild(actions);

      card.appendChild(miniCanvas);
      card.appendChild(info);

      presetsGrid.appendChild(card);
    });
  }

  // Preset Filters
  presetCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetCategoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPresetCategory = btn.dataset.category;
      renderPresets(currentPresetCategory, presetSearchInput.value);
    });
  });

  presetSearchInput.addEventListener('input', (e) => {
    renderPresets(currentPresetCategory, e.target.value);
  });

  // ================= SAVED CROSSHAIRS LOGIC =================
  const STORAGE_KEY = 'val_saved_crosshairs';

  function getSavedCrosshairs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCrosshairsToStorage(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }

  function renderSavedCrosshairs() {
    savedGrid.innerHTML = '';
    const list = getSavedCrosshairs();

    if (list.length === 0) {
      noSavedMsg.classList.remove('hidden');
      return;
    }
    noSavedMsg.classList.add('hidden');

    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'preset-card';

      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      miniCanvas.className = 'preset-canvas';

      const pCtx = miniCanvas.getContext('2d');
      pCtx.fillStyle = '#121820';
      pCtx.fillRect(0, 0, 120, 120);

      const parsed = parseValorantCode(item.code);
      CrosshairRenderer.drawCrosshair(pCtx, 60, 60, parsed, 2, 0);

      const info = document.createElement('div');
      info.className = 'preset-info';

      const title = document.createElement('h3');
      title.className = 'preset-title';
      title.textContent = item.name;

      const date = document.createElement('p');
      date.className = 'preset-desc';
      date.textContent = new Date(item.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const actions = document.createElement('div');
      actions.className = 'preset-actions';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn btn-primary btn-sm';
      loadBtn.textContent = '⚡ تحميل';
      loadBtn.addEventListener('click', () => {
        currentSettings = cloneSettings(parsed);
        syncStateToUI(currentSettings);
        document.querySelector('[data-tab="designerTab"]').click();
        showToast(`✓ تم تحميل التصميم: ${item.name}`);
      });

      const copySBtn = document.createElement('button');
      copySBtn.className = 'btn btn-secondary btn-sm';
      copySBtn.textContent = '📋 نسخ';
      copySBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.code).then(() => {
          showToast(`✓ تم نسخ كود ${item.name}!`);
        });
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = '🗑 حذف';
      delBtn.addEventListener('click', () => {
        if (confirm(`هل أنت متأكد من حذف التصميم "${item.name}"؟`)) {
          const updated = getSavedCrosshairs();
          updated.splice(index, 1);
          saveCrosshairsToStorage(updated);
          renderSavedCrosshairs();
          showToast('تم حذف الكروس هير بنجاح');
        }
      });

      actions.appendChild(loadBtn);
      actions.appendChild(copySBtn);
      actions.appendChild(delBtn);

      info.appendChild(title);
      info.appendChild(date);
      info.appendChild(actions);

      card.appendChild(miniCanvas);
      card.appendChild(info);

      savedGrid.appendChild(card);
    });
  }

  saveCrosshairBtn.addEventListener('click', () => {
    const name = saveNameInput.value.trim();
    if (!name) {
      showToast('يرجى كتابة اسم للتصميم أولاً', 'error');
      saveNameInput.focus();
      return;
    }

    const code = generateValorantCode(currentSettings);
    const list = getSavedCrosshairs();
    list.unshift({
      id: 'saved_' + Date.now(),
      name: name,
      code: code,
      createdAt: Date.now()
    });

    saveCrosshairsToStorage(list);
    saveNameInput.value = '';
    renderSavedCrosshairs();
    showToast(`✓ تم حفظ تصميم "${name}" في قائمتك بنجاح!`);
  });

  // Initial Setup
  syncStateToUI(currentSettings);
  renderPresets();
});
