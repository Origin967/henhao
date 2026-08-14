
        (function() {
            const r = document.documentElement;

            function gI() { const w = window.innerWidth,
                    h = window.innerHeight,
                    im = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
                    il = w > h,
                    hd = document.querySelector('.header'),
                    hw = hd ? hd.clientWidth : w,
                    aw = hw * 0.85; return { w, h, im, il, aw, iss: w < 380, ims: w >= 380 && w < 768 }; }

            function cS(i) { const { w, im, il, aw, iss } = i; if (!im) return 0.78;
                let s; if (il) { s = Math.min(w * 0.0038, 0.52); } else { const b = aw / 800,
                        f = Math.min(w / 375, 1.2);
                    s = Math.min(b * f, 0.65); if (iss) s = Math.min(s, 0.48); } return Math.max(0.38, Math.min(s, 0.72)); }

            function aS(s) { r.style.setProperty('--logo-wrapper-scale', s); }

            function ad() { const i = gI(), s = cS(i);
                aS(s); }
            if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(ad, 10);
            else document.addEventListener('DOMContentLoaded', ad);
            let t;
            window.addEventListener('resize', () => { clearTimeout(t);
                t = setTimeout(ad, 100); });
            window.addEventListener('orientationchange', () => setTimeout(ad, 250));
        })();
    


        (function() {
            const r = document.documentElement;

            function gDI() { const u = navigator.userAgent,
                    w = window.innerWidth,
                    h = window.innerHeight,
                    im = /Mobi|Android|iPhone|iPad|iPod/i.test(u),
                    ia = /Android/i.test(u),
                    ii = /iPhone|iPad|iPod/i.test(u);
                let b = 'unknown',
                    m = 'unknown'; if (ia) { const mc = u.match(/;\s*([^;]+?)\s*(Build|MIUI|Android)/); if (mc) { const ds = mc[
                            1].trim(); if (/vivo/i.test(ds)) b = 'vivo';
                        else if (/oppo/i.test(ds)) b = 'oppo';
                        else if (/xiaomi|redmi|mi /i.test(ds)) b = 'xiaomi';
                        else if (/huawei|honor/i.test(ds)) b = 'huawei';
                        else if (/samsung/i.test(ds)) b = 'samsung';
                        else if (/oneplus/i.test(ds)) b = 'oneplus';
                        else if (/realme/i.test(ds)) b = 'realme';
                        m = ds.replace(new RegExp(b, 'i'), '').trim(); } } else if (ii) { b = 'apple';
                    const mc = u.match(/iPhone OS (\d+_\d+)/); if (mc) m = 'iOS ' + mc[1].replace('_', '.'); } else { b =
                        'desktop'; }
                const is = window.matchMedia('(display-mode: standalone)').matches || (navigator.standalone) || (window
                    .innerHeight === window.screen.height); return { w, h, im, b, m, is, iss: w < 380, ims: w >= 380 && w <
                        768 }; }

            function cOS(i) { const { w, h, im, is } = i,
                    ah = is ? h : h - 40;
                let ws, mmw, mmh; if (im) { ws = Math.min(w * 0.78, ah * 0.46); if (i.b === 'vivo' && i.m.includes('V60')) ws =
                        Math.min(ws, 270);
                    mmw = Math.min(w * 0.92, 380);
                    mmh = Math.min(ah * 0.62, 400); } else { ws = Math.min(w * 0.32, 340);
                    mmw = Math.min(w * 0.42, 440);
                    mmh = Math.min(h * 0.55, 460); }
                ws = Math.max(ws, 190);
                const wcs = ws * 0.88,
                    bmh = im ? Math.max(42, Math.min(h * 0.058, 50)) : 56,
                    fmt = im ? Math.max(14, Math.min(w * 0.04, 18)) : 22,
                    fmp = im ? Math.max(20, Math.min(w * 0.07, 30)) : 38,
                    fi = im ? Math.max(13, Math.min(w * 0.038, 16)) : 17,
                    sb = im && is ? '0px' : 'env(safe-area-inset-bottom,0px)'; return { ws: Math.round(ws), wcs: Math.round(
                        wcs), mmw: Math.round(mmw), mmh: Math.round(mmh), bmh: Math.round(bmh), fmt: fmt.toFixed(1) + 'px',
                    fmp: fmp.toFixed(1) + 'px', fi: fi.toFixed(1) + 'px', sb }; }

            function aO(i, s) { r.style.setProperty('--wheel-size', s.ws + 'px');
                r.style.setProperty('--wheel-canvas-size', s.wcs + 'px');
                r.style.setProperty('--modal-max-width', s.mmw + 'px');
                r.style.setProperty('--modal-min-height', s.mmh + 'px');
                r.style.setProperty('--btn-min-height', s.bmh + 'px');
                r.style.setProperty('--font-modal-title', s.fmt);
                r.style.setProperty('--font-modal-prize', s.fmp);
                r.style.setProperty('--font-input', s.fi);
                r.style.setProperty('--gap-safe-bottom', s.sb); if (i.im) {
                    const p = document.querySelector('.wheel-pointer'); if (p) { const ps = Math.max(7, i.w * 0.022);
                        p.style.borderLeftWidth = ps + 'px';
                        p.style.borderRightWidth = ps + 'px';
                        p.style.borderTopWidth = (ps * 2.4) + 'px'; }

                    const cb = document.querySelector('.wheel-center-btn'); if (cb) { const bs = Math.min(130, Math.max(82, s.ws * 0.34));
                        cb.style.width = bs + 'px';
                        cb.style.height = bs + 'px'; }
                    const ct = document.querySelector('.wheel-center-btn-text'); if (ct) ct.style.fontSize = Math.max(9, s.ws *
                        0.0434) + 'px';
                    const rt = document.getElementById('prizeResultText'); if (rt) rt.style.fontSize = Math.max(11, i.w *
                        0.033) + 'px';
                    const lb = document.getElementById('langSwitchBtn'); if (lb) { lb.style.padding = '4px 9px';
                        lb.style.minHeight = '30px'; }
                    const sv = document.querySelector('.lang-switch-btn svg'); if (sv) { const ss = Math.max(12, i.w * 0.0385);
                        sv.style.width = ss + 'px';
                        sv.style.height = ss + 'px'; }
                    /* 音频按钮响应式尺寸 */
                    const ab = document.getElementById('audioToggleBtn'); if (ab) { const abs = Math.max(28, i.w * 0.072);
                        ab.style.width = abs + 'px';
                        ab.style.height = abs + 'px'; }
                    const asv = document.querySelector('.audio-toggle-btn svg'); if (asv) { const ass = Math.max(12, i.w * 0.034);
                        asv.style.width = ass + 'px';
                        asv.style.height = ass + 'px'; }
                    const lt = document.querySelector('.lang-btn-text'); if (lt) lt.style.fontSize = Math.max(9, i.w * 0.0242) +
                        'px';
                    const la = document.querySelector('.lang-arrow'); if (la) la.style.fontSize = Math.max(9, i.w * 0.0242) + 'px';
                    const si = document.getElementById('step1ChanceInfo'); if (si) { si.style.fontSize = Math.max(9, i.w *
                            0.028) + 'px'; }
                    const ti = document.querySelector('.tiger-icon'); if (ti) { const ts = Math.max(28, s.mmw * 0.13);
                        ti.style.width = ts + 'px';
                        ti.style.height = ts + 'px'; }
                    const mi = document.getElementById('modalIcon'); if (mi) { const ms = Math.max(60, s.mmw * 0.28);
                        mi.style.width = ms + 'px';
                        mi.style.height = ms + 'px'; }
                    document.querySelectorAll('.ios-btn').forEach(b => { b.style.fontSize = Math.max(12, i.w * 0.036) + 'px';
                        b.style.padding = Math.max(8, i.h * 0.018) + 'px'; });
                    document.querySelectorAll('.input-field').forEach(e => { e.style.fontSize = s.fi;
                        e.style.padding = Math.max(8, i.h * 0.016) + 'px ' + Math.max(10, i.w * 0.025) + 'px'; });
                    const pr = document.querySelector('.protocol-wrapper'); if (pr) pr.style.fontSize = Math.max(10, i.w *
                        0.028) + 'px';
                    document.querySelectorAll('.switch-link').forEach(l => l.style.fontSize = Math.max(10, i.w * 0.028) +
                        'px');
                    const risk = document.getElementById('riskTips'); if (risk) risk.style.fontSize = Math.max(10, i.w * 0.028) +
                        'px';
                    const sliderTrack = document.getElementById('prizeSliderTrack');
                    if (sliderTrack) {
                        sliderTrack.style.minHeight = Math.max(38, i.h * 0.065) + 'px';
                    }
                    const sliderCards = document.querySelectorAll('.prize-slide-card');
                    sliderCards.forEach(c => {
                        c.style.minHeight = Math.max(38, i.h * 0.065) + 'px';
                        c.style.padding = Math.max(2, i.h * 0.005) + 'px ' + Math.max(4, i.w * 0.01) + 'px';
                    });
                    const prizeAmounts = document.querySelectorAll('.prize-amount');
                    prizeAmounts.forEach(el => {
                        el.style.fontSize = Math.max(16, i.w * 0.05) + 'px';
                    });
                    const prizeLabels = document.querySelectorAll('.prize-round-label');
                    prizeLabels.forEach(el => {
                        el.style.fontSize = Math.max(7, i.w * 0.018) + 'px';
                    });
                    const dotsContainer = document.getElementById('prizeSliderDots');
                    if (dotsContainer) {
                        const dots = dotsContainer.querySelectorAll('.dot');
                        dots.forEach(d => {
                            d.style.width = Math.max(5, i.w * 0.018) + 'px';
                            d.style.height = Math.max(5, i.w * 0.018) + 'px';
                        });
                    }
                    const hintEl = document.getElementById('prizeSliderHint');
                    if (hintEl) {
                        hintEl.style.fontSize = Math.max(7, i.w * 0.018) + 'px';
                    }
                }
                document.body.setAttribute('data-device-type', i.im ? 'mobile' : 'desktop'); if (i.b) document.body
                    .setAttribute('data-brand', i.b); if (window.gift3d && window.gift3d.resize) window.gift3d.resize(); }

            function sA() { const i = gDI(), s = cOS(i);
                aO(i, s); }
            if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(sA, 10);
            else document.addEventListener('DOMContentLoaded', sA);
            let rt;
            window.addEventListener('resize', () => { clearTimeout(rt);
                rt = setTimeout(sA, 150); });
            window.addEventListener('orientationchange', () => setTimeout(sA, 300));
            if (window.matchMedia) { const q = window.matchMedia('(display-mode: standalone)');
                q.addEventListener('change', sA); }
        })();
    


        (() => {
            const track = document.getElementById('dataStreamTrack');
            const viewport = document.querySelector('.data-stream-viewport');
            if (!track || !viewport) return;

            const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

            // ===== 30条静态滚动数据 =====
            const streamData = [
                { phone: '09*****3568', actionKey: 'streamAction1', prize: '10,000', timeSpec: { u: 'just' }, amount: '10,000 Ks' },
                { phone: '09*****7325', actionKey: 'streamAction2', prize: '500', timeSpec: { u: 'min', n: 2 }, amount: '500 Ks' },
                { phone: '09*****8918', actionKey: 'streamAction3', prize: '1,000', timeSpec: { u: 'sec', n: 47 }, amount: '1,000 Ks' },
                { phone: '09*****2741', actionKey: 'streamAction1', prize: '300', timeSpec: { u: 'just' }, amount: '300 Ks' },
                { phone: '09*****5862', actionKey: 'streamAction2', prize: '5,000', timeSpec: { u: 'min', n: 38 }, amount: '5,000 Ks' },
                { phone: '09*****1154', actionKey: 'streamAction3', prize: '200', timeSpec: { u: 'hr', n: 6 }, amount: '200 Ks' },
                { phone: '09*****4693', actionKey: 'streamAction1', prize: '800', timeSpec: { u: 'min', n: 1 }, amount: '800 Ks' },
                { phone: '09*****3427', actionKey: 'streamAction2', prize: '10,000', timeSpec: { u: 'sec', n: 23 }, amount: '10,000 Ks' },
                { phone: '09*****8835', actionKey: 'streamAction1', prize: '500', timeSpec: { u: 'hr', n: 4 }, amount: '500 Ks' },
                { phone: '09*****1271', actionKey: 'streamAction3', prize: '2,000', timeSpec: { u: 'just' }, amount: '2,000 Ks' },
                { phone: '09*****6509', actionKey: 'streamAction1', prize: '100', timeSpec: { u: 'sec', n: 52 }, amount: '100 Ks' },
                { phone: '09*****9746', actionKey: 'streamAction2', prize: '1,500', timeSpec: { u: 'min', n: 27 }, amount: '1,500 Ks' },
                { phone: '09*****2983', actionKey: 'streamAction3', prize: '300', timeSpec: { u: 'hr', n: 7 }, amount: '300 Ks' },
                { phone: '09*****7612', actionKey: 'streamAction1', prize: '3,000', timeSpec: { u: 'min', n: 15 }, amount: '3,000 Ks' },
                { phone: '09*****4458', actionKey: 'streamAction2', prize: '500', timeSpec: { u: 'just' }, amount: '500 Ks' },
                { phone: '09*****5795', actionKey: 'streamAction3', prize: '10,000', timeSpec: { u: 'hr', n: 3 }, amount: '10,000 Ks' },
                { phone: '09*****9381', actionKey: 'streamAction1', prize: '800', timeSpec: { u: 'min', n: 41 }, amount: '800 Ks' },
                { phone: '09*****6926', actionKey: 'streamAction2', prize: '200', timeSpec: { u: 'just' }, amount: '200 Ks' },
                { phone: '09*****1174', actionKey: 'streamAction3', prize: '5,000', timeSpec: { u: 'min', n: 5 }, amount: '5,000 Ks' },
                { phone: '09*****5637', actionKey: 'streamAction1', prize: '1,000', timeSpec: { u: 'hr', n: 2 }, amount: '1,000 Ks' },
                { phone: '09*****2852', actionKey: 'streamAction2', prize: '300', timeSpec: { u: 'min', n: 8 }, amount: '300 Ks' },
                { phone: '09*****9219', actionKey: 'streamAction3', prize: '500', timeSpec: { u: 'min', n: 13 }, amount: '500 Ks' },
                { phone: '09*****5564', actionKey: 'streamAction1', prize: '2,000', timeSpec: { u: 'min', n: 57 }, amount: '2,000 Ks' },
                { phone: '09*****1703', actionKey: 'streamAction2', prize: '10,000', timeSpec: { u: 'just' }, amount: '10,000 Ks' },
                { phone: '09*****8348', actionKey: 'streamAction3', prize: '800', timeSpec: { u: 'hr', n: 9 }, amount: '800 Ks' },
                { phone: '09*****7915', actionKey: 'streamAction1', prize: '100', timeSpec: { u: 'min', n: 29 }, amount: '100 Ks' },
                { phone: '09*****6486', actionKey: 'streamAction2', prize: '1,500', timeSpec: { u: 'sec', n: 12 }, amount: '1,500 Ks' },
                { phone: '09*****2672', actionKey: 'streamAction3', prize: '500', timeSpec: { u: 'hr', n: 1 }, amount: '500 Ks' },
                { phone: '09*****7157', actionKey: 'streamAction1', prize: '3,000', timeSpec: { u: 'min', n: 16 }, amount: '3,000 Ks' },
                { phone: '09*****3824', actionKey: 'streamAction2', prize: '5,000', timeSpec: { u: 'just' }, amount: '5,000 Ks' }
            ];

            let dataIndex = 0;

            const getNextData = () => {
                const item = streamData[dataIndex];
                dataIndex = (dataIndex + 1) % streamData.length;
                return item;
            };

            // i18n：主翻译函数
            const tStream = () => (typeof window.t === 'function' ? window.t : (k) => k);

            // i18n：根据语言格式化相对时间文案
            const fmtStreamTime = (spec) => {
                const tFn = tStream();
                if (!spec || spec.u === 'just') return tFn('streamTimeJustNow');
                const key = spec.u === 'sec' ? 'streamTimeSecondsAgo' : (spec.u === 'hr' ? 'streamTimeHoursAgo' : 'streamTimeMinutesAgo');
                return String(tFn(key)).replace('{n}', spec.n);
            };

            const createItem = () => {
                const item = document.createElement('div');
                item.className = 'data-stream-item';
                const data = getNextData();
                item._streamData = data;
                const tFn = tStream();
                item.innerHTML = `
                    <div class="data-stream-row">
                        <span class="data-stream-dot"></span>
                        <span class="data-stream-phone">${data.phone}</span>
                        <span class="data-stream-text">${tFn(data.actionKey)}</span>
                        <span class="data-stream-prize">${data.prize}</span>
                        <span class="data-stream-label">${tFn('streamPrizeLabel')}</span>
                        <span class="data-stream-time">${fmtStreamTime(data.timeSpec)}</span>
                    </div>
                    <div class="data-stream-amount">${data.amount}</div>
                `;
                return item;
            };

            // PC shows 2 items, mobile shows 4-6 items
            // Each group needs >= visibleCount * 2 for seamless scroll cycling
            const itemsPerGroup = isMobile() ? 12 : 4;

            const createGroup = () => {
                const group = document.createElement('div');
                group.className = 'data-stream-group';
                for (let i = 0; i < itemsPerGroup; i += 1) {
                    group.appendChild(createItem());
                }
                return group;
            };

            // 语言切换后：刷新所有已有条目文案（数据不变，仅文案随当前语言更新）
            const refreshStreamItemTexts = () => {
                track.querySelectorAll('.data-stream-item').forEach(item => {
                    const data = item._streamData;
                    if (!data) return;
                    const tFn = tStream();
                    const textEl = item.querySelector('.data-stream-text');
                    const labelEl = item.querySelector('.data-stream-label');
                    const timeEl = item.querySelector('.data-stream-time');
                    if (textEl) textEl.textContent = tFn(data.actionKey);
                    if (labelEl) labelEl.textContent = tFn('streamPrizeLabel');
                    if (timeEl) timeEl.textContent = fmtStreamTime(data.timeSpec);
                });
            };

            function initStream() {
                // Clear existing and rebuild
                track.innerHTML = '';
                for (let i = 0; i < 4; i += 1) {
                    track.appendChild(createGroup());
                }

                const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (reducedMotion) {
                    track.style.animation = 'none';
                    return;
                }

                track.style.animation = 'none';
                track.style.transform = 'translate3d(0, 0, 0)';

                const groups = Array.from(track.querySelectorAll('.data-stream-group'));
                const SCROLL_SECONDS_PER_GROUP = 22;
                let offset = 0;
                let lastTime = performance.now();
                let cachedGroupHeight = 0;

                const updateGroupHeight = () => {
                    if (groups.length > 0) {
                        cachedGroupHeight = groups[0].offsetHeight;
                    }
                };
                updateGroupHeight();

                const regenerateGroup = (group) => {
                    while (group.firstChild) {
                        group.removeChild(group.firstChild);
                    }
                    for (let i = 0; i < itemsPerGroup; i += 1) {
                        group.appendChild(createItem());
                    }
                };

                // Debounced resize handler: recalc height after layout stabilizes
                let resizeTimer = null;
                const onViewportResize = () => {
                    if (resizeTimer) clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        updateGroupHeight();
                        resizeTimer = null;
                    }, 120);
                };
                window.addEventListener('resize', onViewportResize);
                window.addEventListener('orientationchange', () => setTimeout(updateGroupHeight, 300));

                const animate = (now) => {
                    const dt = Math.min((now - lastTime) / 1000, 0.1);
                    lastTime = now;

                    if (dt > 0 && groups.length > 0 && cachedGroupHeight > 0) {
                        const groupHeight = cachedGroupHeight;
                        const speed = groupHeight / SCROLL_SECONDS_PER_GROUP;
                        offset += speed * dt;

                        if (offset >= groupHeight) {
                            const recycled = groups.shift();
                            regenerateGroup(recycled);
                            track.appendChild(recycled);
                            groups.push(recycled);
                            offset -= groupHeight;
                            // Refresh cached height after DOM mutation
                            cachedGroupHeight = groups[0].offsetHeight;
                        }

                        track.style.transform = `translate3d(0, ${-offset}px, 0)`;
                    }

                    requestAnimationFrame(animate);
                };

                requestAnimationFrame(animate);

                // Refresh items when language changes
                window.addEventListener('languageChanged', refreshStreamItemTexts);
            }

            // 等主 i18n 系统完成初始语言加载后再构建，保证首屏即为当前语言
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initStream);
            } else {
                initStream();
            }
        })();
    


        (function() {
            let guideVisible = false;
            let guideStarted = false;

            function initGuideFinger() {
                const guide = document.getElementById('guideFinger');
                const button = document.getElementById('wheelCenterBtn');
                if (!guide || !button) return;

                // 关闭按钮
                const closeBtn = document.createElement('button');
                closeBtn.className = 'guide-close-btn is-hidden';
                closeBtn.type = 'button';
                closeBtn.setAttribute('aria-label', '关闭引导');
                closeBtn.textContent = '✕';
                guide.appendChild(closeBtn);

                const hideGuide = () => {
                    guideVisible = false;
                    guide.style.opacity = '0';
                    guide.style.transform = 'translate3d(0, 0, 0) scale(0.84)';
                    closeBtn.classList.add('is-hidden');
                };

                closeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    hideGuide();
                });

                // 固定定位：始终指向大轮盘中心按钮
                const lockToButton = () => {
                    const wrapper = guide.parentElement;
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const rect = button.getBoundingClientRect();
                    const fw = guide.offsetWidth || 84;
                    const fh = guide.offsetHeight || 84;
                    // 指尖在 SVG viewBox (40, 17) 处
                    const tipRatioX = 40 / 72;
                    const tipRatioY = 17 / 72;
                    const tipOffsetX = fw * tipRatioX;
                    const tipOffsetY = fh * tipRatioY;
                    // 按钮中心相对于大轮盘的位置
                    const btnCenterX = rect.left - wrapperRect.left + rect.width / 2;
                    const btnCenterY = rect.top - wrapperRect.top + rect.height / 2;
                    const btnRadius = rect.width / 2;
                    const targetTipX = btnCenterX + Math.max(3, fw * 0.04);
                    const targetTipY = btnCenterY + btnRadius;
                    return {
                        x: Math.max(0, Math.min(wrapperRect.width - fw, targetTipX - tipOffsetX)),
                        y: Math.max(0, Math.min(wrapperRect.height - fh, targetTipY - tipOffsetY))
                    };
                };

                const showGuide = () => {
                    // 延迟确保轮盘渲染完成、按钮位置准确
                    const tryShow = (retries) => {
                        const pos = lockToButton();
                        const btnRect = button.getBoundingClientRect();
                        // 按钮位置有效（不在屏幕外）才显示
                        if (btnRect.top > -100 && btnRect.top < window.innerHeight + 100 && btnRect.left > -100) {
                            guide.style.left = pos.x + 'px';
                            guide.style.top = pos.y + 'px';
                            guideVisible = true;
                            guide.style.opacity = '1';
                            guide.style.transform = 'translate3d(0, 0, 0) scale(1)';
                            closeBtn.classList.remove('is-hidden');
                        } else if (retries > 0) {
                            requestAnimationFrame(() => tryShow(retries - 1));
                        }
                    };
                    requestAnimationFrame(() => tryShow(15));
                };

                if (document.readyState === 'complete') {
                    if (!guideStarted) { guideStarted = true; showGuide(); }
                } else {
                    window.addEventListener('load', () => {
                        if (!guideStarted) { guideStarted = true; showGuide(); }
                    }, { once: true });
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initGuideFinger);
            } else {
                setTimeout(initGuideFinger, 120);
            }

            /* ===== 日间/夜间模式切换（含智能亮度调节 + 连续拖动亮度控制 + 三级浮层） ===== */
            function initDayNightToggle() {
                const toggleWrapper = document.getElementById('toggleWrapper');
                const themeSwitch = document.getElementById('themeSwitch');
                const knob = document.getElementById('themeSwitchKnob');
                const brightnessOverlay = document.getElementById('brightnessOverlay');
                const brightnessPopup = document.getElementById('brightnessPopup');
                const scrollTrack = document.getElementById('toggleScrollTrack');
                const scrollArea = document.getElementById('toggleScrollArea');
                if (!toggleWrapper || !themeSwitch) return;

                // 亮度状态
                const MAX_OVERLAY_ALPHA = 0.45;      // 最暗时叠加层透明度
                var dragRatio = 0;                     // 0=日间(左), 1=夜间(右) 连续值
                var isDragging = false;
                var popupAutoCloseTimer = null;
                var popupScrollContainer = null;
                var tsIconSun = themeSwitch.querySelector('.ts-icon-sun');
                var tsIconMoon = themeSwitch.querySelector('.ts-icon-moon');

                // 缓存 knob 轨道边界（初始化时读取 CSS 定义值，避免拖动时被内联样式污染）
                var _knobMinL = null;
                var _knobMaxL = null;
                function ensureKnobBounds() {
                    if (_knobMinL === null || _knobMaxL === null) {
                        var swW = themeSwitch.offsetWidth;
                        var kW = knob.offsetWidth;
                        // 临时移除内联 left 以读取 CSS 定义的 day 位置
                        var savedLeft = knob.style.left;
                        knob.style.left = '';
                        var cssLeft = parseFloat(getComputedStyle(knob).left);
                        if (isNaN(cssLeft) || cssLeft < 1) cssLeft = 4;
                        knob.style.left = savedLeft;
                        _knobMinL = cssLeft;
                        _knobMaxL = swW - kW - cssLeft;
                        if (_knobMaxL < _knobMinL) _knobMaxL = _knobMinL;
                    }
                }

                // 滚动状态：index 指向当前可见项（0=首充翻倍送, 1=注册送奖金, 2=提现秒到账, 3=充值秒到账）
                var scrollIndex = 0;
                var scrollTimer = null;
                var isScrolling = false;
                var isPaused = false;
                const SCROLL_INTERVAL = 2000;
                const SCROLL_DURATION = 800;
                const TOTAL_ITEMS = 4;

                // ---- 连续亮度应用（基于 dragRatio 0~1） ----
                function applyContinuousBrightness(ratio) {
                    if (!brightnessOverlay) return;
                    ratio = Math.max(0, Math.min(1, ratio));
                    if (ratio <= 0.001) {
                        brightnessOverlay.style.opacity = '0';
                    } else {
                        var alpha = ratio * MAX_OVERLAY_ALPHA;
                        brightnessOverlay.style.background = 'rgba(20, 10, 5, ' + alpha + ')';
                        brightnessOverlay.style.opacity = '1';
                    }
                }

                // ---- 图标交叉淡入淡出（0~0.5太阳, 0.5~1月亮） ----
                function updateIcons(ratio) {
                    if (!tsIconSun || !tsIconMoon) return;
                    var sunOp, moonOp, sunScale, moonScale, sunRot, moonRot;
                    if (ratio < 0.4) {
                        sunOp = 1; moonOp = 0;
                        sunScale = 1; moonScale = 0.5;
                        sunRot = 0; moonRot = -90;
                    } else if (ratio > 0.6) {
                        sunOp = 0; moonOp = 1;
                        sunScale = 0.5; moonScale = 1;
                        sunRot = 90; moonRot = 0;
                    } else {
                        var t = (ratio - 0.4) / 0.2; // 0→1 过渡
                        sunOp = 1 - t; moonOp = t;
                        sunScale = 1 - 0.5 * t; moonScale = 0.5 + 0.5 * t;
                        sunRot = 90 * t; moonRot = -90 * (1 - t);
                    }
                    tsIconSun.style.opacity = sunOp;
                    tsIconSun.style.transform = 'scale(' + sunScale + ') rotate(' + sunRot + 'deg)';
                    tsIconMoon.style.opacity = moonOp;
                    tsIconMoon.style.transform = 'scale(' + moonScale + ') rotate(' + moonRot + 'deg)';
                }

                // ---- 根据 ratio 计算 knob left 像素值 ----
                function ratioToLeft(ratio) {
                    ensureKnobBounds();
                    return _knobMinL + ratio * (_knobMaxL - _knobMinL);
                }

                // ---- 设置 knob 位置 + 亮度 + 图标 ----
                function setKnobPosition(ratio, animate) {
                    if (!knob) return;
                    if (animate) {
                        knob.classList.remove('dragging');
                        knob.style.transition = 'left 0.4s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.4s ease';
                    } else {
                        knob.classList.add('dragging');
                        knob.style.transition = 'none';
                    }
                    knob.style.left = ratioToLeft(ratio) + 'px';
                    applyContinuousBrightness(ratio);
                    updateIcons(ratio);
                }

                // ---- 同步 CSS 类与 ratio ----
                function syncModeClasses(ratio) {
                    if (ratio < 0.5) {
                        toggleWrapper.classList.remove('night-active');
                        toggleWrapper.classList.add('day-active');
                        themeSwitch.classList.remove('night-active');
                        themeSwitch.classList.add('day-active');
                    } else {
                        toggleWrapper.classList.remove('day-active');
                        toggleWrapper.classList.add('night-active');
                        themeSwitch.classList.remove('day-active');
                        themeSwitch.classList.add('night-active');
                    }
                }

                // ---- 快速切换到日间 ----
                function snapToDay() {
                    dragRatio = 0;
                    syncModeClasses(dragRatio);
                    setKnobPosition(dragRatio, true);
                    hideBrightnessPopup();
                }

                // ---- 快速切换到夜间（使用上次 dragRatio 或默认） ----
                function snapToNight() {
                    if (dragRatio < 0.5) dragRatio = 1.0;
                    syncModeClasses(dragRatio);
                    setKnobPosition(dragRatio, true);
                }

                // ===== 拖动逻辑（鼠标 + 手指） =====
                function onDragStart(e) {
                    if (isDragging) return;
                    isDragging = true;
                    knob.classList.add('dragging');
                    knob.style.transition = 'none';
                    knob.setPointerCapture(e.pointerId);
                    // 拖动期间禁止父级触摸滚动，确保手机手指拖动流畅
                    themeSwitch.style.touchAction = 'none';
                    e.preventDefault();
                }

                function onDragMove(e) {
                    if (!isDragging) return;
                    ensureKnobBounds();
                    var swRect = themeSwitch.getBoundingClientRect();
                    var kW = knob.offsetWidth;
                    var rawLeft = e.clientX - swRect.left - kW / 2;
                    var clampedLeft = Math.max(_knobMinL, Math.min(_knobMaxL, rawLeft));
                    var ratio = (_knobMaxL === _knobMinL) ? 0 : (clampedLeft - _knobMinL) / (_knobMaxL - _knobMinL);
                    ratio = Math.max(0, Math.min(1, ratio));
                    dragRatio = ratio;
                    knob.style.left = clampedLeft + 'px';
                    applyContinuousBrightness(ratio);
                    updateIcons(ratio);
                }

                function onDragEnd(e) {
                    if (!isDragging) return;
                    isDragging = false;
                    knob.classList.remove('dragging');
                    // 回到 CSS 过渡
                    knob.style.transition = 'left 0.4s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.4s ease';
                    // 恢复父级触摸行为
                    themeSwitch.style.touchAction = '';
                    syncModeClasses(dragRatio);
                    // 确保 knob 在正确的像素位置
                    knob.style.left = ratioToLeft(dragRatio) + 'px';
                    hideBrightnessPopup();
                }

                if (knob) {
                    knob.addEventListener('pointerdown', onDragStart);
                    knob.addEventListener('lostpointercapture', function(e) {
                        if (isDragging) onDragEnd(e);
                    });
                }
                document.addEventListener('pointermove', function(e) {
                    if (isDragging) onDragMove(e);
                });
                document.addEventListener('pointerup', function(e) {
                    if (isDragging) onDragEnd(e);
                });

                // ===== 浮层位置锚定：始终显示在 themeSwitch 正上方 =====
                function positionBrightnessPopup() {
                    if (!brightnessPopup || !brightnessPopup.classList.contains('active')) return;
                    var tsRect = themeSwitch.getBoundingClientRect();
                    var popupH = brightnessPopup.offsetHeight || 85;
                    var popupTop = tsRect.top - popupH - 2;
                    if (popupTop < 4) popupTop = 4;
                    var popupRight = window.innerWidth - tsRect.right + 4;
                    if (popupRight < 4) popupRight = 4;
                    brightnessPopup.style.top = popupTop + 'px';
                    brightnessPopup.style.right = popupRight + 'px';
                }

                function updatePopupSelection(ratio) {
                    if (!brightnessPopup) return;
                    var options = brightnessPopup.querySelectorAll('.brightness-option');
                    // 不显示选中状态，因为现在是连续值
                    options.forEach(function(opt) {
                        opt.classList.remove('selected');
                    });
                }

                function showBrightnessPopup() {
                    if (!brightnessPopup) return;
                    updatePopupSelection(dragRatio);
                    if (popupAutoCloseTimer) { clearTimeout(popupAutoCloseTimer); popupAutoCloseTimer = null; }
                    // 每次点击都重新触发弹出动画，确保反复点击"夜间"时弹窗反复出现
                    brightnessPopup.classList.remove('active');
                    void brightnessPopup.offsetWidth;
                    brightnessPopup.classList.add('active');
                    positionBrightnessPopup();
                    if (!popupScrollContainer) popupScrollContainer = document.querySelector('.app-container');
                    if (popupScrollContainer) popupScrollContainer.addEventListener('scroll', positionBrightnessPopup, { passive: true });
                    popupAutoCloseTimer = setTimeout(function() {
                        hideBrightnessPopup();
                        popupAutoCloseTimer = null;
                    }, 5000);
                }

                function hideBrightnessPopup() {
                    if (!brightnessPopup) return;
                    if (popupAutoCloseTimer) { clearTimeout(popupAutoCloseTimer); popupAutoCloseTimer = null; }
                    if (popupScrollContainer) popupScrollContainer.removeEventListener('scroll', positionBrightnessPopup);
                    brightnessPopup.classList.remove('active');
                }

                // === 点击文字标签快速切换 ===
                var tsLabelDay = themeSwitch.querySelector('.ts-label-day');
                var tsLabelNight = themeSwitch.querySelector('.ts-label-night');
                if (tsLabelDay) {
                    tsLabelDay.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (isDragging) return;
                        snapToDay();
                    });
                }
                if (tsLabelNight) {
                    tsLabelNight.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (isDragging) return;
                        snapToNight();
                        showBrightnessPopup();
                    });
                }

                // === 滚动动画控制 ===
                function getItemHeight() {
                    if (!scrollArea || !scrollTrack) return 0;
                    var items = scrollTrack.querySelectorAll('.toggle-scroll-item');
                    if (items.length === 0) return 0;
                    return items[0].offsetHeight;
                }

                function scrollToIndex(index, animate) {
                    if (!scrollTrack) return;
                    var itemH = getItemHeight();
                    if (itemH <= 0) return;
                    if (animate) {
                        scrollTrack.style.transition = 'transform ' + (SCROLL_DURATION / 1000) + 's cubic-bezier(0.4, 0, 0.2, 1)';
                    } else {
                        scrollTrack.style.transition = 'none';
                    }
                    scrollTrack.style.transform = 'translateY(-' + (index * itemH) + 'px)';
                }

                function advanceScroll() {
                    if (isPaused || isScrolling) return;
                    isScrolling = true;
                    scrollIndex++;
                    scrollToIndex(scrollIndex, true);
                    if (scrollIndex >= TOTAL_ITEMS) {
                        setTimeout(function() {
                            scrollIndex = 0;
                            scrollToIndex(scrollIndex, false);
                            isScrolling = false;
                            startScrollTimer();
                        }, SCROLL_DURATION + 50);
                    } else {
                        setTimeout(function() {
                            isScrolling = false;
                            startScrollTimer();
                        }, SCROLL_DURATION + 50);
                    }
                }

                function startScrollTimer() {
                    stopScrollTimer();
                    if (isPaused) return;
                    scrollTimer = setTimeout(advanceScroll, SCROLL_INTERVAL);
                }

                function stopScrollTimer() {
                    if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
                }

                function initScroll() {
                    if (!scrollTrack || !scrollArea) return;
                    scrollIndex = 0;
                    scrollToIndex(scrollIndex, false);
                    setTimeout(function() {
                        startScrollTimer();
                    }, 300);
                }

                // 悬停/触摸时暂停滚动
                if (scrollArea) {
                    scrollArea.addEventListener('mouseenter', function() {
                        isPaused = true;
                        stopScrollTimer();
                    });
                    scrollArea.addEventListener('mouseleave', function() {
                        isPaused = false;
                        if (!isScrolling) startScrollTimer();
                    });
                    scrollArea.addEventListener('touchstart', function() {
                        isPaused = true;
                        stopScrollTimer();
                    }, { passive: true });
                    scrollArea.addEventListener('touchend', function() {
                        isPaused = false;
                        if (!isScrolling) startScrollTimer();
                    });
                }

                // 浮层选项点击（离散预设）
                if (brightnessPopup) {
                    brightnessPopup.addEventListener('click', function(e) {
                        var option = e.target.closest('.brightness-option');
                        if (!option) return;
                        var level = parseInt(option.getAttribute('data-level'), 10);
                        if (isNaN(level)) return;
                        // 将离散 level 映射到 dragRatio: 50→1.0, 55→0.66, 60→0.33
                        var ratio;
                        if (level === 50) ratio = 1.0;
                        else if (level === 55) ratio = 0.66;
                        else if (level === 60) ratio = 0.33;
                        else ratio = 0.66;
                        dragRatio = ratio;
                        syncModeClasses(dragRatio);
                        setKnobPosition(dragRatio, true);
                        hideBrightnessPopup();
                    });
                    brightnessPopup.addEventListener('mouseenter', function() {
                        if (popupAutoCloseTimer) { clearTimeout(popupAutoCloseTimer); popupAutoCloseTimer = null; }
                    });
                    brightnessPopup.addEventListener('mouseleave', function() {
                        if (brightnessPopup.classList.contains('active') && !popupAutoCloseTimer) {
                            popupAutoCloseTimer = setTimeout(function() {
                                hideBrightnessPopup();
                                popupAutoCloseTimer = null;
                            }, 3000);
                        }
                    });
                }

                // 点击浮层外部关闭
                document.addEventListener('click', function(e) {
                    if (!brightnessPopup || !brightnessPopup.classList.contains('active')) return;
                    if (!brightnessPopup.contains(e.target) && !themeSwitch.contains(e.target)) {
                        hideBrightnessPopup();
                    }
                }, true);

                // 初始化：默认日间模式
                dragRatio = 0;
                syncModeClasses(dragRatio);
                setKnobPosition(dragRatio, false);
                initScroll();
            }

            /* ===== 首页登录/注册按钮（仅样式展示，暂不绑定弹窗逻辑） ===== */
            function initHeaderAuthButtons() {
                // 按钮仅作视觉展示，暂不绑定点击事件
                // 后续需要时在此处添加弹窗打开逻辑
            }

            // 初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    initDayNightToggle();
                    initHeaderAuthButtons();
                });
            } else {
                initDayNightToggle();
                initHeaderAuthButtons();
            }
        })();
    


        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then((registration) => {
                    console.log('[PWA] Service Worker 注册成功:', registration.scope);
                }).catch((err) => {
                    console.warn('[PWA] Service Worker 注册失败:', err);
                });
            });
        }
    


        (function() {
            'use strict';

            var deferredPrompt = null;
            var bannerEl = document.getElementById('pwaInstallBanner');
            var installBtn = document.getElementById('pwaInstallBtn');
            var closeBtn = document.getElementById('pwaInstallClose');
            var bannerDescEl = bannerEl ? bannerEl.querySelector('.pwa-install-banner-desc') : null;
            var iosGuideEl = document.getElementById('pwaIosGuide');
            var iosGuideCloseBtn = document.getElementById('pwaIosGuideClose');
            var iosGuideTextEl = iosGuideEl ? iosGuideEl.querySelector('.pwa-ios-guide-text') : null;
            var bannerDismissed = false;

            // i18n：更新 PWA 相关文案
            function tPwa(key, fallback) {
                if (typeof window.t === 'function') {
                    var val = window.t(key);
                    if (val && val !== key) return val;
                }
                return fallback || key;
            }

            function updatePwaTexts() {
                if (bannerDescEl) {
                    bannerDescEl.textContent = tPwa('pwa_install_banner_desc', '安装到桌面，获得更快启动体验');
                }
                if (installBtn) {
                    installBtn.textContent = tPwa('pwa_install_btn', '安装');
                }
                if (iosGuideTextEl) {
                    iosGuideTextEl.textContent = tPwa('pwa_ios_guide_text', '点击分享按钮 → 添加到主屏幕');
                }
            }

            // 初始更新
            updatePwaTexts();

            // 语言切换时更新
            window.addEventListener('languageChanged', updatePwaTexts);

            // 检查是否已安装 PWA
            function isPwaInstalled() {
                return window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');
            }

            // 已安装则不再显示
            if (isPwaInstalled()) return;

            // 检查用户是否之前关闭过提示（当日有效）
            try {
                var dismissedData = localStorage.getItem('pwa_banner_dismissed');
                if (dismissedData) {
                    var d = JSON.parse(dismissedData);
                    var today = new Date().toDateString();
                    if (d.date === today) {
                        bannerDismissed = true;
                    }
                }
            } catch (e) {}

            // 检测是否为 iOS 设备
            function isIOS() {
                return /iphone|ipad|ipod/i.test(navigator.userAgent) &&
                       !window.MSStream;
            }

            // 检测是否为 Android
            function isAndroid() {
                return /android/i.test(navigator.userAgent);
            }

            // 显示安装横幅
            function showBanner() {
                if (bannerDismissed) return;
                if (!bannerEl) return;
                bannerEl.classList.add('show');
            }

            // 隐藏安装横幅
            function hideBanner() {
                if (bannerEl) {
                    bannerEl.classList.remove('show');
                }
                bannerDismissed = true;
                try {
                    localStorage.setItem('pwa_banner_dismissed', JSON.stringify({
                        date: new Date().toDateString()
                    }));
                } catch (e) {}
            }

            // 隐藏 iOS 引导
            function hideIosGuide() {
                if (iosGuideEl) {
                    iosGuideEl.classList.remove('show');
                }
            }

            // 显示 iOS 引导
            function showIosGuide() {
                if (!iosGuideEl) return;
                if (isPwaInstalled()) return;
                iosGuideEl.classList.add('show');
            }

            // === beforeinstallprompt 事件（Android Chrome 等支持） ===
            window.addEventListener('beforeinstallprompt', function(e) {
                // 阻止浏览器默认的安装提示
                e.preventDefault();
                // 保存事件以便后续触发
                deferredPrompt = e;
                // 显示自定义安装横幅
                showBanner();
            });

            // === 安装按钮点击 ===
            if (installBtn) {
                installBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (deferredPrompt) {
                        // 调用系统真实安装窗口
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then(function(choiceResult) {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('[PWA] 用户接受安装');
                                hideBanner();
                            } else {
                                console.log('[PWA] 用户拒绝安装');
                            }
                            deferredPrompt = null;
                        });
                    } else if (isIOS()) {
                        // iOS 不支持 beforeinstallprompt，显示引导
                        hideBanner();
                        showIosGuide();
                    }
                });
            }

            // === 关闭按钮点击 ===
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideBanner();
                });
            }

            // === iOS 引导关闭 ===
            if (iosGuideCloseBtn) {
                iosGuideCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideIosGuide();
                });
            }

            // === 已安装检测 ===
            window.addEventListener('appinstalled', function() {
                console.log('[PWA] 应用已安装');
                hideBanner();
                hideIosGuide();
                deferredPrompt = null;
            });

            // === iOS 特殊处理：延迟显示引导 ===
            // iOS Safari 不支持 beforeinstallprompt，在页面加载后显示引导
            if (isIOS() && !isPwaInstalled() && !bannerDismissed) {
                window.addEventListener('load', function() {
                    // 延迟 2 秒后显示，避免与启动页重叠
                    setTimeout(function() {
                        // 检查启动流程是否已完成
                        if (window.__launchReady || !document.getElementById('launchOverlay') ||
                            document.getElementById('launchOverlay').classList.contains('launch-removed')) {
                            showIosGuide();
                        } else {
                            // 监听启动完成事件
                            window.addEventListener('launchReady', function() {
                                setTimeout(showIosGuide, 1500);
                            }, { once: true });
                        }
                    }, 2500);
                });
            }

            // === Android 但浏览器不支持 beforeinstallprompt 的情况 ===
            // 部分 Android 浏览器可能不支持，使用备用检测
            var hasBeforeInstallPrompt = false;
            window.addEventListener('beforeinstallprompt', function() {
                hasBeforeInstallPrompt = true;
            });

            // 页面加载后检查：如果是不支持 beforeinstallprompt 的 Android 浏览器
            if (isAndroid() && !isPwaInstalled() && !bannerDismissed) {
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        if (!hasBeforeInstallPrompt && !deferredPrompt) {
                            // 仍然显示横幅，但点击安装按钮时更新提示文案
                            showBanner();
                            if (installBtn && bannerDescEl) {
                                bannerDescEl.textContent = tPwa('pwa_install_banner_desc', '请使用浏览器菜单中的"添加到主屏幕"功能进行安装');
                                installBtn.textContent = tPwa('pwa_install_btn', '了解');
                                // 点击后隐藏横幅
                                installBtn.addEventListener('click', function fallbackInstall(e) {
                                    e.preventDefault();
                                    hideBanner();
                                }, { once: true });
                            }
                        }
                    }, 3000);
                });
            }

            // 暴露 API
            window.PwaInstallManager = {
                showBanner: showBanner,
                hideBanner: hideBanner,
                showIosGuide: showIosGuide,
                hideIosGuide: hideIosGuide,
                isInstalled: isPwaInstalled
            };
        })();
    