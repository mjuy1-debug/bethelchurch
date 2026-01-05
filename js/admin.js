// Admin Logic
// Alert removed

// Helper to adjust path for Admin
const getAdminPath = (path) => {
    if (!path) return '';
    if (path.startsWith('./')) return '.' + path;
    if (path.startsWith('uploads/')) return '../' + path;
    if (path.startsWith('/uploads/')) return '..' + path;
    return path;
};

document.addEventListener('DOMContentLoaded', () => {
    const isDashboard = document.querySelector('.sidebar') !== null;

    // 1. Login Page Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // If already logged in, redirect to dashboard
        if (sessionStorage.getItem('isAdmin')) {
            window.location.href = 'dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple Hardcoded Auth
            if (username === 'admin' && password === '1234') {
                sessionStorage.setItem('isAdmin', 'true');
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('errorMsg').style.display = 'block';
            }
        });
    }

    // 2. Dashboard Page Logic
    if (isDashboard) {

        // Check Auth
        if (!sessionStorage.getItem('isAdmin')) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'login.html';
        });

        // --- Tab Navigation Setup ---
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        const pageTitle = document.getElementById('pageTitle');

        if (navItems.length > 0) {
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    console.log('Tab Clicked:', item.textContent.trim());
                    e.preventDefault();
                    navItems.forEach(nav => nav.classList.remove('active'));
                    tabContents.forEach(tab => tab.classList.remove('active'));

                    item.classList.add('active');
                    const targetId = item.getAttribute('data-target');
                    const targetContent = document.getElementById(targetId);

                    if (targetContent) {
                        targetContent.classList.add('active');
                    }

                    if (pageTitle) {
                        pageTitle.textContent = item.textContent.trim() + ' 관리';
                    }

                    const globalBtns = document.querySelector('.page-header > div');
                    if (globalBtns) {
                        if (targetId === 'sermon' || targetId === 'notice') {
                            globalBtns.style.display = 'none';
                        } else {
                            globalBtns.style.display = 'flex';
                        }
                    }
                });
            });
        }

        // --- Initialize Data ---
        try { loadDashboardData(); } catch (e) { console.error('Dashboard Data Load Error:', e); }
        try { loadAdminNotices(); } catch (e) { console.error('Notice Load Error:', e); }
        try { loadAdminSermons(); } catch (e) { console.error('Sermon Load Error:', e); }

        // Global Actions
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) saveBtn.addEventListener('click', saveDashboardData);

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportDashboardData);

        // Image Uploads Configuration
        const imageConfigs = [
            { input: 'heroBgInput', key: 'hero-bg', preview: 'heroBgPreview', urlInput: 'heroBgUrl' },
            { input: 'pastorImgInput', key: 'pastor-img', preview: 'pastorImgPreview', urlInput: 'pastorImgUrl' },
            { input: 'ng1ImgInput', key: 'ng-1-img', preview: 'ng1ImgPreview', urlInput: 'ng1ImgUrl' },
            { input: 'ng3ImgInput', key: 'ng-3-img', preview: 'ng3ImgPreview', urlInput: 'ng3ImgUrl' },
            { input: 'ng2ImgInput', key: 'ng-2-img', preview: 'ng2ImgPreview', urlInput: 'ng2ImgUrl' },
            { input: 'org1ImgInput', key: 'org-1-img', preview: 'org1ImgPreview', urlInput: 'org1ImgUrl' },
            { input: 'org2ImgInput', key: 'org-2-img', preview: 'org2ImgPreview', urlInput: 'org2ImgUrl' },
            { input: 'org3ImgInput', key: 'org-3-img', preview: 'org3ImgPreview', urlInput: 'org3ImgUrl' },
            { input: 'org4ImgInput', key: 'org-4-img', preview: 'org4ImgPreview', urlInput: 'org4ImgUrl' },
            { input: 'org5ImgInput', key: 'org-5-img', preview: 'org5ImgPreview', urlInput: 'org5ImgUrl' },
            { input: 'org6ImgInput', key: 'org-6-img', preview: 'org6ImgPreview', urlInput: 'org6ImgUrl' },
            { input: 'phil1ImgInput', key: 'phil-1-img', preview: 'phil1ImgPreview', urlInput: 'phil1ImgUrl' },
            { input: 'phil2ImgInput', key: 'phil-2-img', preview: 'phil2ImgPreview', urlInput: 'phil2ImgUrl' },
            { input: 'phil3ImgInput', key: 'phil-3-img', preview: 'phil3ImgPreview', urlInput: 'phil3ImgUrl' },

            // Sub-Page Headers
            { input: 'headerBgAboutInput', key: 'header-bg-about', preview: 'headerBgAboutPreview', urlInput: 'headerBgAboutUrl' },
            { input: 'headerBgWorshipInput', key: 'header-bg-worship', preview: 'headerBgWorshipPreview', urlInput: 'headerBgWorshipUrl' },
            { input: 'headerBgNextgenInput', key: 'header-bg-nextgen', preview: 'headerBgNextgenPreview', urlInput: 'headerBgNextgenUrl' },
            { input: 'headerBgPhilInput', key: 'header-bg-phil', preview: 'headerBgPhilPreview', urlInput: 'headerBgPhilUrl' },
            { input: 'headerBgNoticeInput', key: 'header-bg-notice', preview: 'headerBgNoticePreview', urlInput: 'headerBgNoticeUrl' },
            { input: 'headerBgOrgInput', key: 'header-bg-org', preview: 'headerBgOrgPreview', urlInput: 'headerBgOrgUrl' },
            { input: 'headerBgFamilyInput', key: 'header-bg-family', preview: 'headerBgFamilyPreview', urlInput: 'headerBgFamilyUrl' },
            { input: 'headerBgNewcomerInput', key: 'header-bg-newcomer', preview: 'headerBgNewcomerPreview', urlInput: 'headerBgNewcomerUrl' }
        ];

        imageConfigs.forEach(config => {
            setupImageUpload(config.input, config.key, config.preview, config.urlInput);
        });

        // Notice Management
        const saveNoticeBtn = document.getElementById('saveNoticeBtn');
        if (saveNoticeBtn) saveNoticeBtn.addEventListener('click', saveNotice);
        const newNoticeBtn = document.getElementById('newNoticeBtn');
        if (newNoticeBtn) newNoticeBtn.addEventListener('click', clearNoticeForm);

        // Sermon Management
        const createBtn = document.getElementById('createSermonBtn');
        if (createBtn) createBtn.addEventListener('click', () => saveSermon('create'));

        const updateBtn = document.getElementById('updateSermonBtn');
        if (updateBtn) updateBtn.addEventListener('click', () => saveSermon('update'));

        const cancelBtn = document.getElementById('cancelSermonBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', clearSermonForm);

        const newSermonBtn = document.getElementById('newSermonBtn');
        if (newSermonBtn) newSermonBtn.addEventListener('click', clearSermonForm);

        setupFileUpload('sermonFileInput', 'sermonFileBase64', 'sermonFileName');

        // Sermon Preacher Image Setup
        setupImageUpload('sermonPreacherImgInput', null, 'sermonPreacherImgPreview', 'sermonPreacherImgUrl');
        setupImageUpload('sermonThumbnailInput', null, 'sermonThumbnailPreview', 'sermonThumbnailUrl');

        // Image Loading Logic (using global getAdminPath)
        let savedData = {};
        try { savedData = JSON.parse(localStorage.getItem('siteData')) || {}; } catch (e) { }
        const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
        const data = { ...baseData, ...savedData };

        imageConfigs.forEach(config => {
            if (data[config.key]) {
                const preview = document.getElementById(config.preview);
                const urlInput = document.getElementById(config.urlInput);

                if (preview) {
                    preview.src = getAdminPath(data[config.key]);
                    preview.style.display = 'block';
                }

                if (urlInput && data[config.key].startsWith('http')) {
                    urlInput.value = data[config.key];
                }
            }
        });

        // Schedule Management
        setupScheduleListeners();
        // Initialize Page Builder only on Dashboard
        initPageBuilder();
    }
});

