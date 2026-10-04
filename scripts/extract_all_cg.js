// Mock RPG Maker environment to load Shiroin_SceneGalleryA.js
const fs = require('fs');
const path = require('path');

global.window = global;
global.DrillUp = {};
global.PluginManager = {
    parameters: () => ({})
};
global.$gameSelfSwitches = { value: () => false };
global.$gameSelfVariables = { value: () => 0 };
global.$gameParty = { hasItem: () => false };
global.$gameSystem = { _drill_SGaA_context_index: 0 };
global.$dataArmors = {};
global.$dataItems = {};
global.RecallStage = {
    start: () => {},
    record: () => {},
    finish: () => {},
    isActive: () => false,
    captureMogTimeVars: () => ({})
};
global.ImageManager = {
    loadPicture: () => ({}),
    preloadPicturesToGpu: () => {}
};
global.Sprite = function() {};
global.Bitmap = function() {};
global.Graphics = { _createFontLoader: () => {} };
global.AudioManager = { playVoice: () => {}, playBgs: () => {}, stopVoice: () => {} };

// Read file content
const pluginPath = "D:\\game\\存在感薄弱妹妹ver1.3.1\\PC\\薄妹1.3\\www\\js\\plugins\\Shiroin_SceneGalleryA.js";
let code = fs.readFileSync(pluginPath, 'utf8');

// Evaluate in sandbox
try {
    eval(code);
    console.log("Evaluated successfully!");
} catch (e) {
    console.log("Eval error:", e.message);
}

// Check entries
const entries = DrillUp.g_SGaA_entries || {};
console.log("Total entries in DrillUp.g_SGaA_entries:", Object.keys(entries).length);

// Also load items.json for Chinese titles
const itemsJsonPath = "D:\\game\\存在感薄弱妹妹ver1.3.1\\PC\\薄妹1.3\\www\\data\\Items.json";
const items = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const itemMap = {};
for (const it of items) {
    if (it && it.name) {
        itemMap[String(it.id)] = it.name;
    }
}

const result = [];
for (const [key, val] of Object.entries(entries)) {
    const itemName = itemMap[String(val.name)] || itemMap[key] || val.title || key;
    result.push({
        key,
        nameId: val.name,
        title: itemName,
        cover: val.cover,
        video: val.video,
        category: val.category || val.traceCategory,
        cardStyle: val.cardStyle,
        order: val.order,
        pic: val.pic
    });
}

fs.writeFileSync("d:\\pro\\work\\proj\\googleAI\\noval-go\\scripts\\cg_gallery_dump.json", JSON.stringify(result, null, 2), 'utf8');
console.log("Saved cg_gallery_dump.json successfully!");
