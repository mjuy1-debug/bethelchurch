document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    highlightActiveMenu();
    setupModals();
    renderNotices();
    loadWorshipSchedule();
    loadWeeklySchedule();
    if (window.location.pathname.includes('notice_detail.html')) {
        loadNoticeDetail();
    }
    updateShortcuts();
    initChurchYT();
    // initSearch(); // Removed
    initMobileMenu(); // Initialize Mobile Menu
});



function loadContent() {
    // Load data strictly from defaultData (Server Source of Truth)
    // We ignore localStorage here to prevents stale data from overriding server updates
    const data = (typeof defaultData !== 'undefined') ? defaultData : {};
    // let savedData = {}; // Removed to fix staleness issue

    // FIX: Check for restricted video URL and ensure all are in embed format
    let dataChanged = false;
    const badIds = ['dQw4w9WgXcQ', 'BHACKCNDMW8'];
    // User requested specific safe URL with start time
    const safeUrl = 'https://www.youtube.com/embed/nU_4xk96Z8g?start=7';

    const getSafeEmbedUrl = (url) => {
        if (!url) return '';
        if (badIds.some(id => url.includes(id))) return safeUrl;

        // If already correct embed format, return as is (unless it needs param cleanup, but basic check first)
        // actually, we want to enforce parameters, so let's re-parse everything unless it's exactly the safeUrl
        if (url === safeUrl) return url;

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

    if (data.sermons && Array.isArray(data.sermons)) {
        data.sermons = data.sermons.map(sermon => {
            if (sermon.videoUrl) {
                const newUrl = getSafeEmbedUrl(sermon.videoUrl);
                if (newUrl !== sermon.videoUrl) {
                    sermon.videoUrl = newUrl;
                    dataChanged = true;
                }
            }
            return sermon;
        });
    }

    // Also check standalone fields if they exist
    if (data['sermon-video-url']) {
        const newUrl = getSafeEmbedUrl(data['sermon-video-url']);
        if (newUrl !== data['sermon-video-url']) {
            data['sermon-video-url'] = newUrl;
            dataChanged = true;
        }
    }

    if (dataChanged) {
        localStorage.setItem('siteData', JSON.stringify(data));
        console.log('Restricted video URL auto-corrected in localStorage.');
    }

    // Apply Styles (Typography & Design)
    // Iterate through data keys and apply those starting with 'style-' as CSS variables
    Object.keys(data).forEach(key => {
        if (key.startsWith('style-')) {
            const cssVar = '--' + key.replace('style-', '');
            const value = data[key];
            if (value) {
                document.documentElement.style.setProperty(cssVar, value);
            }
        }
    });

    // Apply data to elements with data-key attribute (Text Content)
    const elements = document.querySelectorAll('[data-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-key');
        if (data[key]) {
            // Handle newlines for textareas
            if (data[key].includes('\n')) {
                el.innerHTML = data[key].replace(/\n/g, '<br>');
            } else {
                el.innerHTML = data[key]; // Use innerHTML to be safe for br
            }

            // Special handling for Pastor Greeting Styles
            if (key === 'about-pastor-greeting-text' || key === 'about-pastor-greeting-title') {
                if (key === 'about-pastor-greeting-title') {
                    if (data['style-greeting-title-font']) el.style.fontFamily = data['style-greeting-title-font'];
                    if (data['style-greeting-title-size']) el.style.fontSize = data['style-greeting-title-size'];
                    if (data['style-greeting-title-color']) el.style.color = data['style-greeting-title-color'];
                } else {
                    if (data['style-pastor-greeting-font']) el.style.fontFamily = data['style-pastor-greeting-font'];
                    if (data['style-pastor-greeting-size']) el.style.fontSize = data['style-pastor-greeting-size'];
                    if (data['style-pastor-greeting-color']) el.style.color = data['style-pastor-greeting-color'];
                    if (data['style-pastor-greeting-line-height']) el.style.lineHeight = data['style-pastor-greeting-line-height'];
                }
            }

            // Pastor Quote (Home) Styles
            if (key === 'pastor-quote') {
                if (data['style-pastor-quote-font']) el.style.fontFamily = data['style-pastor-quote-font'];
                if (data['style-pastor-quote-size']) el.style.fontSize = data['style-pastor-quote-size'];
                if (data['style-pastor-quote-color']) el.style.color = data['style-pastor-quote-color'];
            }
        }
    });

    // Handle Images (src attribute)
    const images = document.querySelectorAll('[data-img-key]');
    images.forEach(img => {
        const key = img.getAttribute('data-img-key');
        if (data[key]) {
            if (img.tagName === 'IMG') {
                img.src = data[key];
            } else {
                // For background images (div, section)
                img.style.backgroundImage = `url('${data[key]}')`;
            }
        }
    });

    // Store video URL and summary for modal use
    // Find Latest Sermon
    const sermons = data.sermons || [];

    // Sort by ID desc to get latest
    const sortedSermons = [...sermons].sort((a, b) => b.id - a.id);
    const latestSermon = sortedSermons[0];

    if (latestSermon) {
        // Update Text Elements
        const sermonDateEl = document.querySelector('[data-key="sermon-date"]');
        const sermonTitleEl = document.querySelector('[data-key="sermon-title"]');
        const sermonScriptureEl = document.querySelector('[data-key="sermon-scripture"]');
        const sermonPreacherEl = document.querySelector('[data-key="sermon-preacher"]');

        if (sermonDateEl) sermonDateEl.textContent = latestSermon.date;
        if (sermonTitleEl) sermonTitleEl.textContent = latestSermon.title;
        if (sermonScriptureEl) sermonScriptureEl.textContent = latestSermon.scripture;
        if (sermonPreacherEl) sermonPreacherEl.textContent = latestSermon.preacher;

        // Update Preacher Image
        const sermonPreacherImgEl = document.querySelector('.preacher-img');
        if (sermonPreacherImgEl) {
            if (latestSermon.preacherImg) {
                sermonPreacherImgEl.style.backgroundImage = `url('${latestSermon.preacherImg}')`;
            } else {
                sermonPreacherImgEl.style.backgroundImage = ''; // Default or empty
            }
        }

        // Update Thumbnail if videoUrl exists
        if (latestSermon.videoUrl) {
            let videoId = '';
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = latestSermon.videoUrl.match(regExp);
            if (match && match[2].length === 11) {
                videoId = match[2];
            }

            if (videoId) {
                // Custom YouTube Player Support
                const ytWrapper = document.querySelector('.churchYT-wrapper');
                if (ytWrapper) {
                    ytWrapper.setAttribute('data-video', videoId);
                }

                // Update Thumbnail Image (Prioritize Custom Upload)
                const thumbImg = document.querySelector('.churchYT-thumb') || document.querySelector('.video-thumbnail img');
                if (thumbImg) {
                    if (latestSermon.thumbnail) {
                        thumbImg.src = latestSermon.thumbnail;
                    } else {
                        // Fallback to YouTube Default
                        thumbImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    }
                }

                // Ensure the stored URL is the embed version for the iframe
                // Use the robust getEmbedUrl function here as well
                latestSermon.videoUrl = getEmbedUrl(latestSermon.videoUrl);
            }
        }

        // Store Data for Modals
        document.body.setAttribute('data-video-url', latestSermon.videoUrl);
        document.body.setAttribute('data-summary', latestSermon.summary);
        if (latestSermon.file) {
            document.body.setAttribute('data-summary-file', latestSermon.file);
        } else {
            document.body.removeAttribute('data-summary-file');
        }
    } else {
        // Fallback if no sermons
        if (data['sermon-video-url']) {
            document.body.setAttribute('data-video-url', getEmbedUrl(data['sermon-video-url']));
        }
        if (data['sermon-summary']) {
            document.body.setAttribute('data-summary', data['sermon-summary']);
        }
    }

    // Load Header and Footer
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // ... (Header loading logic if needed)
    }
}

