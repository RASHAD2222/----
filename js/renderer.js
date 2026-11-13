/**
 * Valorant Crosshair Canvas Renderer
 * Provides pixel-perfect crosshair rendering, zoom scaling, dynamic recoil simulation,
 * and high quality procedural Valorant game backgrounds.
 */

class CrosshairRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zoom = 2; // Default 2x zoom
    this.background = 'range'; // 'range', 'ascent', 'bind', 'haven', 'icebox', 'dark', 'light', 'green', 'grid'
    this.settings = cloneSettings(DEFAULT_SETTINGS);

    // Dynamic recoil simulation state
    this.recoil = 0;
    this.isShooting = false;
    this.animFrameId = null;

    // Bullet hitmarks array
    this.hitmarkers = [];

    // Bind loop
    this.loop = this.loop.bind(this);
    this.startAnimationLoop();
  }

  setSettings(newSettings) {
    this.settings = cloneSettings(newSettings);
    this.render();
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.render();
  }

  setBackground(bg) {
    this.background = bg;
    this.render();
  }

  triggerShoot() {
    this.recoil = 8.0;
    // Add hit effect near center
    const spread = (Math.random() - 0.5) * 6;
    this.hitmarkers.push({
      x: spread,
      y: (Math.random() - 0.5) * 6,
      alpha: 1.0,
      radius: 3 + Math.random() * 2
    });
    if (this.hitmarkers.length > 8) {
      this.hitmarkers.shift();
    }
  }

  startAnimationLoop() {
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  stopAnimationLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  loop() {
    let needsRender = false;

    // Decay recoil
    if (this.recoil > 0.05) {
      this.recoil *= 0.82;
      needsRender = true;
    } else if (this.recoil > 0) {
      this.recoil = 0;
      needsRender = true;
    }

    // Decay hitmarkers
    for (let i = this.hitmarkers.length - 1; i >= 0; i--) {
      this.hitmarkers[i].alpha -= 0.035;
      needsRender = true;
      if (this.hitmarkers[i].alpha <= 0) {
        this.hitmarkers.splice(i, 1);
      }
    }

    if (needsRender) {
      this.render();
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  render() {
    const { canvas, ctx } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Selected Background
    this.drawBackground(ctx, w, h, this.background);

    // 2. Draw Hitmarkers if any
    this.drawHitmarkers(ctx, w / 2, h / 2);

    // 3. Draw Crosshair
    CrosshairRenderer.drawCrosshair(ctx, w / 2, h / 2, this.settings, this.zoom, this.recoil);

    ctx.restore();
  }

  drawHitmarkers(ctx, cx, cy) {
    if (!this.hitmarkers.length) return;
    ctx.save();
    for (const h of this.hitmarkers) {
      ctx.beginPath();
      ctx.arc(cx + h.x * this.zoom, cy + h.y * this.zoom, h.radius * (this.zoom * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 120, ${h.alpha * 0.8})`;
      ctx.fill();

      // Sparkle cross
      ctx.strokeStyle = `rgba(255, 255, 255, ${h.alpha})`;
      ctx.lineWidth = 1.5;
      const len = 6 * this.zoom;
      ctx.beginPath();
      ctx.moveTo(cx + h.x * this.zoom - len, cy + h.y * this.zoom);
      ctx.lineTo(cx + h.x * this.zoom + len, cy + h.y * this.zoom);
      ctx.moveTo(cx + h.x * this.zoom, cy + h.y * this.zoom - len);
      ctx.lineTo(cx + h.x * this.zoom, cy + h.y * this.zoom + len);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBackground(ctx, w, h, bgType) {
    ctx.save();

    switch (bgType) {
      case 'dark': {
        const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.2);
        grad.addColorStop(0, '#1c242d');
        grad.addColorStop(1, '#0c1117');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'light': {
        const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.2);
        grad.addColorStop(0, '#e5e9f0');
        grad.addColorStop(1, '#c8d0de');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'green': {
        ctx.fillStyle = '#00a859';
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'grid': {
        ctx.fillStyle = '#141c24';
        ctx.fillRect(0, 0, w, h);

        const gridSize = 16 * (this.zoom > 2 ? 2 : 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // High-contrast center guides
        ctx.strokeStyle = 'rgba(255, 70, 85, 0.35)';
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        break;
      }

      case 'range':
      default: {
        // Detailed Range Practice Bot Backdrop
        // Background wall gradient
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
        wallGrad.addColorStop(0, '#1d2a38');
        wallGrad.addColorStop(0.65, '#2b3d4f');
        wallGrad.addColorStop(0.66, '#182029');
        wallGrad.addColorStop(1, '#0e141a');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h);

        // Range Target Platform lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        ctx.lineTo(w, h * 0.65);
        ctx.stroke();

        // Floor perspective lines
        ctx.strokeStyle = 'rgba(0, 245, 155, 0.15)';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h);
        ctx.lineTo(w * 0.4, h * 0.65);
        ctx.moveTo(w * 0.8, h);
        ctx.lineTo(w * 0.6, h * 0.65);
        ctx.stroke();

        // Practice Bot Body & Head right in the center!
        const botCenterX = w / 2;
        const botCenterY = h / 2; // Center crosshair aims at the head/neck

        // Bot Torso
        ctx.fillStyle = '#263342';
        ctx.beginPath();
        ctx.roundRect(botCenterX - 45, botCenterY + 28, 90, 110, [10, 10, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#3d5166';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Chest Armor Plate with Radianite glow core
        ctx.fillStyle = '#1a222c';
        ctx.beginPath();
        ctx.roundRect(botCenterX - 30, botCenterY + 45, 60, 60, 6);
        ctx.fill();

        ctx.fillStyle = '#00f59b';
        ctx.shadowColor = '#00f59b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(botCenterX, botCenterY + 75, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Bot Neck
        ctx.fillStyle = '#1c242d';
        ctx.fillRect(botCenterX - 12, botCenterY + 12, 24, 20);

        // Bot Head (Right behind the crosshair center)
        ctx.fillStyle = '#2e3d4e';
        ctx.beginPath();
        ctx.roundRect(botCenterX - 22, botCenterY - 32, 44, 46, [14, 14, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = '#4e657e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Red Hitbox Target Glow on Head
        ctx.fillStyle = 'rgba(255, 70, 85, 0.28)';
        ctx.beginPath();
        ctx.arc(botCenterX, botCenterY - 10, 18, 0, Math.PI * 2);
        ctx.fill();

        // Bot Visor / Sensor Eye
        ctx.fillStyle = '#ff4655';
        ctx.shadowColor = '#ff4655';
        ctx.shadowBlur = 8;
        ctx.fillRect(botCenterX - 14, botCenterY - 16, 28, 6);
        ctx.shadowBlur = 0;

        break;
      }

      case 'ascent': {
        // Ascent Courtyard Sky & Italian Stone Architecture
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#5b8ec2');
        skyGrad.addColorStop(0.5, '#8cb5db');
        skyGrad.addColorStop(0.51, '#c5ab8d');
        skyGrad.addColorStop(1, '#857158');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Stone archway in background
        ctx.fillStyle = '#9b8772';
        ctx.fillRect(w * 0.15, h * 0.2, w * 0.7, h * 0.5);

        ctx.fillStyle = '#3a342c';
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.5, w * 0.25, Math.PI, 0);
        ctx.rect(w * 0.25, h * 0.5, w * 0.5, h * 0.2);
        ctx.fill();

        // Wooden radianite crate on side
        ctx.fillStyle = '#1c5e52';
        ctx.fillRect(w * 0.58, h * 0.45, 80, 75);
        ctx.strokeStyle = '#00f59b';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.58, h * 0.45, 80, 75);
        break;
      }

      case 'bind': {
        // Bind Desert Sandstone & Teleporter Ambience
        const desertGrad = ctx.createLinearGradient(0, 0, 0, h);
        desertGrad.addColorStop(0, '#86a8b8');
        desertGrad.addColorStop(0.4, '#e1b988');
        desertGrad.addColorStop(0.7, '#c6955e');
        desertGrad.addColorStop(1, '#9b7141');
        ctx.fillStyle = desertGrad;
        ctx.fillRect(0, 0, w, h);

        // Desert buildings
        ctx.fillStyle = '#be9465';
        ctx.fillRect(w * 0.1, h * 0.25, w * 0.35, h * 0.45);
        ctx.fillRect(w * 0.6, h * 0.3, w * 0.35, h * 0.4);

        // Teleporter portal glow
        const portGrad = ctx.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, 70);
        portGrad.addColorStop(0, 'rgba(255, 235, 100, 0.4)');
        portGrad.addColorStop(0.6, 'rgba(215, 120, 20, 0.25)');
        portGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = portGrad;
        ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.4);
        break;
      }

      case 'haven': {
        // Haven Asian Temple & Wood Tiles
        const havenGrad = ctx.createLinearGradient(0, 0, 0, h);
        havenGrad.addColorStop(0, '#667885');
        havenGrad.addColorStop(0.5, '#7b6d61');
        havenGrad.addColorStop(1, '#3a3430');
        ctx.fillStyle = havenGrad;
        ctx.fillRect(0, 0, w, h);

        // Pagoda roof silhouettes
        ctx.fillStyle = '#221e1d';
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h * 0.4);
        ctx.lineTo(w * 0.5, h * 0.2);
        ctx.lineTo(w * 0.95, h * 0.4);
        ctx.lineTo(w * 0.85, h * 0.45);
        ctx.lineTo(w * 0.5, h * 0.26);
        ctx.lineTo(w * 0.15, h * 0.45);
        ctx.closePath();
        ctx.fill();

        // Wooden wall panels
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(w * 0.2, h * 0.45, w * 0.6, h * 0.35);
        break;
      }

      case 'icebox': {
        // Icebox Snowy Industrial Base & Blue Containers
        const iceGrad = ctx.createLinearGradient(0, 0, 0, h);
        iceGrad.addColorStop(0, '#53687e');
        iceGrad.addColorStop(0.5, '#8da0b3');
        iceGrad.addColorStop(0.52, '#d0e0ed');
        iceGrad.addColorStop(1, '#a8bdcf');
        ctx.fillStyle = iceGrad;
        ctx.fillRect(0, 0, w, h);

        // Blue shipping cargo containers
        ctx.fillStyle = '#1c446c';
        ctx.fillRect(w * 0.1, h * 0.3, w * 0.35, h * 0.4);
        ctx.fillStyle = '#8f6831'; // Yellow/Orange container
        ctx.fillRect(w * 0.55, h * 0.25, w * 0.38, h * 0.45);
        break;
      }
    }

    ctx.restore();
  }

  /**
   * Static method to draw crosshair onto any canvas context with exact pixel coordinates
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} cx Center X
   * @param {number} cy Center Y
   * @param {object} s Crosshair Settings
   * @param {number} scale Zoom multiplier (1, 2, 4, etc.)
   * @param {number} recoilOffset Dynamic recoil expansion in pixels
   */
  static drawCrosshair(ctx, cx, cy, s, scale = 1, recoilOffset = 0) {
    ctx.save();

    // Disable image smoothing for sharp pixel art rendition
    ctx.imageSmoothingEnabled = false;

    const crosshairColor = getActiveColor(s);
    const outlineEnabled = Boolean(s.outlines);
    const outlineThick = s.outlineThickness || 1;
    const outlineAlpha = s.outlineOpacity !== undefined ? s.outlineOpacity : 0.5;

    // Helper to calculate pixel bounds
    // Center point in scaled canvas coordinates
    const midX = Math.round(cx);
    const midY = Math.round(cy);

    // Collect all rectangles to draw:
    // Outlines are drawn first in black, then colors drawn on top
    const outlineRects = [];
    const colorRects = [];

    // 1. Center Dot
    if (s.centerDot) {
      const z = s.centerDotSize || 2;
      const dotAlpha = s.centerDotOpacity !== undefined ? s.centerDotOpacity : 1.0;
      const x = -Math.floor(z / 2);
      const y = -Math.floor(z / 2);

      if (outlineEnabled && outlineAlpha > 0) {
        outlineRects.push({
          x: x - outlineThick,
          y: y - outlineThick,
          w: z + outlineThick * 2,
          h: z + outlineThick * 2,
          alpha: outlineAlpha
        });
      }

      colorRects.push({
        x: x,
        y: y,
        w: z,
        h: z,
        alpha: dotAlpha,
        color: crosshairColor
      });
    }

    // 2. Inner Lines
    if (s.innerLines && s.innerLines.show) {
      const il = s.innerLines;
      const t = il.thickness || 2;
      const hLen = il.length !== undefined ? il.length : 6;
      const vLen = il.separateLengths ? (il.verticalLength !== undefined ? il.verticalLength : 6) : hLen;
      const offset = (il.offset !== undefined ? il.offset : 3) +
        (il.firingError ? recoilOffset * (il.firingErrorMultiplier || 1.0) : 0);
      const alpha = il.opacity !== undefined ? il.opacity : 1.0;

      if (alpha > 0) {
        const tHalf = Math.floor(t / 2);

        // Top line
        if (vLen > 0) {
          const rx = -tHalf;
          const ry = -offset - vLen;
          const rw = t;
          const rh = vLen;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Bottom line
        if (vLen > 0) {
          const rx = -tHalf;
          const ry = offset;
          const rw = t;
          const rh = vLen;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Left line
        if (hLen > 0) {
          const rx = -offset - hLen;
          const ry = -tHalf;
          const rw = hLen;
          const rh = t;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Right line
        if (hLen > 0) {
          const rx = offset;
          const ry = -tHalf;
          const rw = hLen;
          const rh = t;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }
      }
    }

    // 3. Outer Lines
    if (s.outerLines && s.outerLines.show) {
      const ol = s.outerLines;
      const t = ol.thickness || 2;
      const hLen = ol.length !== undefined ? ol.length : 2;
      const vLen = ol.separateLengths ? (ol.verticalLength !== undefined ? ol.verticalLength : 2) : hLen;
      const offset = (ol.offset !== undefined ? ol.offset : 10) +
        (ol.firingError ? recoilOffset * (ol.firingErrorMultiplier || 1.0) : 0);
      const alpha = ol.opacity !== undefined ? ol.opacity : 0.35;

      if (alpha > 0) {
        const tHalf = Math.floor(t / 2);

        // Top line
        if (vLen > 0) {
          const rx = -tHalf;
          const ry = -offset - vLen;
          const rw = t;
          const rh = vLen;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Bottom line
        if (vLen > 0) {
          const rx = -tHalf;
          const ry = offset;
          const rw = t;
          const rh = vLen;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Left line
        if (hLen > 0) {
          const rx = -offset - hLen;
          const ry = -tHalf;
          const rw = hLen;
          const rh = t;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }

        // Right line
        if (hLen > 0) {
          const rx = offset;
          const ry = -tHalf;
          const rw = hLen;
          const rh = t;
          if (outlineEnabled && outlineAlpha > 0) {
            outlineRects.push({
              x: rx - outlineThick,
              y: ry - outlineThick,
              w: rw + outlineThick * 2,
              h: rh + outlineThick * 2,
              alpha: outlineAlpha
            });
          }
          colorRects.push({ x: rx, y: ry, w: rw, h: rh, alpha: alpha, color: crosshairColor });
        }
      }
    }

    // A. Render Outlines in black
    for (const r of outlineRects) {
      ctx.fillStyle = `rgba(0, 0, 0, ${r.alpha})`;
      ctx.fillRect(
        midX + Math.round(r.x * scale),
        midY + Math.round(r.y * scale),
        Math.round(r.w * scale),
        Math.round(r.h * scale)
      );
    }

    // B. Render Color Rectangles
    for (const r of colorRects) {
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.fillStyle = r.color;
      ctx.fillRect(
        midX + Math.round(r.x * scale),
        midY + Math.round(r.y * scale),
        Math.round(r.w * scale),
        Math.round(r.h * scale)
      );
      ctx.restore();
    }

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CrosshairRenderer };
}