// --- HELPER FUNCTIONS ---

// --- PAGE BUILDER & SHORTCUTS LOGIC ---

// --- PAGE BUILDER & SHORTCUTS LOGIC ---

let pagesData = []; // [{id, title, blocks: []}]
let editingPageId = null;

function initPageBuilder() {

    console.log('initPageBuilder Started');
    try {
        // 1. Load Data
        loadCustomPages();
        loadShortcuts();

        // 2. Event Listeners for Page Management
        const addNewPageBtn = document.getElementById('addNewPageBtn');
        if (addNewPageBtn) addNewPageBtn.addEventListener('click', createNewPage);
        else console.warn('addNewPageBtn not found');

        const closeEditorBtn = document.getElementById('closeEditorBtn');
        if (closeEditorBtn) closeEditorBtn.addEventListener('click', closePageEditor);

        const deletePageBtn = document.getElementById('deletePageBtn');
        if (deletePageBtn) deletePageBtn.addEventListener('click', deleteCurrentPage);

        const editPageName = document.getElementById('editPageName');
        if (editPageName) editPageName.addEventListener('input', (e) => {
            if (editingPageId) {
                const page = pagesData.find(p => p.id === editingPageId);
                if (page) {
                    page.title = e.target.value;
                    updatePageListUI();
                }
            }
        });

        // 3. Drag and Drop Setup
        setupDragAndDrop();
        console.log('initPageBuilder Completed');
    } catch (e) {
        console.error('initPageBuilder Error:', e);
        alert('페이지 빌더 초기화 오류: ' + e.message);
    }
}

function loadCustomPages() {
    let savedData = {};
    try { savedData = JSON.parse(localStorage.getItem('siteData')) || {}; } catch (e) { }
    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };

    pagesData = data.customPages || [];
    updatePageListUI();
}

function updatePageListUI() {
    const list = document.getElementById('customPageList');
    if (!list) return;

    list.innerHTML = '';
    if (pagesData.length === 0) {
        list.innerHTML = '<li style="padding:10px; text-align:center; color:#888;">페이지가 없습니다.</li>';
        return;
    }

    pagesData.forEach(page => {
        const li = document.createElement('li');
        li.style.cssText = 'padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; cursor:pointer;';
        li.innerHTML = `<span><i class="fas fa-file-alt"></i> ${page.title}</span> <span style="font-size:0.8rem; color:#888;">ID: ${page.id}</span>`;
        li.addEventListener('click', () => openPageEditor(page.id));
        list.appendChild(li);
    });
}

function createNewPage() {
    const title = prompt('새 페이지 제목을 입력하세요:', '새 페이지');
    if (!title) return;

    const newId = 'page-' + Date.now();
    const newPage = {
        id: newId,
        title: title,
        blocks: []
    };

    pagesData.push(newPage);
    savePagesToSiteData();
    updatePageListUI();
    openPageEditor(newId);

    // Refresh shortcut dropdowns
    loadShortcuts();
}

function openPageEditor(pageId) {
    editingPageId = pageId;
    const page = pagesData.find(p => p.id === pageId);
    if (!page) return;

    document.getElementById('pageEditorArea').style.display = 'block';
    document.getElementById('editingPageTitle').textContent = '페이지 편집: ' + page.title;
    document.getElementById('editPageName').value = page.title;

    renderCanvas(page.blocks);

    // Scroll to editor
    document.getElementById('pageEditorArea').scrollIntoView({ behavior: 'smooth' });
}

function closePageEditor() {
    document.getElementById('pageEditorArea').style.display = 'none';
    editingPageId = null;
    document.getElementById('stylePanel').innerHTML = `
        <h5 style="margin-bottom:15px; color:#555;">스타일 설정</h5>
        <div id="styleEditorContent">
            <p style="color:#888; font-size:0.9rem;">캔버스에서 블록을 선택하면<br>설정 메뉴가 나타납니다.</p>
        </div>`;

    // Save on close
    savePagesToSiteData();
}

function deleteCurrentPage() {
    if (!confirm('정말 이 페이지를 삭제하시겠습니까?')) return;

    pagesData = pagesData.filter(p => p.id !== editingPageId);
    savePagesToSiteData();
    updatePageListUI();
    closeEditorBtn.click();

    // Refresh shortcuts
    loadShortcuts();
}

function savePagesToSiteData() {
    let savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    let currentData = { ...baseData, ...savedData };

    currentData.customPages = pagesData;
    localStorage.setItem('siteData', JSON.stringify(currentData));

    // Optional: Auto-save to server silently? Or wait for main specific save?
    // Let's rely on main specific save for valid persistence, but update localStorage for immediate UI.
}

// --- CANVAS & BLOCKS ---

function renderCanvas(blocks) {
    const canvas = document.getElementById('builderCanvas');
    canvas.innerHTML = '';

    if (blocks.length === 0) {
        canvas.innerHTML = `
            <div class="canvas-placeholder" style="text-align:center; color:#888; margin-top:100px; border:2px dashed #ccc; padding:20px;">
                왼쪽에서 블록을 드래그하여 이곳에 놓으세요
            </div>`;
        return;
    }

    blocks.forEach((block, index) => {
        const blockEl = createBlockElement(block, index);
        canvas.appendChild(blockEl);
    });
}