// Global Helper to get embed URL (Robust Version)
window.getEmbedUrl = (url) => {
    if (!url) return '';

    // If already an embed URL, just return it (but check for time param conversion if needed)
    if (url.includes('youtube.com/embed/')) {
        return url;
    }

    let videoId = '';
    let timeParam = '';

    // Extract Video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        videoId = match[2];
    }

    // Extract Time Parameter (t= or start=)
    if (url.includes('t=') || url.includes('start=')) {
        const timeMatch = url.match(/[?&](t|start)=([^&]+)/);
        if (timeMatch && timeMatch[2]) {
            // Convert '1m30s' format to seconds if necessary, but YouTube embed usually takes seconds
            // Simple seconds extraction
            let timeVal = timeMatch[2].replace('s', '');
            timeParam = `?start=${timeVal}`;
        }
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}${timeParam}`;
    }

    return url; // Return original if parsing fails
};

function renderNotices() {
    const noticeList = document.querySelector('.notice-list');
    if (!noticeList) return;

    const savedData = JSON.parse(localStorage.getItem('siteData'));
    const data = savedData || defaultData;
    const notices = data.notices || [];

    let html = '';
    notices.forEach(notice => {
        html += `
            <li>
                <span class="tag">${notice.category}</span>
                <a href="notice_detail.html?id=${notice.id}" class="notice-title">${notice.title}</a>
                <span class="date">${notice.date}</span>
            </li>
        `;
    });
    noticeList.innerHTML = html;
}

function loadNoticeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));

    const savedData = JSON.parse(localStorage.getItem('siteData'));
    const data = savedData || defaultData;
    const notices = data.notices || [];

    const notice = notices.find(n => n.id === id);

    if (notice) {
        const catEl = document.getElementById('noticeCategory');
        const titleEl = document.getElementById('noticeTitle');
        const dateEl = document.getElementById('noticeDate');
        const contentEl = document.getElementById('noticeContent');

        if (catEl) catEl.textContent = notice.category;
        if (titleEl) titleEl.textContent = notice.title;
        if (dateEl) dateEl.textContent = notice.date;
        if (contentEl) contentEl.innerHTML = notice.content;
    } else {
        const container = document.querySelector('.notice-detail-container');
        if (container) container.innerHTML = '<p style="text-align:center; padding:50px;">존재하지 않는 게시물입니다.</p>';
    }
}

function setupModals() {
    const videoModal = document.getElementById('videoModal');
    const summaryModal = document.getElementById('summaryModal');
    const videoFrame = document.getElementById('modalVideoFrame');
    const summaryText = document.getElementById('modalSummaryText');
    const downloadLink = document.getElementById('summaryDownloadLink');

    // Homepage Inline Video Logic
    const thumbnailContainer = document.querySelector('.video-thumbnail') || document.querySelector('.churchYT-wrapper');
    const btnWatch = document.getElementById('btnWatchVideo');

    // Function to play video inline (replaces thumbnail)
    const playInlineVideo = () => {
        const videoUrl = document.body.getAttribute('data-video-url');
        if (videoUrl && thumbnailContainer) {
            const embedUrl = getEmbedUrl(videoUrl);

            // Construct final URL without aggressive params causing 153 error
            let finalUrl = embedUrl;
            const params = [];

            // Check if URL already has query params
            const hasParams = finalUrl.includes('?');

            // Basic autoplay only, removed origin/enablejsapi to avoid 153 error on local files
            if (!finalUrl.includes('autoplay=')) params.push('autoplay=1');
            if (!finalUrl.includes('mute=')) params.push('mute=1'); // Mute often helps with autoplay policies

            if (params.length > 0) {
                finalUrl += (hasParams ? '&' : '?') + params.join('&');
            }

            // Replace thumbnail content with iframe
            thumbnailContainer.innerHTML = `
                <iframe src="${finalUrl}" 
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>`;
        } else {
            alert('설교 영상이 준비되지 않았습니다.');
        }
    };

    // Attach Inline Playback Listeners (Only if on homepage/thumbnail exists)
    if (thumbnailContainer) {
        thumbnailContainer.addEventListener('click', (e) => {
            e.preventDefault();
            playInlineVideo();
        });

        // "Watch Video" button also triggers inline playback on homepage
        if (btnWatch) {
            btnWatch.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to video section if needed
                thumbnailContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                playInlineVideo();
            });
        }
    }

    // Modal Logic (for Sermon List page or other uses)
    const openVideoModal = (url) => {
        let videoUrl = url || document.body.getAttribute('data-video-url');

        if (videoModal && videoFrame && videoUrl) {
            const embedUrl = getEmbedUrl(videoUrl);

            // Add autoplay
            let finalUrl = embedUrl;
            if (finalUrl.includes('?')) {
                finalUrl += '&autoplay=1';
            } else {
                finalUrl += '?autoplay=1';
            }

            videoFrame.src = finalUrl;
            videoModal.style.display = 'flex';
            videoModal.classList.add('show');
        } else {
            if (!videoModal) {
                if (thumbnailContainer) playInlineVideo();
                return;
            }
            alert('설교 영상이 준비되지 않았습니다.');
        }
    };

    // Open Summary Modal
    const openSummary = () => {
        if (!summaryModal || !summaryText) return;

        const text = document.body.getAttribute('data-summary');
        const file = document.body.getAttribute('data-summary-file');

        if (text || file) {
            let content = '';
            if (text) {
                content += `<div class="summary-text">${text.replace(/\n/g, '<br>')}</div>`;
            }

            if (file) {
                if (downloadLink) {
                    downloadLink.href = file;
                    downloadLink.style.display = 'inline-block';
                    if (file.startsWith('data:application/pdf')) {
                        downloadLink.innerHTML = '<i class="fas fa-download"></i> 설교 요약 PDF 다운로드';
                    } else {
                        downloadLink.innerHTML = '<i class="fas fa-download"></i> 설교 요약 파일 다운로드';
                    }
                }

                if (file.startsWith('data:application/pdf')) {
                    content += `
                        <div class="summary-file-viewer" style="margin-top: 20px; height: 400px;">
                            <iframe src="${file}" width="100%" height="100%" style="border: 1px solid #ddd;"></iframe>
                        </div>
                     `;
                }
            } else {
                if (downloadLink) downloadLink.style.display = 'none';
            }

            summaryText.innerHTML = content;
            summaryModal.style.display = 'flex';
            summaryModal.classList.add('show');
        } else {
            alert('말씀 요약이 준비되지 않았습니다.');
        }
    };

    // Event Listeners for Summary
    const btnSummary = document.getElementById('btnShowSummary');
    if (btnSummary) btnSummary.addEventListener('click', (e) => { e.preventDefault(); openSummary(); });

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (videoModal) {
                videoModal.style.display = 'none';
                videoModal.classList.remove('show');
                if (videoFrame) videoFrame.src = '';
            }
            if (summaryModal) {
                summaryModal.style.display = 'none';
                summaryModal.classList.remove('show');
            }
        });
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (videoModal && e.target === videoModal) {
            videoModal.style.display = 'none';
            videoModal.classList.remove('show');
            if (videoFrame) videoFrame.src = '';
        }
        if (summaryModal && e.target === summaryModal) {
            summaryModal.style.display = 'none';
            summaryModal.classList.remove('show');
        }
    });
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-list > li > a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.endsWith(href)) {
            link.style.color = 'var(--secondary-color)';
            link.style.fontWeight = '700';
        }
    });
}

function loadWorshipSchedule() {
    const container = document.getElementById('worshipScheduleContainer');
    if (!container) return;

    let data = {};
    try {
        const saved = localStorage.getItem('siteData');
        if (saved) {
            data = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Data parse error", e);
    }

    // fallback to defaultData if specific arrays are missing or empty
    if (typeof defaultData !== 'undefined') {
        if (!data.worshipSunday || data.worshipSunday.length === 0) {
            data.worshipSunday = defaultData.worshipSunday;
        }
        if (!data.worshipWeekday || data.worshipWeekday.length === 0) {
            data.worshipWeekday = defaultData.worshipWeekday;
        }
    }

    // Sunday Schedule
    const sundayEvents = data.worshipSunday || [];
    let sundayHtml = `
        <h3 style="margin-bottom: 20px; color: var(--primary-color);">주일 예배 일정 (Sunday Worship)</h3>
        <div class="worship-table-wrapper" style="margin-bottom: 60px;">
            <table class="worship-table">
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>예배명</th>
                        <th>장소</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (sundayEvents && sundayEvents.length > 0) {
        sundayEvents.forEach(event => {
            sundayHtml += `
                <tr>
                    <td>${event.time}</td>
                    <td><strong>${event.name}</strong></td>
                    <td>${event.place}</td>
                </tr>
            `;
        });
    } else {
        sundayHtml += `<tr><td colspan="3" style="text-align:center; padding:20px;">등록된 일정이 없습니다.</td></tr>`;
    }
    sundayHtml += `</tbody></table></div>`;

    // Weekday Schedule
    const weekdayEvents = data.worshipWeekday || [];
    let weekdayHtml = `
        <h3 style="margin-bottom: 20px; color: var(--primary-color);">평일 예배/기도회 일정 (Weekday Worship)</h3>
        <div class="worship-table-wrapper">
            <table class="worship-table">
                <thead>
                    <tr>
                        <th>요일</th>
                        <th>시간</th>
                        <th>예배명</th>
                        <th>장소</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (weekdayEvents && weekdayEvents.length > 0) {
        weekdayEvents.forEach(event => {
            weekdayHtml += `
                <tr>
                    <td>${event.day}</td>
                    <td>${event.time}</td>
                    <td><strong>${event.name}</strong></td>
                    <td>${event.place}</td>
                </tr>
            `;
        });
    } else {
        weekdayHtml += `<tr><td colspan="4" style="text-align:center; padding:20px;">등록된 일정이 없습니다.</td></tr>`;
    }
    weekdayHtml += `</tbody></table></div>`;

    container.innerHTML = sundayHtml + weekdayHtml;
}

function loadWeeklySchedule() {
    const weekSection = document.querySelector('.schedule-board');
    if (!weekSection) return;

    const savedData = JSON.parse(localStorage.getItem('siteData'));
    const data = savedData || (typeof defaultData !== 'undefined' ? defaultData : {});
    const schedule = data.weeklySchedule || { month: 'DEC', day: '07' };

    const dateEl = weekSection.querySelector('.cal-date');
    if (dateEl) {
        dateEl.innerHTML = `
            <span class="month">${schedule.month || 'DEC'}</span>
            <span class="day">${schedule.day || '07'}</span>
        `;
    }

    const listEl = weekSection.querySelector('.cal-events .event-list');
    if (listEl) {
        let itemsHtml = '';
        if (schedule.events && Array.isArray(schedule.events) && schedule.events.length > 0) {
            schedule.events.forEach(ev => {
                itemsHtml += `
                    <li>
                        <span class="time">${ev.time}</span>
                        <span class="desc">${ev.name}</span>
                    </li>
                `;
            });
        } else {
            itemsHtml = '<li style="color:#888;">등록된 일정이 없습니다.</li>';
        }
        listEl.innerHTML = itemsHtml;
    }
}

// --- PAGE BUILDER RENDERING ---

function updateShortcuts() {
    // Only run on index.html (or where quick-links exist)
    const container = document.querySelector('.quick-links-grid');
    if (!container) return;

    const savedData = JSON.parse(localStorage.getItem('siteData'));
    const data = savedData || (typeof defaultData !== 'undefined' ? defaultData : {});
    const shortcuts = data.shortcuts || {};
    const customPages = data.customPages || [];

    // Keys: link-1, link-2, link-3, link-4
    for (let i = 1; i <= 4; i++) {
        const key = `link-${i}`;
        const config = shortcuts[key];

        // Find the 'a' tag. The current HTML structure is specific, 
        // but we might need to target by position or recreate them?
        // Let's target by position since they are static in HTML.
        // Actually, the HTML doesn't have unique IDs for the A tags themselves, just data-keys for H3/P.
        // But they are the 1st, 2nd, 3rd, 4th child of .quick-links-grid
        const linkCard = container.querySelector(`.quick-card:nth-child(${i})`);

        if (linkCard && config && config.targetId) {
            // Find the page logic
            const targetPageId = config.targetId;
            let href = '#';

            // Check if it's a Custom Page ID
            if (customPages.find(p => p.id === targetPageId)) {
                href = `page.html?id=${targetPageId}`;
            } else if (targetPageId.includes('.')) {
                // Heuristic: if it has dot, maybe it's a URL/File (e.g. worship.html), fallback
                href = targetPageId;
            } else {
                // Maybe it's a relative path provided as ID? or default?
                // If it's standard 4 defaults (worship.html etc), checking logic:
                // If input was a SELECT from Admin, it only offers Custom Pages.
                // WE need to support reverting to default? 
                // Currently Admin only lists Custom Pages. 
                // If value is empty, it means DEFAULT.
            }

            // If we have a valid custom mapping
            if (config.targetId) {
                linkCard.href = href;
            }
        }

        // If config.targetId is empty, we leave default href from HTML.
    }
}

function renderCustomPage() {
    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('id');
    const container = document.getElementById('dynamicContent');

    if (!pageId || !container) return;

    const savedData = JSON.parse(localStorage.getItem('siteData'));
    const data = savedData || (typeof defaultData !== 'undefined' ? defaultData : {});
    const pages = data.customPages || [];

    const page = pages.find(p => p.id === pageId);

    if (!page) {
        container.innerHTML = '<div style="text-align:center; padding:100px;"><h3>페이지를 찾을 수 없습니다.</h3><a href="index.html">메인으로 돌아가기</a></div>';
        return;
    }

    // Set Title
    document.title = `${page.title} - 화도벧엘교회`;

    // Clear Container
    container.innerHTML = '';

    // Render Blocks
    const blocks = page.blocks || [];

    if (blocks.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:100px; color:#888;">내용이 없습니다.</div>';
        return;
    }

    blocks.forEach(block => {
        const el = createFrontendBlock(block);
        container.appendChild(el);
    });
}

function createFrontendBlock(block) {
    const wrapper = document.createElement('div');
    wrapper.className = 'page-block'; // Global container class if needed

    if (block.type === 'text') {
        // Text Block
        wrapper.style.padding = block.styles.padding || '20px';
        wrapper.style.backgroundColor = block.styles.backgroundColor || 'transparent';
        wrapper.style.textAlign = block.styles.textAlign || 'left';

        const textContent = document.createElement('div');
        textContent.style.fontSize = block.styles.fontSize || '1rem';
        textContent.style.color = block.styles.color || '#333';
        textContent.style.whiteSpace = 'pre-wrap'; // Handle newlines
        // Allow HTML or just text? Textarea implies simple text but admins might want formatting.
        // For security, innerText is safer, but innerHTML allows <br>.
        // Using innerHTML strictly for line breaks if handled, but let's trust admin input slightly or sanitize.
        // block.content comes from textarea.
        textContent.innerHTML = (block.content || '').replace(/\n/g, '<br>');

        wrapper.appendChild(textContent);

    } else if (block.type === 'image') {
        const img = document.createElement('img');
        const src = block.content;

        // Handle relative paths
        if (src.startsWith('uploads/') || src.startsWith('./')) {
            img.src = src; // Browser resolves relative to page.html
        } else {
            img.src = src;
        }

        img.style.width = block.styles.width || '100%';
        img.style.maxWidth = '100%'; // Responsive
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.borderRadius = block.styles.borderRadius || '0';

        wrapper.appendChild(img);

    } else if (block.type === 'button') {
        wrapper.style.textAlign = block.styles.align || 'center';
        wrapper.style.padding = '20px';

        const btn = document.createElement('a');
        btn.href = block.content.link || '#';
        btn.textContent = block.content.text || '버튼';

        btn.style.display = 'inline-block';
        btn.style.padding = block.styles.padding || '10px 20px';
        btn.style.backgroundColor = block.styles.backgroundColor || '#3498db';
        btn.style.color = block.styles.color || '#fff';
        btn.style.textDecoration = 'none';
        btn.style.borderRadius = block.styles.borderRadius || '4px';
        btn.style.fontSize = block.styles.fontSize || '1rem';
        btn.style.transition = '0.3s';

        // Hover effect helper
        btn.onmouseover = () => { btn.style.opacity = '0.9'; };
        btn.onmouseout = () => { btn.style.opacity = '1'; };

        wrapper.appendChild(btn);

    } else if (block.type === 'banner') {
        const bgUrl = block.content.image || '';

        wrapper.style.backgroundImage = `url('${bgUrl}')`;
        wrapper.style.backgroundSize = 'cover';
        wrapper.style.backgroundPosition = 'center';
        wrapper.style.height = block.styles.height || '300px';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.position = 'relative';

        const overlay = document.createElement('div');
        overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
        overlay.style.padding = '40px';
        overlay.style.textAlign = 'center';
        overlay.style.color = '#fff';
        overlay.style.borderRadius = '8px';

        const h2 = document.createElement('h2');
        h2.textContent = block.content.title || '';
        h2.style.marginBottom = '10px';
        h2.style.fontSize = '2rem';

        const p = document.createElement('p');
        p.textContent = block.content.subtitle || '';
        p.style.fontSize = '1.2rem';

        overlay.appendChild(h2);
        overlay.appendChild(p);
        wrapper.appendChild(overlay);

    } else if (block.type === 'spacer') {
        wrapper.style.height = block.styles.height || '50px';
    }
    return wrapper;
}

function initChurchYT() {
    const players = document.querySelectorAll('.churchYT-wrapper');
    players.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const videoId = wrapper.getAttribute('data-video');
            if (!videoId) return;

            // Simple ID check or URL parsing if needed
            // User requirement says 'data-video="영상ID"' but existing system uses URLs.
            // Let's support both: if it's full URL, extract ID.
            let id = videoId;
            if (id.includes('http') || id.includes('youtu')) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = id.match(regExp);
                if (match && match[2].length === 11) {
                    id = match[2];
                }
            }

            const iframe = document.createElement('iframe');
            iframe.className = 'churchYT-iframe';
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            wrapper.innerHTML = '';
            wrapper.appendChild(iframe);
        });
    });
}

function initMobileMenu() {
    const btnMenu = document.querySelector('.btn-menu-mobile');
    const nav = document.querySelector('.nav');

    if (btnMenu && nav) {
        btnMenu.addEventListener('click', (e) => {
            e.preventDefault();
            nav.classList.toggle('active');

            // Optional: Toggle icon (bars <-> times)
            const icon = btnMenu.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Toggle Submenus on Mobile
        const navItems = document.querySelectorAll('.nav-list > li > a');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Only for mobile (check if nav is fixed/active context)
                if (window.innerWidth <= 768) {
                    const parent = item.parentElement;
                    const dropdown = parent.querySelector('.dropdown');

                    if (dropdown) {
                        e.preventDefault(); // Prevent direct link for top items with dropdowns
                        parent.classList.toggle('active');
                    } else {
                        // Close menu if it's a regular link
                        nav.classList.remove('active');
                        const icon = btnMenu.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                }
            });
        });
    }
}

