/**
 * Valorant Crosshair Code Parser & Serializer
 * Handles reading from and writing to Valorant profile code format (e.g. 0;P;c;1;h;0;0t;1;0l;3;0o;2;...)
 */

const COLOR_TABLE = [
  '#ffffff', // 0: White
  '#00ff00', // 1: Green
  '#7fff00', // 2: Yellow-Green
  '#dfff00', // 3: Green-Yellow
  '#ffff00', // 4: Yellow
  '#00ffff', // 5: Cyan
  '#ff00ff', // 6: Pink
  '#ff0000', // 7: Red
  '#ffffff'  // 8: Custom Color (fallback)
];

const DEFAULT_SETTINGS = {
  // General / Color
  color: 0,
  customColor: '#ffffff',
  outlines: true,
  outlineOpacity: 0.5,
  outlineThickness: 1,
  centerDot: false,
  centerDotOpacity: 1.0,
  centerDotSize: 2,
  overrideFiringError: false,

  // Inner Lines
  innerLines: {
    show: true,
    opacity: 1.0,
    length: 6,
    verticalLength: 6,
    separateLengths: false,
    thickness: 2,
    offset: 3,
    movementError: false,
    firingError: false,
    movementErrorMultiplier: 1.0,
    firingErrorMultiplier: 1.0
  },

  // Outer Lines
  outerLines: {
    show: false,
    opacity: 0.35,
    length: 2,
    verticalLength: 2,
    separateLengths: false,
    thickness: 2,
    offset: 10,
    movementError: true,
    firingError: true,
    movementErrorMultiplier: 1.0,
    firingErrorMultiplier: 1.0
  }
};

/**
 * Deep clone settings
 */
function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

/**
 * Get active hex color for settings
 */
function getActiveColor(settings) {
  if (settings.color === 8 && settings.customColor) {
    return settings.customColor;
  }
  return COLOR_TABLE[settings.color] || '#ffffff';
}

/**
 * Parse a raw Valorant crosshair string into a settings object
 * @param {string} code 
 * @returns {object} Normalized crosshair settings
 */
