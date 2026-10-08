
// ============ Sound System ============
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }
}

function playSound(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch(type) {
        case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
        case 'toggle':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.08);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            oscillator.start(now);
            oscillator.stop(now + 0.12);
            break;
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, now);
            oscillator.frequency.setValueAtTime(659, now + 0.1);
            oscillator.frequency.setValueAtTime(784, now + 0.2);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            break;
        case 'open':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
        case 'close':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
    }
}

// ============ Particles ============
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 60 + 280}, 70%, 70%)`;
        container.appendChild(particle);
    }
}
createParticles();

// ============ Character Data ============
const characterData = {
    'suxiaoke': {
        name: '苏小可',
        tag: '元气腹黑少女',
        avatar: 'https://img.wjwj.top/2025/07/14/3a8a6d2710b486a1ea986202bee479d8.jpg',
        description: `<p>🌸留着双丸子头的元气少女，可爱调皮，有点腹黑，喜欢恶作剧。</p><p>🌸身材娇小，胸部只有b罩杯，遇到同样平胸的女生会天生带有好感。</p><p>🌸性格外向自来熟，喜欢和人贴贴，经常邀请女生一起洗澡、上厕所、睡觉。</p>`, reaction: `<p>❤️在高好感度(61%-100%)时被她发现你的性别，她会感觉有趣，会帮你隐瞒甚至出谋划策。</p><p>🖤在低好感度(0%-60%)时被她发现你的性别，她会将你的秘密作为把柄，以此威胁你陪她进行各种危险或刺激的游戏，让你对她言听计从。</p>` },
    'lingyue': {
        name: '凌玥',
        tag: '高冷御姐',
        avatar: 'https://img.wjwj.top/2025/07/14/f1e655aebb6f919229b74859a046b79a.jpg',
        description: `<p>🌸肤白貌美大长腿，前凸后翘小蛮腰，身高高挑，身材火辣，D罩杯，御姐气质。有时会穿性感黑丝包臀裙。</p><p>🌸表情变化少，微笑时仅嘴角微勾。性格高冷，话少有主见。下意识带有社会人气质（如双手插兜），极其聪明，能敏锐观察细节。</p><p>🌸在高中时是叛逆的大姐大，跆拳道黑带，抽烟喝酒鬼混，曾经将调戏过她的教练打成骨折。随后改过自新发奋读书，考上心仪的大学，但仍然带有社会人气质。</p><p>🌸有过一个混混前男友，但仍然是处女，混混前男友经常打电话和发短信骚扰她</p>`, reaction: `<p>❤️在高好感度(61%-100%)时被她发现你的性别，会懒得多管闲事，不会主动透露出去，但会警告你懂得分寸。</p><p>🖤在低好感度(0%-60%)时被她发现你的性别，会以威胁姿态逼问你原因，甚至可能把你揍进ICU病房。</p>` },
    'yezhirou': {
        name: '叶芷柔',
        tag: '温柔校花',
        avatar: 'https://img.wjwj.top/2025/07/14/60679ef8bb14d3e6d3c5a0c9db40384c.jpg',
        description: `<p>🌸 出身书香门第，父母都是教师，从小被教导知书达理、举止端庄。黑长直发，容貌清丽绝俗，气质恬静温婉，是高中时代公认的校花。</p>
        <p>🌸 言行温柔体贴，性格善良，不太会拒绝别人——即便自己并不富裕，也依然会对需要帮助的人伸出援手。</p>
        <p>🌸 有一位青梅竹马的男友陈子诚，在另一座城市的大学就读，两人保持着甜蜜的异地恋情。</p>`,
        reaction: `<p>❤️ 好感度高时 (61%-100%)：会非常认真地与你谈心，尝试理解你的难处并真诚地提供帮助，主动安慰你、为你出主意。</p>
        <p>🖤 好感度低时 (0%-60%)：会陷入内心的纠结与矛盾，犹豫是否应该告发。私底下大概率会将这件事告诉男友陈子诚商量。</p>`
    },
    'xiaqiange': {
        name: '夏仟歌',
        tag: '女扮男装的同学',
        avatar: 'https://img.wjwj.top/2025/05/10/c4d80544818478d71c128c85b702b873.jpg',
        description: `<p>🌸 来自另一部作品的女主角，应粉丝要求友情客串，只要聊天不涉及她的名字就不会触发相关剧情。</p>
        <p>🌸 与你经历相似，从小因家庭原因被父母当作男孩抚养，现在就读于同一所大学，但被分到了男生宿舍。</p>
        <p>🌸 长相极其漂亮，但故意扮成男生模样，言行举止都刻意模仿男性，为了不暴露身份，甚至会主动和男生勾肩搭背融入群体。</p>`,
        reaction: `<p>❤️ 无论好感度高低，当她得知你也和她一样是在伪装性别生活时，会感到深深的共鸣与欣慰，百分百与你站在同一阵营，成为你最可靠的盟友。</p>`
    }
};

// ============ Character Modal ============
const characterModal = document.getElementById('characterModal');
const charModalClose = characterModal.querySelector('.modal-close');

document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', function() {
        playSound('click');
        const characterId = this.getAttribute('data-character');
        const data = characterData[characterId];
        
        document.getElementById('modalName').textContent = data.name;
        document.getElementById('modalTag').textContent = data.tag;
        document.getElementById('modalDescription').innerHTML = data.description;
        document.getElementById('modalReaction').innerHTML = data.reaction;
        document.getElementById('modalAvatar').innerHTML = `<img src="${data.avatar}" alt="${data.name}">`;
        
        characterModal.classList.add('active');
    });
});

charModalClose.addEventListener('click', function() {
    playSound('close');
    characterModal.classList.remove('active');
});

characterModal.addEventListener('click', function(e) {
    if (e.target === characterModal) {
        playSound('close');
        characterModal.classList.remove('active');
    }
});

// ============ Story Synopsis Toggle ============
const storyTrigger = document.getElementById('storyTrigger');
const storyContent = document.getElementById('storyContent');

storyTrigger.addEventListener('click', function() {
    playSound('toggle');
    this.classList.toggle('active');
    storyContent.classList.toggle('active');
});

// ============ Collapsible Logic ============
document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
        playSound('toggle');
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.classList.toggle('active');
    });
});

// ============ Tab Logic ============
document.querySelectorAll('.hub-tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
        playSound('click');
        document.querySelectorAll('.hub-tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.hub-content-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(`tab-panel-${this.dataset.tab}`).classList.add('active');
        updateRealtimeOutput();
    });
});

// ============ Selection Button Logic ============
document.querySelectorAll('.selection-btn-group').forEach(group => {
    group.addEventListener('click', function(e) {
        if (e.target.classList.contains('selection-btn')) {
            playSound('toggle');
            Array.from(this.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateRealtimeOutput();
        }
    });
});

// ============ Roommate Editor ============
const roommateEditorModal = document.getElementById('roommateEditorModal');
const roommateEditorForm = document.getElementById('roommateEditorForm');
const roommateEditorTitle = document.getElementById('roommateEditorTitle');
const roomEditorClose = roommateEditorModal.querySelector('.modal-close');
let currentEditingRoommate = null;

// Store roommate data
const roommateData = { 1: {}, 2: {}, 3: {} };

document.querySelectorAll('.edit-roommate-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        playSound('open');
        const card = this.closest('.roommate-card');
        currentEditingRoommate = card.getAttribute('data-roommate');
        roommateEditorTitle.textContent = `编辑室友 ${currentEditingRoommate} 设定`;
        
        // Pre-fill form with existing data
        const data = roommateData[currentEditingRoommate];
        const inputs = roommateEditorForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = data[input.name] || '';
        });
        
        roommateEditorModal.classList.add('active');
    });
});

roomEditorClose.addEventListener('click', function() {
    playSound('close');
    roommateEditorModal.classList.remove('active');
});

roommateEditorModal.addEventListener('click', function(e) {
    if (e.target === roommateEditorModal) {
        playSound('close');
        roommateEditorModal.classList.remove('active');
    }
});

roommateEditorForm.addEventListener('submit', function(e) {
    e.preventDefault();
    playSound('success');
    
    const inputs = this.querySelectorAll('input');
    let hasData = false;
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            hasData = true;
            roommateData[currentEditingRoommate][input.name] = input.value.trim();
        } else {
            delete roommateData[currentEditingRoommate][input.name];
        }
    });
    
    // Update status display
    const statusEl = document.getElementById(`roommate${currentEditingRoommate}Status`);
    if (hasData) {
        statusEl.textContent = '✅ 已添加';
        statusEl.classList.add('filled');
    } else {
        statusEl.textContent = '尚未设定';
        statusEl.classList.remove('filled');
    }
    
    roommateEditorModal.classList.remove('active');
    updateRealtimeOutput();
});

// ============ Real-time Output Update ============
const functionNames = {
    'summary': '总结',
    'options': '选项',
    'live': '直播',
    'beautify': 'UI美化',
    'plotAssist': '剧情辅助',
    'novel': '小说模式',
    'closeup': '画面特写',
    'logic': '逻辑思考',
    'banter': '雌小鬼吐槽'
};

const roommateFieldNames = {
    'name': '姓名',
    'gender': '性别',
    'age': '年龄',
    'appearance': '外貌',
    'personality': '性格',
    'hobby': '兴趣',
    'identity': '身份',
    'relationship': '情感经历'
};

function updateRealtimeOutput() {
    let output = '';
    
    // User Info
    const userInputs = document.querySelectorAll('.user-input');
    let userInfo = '';
    userInputs.forEach(input => {
        if (input.value.trim() && input.dataset.key !== 'openingScene') {
            const labels = {
                'userName': '姓名',
                'userAge': '年龄',
                'userAppearance': '外貌',
                'userPersonality': '性格',
                'userHobby': '爱好',
                'userSecret': '秘密'
            };
            userInfo += `${labels[input.dataset.key]}：${input.value.trim()}\n`;
        }
    });
    if (userInfo) {
        output += '【主角设定】\n' + userInfo + '\n';
    }
    
    // Roommates
    for (let i = 1; i <= 3; i++) {
        const data = roommateData[i];
        if (Object.keys(data).length > 0) {
            output += `【室友${i}设定】\n`;
            Object.entries(data).forEach(([key, value]) => {
                output += `${roommateFieldNames[key] || key}：${value}\n`;
            });
            output += '\n';
        }
    }
    
    // Opening Scene
    const openingScene = document.querySelector('.user-input[data-key="openingScene"]')?.value.trim();
    if (openingScene) {
        output += `【开场白】\n${openingScene}\n\n`;
    }
    
    // Function Toggles
    output += '【功能指令】\n';
    document.querySelectorAll('.function-toggle').forEach(toggle => {
        const func = toggle.dataset.function;
        const name = functionNames[func] || func;
        const state = toggle.checked ? '开启' : '关闭';
        output += `${name}：${state}\n`;
    });
    
    // Reply Length
    const activeLength = document.querySelector('.selection-btn-group[data-group="replyLength"] .selection-btn.active');
    if (activeLength) output += `回复长度：${activeLength.dataset.value}\n`;
    
    // Perspective
    const activePerspective = document.querySelector('.selection-btn-group[data-group="perspective"] .selection-btn.active');
    if (activePerspective) output += `人称视角：${activePerspective.dataset.value}\n`;
    
    document.getElementById('realtimeOutput').value = output;
}

// Attach input listeners for real-time updates
document.querySelectorAll('.user-input').forEach(input => {
    input.addEventListener('input', function() {
        updateRealtimeOutput();
    });
    input.addEventListener('focus', function() {
        playSound('click');
    });
});

document.querySelectorAll('.function-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
        playSound('toggle');
        updateRealtimeOutput();
    });
});

// Initial update
updateRealtimeOutput();

// ============ Copy Button ============
const copyBtn = document.getElementById('copyBtn');
copyBtn.addEventListener('click', function() {
    playSound('click');
    const text = document.getElementById('realtimeOutput').value;
    if (!text.trim()) {
        showToast('暂无配置内容可复制', 'warning');
        return;
    }
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            playSound('success');
            showToast('✅ 配置已复制到剪贴板！');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
});

function fallbackCopy(text) {
    const textarea = document.getElementById('realtimeOutput');
    textarea.removeAttribute('readonly');
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        const success = document.execCommand('copy');
        textarea.setAttribute('readonly', '');
        if (success) {
            playSound('success');
            showToast('✅ 配置已复制到剪贴板！');
        } else {
            showToast('❌ 复制失败，请手动选择复制', 'error');
        }
    } catch (err) {
        textarea.setAttribute('readonly', '');
        showToast('❌ 复制失败，请手动选择复制', 'error');
    }
}

// ============ Clear Button ============
document.getElementById('clearBtn').addEventListener('click', function() {
    playSound('close');
    if (confirm('确定要清空所有自定义配置吗？')) {
        document.querySelectorAll('.user-input').forEach(input => {
            input.value = '';
        });
        // Reset roommate data
        roommateData[1] = {};
        roommateData[2] = {};
        roommateData[3] = {};
        for (let i = 1; i <= 3; i++) {
            const statusEl = document.getElementById(`roommate${i}Status`);
            statusEl.textContent = '尚未设定';
            statusEl.classList.remove('filled');
        }
        updateRealtimeOutput();
        showToast('🗑️ 配置已清空');
    }
});

// ============ Toast ============
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--primary), var(--pink))';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ============ Keyboard shortcut ============
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (characterModal.classList.contains('active')) {
            playSound('close');
            characterModal.classList.remove('active');
        }
        if (roommateEditorModal.classList.contains('active')) {
            playSound('close');
            roommateEditorModal.classList.remove('active');
        }
    }
});

// Initialize audio on first user interaction
document.addEventListener('click', function initAudioOnce() {
    initAudio();
    document.removeEventListener('click', initAudioOnce);
}, { once: true });

// Also initialize on touch
document.addEventListener('touchstart', function initAudioTouch() {
    initAudio();
    document.removeEventListener('touchstart', initAudioTouch);
}, { once: true });