function createBlockElement(block, index) {
    const div = document.createElement('div');
    div.className = 'builder-block';
    div.dataset.index = index;
    div.draggable = true;

    // Basic Style
    div.style.cssText = `
        position: relative;
        padding: 5px;
        margin-bottom: 2px;
        border: 2px solid transparent;
        cursor: pointer;
        background: #fff;
    `;

    // Apply Block Styles (Preview)
    // Note: This is an editor preview, so it might not be 100% same as frontend, but close.
    let contentHtml = '';

    if (block.type === 'text') {
        div.style.padding = block.styles.padding || '10px';
        div.style.backgroundColor = block.styles.backgroundColor || 'transparent';
        div.style.textAlign = block.styles.textAlign || 'left';
        contentHtml = `<div style="
            font-size: ${block.styles.fontSize || '1rem'};
            color: ${block.styles.color || '#333'};
            font-weight: ${block.styles.fontWeight || 'normal'};
        ">${block.content || '텍스트 입력...'}</div>`;

    } else if (block.type === 'image') {
        const imgUrl = block.content || 'https://via.placeholder.com/300x200?text=No+Image';
        contentHtml = `<img src="${getAdminPath(imgUrl)}" style="
            width: ${block.styles.width || '100%'};
            border-radius: ${block.styles.borderRadius || '0px'};
            display: block; margin: 0 auto;
        ">`;

    } else if (block.type === 'button') {
        div.style.textAlign = block.styles.align || 'center';
        div.style.padding = '10px';
        contentHtml = `<button style="
            padding: ${block.styles.padding || '10px 20px'};
            background-color: ${block.styles.backgroundColor || '#3498db'};
            color: ${block.styles.color || '#fff'};
            border: none;
            border-radius: ${block.styles.borderRadius || '4px'};
            font-size: ${block.styles.fontSize || '1rem'};
        ">${block.content.text || '버튼'}</button>`;

    } else if (block.type === 'banner') {
        const bgUrl = block.content.image || '';
        contentHtml = `<div style="
            height: ${block.styles.height || '200px'};
            background-image: url('${getAdminPath(bgUrl)}');
            background-size: cover;
            background-position: center;
            display: flex; align-items: center; justify-content: center;
            color: #fff; position: relative;
        ">
            <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center;">
                <h3>${block.content.title || '배너 타이틀'}</h3>
                <p>${block.content.subtitle || ''}</p>
            </div>
        </div>`;

    } else if (block.type === 'spacer') {
        contentHtml = `<div style="height: ${block.styles.height || '50px'}; background: #eee; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 0.8rem;">여백 (${block.styles.height || '50px'})</div>`;
    }

    div.innerHTML = contentHtml;

    // Selection Highlight
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectBlock(index);
    });

    // Drag Start (Reordering)
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'reorder', index: index }));
        e.dataTransfer.effectAllowed = 'move';
    });

    return div;
}

function selectBlock(index) {
    // UI Update
    document.querySelectorAll('.builder-block').forEach(el => {
        el.style.border = '2px solid transparent';
        if (el.dataset.index == index) el.style.border = '2px solid #3498db';
    });

    const page = pagesData.find(p => p.id === editingPageId);
    if (!page) return;
    const block = page.blocks[index];

    renderStylePanel(block, index);
}

function renderStylePanel(block, index) {
    const panel = document.getElementById('styleEditorContent');
    const page = pagesData.find(p => p.id === editingPageId);

    let html = `<h6>${block.type.toUpperCase()} 설정</h6>`;

    // Common Content Editors
    if (block.type === 'text') {
        html += `
        <div class="form-group">
            <label>내용</label>
            <textarea id="style-content" rows="4">${block.content}</textarea>
        </div>
        <div class="form-group">
            <label>글자 크기</label>
            <input type="text" id="style-fontSize" value="${block.styles.fontSize || '1rem'}">
        </div>
        <div class="form-group">
            <label>색상</label>
            <input type="color" id="style-color" value="${block.styles.color || '#333333'}">
        </div>
        <div class="form-group">
            <label>정렬 (left/center/right)</label>
            <select id="style-textAlign">
                <option value="left" ${block.styles.textAlign === 'left' ? 'selected' : ''}>왼쪽</option>
                <option value="center" ${block.styles.textAlign === 'center' ? 'selected' : ''}>가운데</option>
                <option value="right" ${block.styles.textAlign === 'right' ? 'selected' : ''}>오른쪽</option>
            </select>
        </div>
        `;
    } else if (block.type === 'image') {
        html += `
        <div class="form-group">
            <label>이미지 URL</label>
            <input type="text" id="style-content" value="${block.content}">
        </div>
        <div class="form-group">
            <label>너비 (예: 100%, 300px)</label>
            <input type="text" id="style-width" value="${block.styles.width || '100%'}">
        </div>
        `;
    } else if (block.type === 'spacer') {
        html += `
        <div class="form-group">
            <label>높이</label>
            <input type="text" id="style-height" value="${block.styles.height || '50px'}">
        </div>`;
    }

    // Add Remove Button
    html += `<hr><button class="btn-delete" style="width:100%;" onclick="removeBlock(${index})">블록 삭제</button>`;

    panel.innerHTML = html;

    // Bind Events
    const inputs = panel.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const key = e.target.id.replace('style-', '');
            const val = e.target.value;

            if (key === 'content') {
                block.content = val;
            } else {
                block.styles[key] = val;
            }

            // Re-render Canvas
            renderCanvas(page.blocks);
            // Re-select to keep focus
            selectBlock(index);
        });
    });
}

function removeBlock(index) {
    const page = pagesData.find(p => p.id === editingPageId);
    if (page) {
        page.blocks.splice(index, 1);
        renderCanvas(page.blocks);
        document.getElementById('styleEditorContent').innerHTML = '<p>블록이 삭제되었습니다.</p>';
    }
}


function setupDragAndDrop() {
    // 1. Draggable Items in Palette
    const draggables = document.querySelectorAll('.draggable-block');
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'new',
                blockType: item.dataset.type
            }));
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    // 2. Drop Zone (Canvas)
    const canvas = document.getElementById('builderCanvas');
    if (canvas) {
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const rawData = e.dataTransfer.getData('text/plain');
            if (!rawData) return;

            const data = JSON.parse(rawData);
            const page = pagesData.find(p => p.id === editingPageId);
            if (!page) return;

            if (data.type === 'new') {
                // Create New Block
                const newBlock = createDefaultBlock(data.blockType);
                page.blocks.push(newBlock);
                renderCanvas(page.blocks);
                selectBlock(page.blocks.length - 1);
            } else if (data.type === 'reorder') {
                // Handle Reorder (Simple append to end for now, or sophisticated logic)
                // Ideally we find drop target index.
                // For simplicity in this v1, checking if dropped on another block could swap.
                // But let's just support "New Block" mainly or simple append.
                // Implementing reorder would require finding the target element.
            }
        });
    } else {
        console.warn('builderCanvas element not found');
    }
}

function createDefaultBlock(type) {
    const base = { type: type, styles: {} };
    if (type === 'text') {
        base.content = '여기에 텍스트를 입력하세요.';
        base.styles = { fontSize: '1rem', color: '#333', textAlign: 'left', padding: '10px' };
    } else if (type === 'image') {
        base.content = '';
        base.styles = { width: '100%' };
    } else if (type === 'button') {
        base.content = { text: '버튼', link: '#' };
        base.styles = { backgroundColor: '#3498db', color: '#fff', padding: '10px 20px', borderRadius: '4px' };
    } else if (type === 'banner') {
        base.content = { title: '배너 제목', subtitle: '부제목', image: '' };
        base.styles = { height: '200px' };
    } else if (type === 'spacer') {
        base.content = '';
        base.styles = { height: '50px' };
    }
    return base;
}

