// ==UserScript==
// @name         qBittorrent Table Enhancer
// @namespace    https://github.com/leeguooooo/qbittorrent-table-enhancer
// @version      1.1.0
// @description  Enhance qBittorrent web interface by showing hidden table columns
// @author       leeguooooo
// @match        http*://*/
// @match        http*://localhost:*/
// @match        http*://127.0.0.1:*/
// @match        http*://192.168.*:*/
// @match        http*://10.*:*/
// @grant        none
// @run-at       document-ready
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Column definitions with their display names
    const COLUMN_DEFINITIONS = {
        'column_priority': { name: '#', description: '优先级' },
        'column_total_size': { name: '总大小', description: '种子文件的总大小' },
        'column_completion_on': { name: '完成于', description: '种子完成时间' },
        'column_tracker': { name: 'Tracker', description: 'Tracker服务器' },
        'column_dl_limit': { name: '下载限制', description: '下载速度限制' },
        'column_up_limit': { name: '上传限制', description: '上传速度限制' },
        'column_downloaded': { name: '已下载', description: '总下载量' },
        'column_uploaded': { name: '已上传', description: '总上传量' },
        'column_downloaded_session': { name: '本次会话下载', description: '本次会话下载量' },
        'column_uploaded_session': { name: '本次会话上传', description: '本次会话上传量' },
        'column_amount_left': { name: '剩余', description: '剩余下载量' },
        'column_time_active': { name: '有效时间', description: '种子活跃时间' },
        'column_save_path': { name: '保存路径', description: '文件保存路径' },
        'column_completed': { name: '完成', description: '已完成大小' },
        'column_max_ratio': { name: '比率限制', description: '最大分享比率' },
        'column_seen_complete': { name: '最后完整可见', description: '最后一次看到完整种子的时间' },
        'column_last_activity': { name: '最后活动', description: '最后活动时间' },
        'column_availability': { name: '可用性', description: '种子可用性' },
        'column_download_path': { name: '保存路径不完整', description: '下载时的临时路径' },
        'column_infohash_v1': { name: '信息哈希值 v1', description: 'BitTorrent v1 哈希值' },
        'column_infohash_v2': { name: '信息哈希值 v2', description: 'BitTorrent v2 哈希值' },
        'column_reannounce': { name: '下次重新汇报', description: '下次向Tracker汇报的时间' }
    };

    let controlPanel = null;
    let isInitialized = false;

    // Check if we're on a qBittorrent web interface
    function isQBittorrentInterface() {
        return document.title.includes('qBittorrent') || 
               document.querySelector('#downloadPage') || 
               document.querySelector('.mocha') ||
               document.querySelector('#transferList');
    }

    // Get all table headers and rows
    function getTableElements() {
        const headers = document.querySelectorAll('#transferList .dynamicTableHeader th');
        const rows = document.querySelectorAll('#transferList tbody tr');
        return { headers, rows };
    }

    // Toggle column visibility
    function toggleColumn(columnClass, show) {
        // Select elements from both fixed header and scrollable content
        const selectors = [
            `#torrentsTableFixedHeaderDiv .${columnClass}`,
            `#torrentsTableDiv .${columnClass}`,
            `#transferList .${columnClass}` // fallback for general case
        ];
        
        let totalElements = 0;
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            totalElements += elements.length;
            elements.forEach(element => {
                if (show) {
                    element.classList.remove('invisible');
                    element.style.display = '';
                } else {
                    element.classList.add('invisible');
                    element.style.display = 'none';
                }
            });
        });
        
        // Debug logging
        console.log(`[qBittorrent Enhancer] Toggled ${totalElements} elements for column ${columnClass} to ${show ? 'visible' : 'hidden'}`);
    }

    // Create control panel
    function createControlPanel() {
        if (controlPanel) return;

        // Create panel container
        controlPanel = document.createElement('div');
        controlPanel.id = 'qbt-enhancer-panel';
        controlPanel.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                width: 320px;
                max-height: 500px;
                background: #2b2b2b;
                border: 1px solid #555;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: #fff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                overflow: hidden;
            ">
                <div style="
                    background: #3a3a3a;
                    padding: 10px;
                    border-bottom: 1px solid #555;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: move;
                " id="qbt-panel-header">
                    <span style="font-weight: bold;">qBittorrent 表格增强器</span>
                    <div>
                        <button id="qbt-toggle-panel" style="
                            background: #555;
                            border: none;
                            color: #fff;
                            padding: 2px 6px;
                            margin-right: 5px;
                            border-radius: 3px;
                            cursor: pointer;
                        ">折叠</button>
                        <button id="qbt-close-panel" style="
                            background: #d32f2f;
                            border: none;
                            color: #fff;
                            padding: 2px 6px;
                            border-radius: 3px;
                            cursor: pointer;
                        ">×</button>
                    </div>
                </div>
                <div id="qbt-panel-content" style="
                    padding: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                ">
                    <div style="margin-bottom: 10px;">
                        <button id="qbt-show-all" style="
                            background: #4caf50;
                            border: none;
                            color: #fff;
                            padding: 5px 10px;
                            margin-right: 5px;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 11px;
                        ">显示所有</button>
                        <button id="qbt-hide-all" style="
                            background: #f44336;
                            border: none;
                            color: #fff;
                            padding: 5px 10px;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 11px;
                        ">隐藏所有</button>
                    </div>
                    <div id="qbt-column-list"></div>
                </div>
            </div>
        `;

        document.body.appendChild(controlPanel);

        // Add event listeners
        setupControlPanelEvents();
        generateColumnList();
        makePanelDraggable();
    }

    // Setup control panel event listeners
    function setupControlPanelEvents() {
        // Close panel
        document.getElementById('qbt-close-panel').addEventListener('click', () => {
            controlPanel.remove();
            controlPanel = null;
        });

        // Toggle panel
        const toggleBtn = document.getElementById('qbt-toggle-panel');
        const content = document.getElementById('qbt-panel-content');
        toggleBtn.addEventListener('click', () => {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggleBtn.textContent = '折叠';
            } else {
                content.style.display = 'none';
                toggleBtn.textContent = '展开';
            }
        });

        // Show all columns
        document.getElementById('qbt-show-all').addEventListener('click', () => {
            Object.keys(COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, true);
                const checkbox = document.querySelector(`#qbt-${columnClass}`);
                if (checkbox) checkbox.checked = true;
            });
        });

        // Hide all columns
        document.getElementById('qbt-hide-all').addEventListener('click', () => {
            Object.keys(COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, false);
                const checkbox = document.querySelector(`#qbt-${columnClass}`);
                if (checkbox) checkbox.checked = false;
            });
        });
    }

    // Generate column list in control panel
    function generateColumnList() {
        const columnList = document.getElementById('qbt-column-list');
        columnList.innerHTML = '';

        Object.entries(COLUMN_DEFINITIONS).forEach(([columnClass, info]) => {
            // Check visibility in both header and content tables
            const headerElement = document.querySelector(`#torrentsTableFixedHeaderDiv .${columnClass}`) || 
                                 document.querySelector(`#torrentsTableDiv .${columnClass}`) ||
                                 document.querySelector(`#transferList .${columnClass}`);
            const isVisible = headerElement && !headerElement.classList.contains('invisible');
            
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                padding: 5px;
                background: #333;
                border-radius: 4px;
            `;

            item.innerHTML = `
                <input type="checkbox" id="qbt-${columnClass}" ${isVisible ? 'checked' : ''} style="margin-right: 8px;">
                <label for="qbt-${columnClass}" style="
                    flex: 1;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                ">
                    <span style="font-weight: bold;">${info.name}</span>
                    <span style="font-size: 10px; color: #aaa;">${info.description}</span>
                </label>
            `;

            columnList.appendChild(item);

            // Add change event listener
            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                toggleColumn(columnClass, e.target.checked);
            });
        });
    }

    // Make panel draggable
    function makePanelDraggable() {
        const header = document.getElementById('qbt-panel-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = controlPanel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            controlPanel.style.left = startLeft + deltaX + 'px';
            controlPanel.style.top = startTop + deltaY + 'px';
            controlPanel.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Debug function to analyze table structure
    function debugTableStructure() {
        console.log('[qBittorrent Enhancer] Table Structure Analysis:');
        
        const fixedHeader = document.querySelector('#torrentsTableFixedHeaderDiv');
        const contentTable = document.querySelector('#torrentsTableDiv');
        const transferList = document.querySelector('#transferList');
        
        console.log('Fixed Header Table:', fixedHeader ? 'Found' : 'Not Found');
        console.log('Content Table:', contentTable ? 'Found' : 'Not Found');
        console.log('Transfer List:', transferList ? 'Found' : 'Not Found');
        
        if (fixedHeader) {
            const headerColumns = fixedHeader.querySelectorAll('th[class*="column_"]');
            console.log(`Fixed header columns: ${headerColumns.length}`);
        }
        
        if (contentTable) {
            const contentColumns = contentTable.querySelectorAll('th[class*="column_"]');
            const dataRows = contentTable.querySelectorAll('tbody tr');
            console.log(`Content header columns: ${contentColumns.length}`);
            console.log(`Data rows: ${dataRows.length}`);
            if (dataRows.length > 0) {
                const dataCells = dataRows[0].querySelectorAll('td[class*="column_"]');
                console.log(`Data cells in first row: ${dataCells.length}`);
            }
        }
        
        // Check some specific columns
        Object.keys(COLUMN_DEFINITIONS).slice(0, 3).forEach(columnClass => {
            const elements = document.querySelectorAll(`#transferList .${columnClass}`);
            console.log(`Column ${columnClass}: ${elements.length} elements found`);
        });
    }

    // Add hotkey to toggle panel
    function setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+Q to toggle panel
            if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
                e.preventDefault();
                if (controlPanel) {
                    controlPanel.remove();
                    controlPanel = null;
                } else {
                    createControlPanel();
                }
            }
            
            // Ctrl+Shift+D for debug
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                debugTableStructure();
            }
        });
    }

    // Main function to enhance the table
    function enhanceTable() {
        if (!isQBittorrentInterface()) {
            return;
        }

        if (isInitialized) return;
        
        console.log('[qBittorrent Table Enhancer] Detected qBittorrent interface');

        // Wait for table to be fully loaded
        const transferList = document.querySelector('#transferList');
        if (!transferList) {
            setTimeout(enhanceTable, 500);
            return;
        }

        isInitialized = true;
        setupHotkeys();
        
        // Show notification
        showNotification();
        
        console.log('[qBittorrent Table Enhancer] Enhancement loaded successfully');
    }

    // Show notification
    function showNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #4caf50;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10001;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
                qBittorrent表格增强器已启用！按 Ctrl+Shift+Q 打开控制面板，Ctrl+Shift+D 调试信息
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Initialize the enhancement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceTable);
    } else {
        enhanceTable();
    }

    // Also monitor for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                enhanceTable();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();