function parseValorantCode(code) {
  if (!code || typeof code !== 'string') {
    return cloneSettings(DEFAULT_SETTINGS);
  }

  const trimmed = code.trim();
  const parts = trimmed.split(';');

  // Start with default settings
  const s = cloneSettings(DEFAULT_SETTINGS);

  // Valorant codes usually start with 0; or 0;s;1; or 0;P;
  let i = 0;
  if (parts[0] === '0') {
    i = 1;
  }

  // Flags to check if certain attributes were explicitly declared
  let hasExplicitInnerShow = false;
  let hasExplicitOuterShow = false;

  for (; i < parts.length; i++) {
    const key = parts[i];
    const val = parts[i + 1];

    if (val === undefined) break;

    // Check specific keys
    switch (key) {
      // General
      case 'c':
        s.color = Math.min(8, Math.max(0, parseInt(val, 10) || 0));
        i++;
        break;
      case 'u': // Custom hex color
        {
          let hex = val.replace(/[^0-9A-Fa-f]/g, '');
          if (hex.length >= 6) {
            // Trim to 6 chars if 8 chars (RGBA)
            s.customColor = '#' + hex.substring(0, 6);
            s.color = 8;
          }
        }
        i++;
        break;
      case 'h': // Outlines enabled
        s.outlines = val === '1';
        i++;
        break;
      case 'o': // Outline opacity
        s.outlineOpacity = Math.min(1.0, Math.max(0.0, parseFloat(val) || 0));
        i++;
        break;
      case 't': // Outline thickness
        s.outlineThickness = Math.min(6, Math.max(1, parseInt(val, 10) || 1));
        i++;
        break;
      case 'd': // Center dot enabled
        s.centerDot = val === '1';
        i++;
        break;
      case 'a': // Center dot opacity
        s.centerDotOpacity = Math.min(1.0, Math.max(0.0, parseFloat(val) || 0));
        i++;
        break;
      case 'z': // Center dot thickness / size
        s.centerDotSize = Math.min(6, Math.max(1, parseInt(val, 10) || 1));
        i++;
        break;
      case 'm': // Override firing error
        s.overrideFiringError = val === '1';
        i++;
        break;

      // Inner lines (0 prefix)
      case '0b':
        s.innerLines.show = val === '1';
        hasExplicitInnerShow = true;
        i++;
        break;
      case '0t':
        s.innerLines.thickness = Math.min(10, Math.max(1, parseInt(val, 10) || 1));
        i++;
        break;
      case '0l':
        s.innerLines.length = Math.min(20, Math.max(0, parseInt(val, 10) || 0));
        if (!s.innerLines.separateLengths) {
          s.innerLines.verticalLength = s.innerLines.length;
        }
        i++;
        break;
      case '0v':
        s.innerLines.verticalLength = Math.min(20, Math.max(0, parseInt(val, 10) || 0));
        s.innerLines.separateLengths = true;
        i++;
        break;
      case '0g':
        s.innerLines.separateLengths = val === '1';
        i++;
        break;
      case '0o':
        s.innerLines.offset = Math.min(20, Math.max(0, parseInt(val, 10) || 0));
        i++;
        break;
      case '0a':
        s.innerLines.opacity = Math.min(1.0, Math.max(0.0, parseFloat(val) || 0));
        i++;
        break;
      case '0m':
        s.innerLines.movementError = val === '1';
        i++;
        break;
      case '0f':
        s.innerLines.firingError = val === '1';
        i++;
        break;
      case '0s':
        s.innerLines.movementErrorMultiplier = parseFloat(val) || 1.0;
        i++;
        break;
      case '0e':
        s.innerLines.firingErrorMultiplier = parseFloat(val) || 1.0;
        i++;
        break;

      // Outer lines (1 prefix)
      case '1b':
        s.outerLines.show = val === '1';
        hasExplicitOuterShow = true;
        i++;
        break;
      case '1t':
        s.outerLines.thickness = Math.min(10, Math.max(1, parseInt(val, 10) || 1));
        i++;
        break;
      case '1l':
        s.outerLines.length = Math.min(20, Math.max(0, parseInt(val, 10) || 0));
        if (!s.outerLines.separateLengths) {
          s.outerLines.verticalLength = s.outerLines.length;
        }
        i++;
        break;
      case '1v':
        s.outerLines.verticalLength = Math.min(20, Math.max(0, parseInt(val, 10) || 0));
        s.outerLines.separateLengths = true;
        i++;
        break;
      case '1g':
        s.outerLines.separateLengths = val === '1';
        i++;
        break;
      case '1o':
        s.outerLines.offset = Math.min(40, Math.max(0, parseInt(val, 10) || 0));
        i++;
        break;
      case '1a':
        s.outerLines.opacity = Math.min(1.0, Math.max(0.0, parseFloat(val) || 0));
        i++;
        break;
      case '1m':
        s.outerLines.movementError = val === '1';
        i++;
        break;
      case '1f':
        s.outerLines.firingError = val === '1';
        i++;
        break;
      case '1s':
        s.outerLines.movementErrorMultiplier = parseFloat(val) || 1.0;
        i++;
        break;
      case '1e':
        s.outerLines.firingErrorMultiplier = parseFloat(val) || 1.0;
        i++;
        break;

      default:
        // Ignore unhandled tokens or standalone section identifiers like 'P', 's', 'A'
        break;
    }
  }

  // If outer lines parameters exist but 1b was not explicitly set to 0, check if length > 0
  if (!hasExplicitOuterShow && (s.outerLines.length > 0 || s.outerLines.verticalLength > 0)) {
    // If any outer line property was set, default show to true
    if (code.includes('1t;') || code.includes('1l;') || code.includes('1o;')) {
      s.outerLines.show = true;
    }
  }

  return s;
}

/**
 * Generate a valid Valorant Crosshair code from settings
 * @param {object} s Settings object
 * @returns {string} Valorant profile string
 */