// --- SHORTCUTS LOGIC ---
function loadShortcuts() {
    let savedData = {};
    try { savedData = JSON.parse(localStorage.getItem('siteData')) || {}; } catch (e) { }
    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };

    const shortcuts = data.shortcuts || {};

    // Populate Dropdowns
    const selects = ['shortcut1Link', 'shortcut2Link', 'shortcut3Link', 'shortcut4Link'];
    selects.forEach((id, idx) => {
        const select = document.getElementById(id);
        if (!select) return;

        // Reset
        select.innerHTML = '<option value="">기본 페이지</option>';

        // Add Custom Pages
        if (pagesData) {
            pagesData.forEach(page => {
                const opt = document.createElement('option');
                opt.value = page.id;
                opt.textContent = page.title;
                select.appendChild(opt);
            });
        }

        // Set Value
        const key = `link-${idx + 1}`;
        if (shortcuts[key] && shortcuts[key].targetId) {
            select.value = shortcuts[key].targetId;
        }
    });
}

function collectShortcutsData() {
    const shortcuts = {};
    ['shortcut1Link', 'shortcut2Link', 'shortcut3Link', 'shortcut4Link'].forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el && el.value) {
            shortcuts[`link-${idx + 1}`] = { targetId: el.value };
        }
    });
    return shortcuts;
}

// !!! IMPORTANT: The main saveDashboardData needs to call this.
// Since I can't easily edit the middle of that big function, I will override it here 
// by copying the critical parts or just patching the result before save.
// Wait, I can just listen to the button click, update the 'siteData' in localStorage with my parts, then let the original function do its thing?
// The original function reads '...savedData' and merges. So if I save to localStorage first, it might work.
// BUT the original function reads 'inputs' and overwrites.
// Let's just create a new 'saveAllWithBuilder()' function and attach it to the button, removing the old listener if possible?
// Or just let both run.
// Best approach: I will Replace the 'saveDashboardData' function in the previous step content if I could.
// Since I am already here, I will use `replace_file_content` to inject the call inside `saveDashboardData` in the NEXT step.

// Add Init Call
document.addEventListener('DOMContentLoaded', initPageBuilder);




function setupImageUpload(inputId, storeKey, previewId, urlInputId) {
    const input = document.getElementById(inputId);
    const urlInput = urlInputId ? document.getElementById(urlInputId) : null;
    const preview = document.getElementById(previewId);

    if (!input) return;

    // File Input Change - SERVER UPLOAD
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate generic size on client side too
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하여야 합니다.');
                input.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                // Show loading state (optional: simple alert or cursor change)
                document.body.style.cursor = 'wait';

                const response = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();
                let fileUrl = result.url;

                // Force relative path if server returned absolute
                if (fileUrl.startsWith('http://localhost:3000/uploads/')) {
                    fileUrl = '.' + fileUrl.replace('http://localhost:3000', '');
                } else if (fileUrl.startsWith('/uploads/')) {
                    fileUrl = '.' + fileUrl;
                }

                // Update Preview with Admin-adjusted path
                if (preview) {
                    preview.src = getAdminPath(fileUrl);
                    preview.style.display = 'block';
                }

                // Store URL instead of Base64
                input.dataset.tempData = fileUrl;

                // Clear URL input if file is selected
                if (urlInput) urlInput.value = '';

                alert('이미지 업로드 완료!');

            } catch (error) {
                console.error('Error:', error);
                alert('이미지 업로드 실패: 서버가 실행 중인지 확인해주세요.\n(npm start 또는 node server.js)');
                input.value = ''; // Clear input
            } finally {
                document.body.style.cursor = 'default';
            }
        }
    });

    // URL Input Change (Manual URL entry still supported)
    if (urlInput) {
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                if (preview) {
                    preview.src = url;
                    preview.style.display = 'block';
                }
                // Store URL as data
                input.dataset.tempData = url;
                // Clear file input value
                input.value = '';
            }
        });
    }
}

function setupFileUpload(inputId, hiddenInputId, nameDisplayId) {
    const input = document.getElementById(inputId);
    const hidden = document.getElementById(hiddenInputId);
    const nameDisplay = document.getElementById(nameDisplayId);

    if (input) {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Client-size check (e.g. 50MB) - Server is unrestricted now
                if (file.size > 50 * 1024 * 1024) {
                    alert('파일 크기는 50MB 이하여야 합니다.');
                    input.value = '';
                    return;
                }

                const formData = new FormData();
                formData.append('image', file); // API expects 'image' key currently

                try {
                    nameDisplay.textContent = '업로드 중...';
                    document.body.style.cursor = 'wait';

                    const response = await fetch('http://localhost:3000/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const result = await response.json();

                    // Success
                    nameDisplay.textContent = file.name + ' (완료)';
                    hidden.value = result.url; // Store URL

                    // Trigger auto-save if desired, or just let user click save
                    // If this is part of dashboard, we might want to warn user to click save
                    alert('파일이 업로드되었습니다. 꼭 "전체 저장" 버튼을 눌러 확옥해주세요.');

                } catch (error) {
                    console.error('Error:', error);
                    alert('파일 업로드 실패: 로컬 서버(node server.js)가 실행 중인지 확인해주세요.');
                    nameDisplay.textContent = '';
                    input.value = '';
                } finally {
                    document.body.style.cursor = 'default';
                }
            }
        });
    }
}

// Helper to save data to server
async function saveDataToServer(data) {
    try {
        const response = await fetch('http://localhost:3000/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Server save failed');
        }
        return true;
    } catch (error) {
        console.error('Server Save Error:', error);
        alert('주의: 로컬 서버에 저장하지 못했습니다.\n(node server.js 실행 여부를 확인하세요)\n\n변경사항은 브라우저에는 임시 저장되었지만, 배포 시 적용되지 않습니다.');
        return false;
    }
}

