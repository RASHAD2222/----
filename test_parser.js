/**
 * Verification Test Suite for Valorant Crosshair Studio
 */

const { parseValorantCode, generateValorantCode, DEFAULT_SETTINGS, COLOR_TABLE } = require('./js/parser.js');
const { PRESETS_DATA } = require('./js/presets.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- TEST 1: Default Settings Code Generation & Parsing ---');
const defaultCode = generateValorantCode(DEFAULT_SETTINGS);
assert(defaultCode.startsWith('0;P'), `Default code starts with 0;P (got: ${defaultCode})`);
const parsedDefault = parseValorantCode(defaultCode);
assert(parsedDefault.color === 0, 'Default color is 0 (White)');
assert(parsedDefault.innerLines.show === true, 'Inner lines enabled by default');
assert(parsedDefault.outerLines.show === false, 'Outer lines disabled by default');

console.log('\n--- TEST 2: Roundtrip Parsing on All Presets ---');
PRESETS_DATA.forEach(preset => {
  try {
    const parsed = parseValorantCode(preset.code);
    assert(parsed !== null && typeof parsed === 'object', `Preset "${preset.name}" parsed successfully`);
    const reGenerated = generateValorantCode(parsed);
    assert(reGenerated.length > 5, `Re-generated code for "${preset.name}" is non-empty (${reGenerated})`);
    const reParsed = parseValorantCode(reGenerated);
    assert(reParsed.color === parsed.color, `Preset "${preset.name}" color preserved (${parsed.color})`);
    assert(reParsed.centerDot === parsed.centerDot, `Preset "${preset.name}" centerDot preserved (${parsed.centerDot})`);
    assert(reParsed.innerLines.show === parsed.innerLines.show, `Preset "${preset.name}" innerLines.show preserved`);
  } catch (err) {
    assert(false, `Preset "${preset.name}" threw error: ${err.message}`);
  }
});

console.log('\n--- TEST 3: Specific Pro Codes Fidelity ---');
// TenZ
const tenz = parseValorantCode('0;s;1;P;c;5;h;0;m;0;0t;1;0l;4;0v;4;0o;2;0a;1;0f;0;1b;0');
assert(tenz.color === 5, 'TenZ color is Cyan (5)');
assert(tenz.outlines === false, 'TenZ outlines is false');
assert(tenz.innerLines.thickness === 1, 'TenZ inner thickness is 1');
assert(tenz.innerLines.length === 4, 'TenZ inner length is 4');
assert(tenz.innerLines.offset === 2, 'TenZ inner offset is 2');

// Boaster
const boaster = parseValorantCode('0;s;1;P;c;1;o;1;d;1;0b;0;1b;0');
assert(boaster.color === 1, 'Boaster color is Green (1)');
assert(boaster.centerDot === true, 'Boaster has center dot');
assert(boaster.innerLines.show === false, 'Boaster has no inner lines');

// Custom Color (Hex)
const customHex = '0;P;c;8;u;FFAA00FF;h;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0';
const parsedCustom = parseValorantCode(customHex);
assert(parsedCustom.color === 8, 'Custom color mode is 8');
assert(parsedCustom.customColor.toUpperCase() === '#FFAA00', `Custom hex parsed as #FFAA00 (got: ${parsedCustom.customColor})`);
const genCustom = generateValorantCode(parsedCustom);
assert(genCustom.includes('c;8;u;FFAA00FF'), `Generated custom hex code includes c;8;u;FFAA00FF (got: ${genCustom})`);

console.log(`\n========================================`);
console.log(`TOTAL RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log(`========================================`);

if (failedTests > 0) {
  process.exit(1);
}