function generateValorantCode(s) {
  const parts = ['0', 'P'];

  // Color
  if (s.color === 8 && s.customColor) {
    parts.push('c', '8');
    const cleanHex = s.customColor.replace('#', '').toUpperCase();
    parts.push('u', cleanHex + 'FF');
  } else if (s.color !== 0) {
    parts.push('c', String(s.color));
  }

  // Outlines
  if (!s.outlines) {
    parts.push('h', '0');
  } else {
    // Default outlines is 1 in Valorant
    if (s.outlineThickness !== 1) {
      parts.push('t', String(s.outlineThickness));
    }
    if (s.outlineOpacity !== 0.5) {
      // Format cleanly without trailing zeros if possible
      parts.push('o', String(Number(s.outlineOpacity.toFixed(3))));
    }
  }

  // Center Dot
  if (s.centerDot) {
    parts.push('d', '1');
    if (s.centerDotSize !== 2) {
      parts.push('z', String(s.centerDotSize));
    }
    if (s.centerDotOpacity !== 1.0) {
      parts.push('a', String(Number(s.centerDotOpacity.toFixed(3))));
    }
  }

  // Override firing error with crosshair offset
  if (s.overrideFiringError) {
    parts.push('m', '1');
  }

  // Inner Lines
  if (!s.innerLines.show) {
    parts.push('0b', '0');
  } else {
    // Thickness
    if (s.innerLines.thickness !== 2) {
      parts.push('0t', String(s.innerLines.thickness));
    }
    // Lengths
    if (s.innerLines.separateLengths) {
      parts.push('0g', '1');
      parts.push('0l', String(s.innerLines.length));
      parts.push('0v', String(s.innerLines.verticalLength));
    } else {
      if (s.innerLines.length !== 6) {
        parts.push('0l', String(s.innerLines.length));
      }
    }
    // Offset
    if (s.innerLines.offset !== 3) {
      parts.push('0o', String(s.innerLines.offset));
    }
    // Opacity
    if (s.innerLines.opacity !== 1.0) {
      parts.push('0a', String(Number(s.innerLines.opacity.toFixed(3))));
    }
    // Movement Error
    if (s.innerLines.movementError) {
      parts.push('0m', '1');
      if (s.innerLines.movementErrorMultiplier !== 1.0) {
        parts.push('0s', String(Number(s.innerLines.movementErrorMultiplier.toFixed(3))));
      }
    }
    // Firing Error
    if (s.innerLines.firingError) {
      parts.push('0f', '1');
      if (s.innerLines.firingErrorMultiplier !== 1.0) {
        parts.push('0e', String(Number(s.innerLines.firingErrorMultiplier.toFixed(3))));
      }
    } else {
      parts.push('0f', '0');
    }
  }

  // Outer Lines
  if (!s.outerLines.show) {
    parts.push('1b', '0');
  } else {
    // Thickness
    if (s.outerLines.thickness !== 2) {
      parts.push('1t', String(s.outerLines.thickness));
    }
    // Lengths
    if (s.outerLines.separateLengths) {
      parts.push('1g', '1');
      parts.push('1l', String(s.outerLines.length));
      parts.push('1v', String(s.outerLines.verticalLength));
    } else {
      if (s.outerLines.length !== 2) {
        parts.push('1l', String(s.outerLines.length));
      }
    }
    // Offset
    if (s.outerLines.offset !== 10) {
      parts.push('1o', String(s.outerLines.offset));
    }
    // Opacity
    if (s.outerLines.opacity !== 0.35) {
      parts.push('1a', String(Number(s.outerLines.opacity.toFixed(3))));
    }
    // Movement Error
    if (!s.outerLines.movementError) {
      parts.push('1m', '0');
    } else if (s.outerLines.movementErrorMultiplier !== 1.0) {
      parts.push('1s', String(Number(s.outerLines.movementErrorMultiplier.toFixed(3))));
    }
    // Firing Error
    if (!s.outerLines.firingError) {
      parts.push('1f', '0');
    } else if (s.outerLines.firingErrorMultiplier !== 1.0) {
      parts.push('1e', String(Number(s.outerLines.firingErrorMultiplier.toFixed(3))));
    }
  }

  return parts.join(';');
}

// Export for browser window and Node/module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLOR_TABLE,
    DEFAULT_SETTINGS,
    cloneSettings,
    getActiveColor,
    parseValorantCode,
    generateValorantCode
  };
}