function loadDashboardData() {
    // Load from defaultData (Server) first
    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};

    // We can still check localStorage for *unsaved* drafts if we wanted, 
    // but to explain the "fix" we initially trust the server. 
    // However, for Admin inputs, maybe we DO want merged data?
    // User issue was "admin page update not applying" on the *site*.
    // So admin showing localStorage is fine, as long as SAVE updates server.
    // But let's keep it consistent: always load fresh server data on reload.
    let savedData = {};
    // try { savedData = JSON.parse(localStorage.getItem('siteData')) || {}; } catch (e) { } 

    // For now, force load from server data to avoid confusion
    const data = { ...baseData };

    // Ensure worship data exists (fallback to default if empty even if property exists)
    if (!data.worshipSunday || data.worshipSunday.length === 0) data.worshipSunday = baseData.worshipSunday || [];
    if (!data.worshipWeekday || data.worshipWeekday.length === 0) data.worshipWeekday = baseData.worshipWeekday || [];

    // [Generic Loader] Populate all inputs/textareas/selects with matching names
    const inputs = document.querySelectorAll('input[type="text"]:not(.img-url-input), textarea, select');
    inputs.forEach(input => {
        if (input.name && data[input.name] !== undefined) {
            let val = data[input.name];
            if (typeof val === 'string') {
                val = val.replace(/<br>/g, '\n');
            }
            input.value = val;
        }
    });

    // Image Previews & URL Inputs
    const imageConfigs = [
        { key: 'hero-bg', preview: 'heroBgPreview', urlInput: 'heroBgUrl', input: 'heroBgInput' },
        { key: 'pastor-img', preview: 'pastorImgPreview', urlInput: 'pastorImgUrl', input: 'pastorImgInput' },
        { key: 'ng-1-img', preview: 'ng1ImgPreview', urlInput: 'ng1ImgUrl', input: 'ng1ImgInput' },
        { key: 'ng-3-img', preview: 'ng3ImgPreview', urlInput: 'ng3ImgUrl', input: 'ng3ImgInput' },
        { key: 'ng-2-img', preview: 'ng2ImgPreview', urlInput: 'ng2ImgUrl', input: 'ng2ImgInput' },
        { key: 'org-1-img', preview: 'org1ImgPreview', urlInput: 'org1ImgUrl', input: 'org1ImgInput' },
        { key: 'org-2-img', preview: 'org2ImgPreview', urlInput: 'org2ImgUrl', input: 'org2ImgInput' },
        { key: 'org-3-img', preview: 'org3ImgPreview', urlInput: 'org3ImgUrl', input: 'org3ImgInput' },
        { key: 'org-4-img', preview: 'org4ImgPreview', urlInput: 'org4ImgUrl', input: 'org4ImgInput' },
        { key: 'org-5-img', preview: 'org5ImgPreview', urlInput: 'org5ImgUrl', input: 'org5ImgInput' },
        { key: 'phil-1-img', preview: 'phil1ImgPreview', urlInput: 'phil1ImgUrl', input: 'phil1ImgInput' },
        { key: 'phil-2-img', preview: 'phil2ImgPreview', urlInput: 'phil2ImgUrl', input: 'phil2ImgInput' },
        { key: 'phil-3-img', preview: 'phil3ImgPreview', urlInput: 'phil3ImgUrl', input: 'phil3ImgInput' },

        // Sub-Page Headers
        { key: 'header-bg-about', preview: 'headerBgAboutPreview', urlInput: 'headerBgAboutUrl', input: 'headerBgAboutInput' },
        { key: 'header-bg-worship', preview: 'headerBgWorshipPreview', urlInput: 'headerBgWorshipUrl', input: 'headerBgWorshipInput' },
        { key: 'header-bg-nextgen', preview: 'headerBgNextgenPreview', urlInput: 'headerBgNextgenUrl', input: 'headerBgNextgenInput' },
        { key: 'header-bg-phil', preview: 'headerBgPhilPreview', urlInput: 'headerBgPhilUrl', input: 'headerBgPhilInput' },
        { key: 'header-bg-notice', preview: 'headerBgNoticePreview', urlInput: 'headerBgNoticeUrl', input: 'headerBgNoticeInput' },
        { key: 'header-bg-org', preview: 'headerBgOrgPreview', urlInput: 'headerBgOrgUrl', input: 'headerBgOrgInput' }
    ];

    imageConfigs.forEach(config => {
        if (data[config.key]) {
            const preview = document.getElementById(config.preview);
            const urlInput = document.getElementById(config.urlInput);

            if (preview) {
                preview.src = getAdminPath(data[config.key]);
                preview.style.display = 'block';
            }

            if (urlInput && data[config.key].startsWith('http')) {
                urlInput.value = data[config.key];
            }
        }
    });

    // Load Schedules
    loadSchedules(data);
}

function saveDashboardData() {
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };
    const currentData = { ...data };

    // 1. Collect Input/Textarea/Select Data
    const inputs = document.querySelectorAll('input[type="text"]:not(.img-url-input), textarea, select');
    inputs.forEach(input => {
        if (input.name) {
            currentData[input.name] = input.value.replace(/\n/g, '<br>');
        }
    });

    // 2. Collect Image Data (Priority: Uploaded Temp URL > URL Input > Existing Data)
    const imageConfigs = [
        { key: 'hero-bg', preview: 'heroBgPreview', urlInput: 'heroBgUrl', input: 'heroBgInput' },
        { key: 'pastor-img', preview: 'pastorImgPreview', urlInput: 'pastorImgUrl', input: 'pastorImgInput' },
        { key: 'ng-1-img', preview: 'ng1ImgPreview', urlInput: 'ng1ImgUrl', input: 'ng1ImgInput' },
        { key: 'ng-3-img', preview: 'ng3ImgPreview', urlInput: 'ng3ImgUrl', input: 'ng3ImgInput' },
        { key: 'ng-2-img', preview: 'ng2ImgPreview', urlInput: 'ng2ImgUrl', input: 'ng2ImgInput' },
        { key: 'org-1-img', preview: 'org1ImgPreview', urlInput: 'org1ImgUrl', input: 'org1ImgInput' },
        { key: 'org-2-img', preview: 'org2ImgPreview', urlInput: 'org2ImgUrl', input: 'org2ImgInput' },
        { key: 'org-3-img', preview: 'org3ImgPreview', urlInput: 'org3ImgUrl', input: 'org3ImgInput' },
        { key: 'org-4-img', preview: 'org4ImgPreview', urlInput: 'org4ImgUrl', input: 'org4ImgInput' },
        { key: 'org-5-img', preview: 'org5ImgPreview', urlInput: 'org5ImgUrl', input: 'org5ImgInput' },
        { key: 'org-6-img', preview: 'org6ImgPreview', urlInput: 'org6ImgUrl', input: 'org6ImgInput' },
        { key: 'phil-1-img', preview: 'phil1ImgPreview', urlInput: 'phil1ImgUrl', input: 'phil1ImgInput' },
        { key: 'phil-2-img', preview: 'phil2ImgPreview', urlInput: 'phil2ImgUrl', input: 'phil2ImgInput' },
        { key: 'phil-3-img', preview: 'phil3ImgPreview', urlInput: 'phil3ImgUrl', input: 'phil3ImgInput' },

        // Sub-Page Headers
        { key: 'header-bg-about', preview: 'headerBgAboutPreview', urlInput: 'headerBgAboutUrl', input: 'headerBgAboutInput' },
        { key: 'header-bg-worship', preview: 'headerBgWorshipPreview', urlInput: 'headerBgWorshipUrl', input: 'headerBgWorshipInput' },
        { key: 'header-bg-nextgen', preview: 'headerBgNextgenPreview', urlInput: 'headerBgNextgenUrl', input: 'headerBgNextgenInput' },
        { key: 'header-bg-phil', preview: 'headerBgPhilPreview', urlInput: 'headerBgPhilUrl', input: 'headerBgPhilInput' },
        { key: 'header-bg-notice', preview: 'headerBgNoticePreview', urlInput: 'headerBgNoticeUrl', input: 'headerBgNoticeInput' },
        { key: 'header-bg-org', preview: 'headerBgOrgPreview', urlInput: 'headerBgOrgUrl', input: 'headerBgOrgInput' }
    ];
    imageConfigs.forEach(config => {
        const fileInput = document.getElementById(config.input);
        const urlInput = document.getElementById(config.urlInput);

        // Check for temp data from upload first
        if (fileInput && fileInput.dataset.tempData) {
            currentData[config.key] = fileInput.dataset.tempData;
        }
        // Then check manual URL input
        else if (urlInput && urlInput.value) {
            currentData[config.key] = urlInput.value;
        }

        // Sanitize Path: Ensure local uploads use relative path ./uploads/
        // This fixes the issue if server returns /uploads/ (absolute)
        if (currentData[config.key] && currentData[config.key].startsWith('/uploads/')) {
            currentData[config.key] = '.' + currentData[config.key];
        }
    });

    // 3. Collect Schedule Data
    const scheduleData = collectScheduleData();
    currentData.weeklySchedule = scheduleData.weeklySchedule;
    currentData.worshipSunday = scheduleData.worshipSunday;
    currentData.worshipWeekday = scheduleData.worshipWeekday;

    // 4. Collect Shortcuts Data (New)
    if (typeof collectShortcutsData === 'function') {
        const shortcutsData = collectShortcutsData();
        currentData.shortcuts = shortcutsData;
    }

    // 5. Ensure Custom Pages are included (from global state if edited)
    if (typeof pagesData !== 'undefined') {
        currentData.customPages = pagesData;
    }

    // Save to LocalStorage (Backup/Fast Access)
    localStorage.setItem('siteData', JSON.stringify(currentData));

    // Save to Server (File Persistence)
    saveDataToServer(currentData).then(success => {
        if (success) {
            // Clear localStorage to ensure next load fetches fresh data from server
            localStorage.removeItem('siteData');
            alert('모든 변경사항이 저장되었습니다.\n(js/data.js 파일이 업데이트됨)');
        }
    });
}

