
    (function() {
        'use strict';
        // 存储网络状态
        window.NetworkStatus = {
            isOnline: navigator.onLine,
            lastCheckTime: Date.now(),

            // 检测网络连接（轻量级健康检查）
            checkConnection: function() {
                var self = this;
                return new Promise(function(resolve) {
                    try {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', './manifest.json?_t=' + Date.now(), true);
                        xhr.timeout = 8000;
                        xhr.onload = function() {
                            self.isOnline = true;
                            self.lastCheckTime = Date.now();
                            resolve(true);
                        };
                        xhr.onerror = function() {
                            self.isOnline = false;
                            self.lastCheckTime = Date.now();
                            resolve(false);
                        };
                        xhr.ontimeout = function() {
                            self.isOnline = false;
                            self.lastCheckTime = Date.now();
                            resolve(false);
                        };
                        xhr.send();
                    } catch (e) {
                        self.isOnline = false;
                        self.lastCheckTime = Date.now();
                        resolve(false);
                    }
                });
            }
        };

        // 立即进行初始网络检测
        window.NetworkStatus.checkConnection().then(function(isOnline) {
            if (!isOnline) {
                window.showNetworkError = true;
            }
        });
    })();
    


    (function() {
        'use strict';

        // ============================================================
        //  网络错误管理器 - 运行时网络阻断
        // ============================================================
        window.NetworkErrorManager = {
            overlay: null,
            retryBtn: null,
            titleEl: null,
            descEl: null,
            _retryLock: false,

            init: function() {
                this.overlay = document.getElementById('networkErrorOverlay');
                this.retryBtn = document.getElementById('networkRetryBtn');
                this.titleEl = document.getElementById('networkErrorTitle');
                this.descEl = document.getElementById('networkErrorDesc');

                if (this.retryBtn) {
                    this.retryBtn.addEventListener('click', this.handleRetry.bind(this));
                }
            },

            show: function() {
                if (this.overlay) {
                    this.overlay.classList.remove('hidden');
                    // 禁止 app-container 交互
                    var appContainer = document.querySelector('.app-container');
                    if (appContainer) {
                        appContainer.style.pointerEvents = 'none';
                        appContainer.style.opacity = '0.5';
                    }
                }
            },

            hide: function() {
                if (this.overlay) {
                    this.overlay.classList.add('hidden');
                    // 恢复 app-container 交互
                    var appContainer = document.querySelector('.app-container');
                    if (appContainer) {
                        appContainer.style.pointerEvents = 'auto';
                        appContainer.style.opacity = '1';
                    }
                }
            },

            handleRetry: function() {
                var self = window.NetworkErrorManager;
                if (self._retryLock) return;
                self._retryLock = true;

                if (self.retryBtn) {
                    self.retryBtn.disabled = true;
                    self.retryBtn.textContent = (function() {
                        var lang = 'my';
                        try { var s = localStorage.getItem('myanmar79_lang'); if (s && (s === 'my' || s === 'en' || s === 'zh')) lang = s; } catch(e) {}
                        if (lang === 'zh') return '检测中...';
                        if (lang === 'en') return 'Checking...';
                        return 'စစ်ဆေးနေသည်...';
                    })();
                }

                window.NetworkStatus.checkConnection().then(function(isOnline) {
                    self._retryLock = false;
                    if (self.retryBtn) {
                        self.retryBtn.disabled = false;
                        self.retryBtn.textContent = (function() {
                            var lang = 'my';
                            try { var s = localStorage.getItem('myanmar79_lang'); if (s && (s === 'my' || s === 'en' || s === 'zh')) lang = s; } catch(e) {}
                            if (lang === 'zh') return '重试';
                            if (lang === 'en') return 'Retry';
                            return 'ပြန်ကြိုးစားပါ';
                        })();
                    }

                    if (isOnline) {
                        self.hide();
                        // 触发网络恢复回调
                        if (typeof window.onNetworkRecover === 'function') {
                            window.onNetworkRecover();
                        }
                    }
                    // 仍然无网络，保持错误提示
                });
            },

            // i18n：更新网络错误提示文案
            setLanguage: function(lang) {
                var texts = {
                    zh: window.LANG_ZH.networkText,
                    en: window.LANG_EN.networkText,
                    my: window.LANG_MY.networkText
                };
                var t = texts[lang] || texts['zh'];
                if (this.titleEl) this.titleEl.textContent = t.title;
                if (this.descEl) this.descEl.textContent = t.desc;
                if (this.retryBtn && !this._retryLock) this.retryBtn.textContent = t.retry;
            }
        };

        // ============================================================
        //  监听浏览器网络状态变化
        // ============================================================
        window.addEventListener('online', function() {
            window.NetworkStatus.isOnline = true;
            if (window.NetworkErrorManager) {
                window.NetworkErrorManager.hide();
            }
            // 触发网络恢复回调
            if (typeof window.onNetworkRecover === 'function') {
                window.onNetworkRecover();
            }
        });

        window.addEventListener('offline', function() {
            window.NetworkStatus.isOnline = false;
            if (window.NetworkErrorManager) {
                window.NetworkErrorManager.show();
            }
        });

        // 语言切换事件：刷新网络错误提示文案
        window.addEventListener('languageChanged', function() {
            if (window.NetworkErrorManager && window.NetworkErrorManager.setLanguage) {
                var lang = 'my';
                try { var s = localStorage.getItem('myanmar79_lang'); if (s && (s === 'my' || s === 'en' || s === 'zh')) lang = s; } catch(e) {}
                window.NetworkErrorManager.setLanguage(lang);
            }
        });

        // DOM 准备后初始化
        function initNetworkErrorManager() {
            window.NetworkErrorManager.init();

            // 更新初始语言
            var lang = 'my';
            try { var s = localStorage.getItem('myanmar79_lang'); if (s && (s === 'my' || s === 'en' || s === 'zh')) lang = s; } catch(e) {}
            window.NetworkErrorManager.setLanguage(lang);

            // 检查是否需要显示网络错误（来自 <head> 预检）
            if (window.showNetworkError) {
                window.NetworkErrorManager.show();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initNetworkErrorManager);
        } else {
            initNetworkErrorManager();
        }
    })();
    


        (function() {
            'use strict';

            // ============================================================
            //  启动状态枚举
            // ============================================================
            var LAUNCH_STATE = {
                INITIALIZING: 'INITIALIZING',
                CHECKING_NETWORK: 'CHECKING_NETWORK',
                CONNECTING: 'CONNECTING',
                LOADING: 'LOADING',
                SLOW_NETWORK: 'SLOW_NETWORK',
                OFFLINE: 'OFFLINE',
                TIMEOUT: 'TIMEOUT',
                ERROR: 'ERROR',
                READY: 'READY'
            };

            // ============================================================
            //  配置
            // ============================================================
            var CONFIG = {
                // 网络检测目标：使用项目真实存在的静态资源
                CHECK_URLS: ['./manifest.json', './icon-192.png'],
                // 单个请求超时时间（毫秒）
                REQUEST_TIMEOUT: 12000,
                // 启动背景图最短展示时长（毫秒）：仅当网络正常且资源已就绪时生效，慢速网络/无网络不受此限制
                LAUNCH_MIN_DISPLAY_MS: 2000,
                // 慢网络阈值（毫秒）
                SLOW_THRESHOLD: 5000,
                // 状态文案更新时机（毫秒）
                STATUS_SLOW_AT: 5000,
                STATUS_SLOWER_AT: 10000,
                // 网络恢复后自动重试延迟（毫秒）
                AUTO_RETRY_DELAY: 800,
                // Toast 自动隐藏时间（毫秒）
                TOAST_RECOVERED_DURATION: 2500
            };

            // ============================================================
            //  DOM 引用
            // ============================================================
            var overlayEl = document.getElementById('launchOverlay');
            var statusTextEl = document.getElementById('launchStatusText');
            var errorPanelEl = document.getElementById('launchErrorPanel');
            var errorTitleEl = document.getElementById('launchErrorTitle');
            var errorDescEl = document.getElementById('launchErrorDesc');
            var retryBtnEl = document.getElementById('launchRetryBtn');

            // ============================================================
            //  内部状态
            // ============================================================
            var currentState = LAUNCH_STATE.INITIALIZING;
            var abortController = null;
            var statusTimer = null;
            var startTime = 0;
            var isLaunchComplete = false;
            var toastTimer = null;
            var toastEl = null;
            var launchWatchdog = null;
            var minDisplayTimer = null;

            // ============================================================
            //  i18n 辅助函数（不依赖主脚本的 t() 提前到位）
            // ============================================================
            function getLang() {
                try {
                    var s = localStorage.getItem('myanmar79_lang');
                    if (s && (s === 'my' || s === 'en' || s === 'zh')) return s;
                } catch (e) {}
                return 'my';
            }

            function getText(key) {
                var lang = getLang();
                // 精简的翻译表：仅包含网络启动所需文案，与主 translations 保持一致
                var T = {
                    my: window.LANG_MY.launchText,
                    en: window.LANG_EN.launchText,
                    zh: window.LANG_ZH.launchText
                };
                var langData = T[lang] || T['my'];
                return langData[key] || (T['my'][key] || key);
            }

            // 当主 i18n 系统就绪后，优先使用主系统的 t() 函数
            function tKey(key) {
                if (typeof window.t === 'function') {
                    var val = window.t(key);
                    if (val && val !== key) return val;
                }
                return getText(key);
            }

            // ============================================================
            //  状态管理
            // ============================================================
            function setState(state) {
                currentState = state;
                // 暴露给外部（游戏主脚本可以读取）
                window.__launchState = state;
            }

            function isTerminalState(state) {
                return state === LAUNCH_STATE.OFFLINE ||
                       state === LAUNCH_STATE.TIMEOUT ||
                       state === LAUNCH_STATE.ERROR ||
                       state === LAUNCH_STATE.READY;
            }

            // ============================================================
            //  UI 更新
            // ============================================================
            function updateStatusText(key) {
                if (statusTextEl) {
                    statusTextEl.textContent = tKey(key);
                }
            }

            function showErrorPanel(titleKey, descKey, btnKey) {
                if (!errorPanelEl) return;
                if (errorTitleEl) errorTitleEl.textContent = tKey(titleKey);
                if (errorDescEl) errorDescEl.textContent = tKey(descKey);
                if (retryBtnEl) retryBtnEl.textContent = tKey(btnKey);
                errorPanelEl.classList.add('visible');
                // 保持 spinner 继续旋转
            }

            function hideErrorPanel() {
                if (errorPanelEl) {
                    errorPanelEl.classList.remove('visible');
                }
            }

            function updateStatusByElapsed() {
                if (isLaunchComplete) return;
                var elapsed = Date.now() - startTime;
                if (currentState === LAUNCH_STATE.OFFLINE ||
                    currentState === LAUNCH_STATE.TIMEOUT ||
                    currentState === LAUNCH_STATE.ERROR) {
                    return;
                }
                if (elapsed > CONFIG.STATUS_SLOWER_AT) {
                    updateStatusText('launch_slow_network');
                    setState(LAUNCH_STATE.SLOW_NETWORK);
                } else if (elapsed > CONFIG.STATUS_SLOW_AT) {
                    updateStatusText('launch_waiting');
                }
            }

            function startStatusTimer() {
                stopStatusTimer();
                startTime = Date.now();
                statusTimer = setInterval(updateStatusByElapsed, 1000);
            }

            function stopStatusTimer() {
                if (statusTimer) {
                    clearInterval(statusTimer);
                    statusTimer = null;
                }
            }

            // ============================================================
            //  网络检测
            // ============================================================
            function abortPendingRequest() {
                if (abortController) {
                    try { abortController.abort(); } catch (e) {}
                    abortController = null;
                }
            }

            function performNetworkCheck() {
                return new Promise(function(resolve, reject) {
                    abortPendingRequest();
                    abortController = new AbortController();
                    var signal = abortController.signal;
                    var timeoutId = null;
                    var completed = false;

                    function finish(err, result) {
                        if (completed) return;
                        completed = true;
                        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
                        if (err) {
                            abortPendingRequest();
                            reject(err);
                        } else {
                            abortController = null;
                            resolve(result);
                        }
                    }

                    // 超时保护
                    timeoutId = setTimeout(function() {
                        finish(new Error('TIMEOUT'));
                    }, CONFIG.REQUEST_TIMEOUT);

                    // 网络检测：GET 请求 + 时间戳参数绕过 SW 缓存
                    // 添加 _t 参数确保 URL 唯一，SW 缓存无法命中，必须走真实网络
                    var checkUrls = CONFIG.CHECK_URLS.slice();
                    var attemptIndex = 0;

                    function tryNextUrl() {
                        if (attemptIndex >= checkUrls.length) {
                            finish(new Error('NETWORK_ERROR'));
                            return;
                        }
                        var baseUrl = checkUrls[attemptIndex];
                        attemptIndex++;
                        // 时间戳参数：确保 SW 缓存无法命中，强制真实网络请求
                        var checkUrl = baseUrl + '?_t=' + Date.now();

                        fetch(checkUrl, {
                            method: 'GET',
                            cache: 'no-store',
                            signal: signal,
                            // 不携带 credentials，只是检测网络可达性
                        }).then(function(response) {
                            // 任何 HTTP 响应（包括 404）都说明网络可达
                            if (response.ok || response.status === 304 || response.status === 404 || response.status === 0) {
                                finish(null, true);
                            } else {
                                // 尝试下一个 URL
                                tryNextUrl();
                            }
                        }).catch(function(err) {
                            if (err && err.name === 'AbortError') {
                                // 已被超时处理，忽略
                                return;
                            }
                            // 尝试下一个 URL
                            tryNextUrl();
                        });
                    }

                    tryNextUrl();
                });
            }

            // ============================================================
            //  启动流程
            // ============================================================
            function startLaunchSequence() {
                if (isLaunchComplete && currentState === LAUNCH_STATE.READY) return;

                // 清除旧看门狗
                if (launchWatchdog) { clearTimeout(launchWatchdog); launchWatchdog = null; }

                setState(LAUNCH_STATE.CHECKING_NETWORK);
                hideErrorPanel();
                updateStatusText('launch_connecting');
                startStatusTimer();

                // 全局看门狗：15 秒后仅在非错误状态下强制完成启动
                // 离线/超时/错误状态下不强制启动，保持错误提示界面
                launchWatchdog = setTimeout(function() {
                    if (!isLaunchComplete) {
                        // 离线、超时、错误状态下不强制完成启动
                        if (currentState === LAUNCH_STATE.OFFLINE ||
                            currentState === LAUNCH_STATE.TIMEOUT ||
                            currentState === LAUNCH_STATE.ERROR) {
                            console.warn('[Launch] 看门狗触发，但当前处于错误状态，不强制启动');
                            return;
                        }
                        console.warn('[Launch] 看门狗触发，强制完成启动');
                        stopStatusTimer();
                        abortPendingRequest();
                        completeLaunch();
                    }
                }, 15000);

                // 首先检查 navigator.onLine
                if (!navigator.onLine) {
                    handleOffline();
                    return;
                }

                setState(LAUNCH_STATE.CONNECTING);
                updateStatusText('launch_connecting');

                performNetworkCheck().then(function() {
                    // 网络可达，继续检查
                    onNetworkAvailable();
                }).catch(function(err) {
                    var msg = (err && err.message) || '';
                    if (msg === 'TIMEOUT') {
                        handleTimeout();
                    } else {
                        handleNetworkError();
                    }
                });
            }

            function onNetworkAvailable() {
                stopStatusTimer();
                setState(LAUNCH_STATE.LOADING);
                updateStatusText('launch_loading');

                // 仅当网络正常且核心资源已准备完成时才进入此流程。
                // 规则：网络正常且资源已就绪时，splash-1080x1920.png 至少展示约 2 秒再进入游戏；
                //      若网络本身较慢（已超过 2 秒），则不再额外等待，立即进入；
                //      绝不因为“2 秒到了”而绕过网络检测或资源加载。
                if (isLaunchComplete) return;
                var elapsed = Date.now() - startTime;
                var remaining = CONFIG.LAUNCH_MIN_DISPLAY_MS - elapsed;
                if (remaining <= 0) {
                    completeLaunch();
                    return;
                }
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                minDisplayTimer = setTimeout(function() {
                    minDisplayTimer = null;
                    completeLaunch();
                }, remaining);
            }

            function completeLaunch() {
                // 清除看门狗
                if (launchWatchdog) { clearTimeout(launchWatchdog); launchWatchdog = null; }
                // 清除最短展示时长计时器
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                // 解除启动锁，恢复原项目 CSS 控制
                const appContainer = document.querySelector('.app-container');
                const launchOverlay = document.querySelector('.launch-overlay');

                if (appContainer) {
                    appContainer.style.display = '';
                }

                if (launchOverlay) {
                    launchOverlay.style.display = '';
                }

                if (isLaunchComplete) return;
                isLaunchComplete = true;
                stopStatusTimer();
                abortPendingRequest();
                setState(LAUNCH_STATE.READY);

                // 平滑过渡：先淡出，再从 DOM 移除
                if (overlayEl) {
                    overlayEl.classList.add('launch-hidden');
                    // 过渡完成后从 DOM 彻底移除
                    var removeOverlay = function() {
                        if (overlayEl && overlayEl.parentNode) {
                            overlayEl.parentNode.removeChild(overlayEl);
                        }
                        overlayEl.removeEventListener('transitionend', removeOverlay);
                    };
                    overlayEl.addEventListener('transitionend', removeOverlay);
                    // 兜底：如果 transitionend 未触发，也要移除
                    setTimeout(removeOverlay, 600);
                }

                // 通知游戏主脚本：网络已就绪
                window.__launchReady = true;
                window.dispatchEvent(new CustomEvent('launchReady'));
            }

            function handleOffline() {
                if (isLaunchComplete) return;
                if (launchWatchdog) { clearTimeout(launchWatchdog); launchWatchdog = null; }
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                stopStatusTimer();
                abortPendingRequest();
                setState(LAUNCH_STATE.OFFLINE);
                // 保持 spinner 继续旋转，不更新状态文字
                showErrorPanel('launch_offline_title', 'launch_offline_desc', 'launch_retry');
            }

            function handleTimeout() {
                if (isLaunchComplete) return;
                if (launchWatchdog) { clearTimeout(launchWatchdog); launchWatchdog = null; }
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                stopStatusTimer();
                abortPendingRequest();
                setState(LAUNCH_STATE.TIMEOUT);
                updateStatusText('launch_timeout_desc');
                showErrorPanel('launch_timeout_title', 'launch_timeout_desc', 'launch_retry');
            }

            function handleNetworkError() {
                if (isLaunchComplete) return;
                if (launchWatchdog) { clearTimeout(launchWatchdog); launchWatchdog = null; }
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                stopStatusTimer();
                abortPendingRequest();
                setState(LAUNCH_STATE.ERROR);
                updateStatusText('launch_error_desc');
                showErrorPanel('launch_error_title', 'launch_error_desc', 'launch_retry');
            }

            // ============================================================
            //  重试
            // ============================================================
            function retry() {
                if (isLaunchComplete) return;
                hideErrorPanel();
                stopStatusTimer();
                abortPendingRequest();
                if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                // 重置状态，重新开始
                startLaunchSequence();
            }

            // ============================================================
            //  运行时网络监控
            // ============================================================
            function createToast() {
                if (toastEl) return;
                toastEl = document.createElement('div');
                toastEl.className = 'global-network-toast';
                toastEl.setAttribute('aria-live', 'polite');
                document.body.appendChild(toastEl);
            }

            function showToast(text, type) {
                createToast();
                if (!toastEl) return;
                toastEl.textContent = text;
                toastEl.className = 'global-network-toast ' + type + ' visible';

                if (toastTimer) clearTimeout(toastTimer);

                if (type === 'toast-recovered') {
                    toastTimer = setTimeout(function() {
                        hideToast();
                    }, CONFIG.TOAST_RECOVERED_DURATION);
                }
            }

            function hideToast() {
                if (toastEl) {
                    toastEl.classList.remove('visible');
                }
                if (toastTimer) {
                    clearTimeout(toastTimer);
                    toastTimer = null;
                }
            }

            var wasOffline = false;

            function onOnline() {
                // 启动阶段：如果还没完成，自动重试
                if (!isLaunchComplete && currentState === LAUNCH_STATE.OFFLINE) {
                    setTimeout(function() {
                        retry();
                    }, CONFIG.AUTO_RETRY_DELAY);
                    return;
                }
                // 运行时：显示恢复提示
                if (isLaunchComplete && wasOffline) {
                    wasOffline = false;
                    showToast(tKey('network_recovered'), 'toast-recovered');
                }
            }

            function onOffline() {
                if (!isLaunchComplete) {
                    // 启动阶段：显示断网
                    handleOffline();
                    return;
                }
                // 运行时：显示断网提示
                wasOffline = true;
                showToast(tKey('network_disconnected'), 'toast-offline');
            }

            // ============================================================
            //  事件绑定
            // ============================================================
            function bindEvents() {
                // 重试按钮（防抖：避免 touchend + click 双重触发）
                var retryDebounce = null;
                function handleRetry(e) {
                    e.preventDefault();
                    if (retryDebounce) return;
                    retryDebounce = setTimeout(function() { retryDebounce = null; }, 300);
                    retry();
                }
                if (retryBtnEl) {
                    retryBtnEl.addEventListener('click', handleRetry);
                    retryBtnEl.addEventListener('touchend', handleRetry);
                }

                // 浏览器 online/offline 事件
                window.addEventListener('online', onOnline);
                window.addEventListener('offline', onOffline);

                // 语言切换事件：语言变化时刷新启动页文案
                window.addEventListener('languageChanged', function() {
                    if (isLaunchComplete) return;
                    // 根据当前状态刷新文案
                    switch (currentState) {
                        case LAUNCH_STATE.OFFLINE:
                            showErrorPanel('launch_offline_title', 'launch_offline_desc', 'launch_retry');
                            break;
                        case LAUNCH_STATE.TIMEOUT:
                            updateStatusText('launch_timeout_desc');
                            showErrorPanel('launch_timeout_title', 'launch_timeout_desc', 'launch_retry');
                            break;
                        case LAUNCH_STATE.ERROR:
                            updateStatusText('launch_error_desc');
                            showErrorPanel('launch_error_title', 'launch_error_desc', 'launch_retry');
                            break;
                        case LAUNCH_STATE.SLOW_NETWORK:
                            updateStatusText('launch_slow_network');
                            break;
                        case LAUNCH_STATE.CONNECTING:
                        case LAUNCH_STATE.CHECKING_NETWORK:
                            updateStatusText('launch_connecting');
                            break;
                        case LAUNCH_STATE.LOADING:
                            updateStatusText('launch_loading');
                            break;
                        default:
                            break;
                    }
                });

                // 页面卸载前清理
                window.addEventListener('beforeunload', function() {
                    stopStatusTimer();
                    abortPendingRequest();
                    if (minDisplayTimer) { clearTimeout(minDisplayTimer); minDisplayTimer = null; }
                });
            }

            // ============================================================
            //  对外暴露 API
            // ============================================================
            window.LaunchManager = {
                getState: function() { return currentState; },
                isReady: function() { return isLaunchComplete && currentState === LAUNCH_STATE.READY; },
                retry: retry,
                showToast: function(text, type) { showToast(text, type); },
                hideToast: hideToast
            };

            // 兼容：暴露网络状态供游戏运行时查询
            window.__isNetworkOnline = function() {
                if (!isLaunchComplete) return false;
                return navigator.onLine;
            };

            // ============================================================
            //  启动
            // ============================================================
            var _launchManagerInitialized = false;
            function initLaunchManager() {
                if (_launchManagerInitialized) return;
                _launchManagerInitialized = true;
                bindEvents();
                // 立即开始启动检查
                startLaunchSequence();
            }

            // DOM 已就绪（此脚本在 overlay HTML 之后，元素已存在）
            if (document.readyState === 'loading') {
                // overlay 元素在脚本之前已被解析，可以直接开始
                if (overlayEl && statusTextEl) {
                    initLaunchManager();
                } else {
                    document.addEventListener('DOMContentLoaded', initLaunchManager);
                }
            } else {
                initLaunchManager();
            }
        })();
    



        (function() {
            const LANG_KEY = 'myanmar79_lang';
            const SUPPORTED = ['my', 'en', 'zh'];
            const DEFAULT = 'my';
            let currentLang = DEFAULT;

            const FLAG_SVG_MYANMAR =
                `<svg viewBox="0 0 45 30" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:2px;"><rect width="45" height="10" fill="#FECB00"/><rect y="10" width="45" height="10" fill="#34B233"/><rect y="20" width="45" height="10" fill="#EA2839"/><polygon points="22.5,6 24.6,12.2 31.2,12.2 25.9,16 28,22.2 22.5,18.4 17,22.2 19.1,16 13.8,12.2 20.4,12.2" fill="#FFFFFF"/></svg>`;
            const FLAG_SVG_USA =
                `<svg viewBox="0 0 57 30" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:2px;"><rect width="57" height="2.3077" fill="#B22234"/><rect y="2.3077" width="57" height="2.3077" fill="#FFFFFF"/><rect y="4.6154" width="57" height="2.3077" fill="#B22234"/><rect y="6.9231" width="57" height="2.3077" fill="#FFFFFF"/><rect y="9.2308" width="57" height="2.3077" fill="#B22234"/><rect y="11.5385" width="57" height="2.3077" fill="#FFFFFF"/><rect y="13.8462" width="57" height="2.3077" fill="#B22234"/><rect y="16.1538" width="57" height="2.3077" fill="#FFFFFF"/><rect y="18.4615" width="57" height="2.3077" fill="#B22234"/><rect y="20.7692" width="57" height="2.3077" fill="#FFFFFF"/><rect y="23.0769" width="57" height="2.3077" fill="#B22234"/><rect y="25.3846" width="57" height="2.3077" fill="#FFFFFF"/><rect y="27.6923" width="57" height="2.3077" fill="#B22234"/><rect width="22.8" height="16.1538" fill="#3C3B6E"/><g fill="#FFFFFF"><circle cx="2.85" cy="1.346" r="0.65"/><circle cx="8.55" cy="1.346" r="0.65"/><circle cx="14.25" cy="1.346" r="0.65"/><circle cx="20" cy="1.346" r="0.65"/><circle cx="5.7" cy="4.038" r="0.65"/><circle cx="11.4" cy="4.038" r="0.65"/><circle cx="17.1" cy="4.038" r="0.65"/><circle cx="2.85" cy="6.73" r="0.65"/><circle cx="8.55" cy="6.73" r="0.65"/><circle cx="14.25" cy="6.73" r="0.65"/><circle cx="20" cy="6.73" r="0.65"/><circle cx="5.7" cy="9.423" r="0.65"/><circle cx="11.4" cy="9.423" r="0.65"/><circle cx="17.1" cy="9.423" r="0.65"/><circle cx="2.85" cy="12.115" r="0.65"/><circle cx="8.55" cy="12.115" r="0.65"/><circle cx="14.25" cy="12.115" r="0.65"/><circle cx="20" cy="12.115" r="0.65"/><circle cx="5.7" cy="14.808" r="0.65"/><circle cx="11.4" cy="14.808" r="0.65"/><circle cx="17.1" cy="14.808" r="0.65"/></g></svg>`;
            const FLAG_SVG_CHINA =
                `<svg viewBox="0 0 45 30" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:2px;"><rect width="45" height="30" fill="#DE2910"/><polygon points="9,4 10.4,8.5 15.2,8.5 11.3,11.3 12.8,15.8 9,13 5.2,15.8 6.7,11.3 2.8,8.5 7.6,8.5" fill="#FFDE00"/><polygon points="18.2,7.5 18.7,9.5 20.8,9.5 19.1,10.8 19.7,12.8 18.2,11.6 16.6,12.8 17.2,10.8 15.5,9.5 17.6,9.5" fill="#FFDE00" transform="rotate(-15,18.2,9.5)"/><polygon points="20,13 20.4,15.2 22.6,15.2 20.7,16.6 21.2,18.8 20,17.5 18.7,18.8 19.2,16.6 17.3,15.2 19.5,15.2" fill="#FFDE00" transform="rotate(-5,20,15.2)"/><polygon points="17,19 17.4,20.9 19.5,20.9 17.8,22.1 18.2,24 17,22.8 15.8,24 16.2,22.1 14.5,20.9 16.6,20.9" fill="#FFDE00" transform="rotate(-28,17,20.9)"/><polygon points="14,23.5 14.4,25.6 16.6,25.6 14.8,26.9 15.3,29 14,27.7 12.7,29 13.2,26.9 11.4,25.6 13.6,25.6" fill="#FFDE00" transform="rotate(-38,14,25.6)"/></svg>`;

            const userAgreementMY = window.LANG_MY.userAgreement;
            const privacyPolicyMY = window.LANG_MY.privacyPolicy;
            const userAgreementEN = window.LANG_EN.userAgreement;
            const privacyPolicyEN = window.LANG_EN.privacyPolicy;
            const userAgreementZH = window.LANG_ZH.userAgreement;
            const privacyPolicyZH = window.LANG_ZH.privacyPolicy;

            const translations = {
                'my': window.LANG_MY.translations,
                'en': window.LANG_EN.translations,
                'zh': window.LANG_ZH.translations
            };

            const agreementContents = {
                userAgreement: { my: userAgreementMY, en: userAgreementEN, zh: userAgreementZH },
                privacyPolicy: { my: privacyPolicyMY, en: privacyPolicyEN, zh: privacyPolicyZH }
            };

            const langDefs = [
                { code: 'my', flag: FLAG_SVG_MYANMAR, labelKey: 'langMy' },
                { code: 'en', flag: FLAG_SVG_USA, labelKey: 'langEn' },
                { code: 'zh', flag: FLAG_SVG_CHINA, labelKey: 'langZh' }
            ];

            function getStoredLang() {
                try { const s = localStorage.getItem(LANG_KEY); if (s && SUPPORTED.includes(s)) return s; } catch (e) {}
                return DEFAULT;
            }

            function setStoredLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} }

            function t(key) {
                return (translations[currentLang] && translations[currentLang][key]) || (translations[DEFAULT] && translations[
                    DEFAULT][key]) || key;
            }
            window.t = t;

            window.getAgreementContent = function(type) {
                return agreementContents[type]?.[currentLang] || agreementContents[type]?.my || '';
            };

            window.getCurrentLang = function() { return currentLang; };
            window.getTranslations = function() { return translations; };
            window.getTranslationsForLang = function(lang) { return translations[lang] || translations[DEFAULT]; };

            let cachedElements = {};

            function cacheElements() {
                if (Object.keys(cachedElements).length > 0) return;
                const ids = [
                    'step1ClaimBtn', 'step2Title', 'step2Subtitle', 'regUsername', 'regPhone', 'regPwd',
                    'regConfirmPwd', 'regCaptcha', 'step2SubmitBtn', 'switchToLogin', 'step3Title', 'loginPhone', 'loginPwd',
                    'riskTips', 'step3SubmitBtn', 'switchToRegister', 'protocolLabel',
                    'step1ChanceInfo', 'step1Title', 'step1Subtitle', 'wheelCenterBtnText',
                    'prizeResultText',
                    'modalPrizeAmount', 'prizeSliderTrack', 'prizeSliderDots', 'prizeSliderHint',
                    'usernameErrorTip', 'phoneErrorTip', 'captchaErrorTip',
                    'loginPhoneErrorTip', 'loginPwdErrorTip', 'forgotPwdLink',
                    'loginBonusTitle', 'loginBonusBadge', 'loginBonusDesc',
                    'rechargeModalTitle', 'rechargeModalActivity', 'rechargeModalDesc', 'rechargeModalBtn',
                    'placeholderTitle', 'placeholderSub', 'placeholderHint', 'placeholderBackBtn',
                    'loginLogoContainer', 'loginLogo'
                ];
                ids.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) cachedElements[id] = el;
                });
            }

            /* ===== Logo 动画控制 ===== */
            let logoAnimationTimer = null;

            function triggerLoginLogoAnimation() {
                const container = cachedElements['loginLogoContainer'] || document.getElementById('loginLogoContainer');
                if (!container) return;
                // 通过移除再添加动画类来重新触发 CSS 动画，避免 cloneNode 造成的 DOM 重排
                container.classList.remove('logo-visible', 'logo-hidden');
                void container.offsetWidth;
                container.classList.add('logo-hidden');
                void container.offsetWidth;
                container.classList.remove('logo-hidden');
                container.classList.add('logo-visible');

                // 通过重置 animation 来重启 ::after 光泽动画，无需 DOM 克隆
                const logo = cachedElements['loginLogo'] || document.getElementById('loginLogo');
                if (logo) {
                    logo.style.animation = 'none';
                    void logo.offsetWidth;
                    logo.style.animation = '';
                }
            }

            /* ===== 更新 UI ===== */
            function updateInspireMessages() {
                window._inspireMessages = t('inspireMessages') || ['✨'];
                if (typeof window._inspireMessages === 'string') {
                    window._inspireMessages = [window._inspireMessages];
                }
            }

            /* ===== 倒计时管理 ===== */
            const BONUS_TIMER_KEY = 'myanmar79_bonus_timer';
            const DURATION_SECONDS = 360;

            function getTodayStr() {
                const d = new Date();
                return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2,
                    '0');
            }

            function loadTimerState() {
                try {
                    const raw = localStorage.getItem(BONUS_TIMER_KEY);
                    if (raw) {
                        const data = JSON.parse(raw);
                        if (data.date === getTodayStr() && typeof data.start === 'number' && !isNaN(data.start)) {
                            return data;
                        }
                    }
                } catch (e) {}
                return null;
            }

            function saveTimerState(start) {
                try {
                    localStorage.setItem(BONUS_TIMER_KEY, JSON.stringify({
                        date: getTodayStr(),
                        start: start
                    }));
                } catch (e) {}
            }

            function resetTimer() {
                const now = Date.now();
                saveTimerState(now);
                return now;
            }

            let timerInterval = null;

            function startTimerLoop() {
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = setInterval(function() {
                    updateBonusDisplay();
                }, 1000);
            }

            function updateBonusDisplay() {
                const badge = document.getElementById('loginBonusBadge');
                const desc = document.getElementById('loginBonusDesc');
                if (!badge || !desc) return;

                const state = loadTimerState();
                if (!state) {
                    badge.textContent = '06:00';
                    badge.classList.remove('expired');
                    desc.textContent = t('login_bonus_desc');
                    return;
                }

                const now = Date.now();
                const elapsed = (now - state.start) / 1000;
                const remaining = Math.max(0, DURATION_SECONDS - elapsed);
                const expired = remaining <= 0;

                if (expired) {
                    badge.textContent = t('bonus_timer_expired');
                    badge.classList.add('expired');
                    desc.textContent = t('bonus_desc_expired');
                } else {
                    const mins = Math.floor(remaining / 60);
                    const secs = Math.floor(remaining % 60);
                    badge.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
                    badge.classList.remove('expired');
                    desc.textContent = t('login_bonus_desc');
                }
            }

            function initBonusTimer() {
                const state = loadTimerState();
                if (!state) {
                    resetTimer();
                }
                updateBonusDisplay();
                startTimerLoop();
            }

            function refreshBonusDisplay() {
                updateBonusDisplay();
            }

            /* ===== 标题动画控制器 ===== */
            let titleAnimator = null;

            function initTitleAnimation() {
                const titleEl = document.getElementById('step3Title');
                if (!titleEl) return;
                if (titleAnimator) {
                    titleAnimator.destroy();
                    titleAnimator = null;
                }
                const text = titleEl.textContent || '';
                if (!text.trim()) return;

                titleAnimator = new TitleAnimator(titleEl);
                titleAnimator.init();
                titleAnimator.start();
            }

            class TitleAnimator {
                constructor(element) {
                    this.element = element;
                    this.charSpans = [];
                    this.originalText = '';
                    this.timer = null;
                    this.isRunning = false;
                    this.isPausing = false;
                    this.currentCharIndex = 0;
                    this.animating = false;
                    this.pauseTimer = null;
                    this._destroyed = false;
                }

                init() {
                    if (this._destroyed) return;
                    this.originalText = this.element.textContent || '';
                    this.element.innerHTML = '';
                    const chars = this.originalText.split('');
                    chars.forEach((char, index) => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.className = 'title-char';
                        if (char === ' ' || char === '\u200B') {
                            span.style.display = 'inline-block';
                            span.style.width = '0.25em';
                            span.style.visibility = 'visible';
                        } else {
                            span.style.display = 'inline-block';
                        }
                        span.dataset.index = index;
                        span.style.background = 'inherit';
                        span.style.webkitBackgroundClip = 'inherit';
                        span.style.webkitTextFillColor = 'inherit';
                        span.style.backgroundClip = 'inherit';
                        span.style.color = 'inherit';
                        this.element.appendChild(span);
                        this.charSpans.push(span);
                    });
                }

                start() {
                    if (this._destroyed || this.charSpans.length === 0) return;
                    if (this.isRunning) return;
                    this.isRunning = true;
                    this.isPausing = false;
                    this.currentCharIndex = 0;
                    this._runNextChar();
                }

                _runNextChar() {
                    if (this._destroyed || !this.isRunning) return;
                    if (this.isPausing) return;

                    if (this.currentCharIndex >= this.charSpans.length) {
                        this.isPausing = true;
                        this.pauseTimer = setTimeout(() => {
                            if (this._destroyed) return;
                            this.isPausing = false;
                            this.currentCharIndex = 0;
                            this._runNextChar();
                        }, 3000);
                        return;
                    }

                    const charSpan = this.charSpans[this.currentCharIndex];
                    if (charSpan) {
                        const charText = charSpan.textContent || '';
                        if (charText.trim() !== '' && charText !== '\u200B') {
                            charSpan.classList.remove('float-up', 'glow-active');
                            void charSpan.offsetWidth;
                            charSpan.classList.add('float-up', 'glow-active');
                            const onFinish = () => {
                                charSpan.removeEventListener('animationend', onFinish);
                                if (!this._destroyed) {
                                    charSpan.classList.remove('float-up', 'glow-active');
                                }
                            };
                            charSpan.addEventListener('animationend', onFinish);
                        }
                        this.currentCharIndex++;
                        const delay = 240 + Math.random() * 60;
                        this.timer = setTimeout(() => {
                            if (!this._destroyed && this.isRunning) {
                                this._runNextChar();
                            }
                        }, delay);
                    } else {
                        this.currentCharIndex++;
                        this.timer = setTimeout(() => {
                            if (!this._destroyed && this.isRunning) {
                                this._runNextChar();
                            }
                        }, 100);
                    }
                }

                stop() {
                    this.isRunning = false;
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }
                    if (this.pauseTimer) {
                        clearTimeout(this.pauseTimer);
                        this.pauseTimer = null;
                    }
                    this.charSpans.forEach(span => {
                        span.classList.remove('float-up', 'glow-active');
                    });
                }

                destroy() {
                    this._destroyed = true;
                    this.stop();
                    if (this.element && this.originalText) {
                        this.element.textContent = this.originalText;
                    }
                    this.charSpans = [];
                }

                reset() {
                    this.stop();
                    this.charSpans.forEach(span => {
                        span.classList.remove('float-up', 'glow-active');
                    });
                    const text = this.element ? this.element.textContent : '';
                    if (text) {
                        this.originalText = text;
                        this.element.innerHTML = '';
                        const chars = text.split('');
                        this.charSpans = [];
                        chars.forEach((char, index) => {
                            const span = document.createElement('span');
                            span.textContent = char;
                            span.className = 'title-char';
                            if (char === ' ' || char === '\u200B') {
                                span.style.display = 'inline-block';
                                span.style.width = '0.25em';
                                span.style.visibility = 'visible';
                            } else {
                                span.style.display = 'inline-block';
                            }
                            span.dataset.index = index;
                            span.style.background = 'inherit';
                            span.style.webkitBackgroundClip = 'inherit';
                            span.style.webkitTextFillColor = 'inherit';
                            span.style.backgroundClip = 'inherit';
                            span.style.color = 'inherit';
                            this.element.appendChild(span);
                            this.charSpans.push(span);
                        });
                        this.isRunning = false;
                        this.isPausing = false;
                        this.currentCharIndex = 0;
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                        if (this.pauseTimer) {
                            clearTimeout(this.pauseTimer);
                            this.pauseTimer = null;
                        }
                        this.start();
                    }
                }
            }

            window.reinitTitleAnimation = function() {
                if (titleAnimator) {
                    titleAnimator.reset();
                } else {
                    initTitleAnimation();
                }
            };

            window.destroyTitleAnimation = function() {
                if (titleAnimator) {
                    titleAnimator.destroy();
                    titleAnimator = null;
                }
            };

            /* ===== 核心 UI 更新 ===== */
            function updateUI() {
                cacheElements();
                const tFn = t;

                if (cachedElements.wheelCenterBtnText) {
                    cachedElements.wheelCenterBtnText.textContent = tFn('draw');
                }

                const wheelMainText = document.getElementById('wheelBtnMainText');
                if (wheelMainText) wheelMainText.textContent = tFn('wheelMainText');
                const wheelSubText = document.getElementById('wheelBtnSubText');
                if (wheelSubText) wheelSubText.textContent = tFn('wheelSubText');

                if (cachedElements.prizeResultText && window.currentPrizeLabel && window.currentPrizeLabel !== '0 Ks') {
                    const prizeResult = document.getElementById('prizeResult');
                    if (prizeResult && prizeResult.classList.contains('show')) {
                        cachedElements.prizeResultText.textContent = tFn('prizeResultPrefix') + window.currentPrizeLabel +
                            tFn('prizeResultSuffix');
                    }
                }

                if (cachedElements.step1ClaimBtn) cachedElements.step1ClaimBtn.textContent = tFn('step1_claim');
                if (cachedElements.step1Title) {
                    if (!cachedElements.step1Title.textContent || cachedElements.step1Title.textContent === '') {
                        cachedElements.step1Title.textContent = tFn('congratsTitle');
                    }
                }
                if (cachedElements.step1Subtitle) {
                    if (!cachedElements.step1Subtitle.textContent || cachedElements.step1Subtitle.textContent === '') {
                        cachedElements.step1Subtitle.textContent = tFn('bonusDeposited');
                    }
                }

                if (typeof window._updateChanceInfoDisplay === 'function') {
                    window._updateChanceInfoDisplay();
                }

                if (cachedElements.step2Title) cachedElements.step2Title.textContent = tFn('step2_title');
                if (cachedElements.step2Subtitle) cachedElements.step2Subtitle.textContent = tFn('step2_sub');
                if (cachedElements.regUsername) cachedElements.regUsername.placeholder = tFn('reg_username_ph');
                if (cachedElements.regPhone) cachedElements.regPhone.placeholder = tFn('reg_phone_ph');
                if (cachedElements.regPwd) cachedElements.regPwd.placeholder = tFn('reg_pwd_ph');
                if (cachedElements.regConfirmPwd) cachedElements.regConfirmPwd.placeholder = tFn('reg_confirm_pwd_ph');
                if (cachedElements.regCaptcha) cachedElements.regCaptcha.placeholder = tFn('reg_captcha_ph');
                if (cachedElements.step2SubmitBtn) cachedElements.step2SubmitBtn.textContent = tFn('step2_submit');
                if (cachedElements.switchToLogin) {
                    cachedElements.switchToLogin.innerHTML = tFn('switch_login') + '<span>' + tFn('switch_login_span') +
                        '</span>';
                }

                if (cachedElements.step3Title) {
                    const newTitle = tFn('step3_title');
                    const currentTitle = cachedElements.step3Title.textContent;
                    if (currentTitle !== newTitle) {
                        cachedElements.step3Title.textContent = newTitle;
                        const step3El = document.getElementById('step3');
                        if (step3El && !step3El.classList.contains('hidden')) {
                            requestAnimationFrame(() => {
                                if (titleAnimator) {
                                    titleAnimator.reset();
                                } else {
                                    initTitleAnimation();
                                }
                            });
                        }
                    }
                }
                if (cachedElements.loginPhone) cachedElements.loginPhone.placeholder = tFn('login_phone_or_id_ph');
                if (cachedElements.loginPwd) cachedElements.loginPwd.placeholder = tFn('login_pwd_ph');
                if (cachedElements.riskTips) cachedElements.riskTips.textContent = tFn('risk_tips');
                if (cachedElements.step3SubmitBtn) cachedElements.step3SubmitBtn.textContent = tFn('step3_submit');
                if (cachedElements.switchToRegister) {
                    cachedElements.switchToRegister.innerHTML = tFn('switch_register') + '<span>' + tFn(
                        'switch_register_span') + '</span>';
                }
                if (cachedElements.forgotPwdLink) {
                    cachedElements.forgotPwdLink.textContent = tFn('login_forgot_pwd');
                }

                if (cachedElements.loginBonusTitle) cachedElements.loginBonusTitle.textContent = tFn('login_bonus_title');

                if (cachedElements.rechargeModalTitle) cachedElements.rechargeModalTitle.textContent = tFn('recharge_title');
                if (cachedElements.rechargeModalActivity) cachedElements.rechargeModalActivity.textContent = tFn(
                    'recharge_activity');
                if (cachedElements.rechargeModalDesc) cachedElements.rechargeModalDesc.textContent = tFn('recharge_desc');
                if (cachedElements.rechargeModalBtn) cachedElements.rechargeModalBtn.textContent = tFn('recharge_btn');

                if (cachedElements.placeholderTitle) cachedElements.placeholderTitle.textContent = tFn('placeholder_title');
                if (cachedElements.placeholderSub) cachedElements.placeholderSub.textContent = tFn('placeholder_sub');
                if (cachedElements.placeholderHint) cachedElements.placeholderHint.textContent = tFn('placeholder_hint');
                if (cachedElements.placeholderBackBtn) cachedElements.placeholderBackBtn.textContent = tFn(
                    'placeholder_btn');

                if (cachedElements.protocolLabel) {
                    let protocolEnd = tFn('protocol_end');
                    if (currentLang === 'my' || currentLang === 'en') {
                        protocolEnd = '';
                    }
                    if (/protocol_end|3protocol_end/i.test(protocolEnd)) {
                        protocolEnd = '';
                    }
                    cachedElements.protocolLabel.innerHTML =
                        tFn('protocol_label') +
                        '<a href="#" class="protocol-link" onclick="event.stopPropagation();openAgreementModal(\'userAgreement\')">' +
                        tFn('userAgreement') + '</a>' +
                        tFn('protocol_mid') +
                        '<a href="#" class="protocol-link" onclick="event.stopPropagation();openAgreementModal(\'privacyPolicy\')">' +
                        tFn('privacyPolicy') + '</a>' +
                        protocolEnd;
                }

                updateInspireMessages();
                updateLangMenuLabels();
                refreshBonusDisplay();
                applyStaticTranslations();

                if (window._refreshHistoryLabels) {
                    window._refreshHistoryLabels();
                }
                updateLoginErrorTips();
                refreshVisibleFieldErrors();

                // 如果 step3 当前可见，触发 Logo 动画
                const step3El = document.getElementById('step3');
                if (step3El && !step3El.classList.contains('hidden')) {
                    setTimeout(() => {
                        triggerLoginLogoAnimation();
                    }, 80);
                }
            }

            function updateLoginErrorTips() {
                const phoneTip = document.getElementById('loginPhoneErrorTip');
                const pwdTip = document.getElementById('loginPwdErrorTip');
                if (phoneTip && phoneTip.classList.contains('visible')) {
                    const key = phoneTip.dataset.errorKey;
                    if (key) phoneTip.textContent = t(key);
                }
                if (pwdTip && pwdTip.classList.contains('visible')) {
                    const key = pwdTip.dataset.errorKey;
                    if (key) pwdTip.textContent = t(key);
                }
            }
            window.updateLoginErrorTips = updateLoginErrorTips;

            // 注册表单当前可见的错误提示：切换语言时同步刷新
            function refreshVisibleFieldErrors() {
                const ids = ['usernameErrorTip', 'phoneErrorTip', 'captchaErrorTip', 'pwdErrorTip', 'confirmPwdErrorTip'];
                ids.forEach(function(id) {
                    const tip = document.getElementById(id);
                    if (tip && tip.classList.contains('visible') && tip.dataset.errorKey) {
                        tip.textContent = t(tip.dataset.errorKey);
                    }
                });
            }

            /* ===== 静态 HTML 文案统一刷新（data-i18n 属性驱动） ===== */
            function applyStaticTranslations() {
                document.querySelectorAll('[data-i18n]').forEach(function(el) {
                    el.textContent = t(el.getAttribute('data-i18n'));
                });
                // 顶部“动态数据流”标签：逐字弹跳动画由三个 span 组成
                let chars = t('streamTagChars');
                if (!Array.isArray(chars)) chars = [];
                const charSpans = document.querySelectorAll('.marquee-tag .ds-char-bounce');
                charSpans.forEach(function(span, i) {
                    if (chars[i] !== undefined) span.textContent = chars[i];
                });
            }

            function switchLanguage(langCode) {
                if (!SUPPORTED.includes(langCode) || langCode === currentLang) return;
                currentLang = langCode;
                setStoredLang(langCode);
                updateUI();
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
            }

            function createLangUI() {
                const header = document.querySelector('.header');
                if (!header) return;
                const btn = document.createElement('div');
                btn.className = 'lang-switch-btn';
                btn.id = 'langSwitchBtn';
                btn.innerHTML =
                    '<svg viewBox="0 0 24 24"><defs><linearGradient id="globeGrad" x1="0.15" y1="0.05" x2="0.85" y2="0.95"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#0068e0"/></linearGradient></defs><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="url(#globeGrad)"/></svg><span class="lang-btn-text">' + t('langBtnLabel') + '</span><span class="lang-arrow">∨</span>';
                const dropdown = document.createElement('div');
                dropdown.className = 'lang-dropdown';
                dropdown.id = 'langDropdown';
                header.appendChild(btn);
                document.body.appendChild(dropdown);
                let open = false;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = btn.getBoundingClientRect();
                    dropdown.style.top = (rect.bottom + 8) + 'px';
                    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
                    open = !open;
                    dropdown.classList.toggle('active', open);
                });
                document.addEventListener('click', (e) => {
                    if (open && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove('active');
                        open = false;
                    }
                }, true);

                function buildMenu() {
                    dropdown.innerHTML = '';
                    langDefs.forEach(def => {
                        const item = document.createElement('div');
                        item.className = 'lang-menu-item';
                        item.dataset.lang = def.code;
                        if (def.code === currentLang) item.classList.add('active');
                        item.innerHTML =
                            '<span class="lang-item-flag">' + def.flag + '</span>' +
                            '<span class="lang-item-text">' + t(def.labelKey) + '</span>' +
                            '<span class="lang-active-dot"></span>';
                        item.addEventListener('click', (e) => {
                            e.stopPropagation();
                            switchLanguage(def.code);
                            dropdown.classList.remove('active');
                            open = false;
                            buildMenu();
                        });
                        dropdown.appendChild(item);
                    });
                }
                buildMenu();

                window._buildLangMenu = buildMenu;
                window._langDropdown = dropdown;
                window._langBtn = btn;
            }

            function updateLangMenuLabels() {
                if (window._buildLangMenu) {
                    window._buildLangMenu();
                }
                const labelEl = window._langBtn ? window._langBtn.querySelector('.lang-btn-text') : null;
                if (labelEl) labelEl.textContent = t('langBtnLabel');
            }
            window.updateLangMenuLabels = updateLangMenuLabels;

            /* ===== 音频控制按钮 —— 左上角喇叭图标 ===== */
            window._audioMuted = false; // 默认非静音（有声状态）

            /**
             * 创建音频切换按钮
             * 默认：有声（喇叭图标 + 声波动画）
             * 点击：静音/取消静音切换（关联控制抽奖奖金音效）
             */
            function createAudioBtn() {
                const btn = document.createElement('div');
                btn.className = 'audio-toggle-btn';
                btn.id = 'audioToggleBtn';
                btn.setAttribute('aria-label', '音频控制');
                btn.setAttribute('role', 'button');
                btn.setAttribute('tabindex', '0');
                // 默认有声图标：喇叭 + 声波弧线
                btn.innerHTML = getAudioIconHTML(false);
                document.body.appendChild(btn);

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window._audioMuted = !window._audioMuted;
                    btn.innerHTML = getAudioIconHTML(window._audioMuted);
                    if (window._audioMuted) {
                        btn.classList.add('muted');
                        btn.setAttribute('aria-label', '音频已静音');
                        // 立即停止正在播放的抽奖奖金音效
                        if (typeof window._stopPrizeSound === 'function') {
                            window._stopPrizeSound();
                        }
                    } else {
                        btn.classList.remove('muted');
                        btn.setAttribute('aria-label', '音频控制');
                    }
                });

                // 键盘无障碍支持
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        btn.click();
                    }
                });

                window._audioBtn = btn;
            }

            /**
             * 获取音频图标 SVG HTML
             * @param {boolean} muted - 是否静音
             * @returns {string} SVG 图标 HTML 字符串
             */
            function getAudioIconHTML(muted) {
                if (muted) {
                    // 静音图标：喇叭 + X 标记
                    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                        '<defs>' +
                        '<linearGradient id="audioOffGrad" x1="0.15" y1="0.05" x2="0.85" y2="0.95">' +
                        '<stop offset="0%" stop-color="#777"/>' +
                        '<stop offset="100%" stop-color="#444"/>' +
                        '</linearGradient>' +
                        '</defs>' +
                        '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="url(#audioOffGrad)"/>' +
                        '<line x1="23" y1="1" x2="1" y2="23" stroke="url(#audioOffGrad)" stroke-width="2" stroke-linecap="round"/>' +
                        '</svg>';
                }
                // 有声图标：喇叭 + 声波弧线（霓虹渐变，呼吸动画）
                return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                    '<defs>' +
                    '<linearGradient id="audioOnGrad" x1="0.15" y1="0.05" x2="0.85" y2="0.95">' +
                    '<stop offset="0%" stop-color="#00f0ff"/>' +
                    '<stop offset="50%" stop-color="#8a2be2"/>' +
                    '<stop offset="100%" stop-color="#b388ff"/>' +
                    '</linearGradient>' +
                    '</defs>' +
                    '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="url(#audioOnGrad)"/>' +
                    '<path class="aw1" d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="url(#audioOnGrad)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
                    '<path class="aw2" d="M18.4 5.6a8.5 8.5 0 0 1 0 12.8" stroke="url(#audioOnGrad)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
                    '</svg>';
            }

            window.openAgreementModal = function(titleKey) {
                const content = window.getAgreementContent(titleKey);
                const existing = document.querySelector('.dynamic-agreement-modal');
                if (existing) existing.remove();
                const overlay = document.createElement('div');
                overlay.className = 'agreement-modal-overlay dynamic-agreement-modal';
                overlay.innerHTML =
                    '<div class="agreement-modal-card">' +
                    '<div class="agreement-modal-title">' + t(titleKey) + '</div>' +
                    '<div class="agreement-modal-body">' + content + '</div>' +
                    '<button class="agreement-modal-close">' + t('confirm') + '</button>' +
                    '</div>';
                document.body.appendChild(overlay);
                const closeBtn = overlay.querySelector('.agreement-modal-close');
                const close = () => {
                    overlay.classList.remove('active');
                    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 280);
                };
                closeBtn.addEventListener('click', close);
                overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
                requestAnimationFrame(() => { requestAnimationFrame(() => { overlay.classList.add('active'); }); });
            };

            function showForgotPwdModal() {
                const existing = document.querySelector('.forgot-modal-overlay');
                if (existing) existing.remove();

                const overlay = document.createElement('div');
                overlay.className = 'forgot-modal-overlay';
                overlay.innerHTML =
                    '<div class="forgot-modal-card">' +
                    '<button class="forgot-modal-close" id="forgotModalCloseBtn" aria-label="关闭">✕</button>' +
                    '<div class="forgot-modal-title">' + t('login_forgot_pwd_title') + '</div>' +
                    '<div class="forgot-modal-body">' +
                    '<p>' + t('login_forgot_pwd_body') + '</p>' +
                    '<p style="margin-top:12px;"><span class="contact-highlight">' + t('login_forgot_pwd_contact') +
                    '</span></p>' +
                    '</div>' +
                    '<button class="forgot-modal-btn" id="forgotModalConfirmBtn">' + t('confirm') + '</button>' +
                    '</div>';
                document.body.appendChild(overlay);

                const closeBtn = overlay.querySelector('#forgotModalCloseBtn');
                const confirmBtn = overlay.querySelector('#forgotModalConfirmBtn');

                const close = () => {
                    overlay.classList.remove('active');
                    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
                };

                closeBtn.addEventListener('click', close);
                confirmBtn.addEventListener('click', close);

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {}
                });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        overlay.classList.add('active');
                    });
                });
            }

            function showRechargeModal() {
                const overlay = document.getElementById('rechargeModalOverlay');
                if (!overlay) return;
                const titleEl = document.getElementById('rechargeModalTitle');
                const activityEl = document.getElementById('rechargeModalActivity');
                const descEl = document.getElementById('rechargeModalDesc');
                const btnEl = document.getElementById('rechargeModalBtn');
                if (titleEl) titleEl.textContent = t('recharge_title');
                if (activityEl) activityEl.textContent = t('recharge_activity');
                if (descEl) descEl.textContent = t('recharge_desc');
                if (btnEl) btnEl.textContent = t('recharge_btn');
                overlay.classList.add('active');
            }

            function hideRechargeModal() {
                const overlay = document.getElementById('rechargeModalOverlay');
                if (overlay) overlay.classList.remove('active');
            }

            function showPlaceholder() {
                const el = document.getElementById('gamePlaceholder');
                if (el) {
                    el.classList.add('active');
                    const titleEl = document.getElementById('placeholderTitle');
                    const subEl = document.getElementById('placeholderSub');
                    const hintEl = document.getElementById('placeholderHint');
                    const btnEl = document.getElementById('placeholderBackBtn');
                    if (titleEl) titleEl.textContent = t('placeholder_title');
                    if (subEl) subEl.textContent = t('placeholder_sub');
                    if (hintEl) hintEl.textContent = t('placeholder_hint');
                    if (btnEl) btnEl.textContent = t('placeholder_btn');
                }
            }

            function hidePlaceholder() {
                const el = document.getElementById('gamePlaceholder');
                if (el) el.classList.remove('active');
                const modal = document.getElementById('modalOverlay');
                if (modal) modal.classList.remove('active');
                const prizeResult = document.getElementById('prizeResult');
                if (prizeResult) prizeResult.classList.remove('show');
                if (window.gift3d && window.gift3d.close) window.gift3d.close();
                window.appState = 'idle';
            }

            /* ===== showStep 增强 ===== */
            const originalShowStep = window.showStep;
            window.showStep = function(stepNumber) {
                if (originalShowStep) {
                    originalShowStep(stepNumber);
                } else {
                    // fallback
                    const s1 = document.getElementById('step1');
                    const s2 = document.getElementById('step2');
                    const s3 = document.getElementById('step3');
                    [s1, s2, s3].forEach(el => { if (el) { el.classList.add('hidden');
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(10px)'; } });
                    let target = null;
                    if (stepNumber === 1) target = s1;
                    else if (stepNumber === 2) target = s2;
                    else if (stepNumber === 3) target = s3;
                    if (target) { target.classList.remove('hidden');
                        requestAnimationFrame(() => { target.style.opacity = '1';
                            target.style.transform = 'translateY(0)'; }); }
                }

                // 如果切换到 step3，触发 Logo 动画和标题动画
                if (stepNumber === 3) {
                    setTimeout(() => {
                        triggerLoginLogoAnimation();
                        if (window.initTitleAnimation) {
                            window.initTitleAnimation();
                        }
                    }, 100);
                } else {
                    if (window.destroyTitleAnimation) {
                        window.destroyTitleAnimation();
                    }
                }
            };

            function init() {
                currentLang = getStoredLang();
                if (!SUPPORTED.includes(currentLang)) currentLang = DEFAULT;
                createLangUI();
                createAudioBtn();
                cacheElements();
                updateUI();
                window._inspireMessages = t('inspireMessages') || ['✨'];
                if (typeof window._inspireMessages === 'string') {
                    window._inspireMessages = [window._inspireMessages];
                }

                const forgotLink = document.getElementById('forgotPwdLink');
                if (forgotLink) {
                    forgotLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        showForgotPwdModal();
                    });
                }

                const pwdToggle = document.getElementById('pwdToggleBtn');
                const pwdInput = document.getElementById('loginPwd');
                if (pwdToggle && pwdInput) {
                    pwdToggle.addEventListener('click', () => {
                        const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                        pwdInput.setAttribute('type', type);
                        const svg = pwdToggle.querySelector('svg');
                        if (type === 'text') {
                            svg.innerHTML =
                                '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
                        } else {
                            svg.innerHTML =
                                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
                        }
                    });
                }

                const regPwdToggle = document.getElementById('regPwdToggle');
                const regPwdInput = document.getElementById('regPwd');
                if (regPwdToggle && regPwdInput) {
                    regPwdToggle.addEventListener('click', () => {
                        const type = regPwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                        regPwdInput.setAttribute('type', type);
                        const svg = regPwdToggle.querySelector('svg');
                        if (type === 'text') {
                            svg.innerHTML =
                                '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
                        } else {
                            svg.innerHTML =
                                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
                        }
                    });
                }

                const regConfirmPwdToggle = document.getElementById('regConfirmPwdToggle');
                const regConfirmPwdInput = document.getElementById('regConfirmPwd');
                if (regConfirmPwdToggle && regConfirmPwdInput) {
                    regConfirmPwdToggle.addEventListener('click', () => {
                        const type = regConfirmPwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                        regConfirmPwdInput.setAttribute('type', type);
                        const svg = regConfirmPwdToggle.querySelector('svg');
                        if (type === 'text') {
                            svg.innerHTML =
                                '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
                        } else {
                            svg.innerHTML =
                                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
                        }
                    });
                }

                const rechargeClose = document.getElementById('rechargeModalClose');
                if (rechargeClose) {
                    rechargeClose.addEventListener('click', (e) => {
                        e.stopPropagation();
                        hideRechargeModal();
                    });
                }
                const rechargeOverlay = document.getElementById('rechargeModalOverlay');
                if (rechargeOverlay) {
                    rechargeOverlay.addEventListener('click', (e) => {
                        if (e.target === rechargeOverlay) {}
                    });
                }

                const rechargeBtn = document.getElementById('rechargeModalBtn');
                if (rechargeBtn) {
                    rechargeBtn.addEventListener('click', () => {
                        alert(t('recharge_btn') + ' (' + t('feature_in_dev') + ')');
                    });
                }

                const backBtn = document.getElementById('placeholderBackBtn');
                if (backBtn) {
                    backBtn.addEventListener('click', hidePlaceholder);
                }

                // 监听 step3 显示，触发 Logo 动画
                const step3El = document.getElementById('step3');
                const observer = new MutationObserver(() => {
                    if (step3El && !step3El.classList.contains('hidden')) {
                        setTimeout(() => {
                            triggerLoginLogoAnimation();
                            initTitleAnimation();
                        }, 80);
                    } else {
                        if (titleAnimator) {
                            titleAnimator.destroy();
                            titleAnimator = null;
                        }
                    }
                });
                observer.observe(step3El, { attributes: true, attributeFilter: ['class'] });

                window.addEventListener('languageChanged', () => {
                    const step3ElLocal = document.getElementById('step3');
                    if (step3ElLocal && !step3ElLocal.classList.contains('hidden')) {
                        setTimeout(() => {
                            triggerLoginLogoAnimation();
                            if (titleAnimator) {
                                titleAnimator.reset();
                            } else {
                                initTitleAnimation();
                            }
                        }, 120);
                    }
                });

                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        const step3ElLocal = document.getElementById('step3');
                        if (step3ElLocal && !step3ElLocal.classList.contains('hidden')) {
                            setTimeout(() => {
                                triggerLoginLogoAnimation();
                                if (titleAnimator) {
                                    titleAnimator.reset();
                                } else {
                                    initTitleAnimation();
                                }
                            }, 200);
                        }
                    }
                });

                // 如果 step3 初始可见（例如语言切换后），触发 Logo 动画
                if (step3El && !step3El.classList.contains('hidden')) {
                    setTimeout(() => {
                        triggerLoginLogoAnimation();
                    }, 150);
                }
            }

            window.initBonusTimer = initBonusTimer;
            window.refreshBonusDisplay = refreshBonusDisplay;
            window.showForgotPwdModal = showForgotPwdModal;
            window.showRechargeModal = showRechargeModal;
            window.hideRechargeModal = hideRechargeModal;
            window.showPlaceholder = showPlaceholder;
            window.hidePlaceholder = hidePlaceholder;
            window.t = t;
            window.switchLanguage = switchLanguage;
            window.updateUI = updateUI;
            window.initTitleAnimation = initTitleAnimation;
            window.triggerLoginLogoAnimation = triggerLoginLogoAnimation;

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();
    


        (function(global) {
            'use strict';
            let currentCode = '';
            let currentToken = '';
            let generateTime = 0;
            let isUsed = false;
            const VALIDITY_DURATION = 5 * 60 * 1000;
            const CODE_LENGTH = 6;
            const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let canvasEl = null;
            let ctx = null;
            let inputField = null;

            function getRandomInt(min, max) {
                const range = max - min + 1;
                const buf = new Uint32Array(1);
                crypto.getRandomValues(buf);
                return min + (buf[0] % range);
            }

            function getRandomChar() {
                return CHARSET[getRandomInt(0, CHARSET.length - 1)];
            }

            function generateToken() {
                const buf = new Uint8Array(16);
                crypto.getRandomValues(buf);
                return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
            }

            function drawCaptcha(code) {
                if (!canvasEl || !ctx) {
                    canvasEl = document.getElementById('captchaCanvas');
                    if (!canvasEl) return;
                    ctx = canvasEl.getContext('2d');
                }
                const w = canvasEl.width;
                const h = canvasEl.height;
                ctx.clearRect(0, 0, w, h);
                const bgGrad = ctx.createLinearGradient(0, 0, w, h);
                const hue1 = getRandomInt(200, 300);
                const hue2 = (hue1 + getRandomInt(30, 90)) % 360;
                bgGrad.addColorStop(0, `hsl(${hue1}, 60%, 20%)`);
                bgGrad.addColorStop(0.5, `hsl(${hue2}, 55%, 15%)`);
                bgGrad.addColorStop(1, `hsl(${hue1 + 30}, 50%, 10%)`);
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w, h);
                ctx.save();
                const dotCount = getRandomInt(60, 120);
                for (let i = 0; i < dotCount; i++) {
                    const x = getRandomInt(0, w);
                    const y = getRandomInt(0, h);
                    const r = getRandomInt(1, 3);
                    const alpha = 0.3 + Math.random() * 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${getRandomInt(0, 360)}, 70%, 70%, ${alpha})`;
                    ctx.fill();
                }
                ctx.restore();
                ctx.save();
                ctx.lineWidth = getRandomInt(1, 2);
                for (let i = 0; i < getRandomInt(2, 4); i++) {
                    ctx.beginPath();
                    const x1 = getRandomInt(0, w * 0.3);
                    const y1 = getRandomInt(0, h);
                    const x2 = getRandomInt(w * 0.7, w);
                    const y2 = getRandomInt(0, h);
                    ctx.moveTo(x1, y1);
                    const cp1x = getRandomInt(w * 0.2, w * 0.5);
                    const cp1y = getRandomInt(0, h);
                    const cp2x = getRandomInt(w * 0.5, w * 0.8);
                    const cp2y = getRandomInt(0, h);
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
                    ctx.strokeStyle = `hsla(${getRandomInt(0, 360)}, 60%, 60%, ${0.15 + Math.random()*0.25})`;
                    ctx.stroke();
                }
                ctx.restore();
                const chars = code.split('');
                const totalWidth = w * 0.78;
                const startX = (w - totalWidth) / 2;
                const charSpacing = totalWidth / chars.length;
                ctx.save();
                chars.forEach((ch, idx) => {
                    const fonts = [
                        'Arial', 'Helvetica', 'Verdana', 'Georgia', 'Times New Roman',
                        'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS'
                    ];
                    const fontFamily = fonts[getRandomInt(0, fonts.length - 1)];
                    const fontSize = getRandomInt(28, 40);
                    const fontWeight = getRandomInt(0, 1) ? 'bold' : 'normal';
                    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
                    const fgHue = (hue1 + getRandomInt(30, 180)) % 360;
                    const fgSat = getRandomInt(60, 100);
                    const fgLight = getRandomInt(60, 90);
                    ctx.fillStyle = `hsl(${fgHue}, ${fgSat}%, ${fgLight}%)`;
                    const angle = (getRandomInt(-30, 30) * Math.PI) / 180;
                    const dx = getRandomInt(-6, 6);
                    const dy = getRandomInt(-5, 5);
                    const x = startX + idx * charSpacing + charSpacing / 2 + dx;
                    const y = h / 2 + fontSize * 0.3 + dy;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0,0,0,0.4)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(ch, 0, 0);
                    ctx.restore();
                });
                ctx.restore();
                ctx.save();
                ctx.lineWidth = getRandomInt(1, 2);
                for (let i = 0; i < getRandomInt(1, 3); i++) {
                    ctx.beginPath();
                    const sx = getRandomInt(0, w);
                    const sy = getRandomInt(0, h);
                    const ex = getRandomInt(0, w);
                    const ey = getRandomInt(0, h);
                    const cpx = getRandomInt(0, w);
                    const cpy = getRandomInt(0, h);
                    ctx.moveTo(sx, sy);
                    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
                    ctx.strokeStyle = `hsla(${getRandomInt(0, 360)}, 50%, 70%, ${0.1 + Math.random()*0.15})`;
                    ctx.stroke();
                }
                ctx.restore();
            }

            const Captcha = {
                generate: function() {
                    let code = '';
                    for (let i = 0; i < CODE_LENGTH; i++) {
                        code += getRandomChar();
                    }
                    const lowerCode = code.toLowerCase();
                    currentCode = lowerCode;
                    currentToken = generateToken();
                    generateTime = Date.now();
                    isUsed = false;
                    drawCaptcha(code);
                    if (inputField) {
                        inputField.value = '';
                        inputField.classList.remove('error');
                    }
                    return { code: lowerCode, token: currentToken };
                },
                refresh: function() {
                    this.generate();
                    const evt = new CustomEvent('captchaRefreshed', { detail: { token: currentToken } });
                    document.dispatchEvent(evt);
                },
                validate: function(userInput, token) {
                    if (!currentCode || !currentToken) {
                        return { valid: false, message: 'captcha_not_generated' };
                    }
                    if (isUsed) {
                        return { valid: false, message: 'captcha_already_used' };
                    }
                    const now = Date.now();
                    if (now - generateTime > VALIDITY_DURATION) {
                        return { valid: false, message: 'captcha_expired' };
                    }
                    if (!userInput || userInput.toLowerCase() !== currentCode) {
                        return { valid: false, message: 'captcha_error' };
                    }
                    isUsed = true;
                    return { valid: true, message: 'captcha_valid' };
                },
                getCurrentCode: function() { return currentCode; },
                getCurrentToken: function() { return currentToken; },
                isUsed: function() { return isUsed; },
                invalidate: function() { isUsed = true; }
            };

            let refreshBtn = null;
            let rotationAngle = 0;

            function handleRefreshClick(e) {
                e.preventDefault();
                rotationAngle += 360;
                refreshBtn.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
                refreshBtn.style.transform = `rotate(${rotationAngle}deg)`;
                refreshBtn.classList.remove('pulse');
                void refreshBtn.offsetWidth;
                refreshBtn.classList.add('pulse');
                Captcha.refresh();
                if (inputField) {
                    inputField.value = '';
                    inputField.classList.remove('error');
                }
                if (navigator.vibrate) {
                    navigator.vibrate(6);
                }
            }

            function initCaptcha() {
                canvasEl = document.getElementById('captchaCanvas');
                if (!canvasEl) {
                    setTimeout(initCaptcha, 100);
                    return;
                }
                ctx = canvasEl.getContext('2d');
                inputField = document.getElementById('regCaptcha');
                refreshBtn = document.getElementById('captchaRefreshBtn');
                Captcha.generate();
                if (refreshBtn) {
                    refreshBtn.removeEventListener('click', handleRefreshClick);
                    refreshBtn.addEventListener('click', handleRefreshClick);
                    refreshBtn.addEventListener('animationend', function onPulseEnd() {
                        this.classList.remove('pulse');
                        this.removeEventListener('animationend', onPulseEnd);
                    });
                }
            }

            global.Captcha = Captcha;
            global.generateCaptcha = function() {
                Captcha.refresh();
                if (refreshBtn) {
                    rotationAngle += 360;
                    refreshBtn.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    refreshBtn.style.transform = `rotate(${rotationAngle}deg)`;
                    refreshBtn.classList.remove('pulse');
                    void refreshBtn.offsetWidth;
                    refreshBtn.classList.add('pulse');
                }
                return Captcha.getCurrentCode();
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initCaptcha);
            } else {
                initCaptcha();
            }
        })(window);
    


        (function() {
            let appState = 'idle',
                currentPrize = 0,
                currentPrizeLabel = '0 Ks',
                currentSectorIndex = -1;
            let remainingChances = 3,
                highestPrize = 0,
                highestPrizeLabel = '0 Ks',
                isGameCompleted = false;
            let prizeHistory = [];
            let prizeHistoryMaxIndex = 0;
            let authSource = 'homepage'; // 'homepage' | 'activation' | 'register'
            let authSourcePrev = 'homepage'; // 保存进入登录前的来源，用于❮返回时恢复
            window.appState = appState;

            /* ===== 按钮防抖工具：防止 300ms 内重复触发 ===== */
            const _btnCooldowns = new WeakMap();
            function debounceBtn(fn, ms) {
                ms = ms || 300;
                return function(e) {
                    const now = Date.now();
                    const last = _btnCooldowns.get(this) || 0;
                    if (now - last < ms) return;
                    _btnCooldowns.set(this, now);
                    return fn.call(this, e);
                };
            }

            window.currentPrizeLabel = currentPrizeLabel;
            const wheelSpinBody = document.getElementById('wheelSpinBody'),
                wheelCenterBtn = document.getElementById('wheelCenterBtn');
            const wheelCanvas = document.getElementById('wheel-canvas'),
                wheelCtx = wheelCanvas.getContext('2d');
            const prizeResult = document.getElementById('prizeResult'),
                prizeResultText = document.getElementById('prizeResultText');
            const modalOverlay = document.getElementById('modalOverlay'),
                modalPrizeAmount = document.getElementById('modalPrizeAmount');
            const step1ChanceInfo = document.getElementById('step1ChanceInfo');
            const NUM_SECTORS = 10,
                SECTOR_DEG = 360 / NUM_SECTORS,
                WHEEL_CANVAS_SIZE = 500,
                WHEEL_CENTER = WHEEL_CANVAS_SIZE / 2,
                WHEEL_RADIUS = 244;
            const sectorColors = ['#ff4081', '#b388ff', '#00e5ff', '#00e676', '#ff4081', '#b388ff', '#00e5ff', '#ffab00', '#ff4081', '#b388ff'];
            const sectorTextColors = ['#FFFFFF', '#FFFFFF', '#0a0015', '#0a0015', '#FFFFFF', '#FFFFFF', '#0a0015', '#FFFFFF', '#FFFFFF', '#FFFFFF'];

            function getSectorLabels() {
                const tFn = window.t || ((k) => k);
                const labels = tFn('wheelSectorLabels');
                if (Array.isArray(labels) && labels.length === NUM_SECTORS) return labels;
                return ['普通奖励', '幸运奖励', '神秘奖励', '高级奖励', '特别奖励', '豪华奖励', '稀有奖励', '至尊奖励', '超级大奖', '终极大奖'];
            }

            /* ===== 大轮盘叶片文案：语言与字体自适应辅助（只影响字体，不改动轮盘任何设计） ===== */
            function getWheelLang() {
                if (typeof window.getCurrentLang === 'function') {
                    const l = window.getCurrentLang();
                    if (l === 'en' || l === 'my' || l === 'zh') return l;
                }
                return 'zh';
            }

            function wheelLabelFontFamily(lang) {
                if (lang === 'my') return '"Noto Sans Myanmar","Padauk","Myanmar Text","Myanmar3",sans-serif';
                return 'sans-serif';
            }

            function fitWheelLabelFont(label, lang, maxWidth) {
                const family = wheelLabelFontFamily(lang);
                // 从 16px 向下逐级测量，取不溢出叶片可用宽度的最大字号（下限 9px 保证清晰可读）
                for (let size = 16; size >= 9; size--) {
                    wheelCtx.font = '900 ' + size + 'px ' + family;
                    if (wheelCtx.measureText(label).width <= maxWidth) return size;
                }
                return 9;
            }

            function calculatePrize() {
                const ua = navigator.userAgent;
                const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua);
                const prizes = [100, 200, 300, 500, 1000, 10000];
                let weights;
                if (isApple) { weights = [28, 23, 18, 13, 8, 10]; } else { weights = [30, 25, 20, 15, 9, 1]; }
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let rand = Math.random() * totalWeight;
                let cum = 0;
                for (let i = 0; i < prizes.length; i++) {
                    cum += weights[i];
                    if (rand < cum) {
                        const prize = prizes[i];
                        const label = prize >= 1000 ? prize.toLocaleString() + ' Ks' : prize + ' Ks';
                        return { sectorIndex: i, prize: prize, label: label };
                    }
                }
                return { sectorIndex: 0, prize: 100, label: '100 Ks' };
            }

            // 圆角矩形辅助函数
            function roundedRect(ctx, x, y, width, height, radius) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
            }

            // 绘制立体红包盒子
            function draw3DEnvelope(ctx, type, x, y, w, h) {
                ctx.save();
                ctx.translate(x, y);

                let gradMain, gradFlap, colorLine, sealGlow;
                if (type === 'red') {
                    gradMain = ctx.createLinearGradient(0, 0, w, h);
                    gradMain.addColorStop(0, '#f87171');
                    gradMain.addColorStop(0.5, '#dc2626');
                    gradMain.addColorStop(1, '#991b1b');
                    gradFlap = ctx.createLinearGradient(0, 0, w, h/2);
                    gradFlap.addColorStop(0, '#fca5a5');
                    gradFlap.addColorStop(1, '#ef4444');
                    colorLine = 'rgba(252, 165, 165, 0.5)';
                    sealGlow = '#fef08a';
                } else if (type === 'yellow') {
                    gradMain = ctx.createLinearGradient(0, 0, w, h);
                    gradMain.addColorStop(0, '#fde047');
                    gradMain.addColorStop(0.5, '#eab308');
                    gradMain.addColorStop(1, '#a16207');
                    gradFlap = ctx.createLinearGradient(0, 0, w, h/2);
                    gradFlap.addColorStop(0, '#fef08a');
                    gradFlap.addColorStop(1, '#facc15');
                    colorLine = 'rgba(254, 240, 138, 0.6)';
                    sealGlow = '#fff';
                } else {
                    gradMain = ctx.createLinearGradient(0, 0, w, h);
                    gradMain.addColorStop(0, '#86efac');
                    gradMain.addColorStop(0.5, '#22c55e');
                    gradMain.addColorStop(1, '#14532d');
                    gradFlap = ctx.createLinearGradient(0, 0, w, h/2);
                    gradFlap.addColorStop(0, '#bbf7d0');
                    gradFlap.addColorStop(1, '#4ade80');
                    colorLine = 'rgba(187, 247, 208, 0.5)';
                    sealGlow = '#fef08a';
                }

                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 4;
                ctx.fillStyle = gradMain;
                roundedRect(ctx, 0, 0, w, h, 6);
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = colorLine;
                ctx.lineWidth = 1;
                roundedRect(ctx, 3, 3, w-6, h-6, 4);
                ctx.stroke();

                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 2;
                ctx.fillStyle = gradFlap;
                ctx.beginPath();
                ctx.moveTo(0, 6);
                ctx.lineTo(w/2, h/2 + 3);
                ctx.lineTo(w, 6);
                ctx.quadraticCurveTo(w, 0, w-6, 0);
                ctx.lineTo(6, 0);
                ctx.quadraticCurveTo(0, 0, 0, 6);
                ctx.closePath();
                ctx.fill();
                ctx.shadowColor = 'transparent';

                ctx.beginPath();
                ctx.moveTo(1, 6);
                ctx.lineTo(w/2, h/2 + 3);
                ctx.lineTo(w-1, 6);
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                const sealX = w / 2;
                const sealY = h / 2 + 1;
                const sealR = 9;
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetY = 2;
                let gradSeal = ctx.createLinearGradient(sealX - sealR, sealY - sealR, sealX + sealR, sealY + sealR);
                gradSeal.addColorStop(0, '#fef08a');
                gradSeal.addColorStop(0.3, '#facc15');
                gradSeal.addColorStop(0.7, '#eab308');
                gradSeal.addColorStop(1, '#854d0e');
                ctx.beginPath();
                ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
                ctx.fillStyle = gradSeal;
                ctx.fill();
                ctx.strokeStyle = sealGlow;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(sealX, sealY, sealR - 2, 0, Math.PI * 2);
                ctx.strokeStyle = '#ca8a04';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                ctx.restore();
            }

            function drawWheelCanvas() {
                wheelCtx.clearRect(0, 0, WHEEL_CANVAS_SIZE, WHEEL_CANVAS_SIZE);
                const bgGrad = wheelCtx.createRadialGradient(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.1, WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS);
                bgGrad.addColorStop(0, '#228b22');
                bgGrad.addColorStop(0.7, '#006400');
                bgGrad.addColorStop(1, '#004d00');
                wheelCtx.beginPath();
                wheelCtx.arc(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS, 0, Math.PI * 2);
                wheelCtx.fillStyle = bgGrad;
                wheelCtx.fill();
                const sectorLabels = getSectorLabels();
                const envelopeTypes = ['red', 'green', 'yellow', 'green', 'red', 'yellow', 'green', 'red', 'yellow', 'green'];
                for (let i = 0; i < NUM_SECTORS; i++) {
                    const startAngle = -Math.PI / 2 + i * (2 * Math.PI / NUM_SECTORS);
                    const endAngle = startAngle + (2 * Math.PI / NUM_SECTORS);
                    wheelCtx.beginPath();
                    wheelCtx.moveTo(WHEEL_CENTER, WHEEL_CENTER);
                    wheelCtx.arc(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS, startAngle, endAngle);
                    wheelCtx.closePath();
                    wheelCtx.fillStyle = (i % 2 === 0) ? '#166534' : '#15803d';
                    wheelCtx.fill();
                    wheelCtx.strokeStyle = '#4ade80';
                    wheelCtx.lineWidth = 2;
                    wheelCtx.stroke();
                    const midAngle = startAngle + (2 * Math.PI / NUM_SECTORS) / 2;
                    wheelCtx.save();
                    wheelCtx.translate(WHEEL_CENTER, WHEEL_CENTER);
                    wheelCtx.rotate(midAngle + Math.PI / 2);
                    const envW = 47, envH = 45;
                    const envDist = WHEEL_RADIUS * 0.57;
                    wheelCtx.save();
                    wheelCtx.translate(0, -envDist);
                    draw3DEnvelope(wheelCtx, envelopeTypes[i], -24, -21, 47, 45);
                    wheelCtx.fillStyle = '#fff';
                    wheelCtx.font = 'bold 14px sans-serif';
                    wheelCtx.textAlign = 'center';
                    wheelCtx.textBaseline = 'middle';
                    wheelCtx.shadowColor = 'rgba(0,0,0,0.5)';
                    wheelCtx.shadowBlur = 2;
                    wheelCtx.shadowOffsetY = 1;
                    wheelCtx.fillText('Ks', 0, 1);
                    wheelCtx.shadowColor = 'transparent';
                    wheelCtx.restore();
                    wheelCtx.restore();
                }
                const wheelLang = getWheelLang();
                for (let i = 0; i < NUM_SECTORS; i++) {
                    const startAngle = -Math.PI / 2 + i * (2 * Math.PI / NUM_SECTORS);
                    const midAngle = startAngle + (2 * Math.PI / NUM_SECTORS) / 2;
                    wheelCtx.save();
                    wheelCtx.translate(WHEEL_CENTER, WHEEL_CENTER);
                    wheelCtx.rotate(midAngle + Math.PI / 2);
                    wheelCtx.fillStyle = '#3CE6B0';
                    const displayLabel = sectorLabels[i] || '';
                    let fontSize;
                    if (wheelLang === 'zh') {
                        // 简体中文：保持原有字体大小规则与视觉效果完全不变
                        fontSize = 16;
                        if (displayLabel.length > 6) fontSize = 14;
                        else if (displayLabel.length > 4) fontSize = 15;
                        wheelCtx.font = `900 ${fontSize}px sans-serif`;
                    } else {
                        // 英文 / 缅甸语：按叶片可用宽度逐级测量自适应，保证不溢出、不挤压、居中清晰
                        fontSize = fitWheelLabelFont(displayLabel, wheelLang, WHEEL_RADIUS * 0.40);
                        wheelCtx.font = `900 ${fontSize}px ${wheelLabelFontFamily(wheelLang)}`;
                    }
                    wheelCtx.textAlign = 'center';
                    wheelCtx.textBaseline = 'middle';
                    wheelCtx.shadowColor = 'rgba(0,0,0,0.8)';
                    wheelCtx.shadowBlur = 4;
                    const textRadius = WHEEL_RADIUS * 0.76;
                    wheelCtx.fillText(displayLabel, 0, -textRadius);
                    wheelCtx.shadowBlur = 0;
                    wheelCtx.strokeStyle = '#3CE6B0';
                    wheelCtx.lineWidth = 0.3;
                    wheelCtx.strokeText(displayLabel, 0, -textRadius);
                    wheelCtx.restore();
                }
                const centerGrad = wheelCtx.createRadialGradient(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.04, WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.20);
                centerGrad.addColorStop(0, '#ffffff');
                centerGrad.addColorStop(0.3, '#4ade80');
                centerGrad.addColorStop(0.7, '#16a34a');
                centerGrad.addColorStop(1, '#14532d');
                wheelCtx.beginPath();
                wheelCtx.arc(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.18, 0, Math.PI * 2);
                wheelCtx.fillStyle = centerGrad;
                wheelCtx.fill();
                wheelCtx.strokeStyle = 'rgba(255,255,255,0.3)';
                wheelCtx.lineWidth = 2;
                wheelCtx.stroke();
                wheelCtx.fillStyle = '#ffffff';
                wheelCtx.font = 'bold 20px "Inter","SF Pro Display",sans-serif';
                wheelCtx.textAlign = 'center';
                wheelCtx.textBaseline = 'middle';
                wheelCtx.shadowColor = 'rgba(74,222,128,0.5)';
                wheelCtx.shadowBlur = 20;
                wheelCtx.fillText('✦', WHEEL_CENTER, WHEEL_CENTER);
                wheelCtx.shadowBlur = 0;
            }
            drawWheelCanvas();

            function initWheelLights() {
                const container = document.getElementById('wheelLights');
                if (!container) return;
                container.innerHTML = '';
                const cw = container.offsetWidth;
                const ch = container.offsetHeight;
                if (cw <= 0 || ch <= 0) return;
                const cx = cw / 2;
                const cy = ch / 2;
                const baseRadius = Math.min(cx, cy);
                const radius = baseRadius * 0.935;
                const lightCount = Math.max(8, Math.min(24, Math.round(baseRadius * 0.055)));
                const halfLightW = clampVal(baseRadius * 0.028, 5, 7);
                for (let i = 0; i < lightCount; i++) {
                    const angle = (i * 2 * Math.PI) / lightCount - Math.PI / 2;
                    const x = cx + radius * Math.cos(angle) - halfLightW;
                    const y = cy + radius * Math.sin(angle) - halfLightW;
                    const light = document.createElement('div');
                    light.className = 'wheel-light';
                    light.style.left = x + 'px';
                    light.style.top = y + 'px';
                    container.appendChild(light);
                }
            }
            function clampVal(val, min, max) { return Math.max(min, Math.min(max, val)); }
            initWheelLights();
            (function setupLightsObserver() {
                const container = document.getElementById('wheelLights');
                if (!container) return;
                let debounceTimer = null;
                const ro = new ResizeObserver(function(entries) {
                    if (debounceTimer) clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(function() {
                        const entry = entries[entries.length - 1];
                        if (entry && entry.contentRect.width > 0) {
                            initWheelLights();
                        }
                    }, 120);
                });
                ro.observe(container);
                window._lightsObserver = ro;
            })();

            let currentRotationDeg = 22.5,
                spinAnimation = null;

            function startSpinAnimation(targetSectorIndex) {
                if (appState === 'spinning') return;
                appState = 'spinning';
                // 大轮盘开始旋转时播放 yinxiao2 音效
                if (typeof window._playWheelSpinSound === 'function') {
                    window._playWheelSpinSound();
                }
                prizeResult.classList.remove('show');
                const sectorCenterDeg = targetSectorIndex * SECTOR_DEG + SECTOR_DEG / 2;
                let targetDeg = (360 - sectorCenterDeg - currentRotationDeg + 720) % 360;
                const fullRotations = (6 + Math.floor(Math.random() * 6)) * 360;
                const spinDirection = 1;
                const totalRotation = fullRotations + targetDeg * spinDirection;
                const startRotation = currentRotationDeg;
                const endRotation = startRotation + totalRotation * spinDirection;
                const duration = 3800 + Math.random() * 1400;
                wheelSpinBody.style.willChange = 'transform';
                wheelSpinBody.style.transform = `rotate(${startRotation}deg)`;
                if (spinAnimation) { spinAnimation.cancel();
                    spinAnimation = null; }
                spinAnimation = wheelSpinBody.animate([
                    { transform: `rotate(${startRotation}deg)` },
                    { transform: `rotate(${endRotation}deg)` }
                ], { duration: duration, easing: 'cubic-bezier(0.2,0.8,0.4,1)', fill: 'forwards' });
                spinAnimation.onfinish = () => {
                    currentRotationDeg = endRotation % 360;
                    wheelSpinBody.style.transform = `rotate(${currentRotationDeg}deg)`;
                    wheelSpinBody.style.willChange = 'auto';
                    spinAnimation = null;
                    onSpinComplete();
                };
            }

            function updateChanceInfoDisplay() {
                const tFn = window.t || ((k) => k);
                if (isGameCompleted || remainingChances === 0) {
                    step1ChanceInfo.textContent = tFn('chancesUsed');
                    step1ChanceInfo.classList.add('done');
                } else {
                    step1ChanceInfo.textContent = tFn('freeChancesLeft').replace('{count}', remainingChances);
                    step1ChanceInfo.classList.remove('done');
                }
            }
            window._updateChanceInfoDisplay = updateChanceInfoDisplay;

            function buildDisplayHistory(prizeHistoryArr) {
                const totalSlots = 3;
                const tFn = window.t || ((k) => k);
                const displayHistory = [];
                for (let i = 0; i < totalSlots; i++) {
                    if (i < prizeHistoryArr.length) {
                        displayHistory.push({
                            round: prizeHistoryArr[i].round,
                            prize: prizeHistoryArr[i].prize,
                            label: prizeHistoryArr[i].label,
                            isMarketing: false
                        });
                    } else {
                        const slotNum = i + 1;
                        const marketingKey = slotNum === 2 ? 'slot2_marketing' : 'slot3_marketing';
                        displayHistory.push({
                            round: slotNum,
                            prize: 0,
                            label: tFn(marketingKey),
                            isMarketing: true
                        });
                    }
                }
                return displayHistory;
            }

            function buildPrizeSlider(history, highlightIndex) {
                const track = document.getElementById('prizeSliderTrack');
                const dots = document.getElementById('prizeSliderDots');
                const hint = document.getElementById('prizeSliderHint');
                if (!track || !dots) return;

                const tFn = window.t || ((k) => k);
                const labelTemplate = tFn('prizeHistoryLabel') || '第 {round} 次抽奖';
                const hintText = tFn('prizeHistoryHint') || '← 左右滑动查看 →';

                track.innerHTML = '';
                dots.innerHTML = '';

                if (!history || history.length === 0) {
                    const card = document.createElement('div');
                    card.className = 'prize-slide-card';
                    card.innerHTML = `<div class="prize-amount">0 Ks</div>`;
                    track.appendChild(card);
                    hint.textContent = '';
                    return;
                }

                history.forEach((item, idx) => {
                    const card = document.createElement('div');
                    card.className = 'prize-slide-card';
                    const isHighlight = (!item.isMarketing && idx === highlightIndex);
                    const label = labelTemplate.replace('{round}', item.round);
                    const amount = item.isMarketing ? item.label : (item.label || '0 Ks');
                    card.innerHTML = `
                        <div class="prize-round-label">${label}</div>
                        <div class="prize-amount ${isHighlight ? 'highlight' : ''}">${amount}</div>
                    `;
                    track.appendChild(card);
                });

                const total = history.length;
                for (let i = 0; i < total; i++) {
                    const dot = document.createElement('span');
                    const isActive = (i === highlightIndex);
                    dot.className = 'dot' + (isActive ? ' active' : '');
                    if (isActive && !history[i].isMarketing) dot.classList.add('done');
                    dot.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const cards = track.querySelectorAll('.prize-slide-card');
                        if (cards[i]) {
                            cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                        const allDots = dots.querySelectorAll('.dot');
                        allDots.forEach((d, idx) => {
                            d.classList.toggle('active', idx === i);
                        });
                    });
                    dots.appendChild(dot);
                }

                hint.textContent = total > 1 ? hintText : '';

                if (window._dragController) {
                    window._dragController.abort();
                    window._dragController = null;
                }
                const controller = new AbortController();
                const signal = controller.signal;
                window._dragController = controller;

                let isDragging = false,
                    startX = 0,
                    startScrollLeft = 0;

                track.addEventListener('mousedown', function(e) {
                    if (e.button !== 0) return;
                    isDragging = true;
                    startX = e.clientX;
                    startScrollLeft = track.scrollLeft;
                    track.style.cursor = 'grabbing';
                    track.style.userSelect = 'none';
                    e.preventDefault();
                }, { signal });

                document.addEventListener('mousemove', function(e) {
                    if (!isDragging) return;
                    const deltaX = e.clientX - startX;
                    track.scrollLeft = startScrollLeft - deltaX;
                    const rect = track.getBoundingClientRect();
                    const cards = track.querySelectorAll('.prize-slide-card');
                    let activeIdx = 0,
                        minDist = Infinity;
                    const centerX = rect.left + rect.width / 2;
                    cards.forEach((card, idx) => {
                        const cardRect = card.getBoundingClientRect();
                        const cardCenter = cardRect.left + cardRect.width / 2;
                        const dist = Math.abs(cardCenter - centerX);
                        if (dist < minDist) { minDist = dist;
                            activeIdx = idx; }
                    });
                    const dotItems = dots.querySelectorAll('.dot');
                    dotItems.forEach((d, idx) => {
                        d.classList.toggle('active', idx === activeIdx);
                    });
                }, { signal });

                document.addEventListener('mouseup', function() {
                    if (isDragging) {
                        isDragging = false;
                        track.style.cursor = 'grab';
                        track.style.userSelect = '';
                    }
                }, { signal });

                track.style.cursor = 'grab';

                setTimeout(() => {
                    const cards = track.querySelectorAll('.prize-slide-card');
                    if (cards.length > 0 && highlightIndex >= 0 && highlightIndex < cards.length) {
                        cards[highlightIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest',
                            inline: 'center' });
                    }
                }, 80);

                let scrollTimeout = null;
                track.addEventListener('scroll', function() {
                    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
                    scrollTimeout = requestAnimationFrame(() => {
                        const rect = track.getBoundingClientRect();
                        const cards = track.querySelectorAll('.prize-slide-card');
                        let activeIdx = 0,
                            minDist = Infinity;
                        const centerX = rect.left + rect.width / 2;
                        cards.forEach((card, idx) => {
                            const cardRect = card.getBoundingClientRect();
                            const cardCenter = cardRect.left + cardRect.width / 2;
                            const dist = Math.abs(cardCenter - centerX);
                            if (dist < minDist) { minDist = dist;
                                activeIdx = idx; }
                        });
                        const dotItems = dots.querySelectorAll('.dot');
                        dotItems.forEach((d, idx) => {
                            d.classList.toggle('active', idx === activeIdx);
                        });
                    });
                }, { passive: true });
            }

            /* ===== 中奖红包飞出动画 ===== */
            // 缓存红包袋渲染图像（使用与轮盘完全相同的 draw3DEnvelope 函数绘制）
            var _envelopeImageCache = {};
            function getEnvelopeImage(type) {
                if (_envelopeImageCache[type]) return _envelopeImageCache[type];
                var offCanvas = document.createElement('canvas');
                offCanvas.width = 60;
                offCanvas.height = 58;
                var offCtx = offCanvas.getContext('2d');
                // 使用和轮盘完全相同的绘制函数，确保红包袋颜色、样式、光影100%一致
                draw3DEnvelope(offCtx, type, 6, 5, 47, 45);
                // 绘制 "Ks" 文字，与轮盘上固定红包袋保持一致
                offCtx.fillStyle = '#fff';
                offCtx.font = 'bold 14px sans-serif';
                offCtx.textAlign = 'center';
                offCtx.textBaseline = 'middle';
                offCtx.shadowColor = 'rgba(0,0,0,0.5)';
                offCtx.shadowBlur = 2;
                offCtx.shadowOffsetY = 1;
                offCtx.fillText('Ks', 30, 27);
                offCtx.shadowColor = 'transparent';
                var dataUrl = offCanvas.toDataURL('image/png');
                _envelopeImageCache[type] = dataUrl;
                return dataUrl;
            }

            function triggerWinEnvelopeFly(sectorIndex, onComplete) {
                var spinBody = document.getElementById('wheelSpinBody');
                if (!spinBody) return 0;

                // 获取轮盘在页面中的位置
                var spinRect = spinBody.getBoundingClientRect();
                if (spinRect.width <= 0) return 0;

                // 画布到CSS的缩放比例（canvas 500px → CSS显示尺寸）
                var canvasScale = spinRect.width / 500;
                // 红包袋在画布坐标系中距中心的距离
                var envDistCanvas = 244 * 0.57; // WHEEL_RADIUS * 0.57 = 139.08
                var envDistCSS = envDistCanvas * canvasScale;

                // 扇形中心角度（画布坐标系：从顶部顺时针）
                // sectorIndex 0-5 对应轮盘前6个扇区，每个扇区36°
                var sectorCenterDeg = sectorIndex * 36 + 18; // SECTOR_DEG * sectorIndex + SECTOR_DEG/2
                // 转换为标准数学角（从右侧逆时针），再加上轮盘旋转角
                var mathAngleRad = (sectorCenterDeg - 90 + currentRotationDeg) * Math.PI / 180;

                // 轮盘canvas中心在页面中的坐标
                var wheelCenterPageX = spinRect.left + spinRect.width / 2;
                var wheelCenterPageY = spinRect.top + spinRect.height / 2;

                // 红包袋在页面中的起始坐标
                var startPageX = wheelCenterPageX + envDistCSS * Math.cos(mathAngleRad);
                var startPageY = wheelCenterPageY + envDistCSS * Math.sin(mathAngleRad);

                // 确定红包袋类型（与 drawWheelCanvas 中 envelopeTypes 数组完全对应）
                var envelopeTypes = ['red', 'green', 'yellow', 'green', 'red', 'yellow', 'green', 'red', 'yellow', 'green'];
                var envType = envelopeTypes[sectorIndex] || 'red';
                var envImgSrc = getEnvelopeImage(envType);

                // 红包袋尺寸（响应式，根据轮盘大小自适应）
                var envSize = Math.max(40, Math.min(64, spinRect.width * 0.13));

                // ===== 创建 fixed 定位的动画覆盖层（绕过所有 overflow 裁剪） =====
                // 先移除旧层
                var oldOverlay = document.getElementById('winEnvFlyOverlay');
                if (oldOverlay && oldOverlay.parentNode) oldOverlay.parentNode.removeChild(oldOverlay);

                var overlay = document.createElement('div');
                overlay.id = 'winEnvFlyOverlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
                document.body.appendChild(overlay);

                // ===== 中心光爆 =====
                var burst = document.createElement('div');
                burst.className = 'win-fly-burst';
                var burstSize = envSize * 2.8;
                burst.style.cssText = 'position:absolute;left:' + (startPageX - burstSize / 2) + 'px;top:' + (startPageY - burstSize / 2) + 'px;width:' + burstSize + 'px;height:' + burstSize + 'px;border-radius:50%;opacity:0;transform:scale(0.2);pointer-events:none;background:radial-gradient(circle,rgba(255,220,80,0.55) 0%,rgba(255,180,40,0.25) 30%,rgba(255,140,20,0.08) 55%,transparent 72%);';
                overlay.appendChild(burst);

                // ===== 扩散光环 =====
                var ring = document.createElement('div');
                ring.className = 'win-fly-ring';
                var ringSize = envSize * 2.4;
                ring.style.cssText = 'position:absolute;left:' + (startPageX - ringSize / 2) + 'px;top:' + (startPageY - ringSize / 2) + 'px;width:' + ringSize + 'px;height:' + ringSize + 'px;border-radius:50%;opacity:0;transform:scale(0.1);pointer-events:none;border:2px solid rgba(255,215,0,0.7);box-shadow:0 0 16px rgba(255,200,50,0.5),0 0 40px rgba(255,160,30,0.25),inset 0 0 12px rgba(255,220,80,0.15);background:transparent;';
                overlay.appendChild(ring);

                // ===== 粒子 =====
                var particles = [];
                var pColors = ['#ffd700','#ffec8b','#fff8dc','#ffe4b5','#ffb90f','#ffa500','#ffe55c','#ffc107','#fff3b0','#ffe082'];
                for (var pi = 0; pi < 32; pi++) {
                    var p = document.createElement('div');
                    var pSize = 2.5 + Math.random() * 7;
                    var pColor = pColors[Math.floor(Math.random() * pColors.length)];
                    var glowSize = 3 + Math.random() * 8;
                    p.style.cssText = 'position:absolute;left:' + startPageX + 'px;top:' + startPageY + 'px;width:' + pSize + 'px;height:' + pSize + 'px;border-radius:50%;background:' + pColor + ';box-shadow:0 0 ' + glowSize + 'px ' + pColor + ';opacity:1;pointer-events:none;';
                    overlay.appendChild(p);

                    var pAngle = Math.random() * Math.PI * 2;
                    var pDist = 50 + Math.random() * 180;
                    particles.push({
                        el: p,
                        tx: startPageX + Math.cos(pAngle) * pDist,
                        ty: startPageY + Math.sin(pAngle) * pDist - 20 - Math.random() * 40,
                        delay: Math.random() * 0.3,
                        dur: 2.2 + Math.random() * 1.0
                    });
                }

                // ===== 5个红包袋：向顶部方向飞出，分批依次出现 =====
                var envelopes = [];
                var ENV_COUNT = 5;
                for (var ei = 0; ei < ENV_COUNT; ei++) {
                    var env = document.createElement('div');
                    // 初始状态：缩小、透明、位于中奖位置
                    env.style.cssText = 'position:absolute;left:' + (startPageX - envSize / 2) + 'px;top:' + (startPageY - envSize / 2) + 'px;width:' + envSize + 'px;height:' + envSize + 'px;opacity:0;transform:scale(0.25) rotate(0deg);pointer-events:none;';
                    // 使用完全相同的红包袋图片
                    env.innerHTML = '<img src="' + envImgSrc + '" style="width:100%;height:100%;display:block;filter:drop-shadow(0 6px 18px rgba(255,180,40,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.35));" draggable="false" alt="" />';
                    env.className = 'win-fly-envelope';
                    overlay.appendChild(env);

                    // 5个红包袋最终排列：整齐优雅的弧形布局
                    // 水平均匀分布，中心略高形成自然拱形
                    var envSpacing = envSize * 1.28 + 10;
                    var offsetX = (ei - 2) * envSpacing;
                    // 垂直方向：形成轻微上弧（中心最高，两侧略低）
                    var arcDrop = Math.abs(ei - 2) * 6;
                    var flyUp = 78 - arcDrop;
                    // 目标位置：整齐排列，向上飞行
                    var tgtX = startPageX + offsetX;
                    var tgtY = startPageY - flyUp;
                    // 徽标级精微旋转（中心0°，外侧±6°）
                    var rot = (ei - 2) * 5;
                    // 分批依次出现：每个红包袋间隔0.22s，快速出击
                    var envDelay = ei * 0.22;
                    // 飞行动画时长：统一0.85s，整齐划一
                    var envDur = 0.85;

                    envelopes.push({
                        el: env,
                        sx: startPageX, sy: startPageY,
                        tx: tgtX, ty: tgtY,
                        rotation: rot,
                        delay: envDelay,
                        duration: envDur
                    });
                }

                // ===== 使用双 rAF 确保浏览器完成初始布局后再启动过渡 =====
                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        // ---- 光爆动画：柔和展开，1.0s ----
                        burst.style.transition = 'all 1.0s cubic-bezier(0.08,0.78,0.25,0.98)';
                        burst.style.opacity = '1';
                        burst.style.transform = 'scale(1.8)';

                        // ---- 光环动画：舒展扩散，1.2s ----
                        ring.style.transition = 'all 1.2s cubic-bezier(0.08,0.78,0.25,0.98)';
                        ring.style.opacity = '1';
                        ring.style.transform = 'scale(2.5)';

                        // ---- 粒子飞散：延长时长，匹配红包袋节奏 ----
                        particles.forEach(function(pd) {
                            setTimeout(function() {
                                pd.el.style.transition = 'all ' + pd.dur + 's cubic-bezier(0.08,0.78,0.22,0.97)';
                                pd.el.style.left = pd.tx + 'px';
                                pd.el.style.top = pd.ty + 'px';
                                pd.el.style.opacity = '0';
                                pd.el.style.transform = 'scale(0.1)';
                            }, pd.delay * 1000);
                        });

                        // ---- 红包袋依次飞出：丝滑缓出曲线 —— 轻柔起步 + 绵长漂浮 ----
                        // cubic-bezier(0.12,0.90,0.25,0.99)：
                        //   前段轻柔加速，中后段极慢减速漂浮，末段接近静止
                        envelopes.forEach(function(ed) {
                            setTimeout(function() {
                                var dx = ed.tx - ed.sx;
                                var dy = ed.ty - ed.sy;
                                ed.el.style.transition = 'all ' + ed.duration + 's cubic-bezier(0.12,0.90,0.25,0.99)';
                                ed.el.style.opacity = '1';
                                ed.el.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(1.06) rotate(' + ed.rotation + 'deg)';
                            }, ed.delay * 1000);
                        });
                    });
                });

                // ---- 光环淡出（延迟至1.0s开始，缓慢消退） ----
                setTimeout(function() {
                    ring.style.transition = 'all 1.0s ease-out';
                    ring.style.opacity = '0';
                    ring.style.transform = 'scale(3.8)';
                }, 1000);

                // ---- 光爆淡出（延迟至1.2s开始，与光环交错消退） ----
                setTimeout(function() {
                    burst.style.transition = 'all 1.0s ease-out';
                    burst.style.opacity = '0';
                    burst.style.transform = 'scale(2.6)';
                }, 1200);

                // 红包袋停稳后保留，为后续开奖转换动画做准备
                // 使用 transitionend 精确检测最后一个红包袋到达位置
                if (typeof onComplete === 'function') {
                    var lastEnv = envelopes[envelopes.length - 1];
                    if (lastEnv && lastEnv.el) {
                        var _transitionHandled = false;
                        var _onLastEnvDone = function(e) {
                            if (_transitionHandled) return;
                            if (e.propertyName === 'transform') {
                                _transitionHandled = true;
                                lastEnv.el.removeEventListener('transitionend', _onLastEnvDone);
                                onComplete();
                            }
                        };
                        lastEnv.el.addEventListener('transitionend', _onLastEnvDone);
                        // 兜底：若 transitionend 未触发，延迟后强制回调
                        var _fallbackMs = (lastEnv.delay * 1000) + (lastEnv.duration * 1000) + 600;
                        setTimeout(function() {
                            if (!_transitionHandled) {
                                _transitionHandled = true;
                                lastEnv.el.removeEventListener('transitionend', _onLastEnvDone);
                                onComplete();
                            }
                        }, _fallbackMs);
                    } else {
                        setTimeout(onComplete, 50);
                    }
                }
            }

            /* ===== 中奖金额开奖累计动画（Burst → Glide → Count-Up） ===== */
            function triggerCoinDropAnimation(sectorIndex, prize) {
                var flyOverlay = document.getElementById('winEnvFlyOverlay');
                if (!flyOverlay) return 0;

                var envelopeEls = flyOverlay.querySelectorAll('.win-fly-envelope');
                if (envelopeEls.length === 0) return 0;

                var centerBtn = document.getElementById('wheelCenterBtn');
                if (!centerBtn) return 0;

                // 智能计算每个红包袋金额（5 个金额之和 = 中奖金额）
                var perCoin = Math.floor(prize / 5);
                var rem = prize - perCoin * 5;
                var amounts = [];
                for (var ai = 0; ai < 5; ai++) {
                    amounts.push(perCoin + (ai === 4 ? rem : 0));
                }

                // 计算落点：中心抽奖按钮正中心（动态适配 PC / 手机）
                var btnRect = centerBtn.getBoundingClientRect();
                var landCx = btnRect.left + btnRect.width / 2;
                var landCy = btnRect.top + btnRect.height / 2;

                // 累计总额显示（纯数字，无单位）—— 定位在按钮中心
                var totalDisplay = document.createElement('div');
                totalDisplay.className = 'coin-total-display';
                totalDisplay.style.left = landCx + 'px';
                totalDisplay.style.top = landCy + 'px';
                totalDisplay.style.transform = 'translate(-50%, -50%)';
                var tFn = window.t || function(k) { return k; };
                totalDisplay.innerHTML = '<div class="coin-total-label">' + tFn('coinTotalLabel') + '</div><div class="coin-total-value" id="coinTotalValue"></div>';
                flyOverlay.appendChild(totalDisplay);

                var currentTotal = 0;
                var _totalShown = false;
                var totalValueEl = document.getElementById('coinTotalValue');
                var STAGGER = 400;       // 每个红包开奖间隔 ~0.4s
                var BURST_DUR = 400;     // 红包爆开时长
                var NUMBER_HOLD = 420;   // 数字停留后开始飞行
                var GLIDE_DUR = 700;     // 数字飞行时长
                var totalDuration = 0;

                for (var ei = 0; ei < 5; ei++) {
                    (function(idx) {
                        var delay = idx * STAGGER;

                        setTimeout(function() {
                            var env = envelopeEls[idx];
                            if (!env) return;

                            // 1. 红包爆开
                            env.classList.add('coin-bursting');

                            setTimeout(function() {
                                env.classList.add('coin-burst-done');

                                // 2. 数字在红包消失位置出现
                                var rect = env.getBoundingClientRect();
                                var cx = rect.left + rect.width / 2;
                                var cy = rect.top + rect.height / 2;

                                var number = document.createElement('div');
                                number.className = 'coin-number-badge';
                                number.textContent = amounts[idx];
                                number.style.left = cx + 'px';
                                number.style.top = cy + 'px';
                                flyOverlay.appendChild(number);

                                // 数字弹入
                                requestAnimationFrame(function() {
                                    requestAnimationFrame(function() {
                                        number.classList.add('coin-number-show');
                                    });
                                });

                                // 3. 数字丝滑飞行到按钮上方落点
                                setTimeout(function() {
                                    number.classList.add('coin-number-glide');
                                    number.style.left = landCx + 'px';
                                    number.style.top = landCy + 'px';

                                    // 累加总额（纯数字）
                                    currentTotal += amounts[idx];
                                    var totalLabel = currentTotal >= 1000 ? currentTotal.toLocaleString() : String(currentTotal);
                                    if (totalValueEl) {
                                        totalValueEl.textContent = totalLabel;
                                        if (!_totalShown) {
                                            _totalShown = true;
                                            totalDisplay.style.transition = 'opacity 0.5s ease-out';
                                            totalDisplay.style.opacity = '1';
                                        }
                                        totalValueEl.classList.add('pulse');
                                        setTimeout(function() { totalValueEl.classList.remove('pulse'); }, 250);
                                    }
                                }, NUMBER_HOLD);

                                // 4. 清理数字元素
                                setTimeout(function() {
                                    if (number.parentNode) number.parentNode.removeChild(number);
                                }, NUMBER_HOLD + GLIDE_DUR + 350);

                            }, BURST_DUR);

                        }, delay);
                    })(ei);
                }

                totalDuration = 4 * STAGGER + BURST_DUR + NUMBER_HOLD + GLIDE_DUR;

                // 收尾：总额淡出并清理整个飞行动画层（最后一枚金币到达后+400ms开始淡出）
                setTimeout(function() {
                    totalDisplay.style.transition = 'opacity 0.5s ease-out';
                    totalDisplay.style.opacity = '0';
                    setTimeout(function() {
                        if (flyOverlay.parentNode) flyOverlay.parentNode.removeChild(flyOverlay);
                    }, 600);
                }, totalDuration + 400);

                return totalDuration;
            }

            function onSpinComplete() {
                appState = 'done';
                window.currentPrizeLabel = currentPrizeLabel;

                const tFn = window.t || ((k) => k);

                const round = prizeHistory.length + 1;
                prizeHistory.push({
                    round: round,
                    prize: currentPrize,
                    label: currentPrizeLabel
                });

                if (currentPrize > highestPrize) {
                    highestPrize = currentPrize;
                    highestPrizeLabel = currentPrizeLabel;
                    prizeHistoryMaxIndex = prizeHistory.length - 1;
                } else {
                    for (let i = 0; i < prizeHistory.length; i++) {
                        if (prizeHistory[i].prize === highestPrize) {
                            prizeHistoryMaxIndex = i;
                            break;
                        }
                    }
                }

                prizeResultText.textContent = tFn('prizeResultPrefix') + currentPrizeLabel + tFn('prizeResultSuffix');
                // 中奖提示文字已隐藏，保持界面简洁
                // prizeResult.classList.add('show');

                const titleEl = document.getElementById('step1Title'),
                    subEl = document.getElementById('step1Subtitle'),
                    claimBtn = document.getElementById('step1ClaimBtn');

                remainingChances--;

                const displayHistory = buildDisplayHistory(prizeHistory);
                const highlightIndex = prizeHistory.length - 1;

                buildPrizeSlider(displayHistory, highlightIndex);
                window._prizeHistoryData = {
                    history: displayHistory,
                    highlightIndex: highlightIndex
                };

                if (remainingChances === 0) {
                    isGameCompleted = true;
                    titleEl.textContent = tFn('gameOverTitle');
                    subEl.textContent = tFn('gameOverSub');
                    claimBtn.textContent = tFn('gameOverClaim');
                } else {
                    if (currentPrize > 0) {
                        titleEl.textContent = tFn('congratsTitle');
                        subEl.textContent = tFn('bonusDeposited');
                    } else {
                        titleEl.textContent = tFn('thanksParticipating');
                        subEl.textContent = tFn('goodLuckNext');
                    }
                    claimBtn.textContent = tFn('step1_claim');
                }

                updateChanceInfoDisplay();
                window._spinJustCompleted = true;

                // ===== 触发中奖红包飞出动画 =====
                // 弹窗显示逻辑：等待 VFX 特效完整结束后再展示
                function showModalAfterVfx() {
                    showStep(1);
                    titleEl.style.opacity = '0';
                    modalPrizeAmount.style.opacity = '0';
                    subEl.style.opacity = '0';
                    claimBtn.style.opacity = '0';
                    modalOverlay.classList.add('active');
                    modalPrizeAmount.classList.add('show');
                    requestAnimationFrame(function() { titleEl.style.opacity = '1'; });
                    requestAnimationFrame(function() { modalPrizeAmount.style.opacity = '1'; });
                    requestAnimationFrame(function() { subEl.style.opacity = '1'; });
                    requestAnimationFrame(function() { claimBtn.style.opacity = '1'; });
                    if (window.gift3d && window.gift3d.open) window.gift3d.open();
                }

                // ============================================================
                // 第一阶段：黄金光效 + 红包飞出（并行，不等待）
                // ============================================================
                var vfxContainer = document.getElementById('winVfxContainer');
                if (vfxContainer) {
                    vfxContainer.classList.remove('active');
                    void vfxContainer.offsetWidth;
                    vfxContainer.classList.add('active');
                }

                triggerWinEnvelopeFly(currentSectorIndex, function() {
                    // ---- 5个红包全部飞出完成 → 第一阶段黄金光效消失 ----
                    if (vfxContainer && vfxContainer.classList.contains('active')) {
                        vfxContainer.classList.remove('active');
                    }

                    // 光效淡出(0.15s过渡) + 缓冲后，进入金额累计阶段
                    setTimeout(function() {
                        // ---- 第二阶段：金额依次释放并完成累计 ----
                        var coinDuration = triggerCoinDropAnimation(currentSectorIndex, currentPrize);

                        // 金额累计完成 → 中奖叶片单独触发高亮光效
                        setTimeout(function() {
                            if (vfxContainer) {
                                vfxContainer.classList.remove('active');
                                void vfxContainer.offsetWidth;
                                vfxContainer.classList.add('active');
                            }

                            // 光效动画完成(约1.5s) → 优雅退场 → 弹窗展示
                            setTimeout(function() {
                                if (vfxContainer && vfxContainer.classList.contains('active')) {
                                    vfxContainer.classList.remove('active');
                                    setTimeout(function() {
                                        showModalAfterVfx();
                                    }, 220);
                                } else {
                                    showModalAfterVfx();
                                }
                            }, 1600);
                        }, coinDuration + 80);
                    }, 250);
                });
            }

            const step1 = document.getElementById('step1'),
                step2 = document.getElementById('step2'),
                step3 = document.getElementById('step3');

            // ===== 交互式翻页状态 (Interactive Page Flip) =====
            let _currentAuthStep = null;      // null | 2 | 3
            let _flipDragging = false;        // 手指正在拖拽中
            let _flipAnimId = null;           // rAF ID for snap animation
            let _flipStartX = 0;             // 拖拽起始 X
            let _flipStartY = 0;             // 拖拽起始 Y
            let _flipCurrentAngle = 0;        // 当前 rotateY 角度
            let _flipLocked = false;          // 锁定：点击翻页进行中或松手回弹中
            let _flipOriginStep = null;       // 拖拽开始时所在的步骤 (2|3)
            let _flipContentSwapped = false;  // 内容是否已切换到目标步骤
            let _flipCardWidth = 0;           // 缓存的卡片宽度
            const FLIP_MAX_ANGLE = 50;        // 最大旋转角度 (deg)
            const FLIP_THRESHOLD = 0.30;      // 触发切换的进度阈值 (30%)
            const FLIP_MID_SWAP = 0.22;       // 内容切换中点 (22%)

            function showStep(stepNumber) {
                // 点击切换链接时的翻页（非拖拽触发）
                const isAuthTransition = (_currentAuthStep === 2 && stepNumber === 3) || (_currentAuthStep === 3 && stepNumber === 2);

                if (isAuthTransition && !_flipLocked && !_flipDragging) {
                    triggerClickFlip(stepNumber);
                    return;
                }

                // 标准切换（非翻页、或翻页中）
                _performStandardStepSwitch(stepNumber);
            }

            function _performStandardStepSwitch(stepNumber) {
                [step1, step2, step3].forEach(el => { el.classList.add('hidden');
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(10px)'; });
                let target = null;
                if (stepNumber === 1) target = step1;
                else if (stepNumber === 2) target = step2;
                else if (stepNumber === 3) target = step3;
                if (target) { target.classList.remove('hidden');
                    requestAnimationFrame(() => { target.style.opacity = '1';
                        target.style.transform = 'translateY(0)'; }); }

                _currentAuthStep = (stepNumber === 2 || stepNumber === 3) ? stepNumber : null;

                const backBtn = document.getElementById('modalBackBtn');
                const closeBtn = document.getElementById('modalCloseBtn');
                if (stepNumber === 1) {
                    if (remainingChances > 0 || window._spinJustCompleted) {
                        if (backBtn) backBtn.style.display = 'flex';
                        if (closeBtn) closeBtn.style.display = 'none';
                    } else {
                        if (backBtn) backBtn.style.display = 'none';
                        if (closeBtn) closeBtn.style.display = 'flex';
                    }
                    window._spinJustCompleted = false;
                } else {
                    if (backBtn) backBtn.style.display = 'none';
                    if (closeBtn) closeBtn.style.display = 'flex';
                }
                if (stepNumber === 2) {
                    resetPwdValidation();
                    if (window.generateCaptcha) { window.generateCaptcha(); }
                    clearFieldErrors();
                }
                if (stepNumber === 3) {
                    if (typeof window.initBonusTimer === 'function') { window.initBonusTimer(); }
                    setTimeout(() => {
                        if (window.triggerLoginLogoAnimation) { window.triggerLoginLogoAnimation(); }
                        if (window.initTitleAnimation) { window.initTitleAnimation(); }
                    }, 100);
                } else {
                    if (window.destroyTitleAnimation) { window.destroyTitleAnimation(); }
                }
            }

            // ===== 初始化新步骤内容 =====
            function _initStepContent(stepNumber) {
                const backBtn = document.getElementById('modalBackBtn');
                const closeBtn = document.getElementById('modalCloseBtn');
                if (backBtn) backBtn.style.display = 'none';
                if (closeBtn) closeBtn.style.display = 'flex';
                if (stepNumber === 2) {
                    resetPwdValidation();
                    if (window.generateCaptcha) { window.generateCaptcha(); }
                    clearFieldErrors();
                    if (window.destroyTitleAnimation) { window.destroyTitleAnimation(); }
                }
                if (stepNumber === 3) {
                    if (typeof window.initBonusTimer === 'function') { window.initBonusTimer(); }
                    setTimeout(() => {
                        if (window.triggerLoginLogoAnimation) { window.triggerLoginLogoAnimation(); }
                        if (window.initTitleAnimation) { window.initTitleAnimation(); }
                    }, 80);
                }
            }

            // ===== 根据角度计算变换和阴影 =====
            function _applyFlipTransform(angle) {
                const modalCard = document.getElementById('modalCard');
                if (!modalCard) return;

                const absAngle = Math.abs(angle);
                const progress = Math.min(absAngle / FLIP_MAX_ANGLE, 1);
                const scale = 1 - progress * 0.06;
                const origin = angle < 0 ? 'left center' : 'right center';

                // 阴影：随角度增强，翻页侧阴影加深
                const shadowIntensity = progress;
                const baseShadow = '0 24px 80px rgba(0,0,0,0.6)';
                const insetGlow = `inset 0 1px 0 rgba(255,255,255,${(0.06 * (1 - progress * 0.7)).toFixed(3)})`;
                const flipDark = `rgba(0,0,0,${(0.15 + shadowIntensity * 0.55).toFixed(2)})`;
                const sideShadowX = angle < 0 ? `${(12 + progress * 28).toFixed(0)}px` : `${-(12 + progress * 28).toFixed(0)}px`;
                const sideShadow = `${sideShadowX} ${(18 + progress * 22).toFixed(0)}px ${(40 + progress * 50).toFixed(0)}px ${flipDark}`;
                const innerShadow = angle < 0
                    ? `${(2 + progress * 4).toFixed(0)}px 0 ${(10 + progress * 16).toFixed(0)}px rgba(0,0,0,${(0.1 + shadowIntensity * 0.3).toFixed(2)})`
                    : `${-(2 + progress * 4).toFixed(0)}px 0 ${(10 + progress * 16).toFixed(0)}px rgba(0,0,0,${(0.1 + shadowIntensity * 0.3).toFixed(2)})`;

                modalCard.style.transformOrigin = origin;
                modalCard.style.transform = `scale(${scale.toFixed(3)}) rotateY(${angle.toFixed(2)}deg)`;
                modalCard.style.boxShadow = [baseShadow, sideShadow, innerShadow, insetGlow].join(', ');
            }

            // ===== 内容切换（根据当前角度决定显示哪个步骤） =====
            function _swapFlipContent(angle, originStep) {
                const absAngle = Math.abs(angle);
                const progress = absAngle / FLIP_MAX_ANGLE;
                const shouldSwap = progress > FLIP_MID_SWAP;

                if (shouldSwap === _flipContentSwapped) return; // 无需切换

                const targetStep = originStep === 2 ? 3 : 2;
                const oldEl = originStep === 2 ? step2 : step3;
                const newEl = targetStep === 2 ? step2 : step3;

                if (shouldSwap) {
                    // 切换到目标步骤
                    [step1, step2, step3].forEach(el => { el.classList.add('hidden'); });
                    if (oldEl) { oldEl.classList.add('step-flip-fading'); oldEl.classList.remove('step-flip-showing'); }
                    if (newEl) {
                        newEl.classList.remove('hidden', 'step-flip-fading');
                        newEl.classList.add('step-flip-showing');
                    }
                    _flipContentSwapped = true;
                } else {
                    // 恢复原始步骤
                    [step1, step2, step3].forEach(el => { el.classList.add('hidden'); });
                    if (newEl) { newEl.classList.add('step-flip-fading'); newEl.classList.remove('step-flip-showing'); }
                    if (oldEl) {
                        oldEl.classList.remove('hidden', 'step-flip-fading');
                        oldEl.classList.add('step-flip-showing');
                    }
                    _flipContentSwapped = false;
                }
            }

            // ===== 开始拖拽翻页 =====
            function _startFlipDrag(clientX, clientY) {
                if (_flipLocked || _flipDragging) return;
                if (_currentAuthStep !== 2 && _currentAuthStep !== 3) return;

                const modalCard = document.getElementById('modalCard');
                if (!modalCard) return;

                _flipDragging = true;
                _flipStartX = clientX;
                _flipStartY = clientY;
                _flipCurrentAngle = 0;
                _flipOriginStep = _currentAuthStep;
                _flipContentSwapped = false;
                _flipCardWidth = modalCard.getBoundingClientRect().width || 300;

                modalCard.classList.add('flip-dragging');
                modalCard.style.overflowY = 'hidden';
                _applyFlipTransform(0);
            }

            // ===== 拖拽移动：实时跟手 =====
            function _updateFlipDrag(clientX) {
                if (!_flipDragging) return;

                const deltaX = clientX - _flipStartX;
                // 将像素位移映射到角度：卡片宽度的 60% 对应最大角度
                const sensitivity = _flipCardWidth * 0.60;
                let angle = (deltaX / sensitivity) * FLIP_MAX_ANGLE;
                angle = Math.max(-FLIP_MAX_ANGLE, Math.min(FLIP_MAX_ANGLE, angle));

                _flipCurrentAngle = angle;
                _applyFlipTransform(angle);
                _swapFlipContent(angle, _flipOriginStep);

                // 轻微触觉反馈：在切换点附近提供视觉提示
                const progress = Math.abs(angle) / FLIP_MAX_ANGLE;
                const modalCard = document.getElementById('modalCard');
                if (modalCard) {
                    if (progress > FLIP_MID_SWAP - 0.05 && progress < FLIP_MID_SWAP + 0.05) {
                        modalCard.style.filter = 'brightness(1.04)';
                    } else {
                        modalCard.style.filter = '';
                    }
                }
            }

            // ===== 松手：判断完成或回弹 =====
            function _endFlipDrag() {
                if (!_flipDragging) return;

                const modalCard = document.getElementById('modalCard');
                _flipDragging = false;
                modalCard.style.filter = '';

                const progress = Math.abs(_flipCurrentAngle) / FLIP_MAX_ANGLE;

                if (progress >= FLIP_THRESHOLD) {
                    // 完成翻页
                    const sign = _flipCurrentAngle > 0 ? 1 : -1;
                    const targetStep = _flipOriginStep === 2 ? 3 : 2;
                    _flipLocked = true;
                    modalCard.classList.remove('flip-dragging');
                    modalCard.classList.add('flip-quick');

                    // 第一步：快速翻到最大角度
                    const peakAngle = sign * FLIP_MAX_ANGLE;
                    _applyFlipTransform(peakAngle);
                    // 确保内容切换到目标
                    _swapFlipContent(peakAngle, _flipOriginStep);

                    // 第二步：短暂延迟后弹簧回弹到 0°
                    setTimeout(() => {
                        modalCard.classList.remove('flip-quick');
                        modalCard.classList.add('flip-springback');
                        _applyFlipTransform(0);

                        // 完成切换
                        _currentAuthStep = targetStep;
                        _initStepContent(targetStep);
                    }, 200);

                    // 第三步：清理
                    setTimeout(() => {
                        modalCard.classList.remove('flip-springback');
                        modalCard.style.overflowY = '';
                        modalCard.style.transformOrigin = '';
                        modalCard.style.transform = '';
                        modalCard.style.boxShadow = '';
                        modalCard.style.filter = '';
                        [step1, step2, step3].forEach(el => {
                            el.classList.remove('step-flip-fading', 'step-flip-showing');
                        });
                        // 确保当前步骤可见
                        const curEl = targetStep === 2 ? step2 : step3;
                        if (curEl) {
                            curEl.classList.remove('hidden');
                            curEl.style.opacity = '1';
                            curEl.style.transform = 'translateY(0)';
                        }
                        _flipLocked = false;
                        _flipContentSwapped = false;
                    }, 750);

                } else {
                    // 回弹：平滑弹回 0°
                    _flipLocked = true;
                    modalCard.classList.remove('flip-dragging');
                    modalCard.classList.add('flip-snapping');
                    _applyFlipTransform(0);
                    // 恢复原始内容
                    if (_flipContentSwapped) {
                        _swapFlipContent(0, _flipOriginStep);
                    }

                    setTimeout(() => {
                        modalCard.classList.remove('flip-snapping');
                        modalCard.style.overflowY = '';
                        modalCard.style.transformOrigin = '';
                        modalCard.style.transform = '';
                        modalCard.style.boxShadow = '';
                        modalCard.style.filter = '';
                        [step1, step2, step3].forEach(el => {
                            el.classList.remove('step-flip-fading', 'step-flip-showing');
                        });
                        // 确保原始步骤可见
                        const origEl = _flipOriginStep === 2 ? step2 : step3;
                        if (origEl) {
                            origEl.classList.remove('hidden');
                            origEl.style.opacity = '1';
                            origEl.style.transform = 'translateY(0)';
                        }
                        _flipLocked = false;
                        _flipContentSwapped = false;
                    }, 450);
                }
            }

            // ===== 点击触发的翻页动画（无跟手，快速自动翻页） =====
            function triggerClickFlip(targetStep) {
                if (_flipLocked || _flipDragging) return;
                _flipLocked = true;

                const modalCard = document.getElementById('modalCard');
                if (!modalCard) { _performStandardStepSwitch(targetStep); _flipLocked = false; return; }

                const goingToLogin = targetStep === 3;
                const sign = goingToLogin ? 1 : -1; // login: flip right(+), register: flip left(-)
                const peakAngle = sign * FLIP_MAX_ANGLE;

                modalCard.style.overflowY = 'hidden';
                modalCard.classList.add('flip-quick');

                // 第一步：翻到峰值角度
                _applyFlipTransform(peakAngle);
                // 立即切换内容
                const oldEl = _currentAuthStep === 2 ? step2 : step3;
                const newEl = targetStep === 2 ? step2 : step3;
                [step1, step2, step3].forEach(el => { el.classList.add('hidden'); });
                if (oldEl) { oldEl.classList.add('step-flip-fading'); }
                if (newEl) { newEl.classList.remove('hidden', 'step-flip-fading'); newEl.classList.add('step-flip-showing'); }

                // 第二步：回弹
                setTimeout(() => {
                    modalCard.classList.remove('flip-quick');
                    modalCard.classList.add('flip-springback');
                    _applyFlipTransform(0);
                    _currentAuthStep = targetStep;
                    _initStepContent(targetStep);
                }, 200);

                // 第三步：清理
                setTimeout(() => {
                    modalCard.classList.remove('flip-springback');
                    modalCard.style.overflowY = '';
                    modalCard.style.transformOrigin = '';
                    modalCard.style.transform = '';
                    modalCard.style.boxShadow = '';
                    [step1, step2, step3].forEach(el => {
                        el.classList.remove('step-flip-fading', 'step-flip-showing');
                    });
                    if (newEl) {
                        newEl.style.opacity = '1';
                        newEl.style.transform = 'translateY(0)';
                    }
                    _flipLocked = false;
                }, 750);
            }

            // ===== 底部文字按钮专用：自动完整翻页（不进入手动控制状态） =====
            function triggerAutoSwitch(targetStep) {
                if (_flipLocked || _flipDragging) return;
                _flipLocked = true;

                const modalCard = document.getElementById('modalCard');
                if (!modalCard) { _performStandardStepSwitch(targetStep); _flipLocked = false; return; }

                const goingToLogin = targetStep === 3;
                const sign = goingToLogin ? 1 : -1;
                const peakAngle = sign * FLIP_MAX_ANGLE;

                // 准备旧/新步骤
                const oldStepEl = _currentAuthStep === 2 ? step2 : step3;
                const newStepEl = targetStep === 2 ? step2 : step3;

                modalCard.style.overflowY = 'hidden';

                // 第一阶段：翻开（0° → 峰值角度）
                modalCard.classList.add('auto-flip-turn');
                _applyFlipTransform(peakAngle);

                // 内容在翻开中途（~150ms）切换
                setTimeout(() => {
                    [step1, step2, step3].forEach(el => { el.classList.add('hidden'); });
                    if (oldStepEl) { oldStepEl.classList.add('auto-flip-fadeout'); oldStepEl.classList.remove('auto-flip-fadein'); }
                    if (newStepEl) {
                        newStepEl.classList.remove('hidden', 'auto-flip-fadeout');
                        newStepEl.classList.add('auto-flip-fadein');
                    }
                }, 140);

                // 第二阶段：回弹（峰值 → 0°）
                setTimeout(() => {
                    modalCard.classList.remove('auto-flip-turn');
                    modalCard.classList.add('auto-flip-return');
                    _applyFlipTransform(0);
                    _currentAuthStep = targetStep;
                    _initStepContent(targetStep);
                }, 320);

                // 第三阶段：清理
                setTimeout(() => {
                    modalCard.classList.remove('auto-flip-return');
                    modalCard.style.overflowY = '';
                    modalCard.style.transformOrigin = '';
                    modalCard.style.transform = '';
                    modalCard.style.boxShadow = '';
                    [step1, step2, step3].forEach(el => {
                        el.classList.remove('auto-flip-fadeout', 'auto-flip-fadein');
                    });
                    if (newStepEl) {
                        newStepEl.classList.remove('hidden');
                        newStepEl.style.opacity = '1';
                        newStepEl.style.transform = 'translateY(0)';
                    }
                    _flipLocked = false;
                }, 920);
            }

            // ===== 交互式滑动手势 (Interactive Swipe Gesture) =====
            function initAuthSwipeGesture() {
                const modalCard = document.getElementById('modalCard');
                if (!modalCard) return;

                let _touchActive = false;
                let _touchMoved = false;
                let _lastTouchX = 0;
                let _lastTouchY = 0;
                const DRAG_THRESHOLD = 8; // 最小拖拽距离才触发翻页（过滤点击）

                // ===== 垂直滑动切换状态 =====
                let _swipeDragging = false;       // 垂直滑动进行中
                let _swipeLocked = false;         // 垂直滑动锁定（动画中）
                let _swipeStartY = 0;             // 滑动起始Y
                let _swipeCurrentOffset = 0;      // 当前偏移量
                let _swipeOriginStep = null;      // 滑动起始步骤(2|3)
                let _swipeDirInit = false;        // 滑动方向是否已确定
                const SWIPE_THRESHOLD = 60;       // 触发切换的最小偏移(px)
                const SWIPE_MAX_OFFSET = 200;     // 最大跟手偏移(px)
                // 灵敏度系数：手指移动1px，页面移动多少px（<1时页面移动更少，手感更重/有质感）
                const SWIPE_SENSITIVITY = 0.78;

                // ===== 垂直滑动：开始 =====
                function _startVerticalSwipe(clientY) {
                    if (_swipeLocked || _swipeDragging || _flipLocked || _flipDragging) return;
                    if (_currentAuthStep !== 2 && _currentAuthStep !== 3) return;

                    _swipeDragging = true;
                    _swipeStartY = clientY;
                    _swipeCurrentOffset = 0;
                    _swipeOriginStep = _currentAuthStep;
                    _swipeDirInit = false;   // 方向尚未确定

                    const curEl = _swipeOriginStep === 2 ? step2 : step3;
                    const otherEl = _swipeOriginStep === 2 ? step3 : step2;

                    // 准备两个步骤：都可见，当前步骤在上，另一个不可见等待方向确定
                    [step1].forEach(function(el) { el.classList.add('hidden'); });
                    curEl.classList.remove('hidden');
                    curEl.classList.add('swipe-sliding');
                    curEl.style.opacity = '1';
                    curEl.style.transform = 'translateY(0)';

                    otherEl.classList.remove('hidden');
                    otherEl.classList.add('swipe-sliding');
                    otherEl.style.opacity = '0';
                    otherEl.style.transform = 'translateY(0)';

                    modalCard.classList.add('swipe-active');
                }

                // ===== 垂直滑动：跟手移动 =====
                function _updateVerticalSwipe(clientY) {
                    if (!_swipeDragging) return;

                    var rawDelta = clientY - _swipeStartY;
                    var offset = rawDelta * SWIPE_SENSITIVITY;
                    // 限制最大偏移
                    offset = Math.max(-SWIPE_MAX_OFFSET, Math.min(SWIPE_MAX_OFFSET, offset));
                    _swipeCurrentOffset = offset;

                    var curEl = _swipeOriginStep === 2 ? step2 : step3;
                    var otherEl = _swipeOriginStep === 2 ? step3 : step2;

                    // 首次有意义的移动时，根据方向初始化另一个步骤的位置
                    if (!_swipeDirInit && Math.abs(offset) > 2) {
                        _swipeDirInit = true;
                        if (offset < 0) {
                            // 向上滑动：另一个步骤从下方进入
                            otherEl.style.transform = 'translateY(100%)';
                        } else {
                            // 向下滑动：另一个步骤从上方进入
                            otherEl.style.transform = 'translateY(-100%)';
                        }
                    }

                    // 当前步骤：随手指移动
                    curEl.style.transform = 'translateY(' + offset + 'px)';
                    curEl.style.opacity = Math.max(0, 1 - Math.abs(offset) / (SWIPE_MAX_OFFSET * 1.5)).toFixed(3);

                    // 另一个步骤：从相反方向跟随进入
                    if (offset < 0) {
                        // 向上滑动：另一个步骤从下方进入
                        var otherY = 100 + (offset / SWIPE_MAX_OFFSET) * 100;
                        otherEl.style.transform = 'translateY(' + Math.max(0, otherY) + '%)';
                    } else {
                        // 向下滑动：另一个步骤从上方进入
                        var otherY2 = -100 + (offset / SWIPE_MAX_OFFSET) * 100;
                        otherEl.style.transform = 'translateY(' + Math.min(0, otherY2) + '%)';
                    }
                    otherEl.style.opacity = (Math.min(1, Math.abs(offset) / (SWIPE_THRESHOLD * 0.8))).toFixed(3);
                }

                // ===== 垂直滑动：松手 =====
                function _endVerticalSwipe() {
                    if (!_swipeDragging) return;
                    _swipeDragging = false;

                    var absOffset = Math.abs(_swipeCurrentOffset);
                    var curEl = _swipeOriginStep === 2 ? step2 : step3;
                    var otherEl = _swipeOriginStep === 2 ? step3 : step2;
                    var targetStep = _swipeOriginStep === 2 ? 3 : 2;

                    _swipeLocked = true;

                    if (absOffset >= SWIPE_THRESHOLD) {
                        // === 触发切换 ===
                        var goingUp = _swipeCurrentOffset < 0;
                        // 当前步骤滑出
                        curEl.classList.remove('swipe-sliding');
                        curEl.classList.add('swipe-snapping');
                        if (goingUp) {
                            curEl.classList.add('swipe-slide-out-up');
                        } else {
                            curEl.classList.add('swipe-slide-out-down');
                        }
                        curEl.style.transform = '';
                        curEl.style.opacity = '';

                        // 目标步骤滑入
                        otherEl.classList.remove('swipe-sliding');
                        otherEl.classList.add('swipe-snapping');
                        if (goingUp) {
                            otherEl.classList.add('swipe-slide-in-from-bottom');
                        } else {
                            otherEl.classList.add('swipe-slide-in-from-top');
                        }
                        otherEl.style.transform = '';
                        otherEl.style.opacity = '';

                        _currentAuthStep = targetStep;
                        _initStepContent(targetStep);

                        // 清理
                        setTimeout(function() {
                            _cleanupVerticalSwipe(curEl, otherEl);
                            // 确保目标步骤正确显示，旧步骤隐藏
                            curEl.classList.add('hidden');
                            curEl.style.opacity = '0';
                            otherEl.classList.remove('hidden');
                            otherEl.style.opacity = '1';
                            otherEl.style.transform = 'translateY(0)';
                            modalCard.classList.remove('swipe-active');
                            _swipeLocked = false;
                        }, 420);

                    } else {
                        // === 回弹 ===
                        curEl.classList.remove('swipe-sliding');
                        curEl.classList.add('swipe-snapping');
                        curEl.style.transform = 'translateY(0)';
                        curEl.style.opacity = '1';

                        otherEl.classList.remove('swipe-sliding');
                        otherEl.classList.add('swipe-snapping');
                        // 让另一个步骤滑回原来的位置
                        if (_swipeCurrentOffset < 0) {
                            otherEl.style.transform = 'translateY(100%)';
                        } else {
                            otherEl.style.transform = 'translateY(-100%)';
                        }
                        otherEl.style.opacity = '0';

                        setTimeout(function() {
                            _cleanupVerticalSwipe(curEl, otherEl);
                            // 回弹完成：恢复原步骤可见，隐藏另一个
                            curEl.classList.remove('hidden');
                            curEl.style.opacity = '1';
                            curEl.style.transform = 'translateY(0)';
                            otherEl.classList.add('hidden');
                            otherEl.style.opacity = '0';
                            otherEl.style.transform = 'translateY(10px)';
                            modalCard.classList.remove('swipe-active');
                            _swipeLocked = false;
                        }, 400);
                    }
                }

                function _cleanupVerticalSwipe(curEl, otherEl) {
                    [curEl, otherEl].forEach(function(el) {
                        if (!el) return;
                        el.classList.remove('swipe-sliding', 'swipe-snapping',
                            'swipe-slide-out-up', 'swipe-slide-out-down',
                            'swipe-slide-in-from-bottom', 'swipe-slide-in-from-top');
                        el.style.transform = '';
                        el.style.opacity = '';
                    });
                }

                // === Touch Events ===
                modalCard.addEventListener('touchstart', function(e) {
                    if (_flipLocked || _swipeLocked) return;
                    if (_currentAuthStep !== 2 && _currentAuthStep !== 3) return;
                    const target = e.target;
                    if (target.closest('input, textarea, button, select, .captcha-refresh-btn, .pwd-toggle-btn, .protocol-link, .forgot-pwd-link')) return;

                    const touch = e.touches[0];
                    _lastTouchX = touch.clientX;
                    _lastTouchY = touch.clientY;
                    _touchActive = true;
                    _touchMoved = false;
                }, { passive: true });

                modalCard.addEventListener('touchmove', function(e) {
                    if (!_touchActive || _flipLocked || _swipeLocked) return;
                    const touch = e.touches[0];
                    const deltaX = Math.abs(touch.clientX - _lastTouchX);
                    const deltaY = Math.abs(touch.clientY - _lastTouchY);

                    if (!_touchMoved && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
                        // 判断滑动方向：水平滑动触发翻页，垂直滑动触发上下切换
                        if (deltaX > deltaY * 1.2 && deltaX > DRAG_THRESHOLD) {
                            // 水平滑动 → 开始翻页
                            _touchMoved = true;
                            _startFlipDrag(_lastTouchX, _lastTouchY);
                            e.preventDefault();
                        } else if (deltaY > deltaX * 1.2 && deltaY > DRAG_THRESHOLD) {
                            // 垂直滑动 → 上下滑动切换登录/注册
                            _touchMoved = true;
                            _startVerticalSwipe(_lastTouchY);
                            e.preventDefault();
                        }
                    }

                    if (_flipDragging) {
                        _updateFlipDrag(touch.clientX);
                        e.preventDefault();
                    }
                    if (_swipeDragging) {
                        _updateVerticalSwipe(touch.clientY);
                        e.preventDefault();
                    }
                }, { passive: false });

                modalCard.addEventListener('touchend', function(e) {
                    if (_flipDragging) {
                        _endFlipDrag();
                    }
                    if (_swipeDragging) {
                        _endVerticalSwipe();
                    }
                    _touchActive = false;
                    _touchMoved = false;
                }, { passive: true });

                modalCard.addEventListener('touchcancel', function(e) {
                    if (_flipDragging) {
                        _endFlipDrag();
                    }
                    if (_swipeDragging) {
                        _endVerticalSwipe();
                    }
                    _touchActive = false;
                    _touchMoved = false;
                }, { passive: true });

                // === Mouse Events (桌面端调试) ===
                modalCard.addEventListener('mousedown', function(e) {
                    if (_flipLocked || _swipeLocked) return;
                    if (_currentAuthStep !== 2 && _currentAuthStep !== 3) return;
                    const target = e.target;
                    if (target.closest('input, textarea, button, select, .captcha-refresh-btn, .pwd-toggle-btn, .protocol-link, .forgot-pwd-link')) return;
                    _lastTouchX = e.clientX;
                    _lastTouchY = e.clientY;
                    _touchActive = true;
                    _touchMoved = false;
                });

                window.addEventListener('mousemove', function(e) {
                    if (!_touchActive || _flipLocked || _swipeLocked) return;
                    const deltaX = Math.abs(e.clientX - _lastTouchX);
                    const deltaY = Math.abs(e.clientY - _lastTouchY);

                    if (!_touchMoved && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
                        if (deltaX > deltaY * 1.2 && deltaX > DRAG_THRESHOLD) {
                            _touchMoved = true;
                            _startFlipDrag(_lastTouchX, _lastTouchY);
                        } else if (deltaY > deltaX * 1.2 && deltaY > DRAG_THRESHOLD) {
                            _touchMoved = true;
                            _startVerticalSwipe(_lastTouchY);
                        }
                    }

                    if (_flipDragging) {
                        _updateFlipDrag(e.clientX);
                    }
                    if (_swipeDragging) {
                        _updateVerticalSwipe(e.clientY);
                    }
                });

                window.addEventListener('mouseup', function(e) {
                    if (_flipDragging) {
                        _endFlipDrag();
                    }
                    if (_swipeDragging) {
                        _endVerticalSwipe();
                    }
                    _touchActive = false;
                    _touchMoved = false;
                });
            }

            window.showStep = showStep;

            function clearFieldErrors() {
                const groups = ['usernameGroup', 'phoneGroup', 'captchaGroup'];
                groups.forEach(id => {
                    const g = document.getElementById(id);
                    if (!g) return;
                    const input = g.querySelector('.input-field');
                    const tip = g.querySelector('.field-error-tip');
                    if (input) input.classList.remove('error');
                    if (tip) {
                        tip.textContent = '';
                        tip.classList.remove('visible');
                    }
                });
                const pwdTip = document.getElementById('pwdErrorTip');
                const confirmTip = document.getElementById('confirmPwdErrorTip');
                const pwdInput = document.getElementById('regPwd');
                const confirmInput = document.getElementById('regConfirmPwd');
                if (pwdInput) pwdInput.classList.remove('error');
                if (confirmInput) confirmInput.classList.remove('error');
                if (pwdTip) { pwdTip.textContent = '';
                    pwdTip.classList.remove('visible'); }
                if (confirmTip) { confirmTip.textContent = '';
                    confirmTip.classList.remove('visible'); }
            }

            function showFieldError(groupId, errorKey) {
                const tFn = window.t || ((k) => k);
                const g = document.getElementById(groupId);
                if (!g) return;
                const input = g.querySelector('.input-field');
                const tip = g.querySelector('.field-error-tip');
                if (input) input.classList.add('error');
                if (tip) {
                    tip.dataset.errorKey = errorKey;
                    tip.textContent = tFn(errorKey);
                    tip.classList.add('visible');
                }
            }

            function clearFieldError(groupId) {
                const g = document.getElementById(groupId);
                if (!g) return;
                const input = g.querySelector('.input-field');
                const tip = g.querySelector('.field-error-tip');
                if (input) input.classList.remove('error');
                if (tip) {
                    tip.dataset.errorKey = '';
                    tip.textContent = '';
                    tip.classList.remove('visible');
                }
            }

            function validatePhoneNumber(phone) {
                if (!phone) return { valid: false, error: 'phone_error_format' };
                const trimmed = phone.trim();
                if (trimmed === '') return { valid: false, error: 'phone_error_format' };
                const cleaned = trimmed.replace(/\s/g, '');
                if (!/^\d+$/.test(cleaned)) return { valid: false, error: 'phone_error_format' };
                if (cleaned.length === 11 && cleaned.startsWith('09')) {
                    return { valid: true, normalized: cleaned };
                } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
                    return { valid: true, normalized: '0' + cleaned };
                }
                return { valid: false, error: 'phone_error_format' };
            }

            function validateUsername(username) {
                if (!username) return { valid: false, error: 'username_error_empty' };
                const trimmed = username.trim();
                if (trimmed === '') return { valid: false, error: 'username_error_empty' };
                if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
                    return { valid: false, error: 'username_error_invalid' };
                }
                return { valid: true, normalized: trimmed };
            }

            function getRegisteredUsers() {
                try {
                    const raw = localStorage.getItem('myanmar79_users');
                    if (raw) return JSON.parse(raw);
                } catch (e) {}
                try {
                    const old = localStorage.getItem('myanmar79_registered');
                    if (old) {
                        const data = JSON.parse(old);
                        if (data.phones && data.usernames) {
                            const users = [];
                            data.phones.forEach((p, i) => {
                                const u = data.usernames[i] || '';
                                users.push({ phone: p, username: u });
                            });
                            return users;
                        }
                    }
                } catch (e) {}
                return [];
            }

            function saveRegisteredUser(phone, username, password) {
                try {
                    let users = getRegisteredUsers();
                    users = users.filter(u => u.phone !== phone && u.username !== username);
                    users.push({ phone, username, password });
                    localStorage.setItem('myanmar79_users', JSON.stringify(users));
                    const phones = users.map(u => u.phone);
                    const usernames = users.map(u => u.username);
                    localStorage.setItem('myanmar79_registered', JSON.stringify({ phones, usernames }));
                } catch (e) {}
            }

            function isPhoneRegistered(phone) {
                const users = getRegisteredUsers();
                return users.some(u => u.phone === phone);
            }

            function isUsernameRegistered(username) {
                const users = getRegisteredUsers();
                return users.some(u => u.username === username);
            }

            function findUserByPhoneOrUsername(input) {
                const users = getRegisteredUsers();
                const phoneResult = validatePhoneNumber(input);
                if (phoneResult.valid) {
                    const found = users.find(u => u.phone === phoneResult.normalized);
                    if (found) return found;
                }
                const found = users.find(u => u.username === input);
                if (found) return found;
                return null;
            }

            function getLoginAttempts(accountKey) {
                try {
                    const raw = localStorage.getItem('login_attempts_' + accountKey);
                    if (raw) return JSON.parse(raw);
                } catch (e) {}
                return { count: 0, lockedUntil: 0 };
            }

            function setLoginAttempts(accountKey, data) {
                try {
                    localStorage.setItem('login_attempts_' + accountKey, JSON.stringify(data));
                } catch (e) {}
            }

            function checkLoginLock(accountKey) {
                const data = getLoginAttempts(accountKey);
                if (data.lockedUntil && Date.now() < data.lockedUntil) {
                    const remaining = Math.ceil((data.lockedUntil - Date.now()) / 60000);
                    return { locked: true, remaining: remaining };
                }
                return { locked: false };
            }

            function recordFailedAttempt(accountKey) {
                const data = getLoginAttempts(accountKey);
                data.count++;
                if (data.count >= 10) {
                    data.lockedUntil = Date.now() + 10 * 60 * 1000;
                } else if (data.count >= 20) {
                    data.lockedUntil = Date.now() + 30 * 60 * 1000;
                } else if (data.count >= 30) {
                    data.lockedUntil = Date.now() + 60 * 60 * 1000;
                }
                setLoginAttempts(accountKey, data);
                return data;
            }

            function resetLoginAttempts(accountKey) {
                setLoginAttempts(accountKey, { count: 0, lockedUntil: 0 });
            }

            function setupRealtimeValidation() {
                const usernameInput = document.getElementById('regUsername');
                const phoneInput = document.getElementById('regPhone');
                const captchaInput = document.getElementById('regCaptcha');

                if (usernameInput) {
                    usernameInput.addEventListener('input', function() {
                        const val = this.value;
                        if (val === '') {
                            clearFieldError('usernameGroup');
                            return;
                        }
                        const result = validateUsername(val);
                        if (result.valid) {
                            if (isUsernameRegistered(result.normalized)) {
                                showFieldError('usernameGroup', 'username_error_exists');
                            } else {
                                clearFieldError('usernameGroup');
                            }
                        } else {
                            showFieldError('usernameGroup', result.error);
                        }
                    });
                }

                if (phoneInput) {
                    phoneInput.addEventListener('input', function() {
                        const val = this.value;
                        if (val === '') {
                            clearFieldError('phoneGroup');
                            return;
                        }
                        const result = validatePhoneNumber(val);
                        if (result.valid) {
                            if (isPhoneRegistered(result.normalized)) {
                                showFieldError('phoneGroup', 'phone_error_registered');
                            } else {
                                clearFieldError('phoneGroup');
                            }
                        } else {
                            showFieldError('phoneGroup', result.error);
                        }
                    });
                }

                if (captchaInput) {
                    captchaInput.addEventListener('input', function() {
                        const val = this.value.trim();
                        if (val === '') {
                            clearFieldError('captchaGroup');
                            return;
                        }
                        const validation = window.Captcha.validate(val);
                        if (validation.valid) {
                            clearFieldError('captchaGroup');
                        } else {
                            const tFn = window.t || ((k) => k);
                            const msg = tFn(validation.message) || validation.message;
                            const g = document.getElementById('captchaGroup');
                            if (g) {
                                const inp = g.querySelector('.input-field');
                                const tip = g.querySelector('.field-error-tip');
                                if (inp) inp.classList.add('error');
                                if (tip) {
                                    tip.dataset.errorKey = validation.message;
                                    tip.textContent = msg;
                                    tip.classList.add('visible');
                                }
                            }
                        }
                    });
                }
            }

            document.getElementById('step2SubmitBtn').addEventListener('click', debounceBtn(function() {
                const tFn = window.t || ((k) => k);

                const isChecked = document.getElementById('protocolCheck').checked;
                if (!isChecked) {
                    alert(tFn('protocol_required'));
                    return;
                }

                const usernameEl = document.getElementById('regUsername');
                const username = usernameEl ? usernameEl.value : '';
                const usernameResult = validateUsername(username);
                if (!usernameResult.valid) {
                    showFieldError('usernameGroup', usernameResult.error);
                    return;
                }
                if (isUsernameRegistered(usernameResult.normalized)) {
                    showFieldError('usernameGroup', 'username_error_exists');
                    return;
                }
                clearFieldError('usernameGroup');

                const phoneEl = document.getElementById('regPhone');
                const phone = phoneEl ? phoneEl.value : '';
                const phoneResult = validatePhoneNumber(phone);
                if (!phoneResult.valid) {
                    showFieldError('phoneGroup', phoneResult.error);
                    return;
                }
                const normalizedPhone = phoneResult.normalized;
                if (isPhoneRegistered(normalizedPhone)) {
                    showFieldError('phoneGroup', 'phone_error_registered');
                    return;
                }
                clearFieldError('phoneGroup');

                const regPwdEl = document.getElementById('regPwd');
                const regConfirmPwdEl = document.getElementById('regConfirmPwd');
                const pwdErrorTip = document.getElementById('pwdErrorTip');
                const confirmPwdErrorTip = document.getElementById('confirmPwdErrorTip');
                const pwd = regPwdEl ? regPwdEl.value : '';
                const confirmPwd = regConfirmPwdEl ? regConfirmPwdEl.value : '';

                const pwdValidation = window.validatePassword ? window.validatePassword(pwd) : { valid: pwd.length === 6 &&
                        /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd), error: 'pwd_format_error' };
                if (!pwdValidation.valid) {
                    const errKey = pwdValidation.error || 'pwd_format_error';
                    if (regPwdEl) regPwdEl.classList.add('error');
                    if (pwdErrorTip) {
                        pwdErrorTip.textContent = tFn(errKey);
                        pwdErrorTip.classList.add('visible');
                    }
                    return;
                }
                if (regPwdEl) regPwdEl.classList.remove('error');
                if (pwdErrorTip) { pwdErrorTip.textContent = '';
                    pwdErrorTip.classList.remove('visible'); }

                if (confirmPwd !== pwd) {
                    if (regConfirmPwdEl) regConfirmPwdEl.classList.add('error');
                    if (confirmPwdErrorTip) {
                        confirmPwdErrorTip.textContent = tFn('pwd_mismatch');
                        confirmPwdErrorTip.classList.add('visible');
                    }
                    return;
                }
                if (regConfirmPwdEl) regConfirmPwdEl.classList.remove('error');
                if (confirmPwdErrorTip) { confirmPwdErrorTip.textContent = '';
                    confirmPwdErrorTip.classList.remove('visible'); }

                const captchaInput = document.getElementById('regCaptcha');
                const captchaVal = captchaInput ? captchaInput.value.trim() : '';
                const validation = window.Captcha.validate(captchaVal);
                if (!validation.valid) {
                    const errMsg = tFn(validation.message) || validation.message;
                    const g = document.getElementById('captchaGroup');
                    if (g) {
                        const inp = g.querySelector('.input-field');
                        const tip = g.querySelector('.field-error-tip');
                        if (inp) inp.classList.add('error');
                        if (tip) {
                            tip.dataset.errorKey = validation.message;
                            tip.textContent = errMsg;
                            tip.classList.add('visible');
                        }
                    }
                    return;
                }
                clearFieldError('captchaGroup');

                saveRegisteredUser(normalizedPhone, usernameResult.normalized, pwd);

                alert(tFn('register_success') + ' ' + (highestPrizeLabel || window.currentPrizeLabel));

                modalOverlay.classList.remove('active');
                prizeResult.classList.remove('show');
                if (window.gift3d && window.gift3d.close) window.gift3d.close();
                appState = 'idle';
                if (window.showPlaceholder) window.showPlaceholder();
            }));

            window.validatePassword = function(pwd) {
                if (pwd.length !== 6) {
                    return { valid: false, error: 'pwd_length_error' };
                }
                const hasLetter = /[a-zA-Z]/.test(pwd);
                const hasDigit = /[0-9]/.test(pwd);
                if (!hasLetter || !hasDigit) {
                    return { valid: false, error: 'pwd_format_error' };
                }
                return { valid: true, error: null };
            };

            function setupPwdRealTimeValidation() {
                const regPwdEl = document.getElementById('regPwd');
                const pwdErrorTip = document.getElementById('pwdErrorTip');
                const regConfirmPwdEl = document.getElementById('regConfirmPwd');
                const confirmPwdErrorTip = document.getElementById('confirmPwdErrorTip');
                const tFn = window.t || ((k) => k);

                if (regPwdEl) {
                    regPwdEl.addEventListener('input', function() {
                        const val = this.value;
                        if (val.length > 6) {
                            this.value = val.slice(0, 6);
                            showPwdError(this, pwdErrorTip, 'pwd_max_length_error');
                            return;
                        }
                        clearPwdError(this, pwdErrorTip);
                        if (regConfirmPwdEl && regConfirmPwdEl.value.length > 0) {
                            if (regConfirmPwdEl.value !== this.value) {
                                showPwdError(regConfirmPwdEl, confirmPwdErrorTip, 'pwd_mismatch');
                            } else {
                                clearPwdError(regConfirmPwdEl, confirmPwdErrorTip);
                            }
                        }
                    });
                }

                if (regConfirmPwdEl) {
                    regConfirmPwdEl.addEventListener('input', function() {
                        const val = this.value;
                        if (val.length > 6) {
                            this.value = val.slice(0, 6);
                            showPwdError(this, confirmPwdErrorTip, 'pwd_max_length_error');
                            return;
                        }
                        clearPwdError(this, confirmPwdErrorTip);
                        if (regPwdEl && val.length === 6 && regPwdEl.value.length === 6) {
                            if (val !== regPwdEl.value) {
                                showPwdError(this, confirmPwdErrorTip, 'pwd_mismatch');
                            } else {
                                clearPwdError(this, confirmPwdErrorTip);
                            }
                        }
                    });
                }
            }

            function showPwdError(inputEl, tipEl, errorKey) {
                const tFn = window.t || ((k) => k);
                if (inputEl) inputEl.classList.add('error');
                if (tipEl) {
                    tipEl.dataset.errorKey = errorKey;
                    tipEl.textContent = tFn(errorKey);
                    tipEl.classList.add('visible');
                }
            }

            function clearPwdError(inputEl, tipEl) {
                if (inputEl) inputEl.classList.remove('error');
                if (tipEl) {
                    tipEl.dataset.errorKey = '';
                    tipEl.textContent = '';
                    tipEl.classList.remove('visible');
                }
            }

            function resetPwdValidation() {
                const regPwdEl = document.getElementById('regPwd');
                const regConfirmPwdEl = document.getElementById('regConfirmPwd');
                const pwdErrorTip = document.getElementById('pwdErrorTip');
                const confirmPwdErrorTip = document.getElementById('confirmPwdErrorTip');
                if (regPwdEl) regPwdEl.classList.remove('error');
                if (regConfirmPwdEl) regConfirmPwdEl.classList.remove('error');
                if (pwdErrorTip) { pwdErrorTip.textContent = '';
                    pwdErrorTip.classList.remove('visible'); }
                if (confirmPwdErrorTip) { confirmPwdErrorTip.textContent = '';
                    confirmPwdErrorTip.classList.remove('visible'); }
                if (regPwdEl) regPwdEl.value = '';
                if (regConfirmPwdEl) regConfirmPwdEl.value = '';
            }

            document.getElementById('step3SubmitBtn').addEventListener('click', debounceBtn(function() {
                const tFn = window.t || ((k) => k);
                const loginPhoneInput = document.getElementById('loginPhone');
                const loginPwdInput = document.getElementById('loginPwd');
                const phoneErrorTip = document.getElementById('loginPhoneErrorTip');
                const pwdErrorTip = document.getElementById('loginPwdErrorTip');

                if (phoneErrorTip) { phoneErrorTip.textContent = '';
                    phoneErrorTip.classList.remove('visible');
                    phoneErrorTip.dataset.errorKey = ''; }
                if (pwdErrorTip) { pwdErrorTip.textContent = '';
                    pwdErrorTip.classList.remove('visible');
                    pwdErrorTip.dataset.errorKey = ''; }
                document.getElementById('loginPhone').classList.remove('error');
                document.getElementById('loginPwd').classList.remove('error');

                const inputVal = loginPhoneInput ? loginPhoneInput.value.trim() : '';
                const pwd = loginPwdInput ? loginPwdInput.value : '';

                const pwdValidation = window.validatePassword(pwd);
                if (!pwdValidation.valid) {
                    const errKey = pwdValidation.error || 'pwd_format_error';
                    if (pwdErrorTip) {
                        pwdErrorTip.textContent = tFn('login_pwd_format_error');
                        pwdErrorTip.classList.add('visible');
                        pwdErrorTip.dataset.errorKey = 'login_pwd_format_error';
                    }
                    document.getElementById('loginPwd').classList.add('error');
                    return;
                }

                const user = findUserByPhoneOrUsername(inputVal);
                if (!user) {
                    if (phoneErrorTip) {
                        phoneErrorTip.textContent = tFn('login_error_account_or_pwd');
                        phoneErrorTip.classList.add('visible');
                        phoneErrorTip.dataset.errorKey = 'login_error_account_or_pwd';
                    }
                    document.getElementById('loginPhone').classList.add('error');
                    return;
                }

                const accountKey = user.phone || user.username;
                const lock = checkLoginLock(accountKey);
                if (lock.locked) {
                    const msg = tFn('login_error_too_many_attempts').replace('{minutes}', lock.remaining);
                    if (pwdErrorTip) {
                        pwdErrorTip.textContent = msg;
                        pwdErrorTip.classList.add('visible');
                        pwdErrorTip.dataset.errorKey = 'login_error_too_many_attempts';
                    }
                    document.getElementById('loginPwd').classList.add('error');
                    return;
                }

                if (user.password !== pwd) {
                    recordFailedAttempt(accountKey);
                    if (pwdErrorTip) {
                        pwdErrorTip.textContent = tFn('login_error_account_or_pwd');
                        pwdErrorTip.classList.add('visible');
                        pwdErrorTip.dataset.errorKey = 'login_error_account_or_pwd';
                    }
                    document.getElementById('loginPwd').classList.add('error');
                    return;
                }

                resetLoginAttempts(accountKey);
                alert(tFn('login_msg'));

                modalOverlay.classList.remove('active');
                prizeResult.classList.remove('show');
                if (window.gift3d && window.gift3d.close) window.gift3d.close();
                appState = 'idle';

                setTimeout(() => {
                    if (window.showRechargeModal) window.showRechargeModal();
                }, 300);
            }));

            document.getElementById('step1ClaimBtn').addEventListener('click', function() {
                if (currentPrize === 0 && remainingChances > 0) {
                    const tFn = window.t || ((k) => k);
                    alert(tFn('noBonus'));
                    return;
                }
                authSource = 'activation';
                showStep(2);
            });
            document.getElementById('switchToLogin').addEventListener('click', function() { authSourcePrev = authSource; authSource = 'register'; _performStandardStepSwitch(3); });
            document.getElementById('switchToRegister').addEventListener('click', function() { if (authSource === 'register') authSource = authSourcePrev; _performStandardStepSwitch(2); });

            // ===== 首页登录/注册按钮 → 打开认证弹窗 =====
            const headerLoginBtn = document.getElementById('headerLoginBtn');
            const headerRegisterBtn = document.getElementById('headerRegisterBtn');
            if (headerLoginBtn) {
                headerLoginBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    authSource = 'homepage';
                    window._modalPlaySound = false;
                    modalPrizeAmount.classList.add('show');
                    showStep(3);
                    modalOverlay.classList.add('active');
                    setTimeout(() => { window._modalPlaySound = true; }, 50);
                });
            }
            if (headerRegisterBtn) {
                headerRegisterBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    authSource = 'homepage';
                    window._modalPlaySound = false;
                    modalPrizeAmount.classList.add('show');
                    if (window.generateCaptcha) window.generateCaptcha();
                    showStep(2);
                    modalOverlay.classList.add('active');
                    setTimeout(() => { window._modalPlaySound = true; }, 50);
                });
            }

            // ===== ❮ 返回按钮（智能导航） =====
            document.getElementById('modalBackBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                if (!step1.classList.contains('hidden')) {
                    // 激活奖金页 → 返回大轮盘首页
                    closeAuthModal();
                } else if (!step2.classList.contains('hidden')) {
                    if (authSource === 'activation') {
                        // 来自激活奖金 → 返回激活奖金页
                        showStep(1);
                    } else {
                        // 来自首页注册 → 返回大轮盘首页
                        closeAuthModal();
                    }
                } else if (!step3.classList.contains('hidden')) {
                    if (authSource === 'register') {
                        // 来自注册 → 返回注册页，恢复之前的来源
                        authSource = authSourcePrev;
                        showStep(2);
                    } else {
                        // 来自首页登录 → 返回大轮盘首页
                        closeAuthModal();
                    }
                }
            });

            // ===== ✕ 关闭按钮（统一关闭整个流程） =====
            document.getElementById('modalCloseBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                closeAuthModal();
            });

            function closeAuthModal() {
                modalOverlay.classList.remove('active');
                prizeResult.classList.remove('show');
                if (window.gift3d && window.gift3d.close) window.gift3d.close();
                appState = 'idle';
                authSource = 'homepage';
                authSourcePrev = 'homepage';
                _currentAuthStep = null;
                _flipLocked = false;
                _flipDragging = false;
                _flipContentSwapped = false;
                _flipCurrentAngle = 0;
                // 清理翻页动画残留
                const modalCard = document.getElementById('modalCard');
                if (modalCard) {
                    modalCard.classList.remove('flip-dragging', 'flip-snapping', 'flip-springback', 'flip-quick', 'auto-flip-turn', 'auto-flip-return');
                    modalCard.style.overflowY = '';
                    modalCard.style.transformOrigin = '';
                    modalCard.style.transform = '';
                    modalCard.style.boxShadow = '';
                    modalCard.style.filter = '';
                }
                [step1, step2, step3].forEach(el => {
                    if (el) { el.classList.remove('step-flip-fading', 'step-flip-showing', 'auto-flip-fadeout', 'auto-flip-fadein'); }
                });
                // 取消待执行的动画回调
                if (_flipAnimId) { cancelAnimationFrame(_flipAnimId); _flipAnimId = null; }
            }
            window.closeAuthModal = closeAuthModal;

            function handleWheelClick(e) {
                if (appState === 'spinning') return;
                if (isGameCompleted || remainingChances === 0) {
                    const tFn = window.t || ((k) => k);
                    const titleEl = document.getElementById('step1Title'),
                        subEl = document.getElementById('step1Subtitle'),
                        claimBtn = document.getElementById('step1ClaimBtn');
                    titleEl.textContent = tFn('gameOverTitle');
                    subEl.textContent = tFn('gameOverSub');
                    claimBtn.textContent = tFn('gameOverClaim');
                    if (prizeHistory.length > 0) {
                        const displayHistory = buildDisplayHistory(prizeHistory);
                        const highlightIndex = prizeHistory.length - 1;
                        buildPrizeSlider(displayHistory, highlightIndex);
                        window._prizeHistoryData = {
                            history: displayHistory,
                            highlightIndex: highlightIndex
                        };
                    }
                    updateChanceInfoDisplay();
                    window._spinJustCompleted = false;
                    showStep(1);
                    titleEl.style.opacity = '0';
                    modalPrizeAmount.style.opacity = '0';
                    subEl.style.opacity = '0';
                    claimBtn.style.opacity = '0';
                    modalOverlay.classList.add('active');
                    modalPrizeAmount.classList.add('show');
                    requestAnimationFrame(() => { titleEl.style.opacity = '1'; });
                    requestAnimationFrame(() => { modalPrizeAmount.style.opacity = '1'; });
                    requestAnimationFrame(() => { subEl.style.opacity = '1'; });
                    requestAnimationFrame(() => { claimBtn.style.opacity = '1'; });
                    return;
                }
                if (appState === 'done') { shakeElement(prizeResultText);
                    return; }
                const result = calculatePrize();
                currentSectorIndex = result.sectorIndex;
                currentPrize = result.prize;
                currentPrizeLabel = result.label;
                // 播放免费抽奖按钮点击音效
                if (typeof window._playWheelClickSound === 'function') {
                    window._playWheelClickSound();
                }
                startSpinAnimation(currentSectorIndex);
            }
            wheelCenterBtn.addEventListener('click', debounceBtn(function(e) { e.stopPropagation();
                handleWheelClick(e); }));

            function shakeElement(el) {
                el.style.transition = 'transform 0.08s';
                el.style.transform = 'translateX(-4px)';
                setTimeout(() => { el.style.transform = 'translateX(4px)'; }, 80);
                setTimeout(() => { el.style.transform = 'translateX(-3px)'; }, 160);
                setTimeout(() => { el.style.transform = 'translateX(0)'; }, 240);
                setTimeout(() => { el.style.transition = ''; }, 320);
            }

            function initGame() {
                appState = 'idle';
                currentRotationDeg = 22.5;
                wheelSpinBody.style.transform = `rotate(${currentRotationDeg}deg)`;
                prizeResult.classList.remove('show');
                window.currentPrizeLabel = currentPrizeLabel;
                showStep(1);
                remainingChances = 3;
                highestPrize = 0;
                highestPrizeLabel = '0 Ks';
                isGameCompleted = false;
                prizeHistory = [];
                prizeHistoryMaxIndex = 0;
                const displayHistory = buildDisplayHistory([]);
                buildPrizeSlider(displayHistory, 0);
                window._prizeHistoryData = {
                    history: displayHistory,
                    highlightIndex: 0
                };
                updateChanceInfoDisplay();
                drawWheelCanvas();
                modalPrizeAmount.classList.remove('show');
                clearFieldErrors();
                setupRealtimeValidation();
                setupPwdRealTimeValidation();
                initAuthSwipeGesture();
            }

            window.addEventListener('languageChanged', function() {
                drawWheelCanvas();
                updateChanceInfoDisplay();
                if (prizeResult.classList.contains('show') && window.currentPrizeLabel && window.currentPrizeLabel !==
                    '0 Ks') {
                    const tFn = window.t || ((k) => k);
                    prizeResultText.textContent = tFn('prizeResultPrefix') + window.currentPrizeLabel + tFn(
                        'prizeResultSuffix');
                }
                if (window._refreshHistoryLabels) {
                    window._refreshHistoryLabels();
                }
                if (modalOverlay.classList.contains('active')) {
                    const tFn = window.t || ((k) => k);
                    const titleEl = document.getElementById('step1Title');
                    const subEl = document.getElementById('step1Subtitle');
                    const claimBtn = document.getElementById('step1ClaimBtn');
                    if (!step1.classList.contains('hidden')) {
                        if (isGameCompleted || remainingChances === 0) {
                            if (titleEl) titleEl.textContent = tFn('gameOverTitle');
                            if (subEl) subEl.textContent = tFn('gameOverSub');
                            if (claimBtn) claimBtn.textContent = tFn('gameOverClaim');
                        } else {
                            if (currentPrize > 0) {
                                if (titleEl) titleEl.textContent = tFn('congratsTitle');
                                if (subEl) subEl.textContent = tFn('bonusDeposited');
                            } else {
                                if (titleEl) titleEl.textContent = tFn('thanksParticipating');
                                if (subEl) subEl.textContent = tFn('goodLuckNext');
                            }
                            if (claimBtn) claimBtn.textContent = tFn('step1_claim');
                        }
                    }
                }
                const loginPhone = document.getElementById('loginPhone');
                const loginPwd = document.getElementById('loginPwd');
                const tFn = window.t || ((k) => k);
                if (loginPhone) loginPhone.placeholder = tFn('login_phone_or_id_ph');
                if (loginPwd) loginPwd.placeholder = tFn('login_pwd_ph');
                const forgotLink = document.getElementById('forgotPwdLink');
                if (forgotLink) forgotLink.textContent = tFn('login_forgot_pwd');
                if (typeof window.updateLoginErrorTips === 'function') {
                    window.updateLoginErrorTips();
                }

                const rt = document.getElementById('rechargeModalTitle');
                const ra = document.getElementById('rechargeModalActivity');
                const rd = document.getElementById('rechargeModalDesc');
                const rb = document.getElementById('rechargeModalBtn');
                if (rt) rt.textContent = tFn('recharge_title');
                if (ra) ra.textContent = tFn('recharge_activity');
                if (rd) rd.textContent = tFn('recharge_desc');
                if (rb) rb.textContent = tFn('recharge_btn');

                const lbTitle = document.getElementById('loginBonusTitle');
                const lbBadge = document.getElementById('loginBonusBadge');
                const lbDesc = document.getElementById('loginBonusDesc');
                if (lbTitle) lbTitle.textContent = tFn('login_bonus_title');
                if (typeof window.refreshBonusDisplay === 'function') {
                    window.refreshBonusDisplay();
                }

                const pt = document.getElementById('placeholderTitle');
                const ps = document.getElementById('placeholderSub');
                const ph = document.getElementById('placeholderHint');
                const pb = document.getElementById('placeholderBackBtn');
                if (pt) pt.textContent = tFn('placeholder_title');
                if (ps) ps.textContent = tFn('placeholder_sub');
                if (ph) ph.textContent = tFn('placeholder_hint');
                if (pb) pb.textContent = tFn('placeholder_btn');

                // 如果 step3 可见，触发 Logo 动画
                const step3El = document.getElementById('step3');
                if (step3El && !step3El.classList.contains('hidden')) {
                    setTimeout(() => {
                        if (window.triggerLoginLogoAnimation) {
                            window.triggerLoginLogoAnimation();
                        }
                    }, 100);
                }
            });

            window._refreshHistoryLabels = function() {
                if (!window._prizeHistoryData) return;
                const data = window._prizeHistoryData;
                const highlight = data.highlightIndex;
                const history = data.history;
                if (!history || history.length === 0) return;
                const tFn = window.t || ((k) => k);
                const labelTemplate = tFn('prizeHistoryLabel') || '第 {round} 次抽奖';
                const hintText = tFn('prizeHistoryHint') || '← 左右滑动查看 →';
                const cards = document.querySelectorAll('.prize-slide-card');
                history.forEach((item, idx) => {
                    if (cards[idx]) {
                        const labelEl = cards[idx].querySelector('.prize-round-label');
                        if (labelEl) {
                            labelEl.textContent = labelTemplate.replace('{round}', item.round);
                        }
                        if (!item.isMarketing) {
                            const amountEl = cards[idx].querySelector('.prize-amount');
                            if (amountEl && item.label) {
                                amountEl.textContent = item.label;
                            }
                        }
                    }
                });
                const hint = document.getElementById('prizeSliderHint');
                if (hint) {
                    hint.textContent = history.length > 1 ? hintText : '';
                }
                const dotsEl = document.getElementById('prizeSliderDots');
                if (dotsEl) {
                    const dotItems = dotsEl.querySelectorAll('.dot');
                    dotItems.forEach((d, i) => {
                        d.classList.toggle('active', i === highlight);
                        d.classList.toggle('done', i === highlight && !history[i]?.isMarketing);
                    });
                }
            };

            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGame);
            else initGame();
            window.addEventListener('beforeunload', () => { if (spinAnimation) spinAnimation.cancel(); });
        })();
    


        (function() {
            let aC = null,
                mG = null,
                wG = null,
                an = [],
                tI = null,
                pA = null,
                wA = null,
                wA2 = null,
                wA3 = null;

            function cA() { if (aC) return aC; try { aC = new(window.AudioContext || window.webkitAudioContext)();
                    mG = aC.createGain();
                    mG.gain.value = 0.4;
                    mG.connect(aC.destination);
                    wG = aC.createGain();
                    wG.gain.value = 0;
                    wG.connect(mG); return aC; } catch (e) { return null; } }

            function eC() { if (!aC) cA(); if (aC && aC.state === 'suspended') aC.resume(); return aC; }

            function clN() { if (tI) { clearTimeout(tI);
                    tI = null; }
                an.splice(0).forEach(n => { try { if (n.o) { n.o.stop();
                        n.o.disconnect(); } } catch (e) {} try { if (n.g) n.g.disconnect(); } catch (e) {} });
                if (pA) { try { pA.pause(); pA.currentTime = 0; } catch (e) {} } }
            // 暴露全局停止音效函数，供喇叭静音按钮调用
            window._stopPrizeSound = clN;

            function pW() {
                // 检查全局静音状态：静音时不播放抽奖奖金音效
                if (window._audioMuted) return;
                clN();
                try {
                    if (!pA) {
                        pA = new Audio('zhongjiang.mp3');
                        pA.preload = 'auto';
                    }
                    pA.currentTime = 0;
                    pA.play().catch(function(e) { /* 浏览器自动播放限制 */ });
                } catch (e) {} }

            function pWC() {
                // 免费抽奖按钮点击音效：播放 yinxiao1.mp3
                if (window._audioMuted) return;
                try {
                    if (!wA) {
                        wA = new Audio('yinxiao1.mp3');
                        wA.preload = 'auto';
                    }
                    wA.currentTime = 0;
                    wA.play().catch(function(e) { /* 浏览器自动播放限制 */ });
                } catch (e) {} }
            // 暴露全局免费抽奖按钮音效函数
            window._playWheelClickSound = pWC;

            function pWCS() {
                // 大轮盘开始旋转音效：播放 yinxiao2.mp3
                if (window._audioMuted) return;
                try {
                    if (!wA2) {
                        wA2 = new Audio('yinxiao2.mp3');
                        wA2.preload = 'auto';
                    }
                    // 预创建 yinxiao3 并置于就绪态，确保 ended 回调中零延迟启播
                    if (!wA3) {
                        wA3 = new Audio('yinxiao3.mp3');
                        wA3.preload = 'auto';
                    }
                    wA3.pause();
                    wA3.currentTime = 0;
                    // 监听 yinxiao2 播放进度，临近结束时重新校准 wA3 就绪态
                    var primeW3 = function() {
                        if (!wA2 || !wA3) return;
                        var remaining = (wA2.duration || 0) - (wA2.currentTime || 0);
                        if (remaining > 0 && remaining < 0.25) {
                            try { wA3.currentTime = 0; } catch (e) {}
                            wA2.removeEventListener('timeupdate', primeW3);
                        }
                    };
                    wA2.removeEventListener('timeupdate', primeW3);
                    wA2.addEventListener('timeupdate', primeW3);
                    wA2.removeEventListener('ended', pWCS3);
                    wA2.addEventListener('ended', pWCS3, { once: true });
                    wA2.pause();
                    wA2.currentTime = 0;
                    var p = wA2.play();
                    if (p !== undefined) {
                        p.catch(function() {
                            wA2.load();
                            wA2.currentTime = 0;
                            wA2.play().catch(function() {});
                        });
                    }
                } catch (e) {} }

            function pWCS3() {
                // 大轮盘旋转后续阶段音效：yinxiao2 结束后无缝播放 yinxiao3.mp3（仅一次，不循环）
                if (window._audioMuted) return;
                try {
                    if (!wA3) {
                        wA3 = new Audio('yinxiao3.mp3');
                        wA3.preload = 'auto';
                    }
                    // wA3 已在 pWCS 中预置到位，此处直接播放消除交接空档
                    var p = wA3.play();
                    if (p !== undefined) {
                        p.catch(function() {
                            wA3.load();
                            wA3.currentTime = 0;
                            wA3.play().catch(function() {});
                        });
                    }
                } catch (e) {} }
            // 暴露全局大轮盘旋转音效函数
            window._playWheelSpinSound = pWCS;

            function uA() { eC(); }

            function bE() { const mo = document.getElementById('modalOverlay'); if (mo) { new MutationObserver(() => { if (mo
                            .classList.contains('active') && window._modalPlaySound !== false) pW(); }).observe(mo, { attributes: true,
                        attributeFilter: ['class'] }); } ['click', 'touchstart', 'touchend'].forEach(e => document
                    .addEventListener(e, () => { uA(); }, { capture: true, once: false })); }

            function dD() { clN(); if (tI) clearTimeout(tI);
                try { if (wG) wG.disconnect(); } catch (e) {} try { if (mG) mG.disconnect(); } catch (e) {} try { if (aC && aC
                        .state !== 'closed') aC.close(); } catch (e) {}
                aC = mG = wG = null;
                if (pA) { try { pA.pause(); pA.src = ''; pA.load(); } catch (e) {} pA = null; }
                if (wA3) { try { wA3.pause(); wA3.src = ''; wA3.load(); } catch (e) {} wA3 = null; } }
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { cA();
                    bE(); }, 120); });
            else setTimeout(() => { cA();
                bE(); }, 120);
            window.addEventListener('beforeunload', dD);
        })();
    