function exportDashboardData() {
    const data = localStorage.getItem('siteData');
    if (!data) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'church_data_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// --- NOTICE FUNCTIONS ---

function loadAdminNotices() {
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };
    const notices = data.notices || [];

    const listContainer = document.querySelector('.notice-list-admin');
    if (!listContainer) return;

    // Sort desc
    const sorted = [...notices].sort((a, b) => b.id - a.id);

    let html = '';
    if (sorted.length === 0) {
        html = '<p style="text-align:center; color:#888;">등록된 공지사항이 없습니다.</p>';
    } else {
        sorted.forEach(notice => {
            html += `
            <div class="notice-item-admin">
                <div>
                    <span class="badge badge-primary">${notice.category}</span>
                    <span style="font-weight:bold; margin-left: 5px;">${notice.title}</span>
                    <span style="font-size:0.85rem; color:#888; margin-left:10px;">(${notice.date})</span>
                </div>
                <div class="notice-actions">
                    <button type="button" class="btn-edit" onclick="editNotice(${notice.id})">수정</button>
                    <button type="button" class="btn-delete" onclick="deleteNotice(${notice.id})">삭제</button>
                </div>
            </div>`;
        });
    }
    listContainer.innerHTML = html;
}


window.editNotice = function (id) {
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { console.error(e); }
    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };

    const notices = data.notices || [];
    const notice = notices.find(n => n.id === id);

    if (notice) {
        document.getElementById('noticeId').value = notice.id;
        document.getElementById('noticeCategory').value = notice.category;
        document.getElementById('noticeTitle').value = notice.title;
        document.getElementById('noticeDate').value = notice.date;
        document.getElementById('noticeContent').value = notice.content.replace(/<br>/g, '\n');

        const formGroup = document.querySelector('#notice .form-group');
        if (formGroup) {
            formGroup.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

window.deleteNotice = function (id) {
    if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    let currentData = { ...baseData, ...savedData };
    let notices = currentData.notices || [];
    notices = notices.filter(n => n.id !== id);

    currentData.notices = notices;
    localStorage.setItem('siteData', JSON.stringify(currentData));

    // Save to Server
    saveDataToServer(currentData).then(() => {
        loadAdminNotices();
        clearNoticeForm();
    });
};

function saveNotice() {
    const id = document.getElementById('noticeId').value;
    const category = document.getElementById('noticeCategory').value;
    const title = document.getElementById('noticeTitle').value;
    const date = document.getElementById('noticeDate').value;
    let content = document.getElementById('noticeContent').value;

    if (!title || !date) {
        alert('제목과 날짜는 필수입니다.');
        return;
    }

    content = content.replace(/\n/g, '<br>');

    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    let currentData = { ...baseData, ...savedData };
    let notices = currentData.notices || [];

    if (id) {
        const index = notices.findIndex(n => n.id == id);
        if (index !== -1) {
            notices[index] = { id: parseInt(id), category, title, date, content };
        }
    } else {
        const newId = notices.length > 0 ? Math.max(0, ...notices.map(n => n.id)) + 1 : 1;
        notices.push({ id: newId, category, title, date, content });
    }

    currentData.notices = notices;
    localStorage.setItem('siteData', JSON.stringify(currentData));

    saveDataToServer(currentData).then(() => {
        alert('공지사항이 저장되었습니다.');
        loadAdminNotices();
        clearNoticeForm();
    });
}

function clearNoticeForm() {
    document.getElementById('noticeId').value = '';
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeDate').value = '';
    document.getElementById('noticeContent').value = '';
    document.getElementById('noticeCategory').value = '공지';
}

// --- SERMON FUNCTIONS ---

function loadAdminSermons() {
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };

    const sermons = data.sermons || [];
    const listContainer = document.querySelector('.sermon-list-admin');

    if (!listContainer) return;

    const sortedSermons = [...sermons].sort((a, b) => b.id - a.id);

    let html = '';
    if (sortedSermons.length === 0) {
        html = '<p style="text-align:center; color:#888;">등록된 설교가 없습니다.</p>';
    } else {
        sortedSermons.forEach(sermon => {
            html += `
            <div class="notice-item-admin">
                <div>
                    <span style="font-weight:bold; color:#2c3e50;">${sermon.title}</span>
                    <span style="font-size:0.85rem; color:#888; margin-left:10px;">(${sermon.date})</span>
                </div>
                <div class="notice-actions">
                    <button type="button" class="btn-edit" onclick="editSermon(${sermon.id})">수정</button>
                    <button type="button" class="btn-delete" onclick="deleteSermon(${sermon.id})">삭제</button>
                </div>
            </div>
            `;
        });
    }
    listContainer.innerHTML = html;
}

window.editSermon = function (id) {
    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    const data = { ...baseData, ...savedData };

    const sermons = data.sermons || [];
    const sermon = sermons.find(s => s.id === id);

    if (sermon) {
        document.getElementById('sermonId').value = sermon.id;
        document.getElementById('sermonDate').value = sermon.date;
        document.getElementById('sermonTitle').value = sermon.title;
        document.getElementById('sermonScripture').value = sermon.scripture;
        document.getElementById('sermonPreacher').value = sermon.preacher;
        document.getElementById('sermonVideoUrl').value = sermon.videoUrl;
        document.getElementById('sermonSummary').value = sermon.summary;

        // Preacher Image Loading
        const preacherImgInput = document.getElementById('sermonPreacherImgInput');
        const preacherImgUrl = document.getElementById('sermonPreacherImgUrl');
        const preacherImgPreview = document.getElementById('sermonPreacherImgPreview');
        if (sermon.preacherImg) {
            if (preacherImgPreview) {
                preacherImgPreview.src = sermon.preacherImg;
                preacherImgPreview.style.display = 'block';
            }
            if (preacherImgUrl && sermon.preacherImg.startsWith('http')) {
                preacherImgUrl.value = sermon.preacherImg;
            }
            if (preacherImgInput) {
                preacherImgInput.dataset.tempData = sermon.preacherImg;
            }
        } else {
            if (preacherImgPreview) preacherImgPreview.src = '';
            if (preacherImgUrl) preacherImgUrl.value = '';
        }

        // Thumbnail Image Loading
        const thumbnailInput = document.getElementById('sermonThumbnailInput');
        const thumbnailPreview = document.getElementById('sermonThumbnailPreview');
        const thumbnailUrl = document.getElementById('sermonThumbnailUrl');
        if (sermon.thumbnail) {
            if (thumbnailPreview) {
                thumbnailPreview.src = sermon.thumbnail;
                thumbnailPreview.style.display = 'block';
            }
            if (thumbnailUrl && sermon.thumbnail.startsWith('http')) {
                thumbnailUrl.value = sermon.thumbnail;
            }
            if (thumbnailInput) {
                thumbnailInput.dataset.tempData = sermon.thumbnail;
            }
        } else {
            if (thumbnailPreview) {
                thumbnailPreview.src = '';
                thumbnailPreview.style.display = 'none';
            }
            if (thumbnailUrl) thumbnailUrl.value = '';
        }

        if (sermon.file) {
            const fileNameElem = document.getElementById('sermonFileName');
            if (fileNameElem) fileNameElem.textContent = '기존 파일 유지됨';

            const fileBase64Elem = document.getElementById('sermonFileBase64');
            if (fileBase64Elem) fileBase64Elem.value = sermon.file;
        } else {
            const fileNameElem = document.getElementById('sermonFileName');
            if (fileNameElem) fileNameElem.textContent = '선택된 파일 없음';

            const fileBase64Elem = document.getElementById('sermonFileBase64');
            if (fileBase64Elem) fileBase64Elem.value = '';
        }

        const createBtn = document.getElementById('createSermonBtn');
        const updateBtn = document.getElementById('updateSermonBtn');
        const cancelBtn = document.getElementById('cancelSermonBtn');

        if (createBtn) createBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'block';
        if (cancelBtn) cancelBtn.style.display = 'block';

        const formGroup = document.querySelector('#sermon .form-group');
        if (formGroup) formGroup.scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteSermon = function (id) {
    if (!confirm('정말 이 설교를 삭제하시겠습니까?')) return;

    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    let currentData = { ...baseData, ...savedData };
    let sermons = currentData.sermons || [];

    sermons = sermons.filter(s => s.id !== id);

    currentData.sermons = sermons;
    localStorage.setItem('siteData', JSON.stringify(currentData));

    saveDataToServer(currentData).then(() => {
        loadAdminSermons();
        clearSermonForm();
    });
};

function saveSermon(mode) {
    const id = document.getElementById('sermonId').value;
    const date = document.getElementById('sermonDate').value;
    const title = document.getElementById('sermonTitle').value;
    const scripture = document.getElementById('sermonScripture').value;
    const preacher = document.getElementById('sermonPreacher').value;
    const videoUrl = document.getElementById('sermonVideoUrl').value;
    const summary = document.getElementById('sermonSummary').value;
    const fileBase64 = document.getElementById('sermonFileBase64').value;

    // Get Preacher Image
    const preacherImgInput = document.getElementById('sermonPreacherImgInput');
    let preacherImg = '';
    if (preacherImgInput && preacherImgInput.dataset.tempData) {
        preacherImg = preacherImgInput.dataset.tempData;
    }

    // Get Thumbnail Image
    const thumbnailInput = document.getElementById('sermonThumbnailInput');
    const thumbnailUrlInput = document.getElementById('sermonThumbnailUrl');
    let thumbnail = '';

    // Priority: Uploaded > URL Input > Existing Data (will be handled during update merge if empty)
    if (thumbnailInput && thumbnailInput.dataset.tempData) {
        thumbnail = thumbnailInput.dataset.tempData;
    } else if (thumbnailUrlInput && thumbnailUrlInput.value) {
        thumbnail = thumbnailUrlInput.value;
    }

    if (!title || !date) {
        alert('설교 제목과 날짜는 필수입니다.');
        return;
    }

    let savedData = {};
    try {
        savedData = JSON.parse(localStorage.getItem('siteData')) || {};
    } catch (e) { }

    const baseData = (typeof defaultData !== 'undefined') ? defaultData : {};
    let currentData = { ...baseData, ...savedData };
    let sermons = [...(currentData.sermons || [])];

    // Helper for safe embed URL (same as main.js logic)
    const getSafeEmbedUrl = (url) => {
        if (!url) return '';
        const badIds = ['dQw4w9WgXcQ', 'BHACKCNDMW8'];
        if (badIds.some(badId => url.includes(badId))) {
            return 'https://www.youtube.com/embed/nU_4xk96Z8g?start=7';
        }
        let videoId = '';
        let timeParam = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            videoId = match[2];
        }
        if (url.includes('t=') || url.includes('start=')) {
            const timeMatch = url.match(/[?&](t|start)=([^&]+)/);
            if (timeMatch && timeMatch[2]) {
                const timeVal = timeMatch[2].replace('s', '');
                timeParam = `?start=${timeVal}`;
            }
        }
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}${timeParam}`;
        }
        return url;
    };

    const finalVideoUrl = getSafeEmbedUrl(videoUrl);

    if (mode === 'update' && id) {
        const index = sermons.findIndex(s => s.id == id);
        if (index !== -1) {
            const existing = sermons[index];
            sermons[index] = {
                id: parseInt(id),
                date, title, scripture, preacher, videoUrl: finalVideoUrl, summary,
                file: fileBase64,
                file: fileBase64,
                // If new image, use it, else keep existing
                preacherImg: preacherImg || existing.preacherImg,
                thumbnail: thumbnail || existing.thumbnail
            };
            alert('설교가 수정되었습니다.');
        } else {
            alert('수정할 설교를 찾을 수 없습니다.');
            return;
        }
    } else {
        const newId = sermons.length > 0 ? Math.max(0, ...sermons.map(s => parseInt(s.id) || 0)) + 1 : 1;
        sermons.push({
            id: newId,
            date, title, scripture, preacher, videoUrl: finalVideoUrl, summary,
            file: fileBase64,
            preacherImg: preacherImg,
            thumbnail: thumbnail
        });
        alert('새 설교가 등록되었습니다.');
    }

    currentData.sermons = sermons;

    try {
        localStorage.setItem('siteData', JSON.stringify(currentData));

        saveDataToServer(currentData).then(() => {
            if (mode === 'create') alert('새 설교가 등록되었습니다.');
            else alert('설교가 수정되었습니다.');

            loadAdminSermons();
            clearSermonForm();
        });

    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('저장 용량이 초과되었습니다. 첨부파일 크기를 줄여주세요.');
        } else {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        }
    }
}

function clearSermonForm() {
    const fields = ['sermonId', 'sermonDate', 'sermonTitle', 'sermonScripture', 'sermonPreacher', 'sermonVideoUrl', 'sermonSummary', 'sermonFileBase64', 'sermonFileInput', 'sermonPreacherImgInput', 'sermonPreacherImgUrl'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const thumbnailFields = ['sermonThumbnailInput', 'sermonThumbnailUrl'];
    thumbnailFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Clear Preacher Img Preview and data
    const preacherImgInput = document.getElementById('sermonPreacherImgInput');
    if (preacherImgInput) delete preacherImgInput.dataset.tempData;
    const preacherImgPreview = document.getElementById('sermonPreacherImgPreview');
    if (preacherImgPreview) preacherImgPreview.src = '';

    // Clear Thumbnail Preview and data
    const thumbnailInput = document.getElementById('sermonThumbnailInput');
    if (thumbnailInput) delete thumbnailInput.dataset.tempData;
    const thumbnailPreview = document.getElementById('sermonThumbnailPreview');
    if (thumbnailPreview) {
        thumbnailPreview.src = '';
        thumbnailPreview.style.display = 'none';
    }

    const fileName = document.getElementById('sermonFileName');
    if (fileName) fileName.textContent = '선택된 파일 없음';

    const createBtn = document.getElementById('createSermonBtn');
    const updateBtn = document.getElementById('updateSermonBtn');
    const cancelBtn = document.getElementById('cancelSermonBtn');

    if (createBtn) createBtn.style.display = 'block';
    if (updateBtn) updateBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// --- SCHEDULE MANAGEMENT FUNCTIONS ---

function setupScheduleListeners() {
    // Weekly Event
    const addWeekly = document.getElementById('addWeeklyEventBtn');
    if (addWeekly) {
        addWeekly.addEventListener('click', () => {
            const time = document.getElementById('newWeeklyTime').value;
            const name = document.getElementById('newWeeklyName').value;
            if (!time || !name) { alert('시간과 일정명을 입력하세요.'); return; }
            addWeeklyEventRow(time, name);
            document.getElementById('newWeeklyTime').value = '';
            document.getElementById('newWeeklyName').value = '';
        });
    }

    // Sunday Schedule
    const addSun = document.getElementById('addSunScheduleBtn');
    if (addSun) {
        addSun.addEventListener('click', () => {
            const time = document.getElementById('newSunTime').value;
            const name = document.getElementById('newSunName').value;
            const place = document.getElementById('newSunPlace').value;
            if (!time || !name) { alert('시간과 예배명을 입력하세요.'); return; }
            addSundayRow(time, name, place);
            document.getElementById('newSunTime').value = '';
            document.getElementById('newSunName').value = '';
            document.getElementById('newSunPlace').value = '';
        });
    }

    // Weekday Schedule
    const addWk = document.getElementById('addWkScheduleBtn');
    if (addWk) {
        addWk.addEventListener('click', () => {
            const day = document.getElementById('newWkDay').value;
            const time = document.getElementById('newWkTime').value;
            const name = document.getElementById('newWkName').value;
            const place = document.getElementById('newWkPlace').value;
            if (!day || !time || !name) { alert('요일, 시간, 예배명을 입력하세요.'); return; }
            addWeekdayRow(day, time, name, place);
            document.getElementById('newWkDay').value = '';
            document.getElementById('newWkTime').value = '';
            document.getElementById('newWkName').value = '';
            document.getElementById('newWkPlace').value = '';
        });
    }
}

function loadSchedules(data) {
    // 1. Weekly Schedule
    const weekly = data.weeklySchedule || {};
    if (document.getElementById('weeklyMonth')) document.getElementById('weeklyMonth').value = weekly.month || '';
    if (document.getElementById('weeklyDay')) document.getElementById('weeklyDay').value = weekly.day || '';

    const weeklyContainer = document.getElementById('weeklyEventsList');
    if (weeklyContainer) {
        weeklyContainer.innerHTML = '';
        if (weekly.events && Array.isArray(weekly.events)) {
            weekly.events.forEach(ev => addWeeklyEventRow(ev.time, ev.name));
        }
    }

    // 2. Sunday
    const sundayTbody = document.getElementById('sundayScheduleTbody');
    if (sundayTbody) {
        sundayTbody.innerHTML = '';
        if (data.worshipSunday && Array.isArray(data.worshipSunday)) {
            data.worshipSunday.forEach(row => addSundayRow(row.time, row.name, row.place));
        }
    }

    // 3. Weekday
    const weekdayTbody = document.getElementById('weekdayScheduleTbody');
    if (weekdayTbody) {
        weekdayTbody.innerHTML = '';
        if (data.worshipWeekday && Array.isArray(data.worshipWeekday)) {
            data.worshipWeekday.forEach(row => addWeekdayRow(row.day, row.time, row.name, row.place));
        }
    }
}

function collectScheduleData() {
    // Weekly
    const month = document.getElementById('weeklyMonth').value;
    const day = document.getElementById('weeklyDay').value;
    const weeklyEvents = [];
    document.querySelectorAll('.weekly-event-item').forEach(item => {
        weeklyEvents.push({
            time: item.dataset.time,
            name: item.dataset.name
        });
    });

    // Sunday
    const sundayRows = [];
    document.querySelectorAll('#sundayScheduleTbody tr').forEach(tr => {
        // Safe check for children
        if (tr.children.length >= 3) {
            sundayRows.push({
                time: tr.children[0].textContent,
                name: tr.children[1].textContent,
                place: tr.children[2].textContent
            });
        }
    });

    // Weekday
    const weekdayRows = [];
    document.querySelectorAll('#weekdayScheduleTbody tr').forEach(tr => {
        if (tr.children.length >= 4) {
            weekdayRows.push({
                day: tr.children[0].textContent,
                time: tr.children[1].textContent,
                name: tr.children[2].textContent,
                place: tr.children[3].textContent
            });
        }
    });

    return {
        weeklySchedule: { month, day, events: weeklyEvents },
        worshipSunday: sundayRows,
        worshipWeekday: weekdayRows
    };
}

// DOM Builders
function addWeeklyEventRow(time, name) {
    const container = document.getElementById('weeklyEventsList');
    if (!container) return;
    if (container.querySelector('p')) container.innerHTML = ''; // Remove 'no data' text

    const div = document.createElement('div');
    div.className = 'weekly-event-item';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.padding = '8px';
    div.style.borderBottom = '1px solid #eee';
    div.dataset.time = time;
    div.dataset.name = name;

    div.innerHTML = `
        <span><strong>${time}</strong> ${name}</span>
        <button type="button" onclick="this.parentElement.remove()" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function addSundayRow(time, name, place) {
    const tbody = document.getElementById('sundayScheduleTbody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="padding:10px; border:1px solid #ddd;">${time}</td>
        <td style="padding:10px; border:1px solid #ddd;">${name}</td>
        <td style="padding:10px; border:1px solid #ddd;">${place}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center;">
            <button type="button" onclick="this.closest('tr').remove()" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
}

function addWeekdayRow(day, time, name, place) {
    const tbody = document.getElementById('weekdayScheduleTbody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="padding:10px; border:1px solid #ddd;">${day}</td>
        <td style="padding:10px; border:1px solid #ddd;">${time}</td>
        <td style="padding:10px; border:1px solid #ddd;">${name}</td>
        <td style="padding:10px; border:1px solid #ddd;">${place}</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center;">
            <button type="button" onclick="this.closest('tr').remove()" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
}

// Global listener removed. Called explicitly in dashboard logic.
