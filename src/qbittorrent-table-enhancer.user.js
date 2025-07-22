// ==UserScript==
// @name         qBittorrent Table Enhancer
// @namespace    https://github.com/leeguooooo/qbittorrent-table-enhancer
// @version      1.3.0
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

    // Hidden column definitions 
    const HIDDEN_COLUMN_DEFINITIONS = {
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

    // Visible column definitions (currently displayed columns)
    const VISIBLE_COLUMN_DEFINITIONS = {
        'column_state_icon': { name: '状态图标', description: '种子状态图标' },
        'column_name': { name: '名称', description: '种子名称' },
        'column_size': { name: '选定大小', description: '选择下载的文件大小' },
        'column_progress': { name: '进度', description: '下载进度' },
        'column_status': { name: '状态', description: '当前状态' },
        'column_num_seeds': { name: '种子', description: '种子数量' },
        'column_num_leechs': { name: '用户', description: '下载用户数量' },
        'column_dlspeed': { name: '下载速度', description: '当前下载速度' },
        'column_upspeed': { name: '上传速度', description: '当前上传速度' },
        'column_eta': { name: '剩余时间', description: '预计完成时间' },
        'column_ratio': { name: '比率', description: '分享比率' },
        'column_popularity': { name: '流行度', description: '种子流行度' },
        'column_category': { name: '分类', description: '种子分类' },
        'column_tags': { name: '标签', description: '种子标签' },
        'column_added_on': { name: '添加于', description: '添加时间' },
        'column_private': { name: '私密', description: '是否为私有种子' }
    };

    let controlPanel = null;
    let isInitialized = false;
    let activeFilters = [];
    
    // Filter types for different columns
    const FILTER_TYPES = {
        'save_path': { name: '保存路径', columnClass: 'column_save_path', dataIndex: 27 },
        'name': { name: '名称', columnClass: 'column_name', dataIndex: 2 },
        'category': { name: '分类', columnClass: 'column_category', dataIndex: 14 },
        'tags': { name: '标签', columnClass: 'column_tags', dataIndex: 15 },
        'status': { name: '状态', columnClass: 'column_status', dataIndex: 6 },
        'tracker': { name: 'Tracker', columnClass: 'column_tracker', dataIndex: 18 }
    };

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

    // Apply filters to hide rows
    function applyFilters() {
        const dataRows = document.querySelectorAll('#torrentsTableDiv tbody tr');
        let hiddenCount = 0;
        
        dataRows.forEach(row => {
            let shouldHide = false;
            
            // Check each active filter
            activeFilters.forEach(filter => {
                const cellIndex = FILTER_TYPES[filter.type]?.dataIndex;
                if (cellIndex !== undefined && row.children[cellIndex]) {
                    const cellText = row.children[cellIndex].textContent.trim();
                    const cellTitle = row.children[cellIndex].getAttribute('title') || '';
                    
                    // Check if filter matches (case insensitive)
                    const textToCheck = (cellText + ' ' + cellTitle).toLowerCase();
                    const filterValue = filter.value.toLowerCase();
                    
                    if (filter.mode === 'exclude' && textToCheck.includes(filterValue)) {
                        shouldHide = true;
                    } else if (filter.mode === 'include' && !textToCheck.includes(filterValue)) {
                        shouldHide = true;
                    }
                }
            });
            
            // Apply visibility
            if (shouldHide) {
                row.style.display = 'none';
                row.classList.add('qbt-filtered');
                hiddenCount++;
            } else {
                row.style.display = '';
                row.classList.remove('qbt-filtered');
            }
        });
        
        console.log(`[qBittorrent Enhancer] Applied ${activeFilters.length} filters, hidden ${hiddenCount} rows`);
        updateFilterStatus();
    }

    // Update filter status display
    function updateFilterStatus() {
        const statusElement = document.getElementById('qbt-filter-status');
        if (statusElement) {
            const hiddenRows = document.querySelectorAll('#torrentsTableDiv tbody tr.qbt-filtered').length;
            const totalRows = document.querySelectorAll('#torrentsTableDiv tbody tr').length;
            statusElement.textContent = activeFilters.length > 0 ? 
                `过滤器: ${activeFilters.length}个活跃, 隐藏 ${hiddenRows}/${totalRows} 行` : 
                '无活跃过滤器';
        }
    }

    // Add a new filter
    function addFilter(type, value, mode = 'exclude') {
        if (!value.trim()) return;
        
        // Check if filter already exists
        const exists = activeFilters.some(f => f.type === type && f.value === value && f.mode === mode);
        if (exists) return;
        
        activeFilters.push({ type, value, mode, id: Date.now() });
        applyFilters();
        refreshFilterList();
    }

    // Remove a filter
    function removeFilter(filterId) {
        activeFilters = activeFilters.filter(f => f.id !== filterId);
        applyFilters();
        refreshFilterList();
    }
    
    // Expose removeFilter to global scope for onclick handlers
    window.removeFilter = removeFilter;

    // Clear all filters
    function clearAllFilters() {
        activeFilters = [];
        applyFilters();
        refreshFilterList();
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
        
        // Additionally handle data rows by column index
        // Get column index from header
        const headerRow = document.querySelector('#torrentsTableDiv thead tr') || 
                         document.querySelector('#torrentsTableFixedHeaderDiv thead tr');
        if (headerRow) {
            const headers = headerRow.querySelectorAll('th');
            let columnIndex = -1;
            
            headers.forEach((header, index) => {
                if (header.classList.contains(columnClass)) {
                    columnIndex = index;
                }
            });
            
            if (columnIndex >= 0) {
                // Toggle corresponding td elements by index
                const dataRows = document.querySelectorAll('#torrentsTableDiv tbody tr');
                dataRows.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        if (show) {
                            cell.classList.remove('invisible');
                            cell.style.display = '';
                        } else {
                            cell.classList.add('invisible');
                            cell.style.display = 'none';
                        }
                        totalElements++;
                    }
                });
            }
        }
        
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
                    <!-- Column Controls -->
                    <div style="margin-bottom: 15px; border-bottom: 1px solid #555; padding-bottom: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: #fff; font-size: 14px;">列显示控制</h4>
                        
                        <!-- Hidden Columns Section -->
                        <div style="margin-bottom: 10px;">
                            <h5 style="margin: 0 0 5px 0; color: #ccc; font-size: 12px;">隐藏列（显示更多信息）</h5>
                            <button id="qbt-show-all" style="
                                background: #4caf50;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                margin-right: 5px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 10px;
                            ">显示所有</button>
                            <button id="qbt-hide-all" style="
                                background: #f44336;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 10px;
                            ">隐藏所有</button>
                        </div>

                        <!-- Visible Columns Section -->
                        <div style="margin-bottom: 10px;">
                            <h5 style="margin: 0 0 5px 0; color: #ccc; font-size: 12px;">显示列（隐藏不需要的）</h5>
                            <button id="qbt-show-all-visible" style="
                                background: #4caf50;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                margin-right: 5px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 10px;
                            ">显示所有</button>
                            <button id="qbt-hide-all-visible" style="
                                background: #f44336;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 10px;
                            ">隐藏所有</button>
                        </div>
                    </div>
                    
                    <div id="qbt-hidden-column-list" style="margin-bottom: 10px;"></div>
                    <div id="qbt-visible-column-list" style="margin-bottom: 15px;"></div>
                    
                    <!-- Filter Controls -->
                    <div style="border-bottom: 1px solid #555; padding-bottom: 10px; margin-bottom: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: #fff; font-size: 14px;">数据过滤器</h4>
                        <div style="margin-bottom: 8px;">
                            <select id="qbt-filter-type" style="
                                background: #333;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 3px;
                                border-radius: 3px;
                                font-size: 11px;
                                margin-right: 5px;
                                width: 80px;
                            ">
                                <option value="save_path">保存路径</option>
                                <option value="name">名称</option>
                                <option value="category">分类</option>
                                <option value="tags">标签</option>
                                <option value="status">状态</option>
                                <option value="tracker">Tracker</option>
                            </select>
                            <select id="qbt-filter-mode" style="
                                background: #333;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 3px;
                                border-radius: 3px;
                                font-size: 11px;
                                margin-right: 5px;
                                width: 60px;
                            ">
                                <option value="exclude">排除</option>
                                <option value="include">仅显示</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <input type="text" id="qbt-filter-value" placeholder="输入过滤值..." style="
                                background: #333;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 3px 6px;
                                border-radius: 3px;
                                font-size: 11px;
                                width: 140px;
                                margin-right: 5px;
                            ">
                            <button id="qbt-add-filter" style="
                                background: #2196f3;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 11px;
                            ">添加</button>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <button id="qbt-clear-filters" style="
                                background: #ff9800;
                                border: none;
                                color: #fff;
                                padding: 4px 8px;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 11px;
                                margin-right: 5px;
                            ">清除所有</button>
                            <span id="qbt-filter-status" style="color: #aaa; font-size: 10px;">无活跃过滤器</span>
                        </div>
                    </div>
                    <div id="qbt-filter-list" style="margin-bottom: 10px;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(controlPanel);

        // Add event listeners
        setupControlPanelEvents();
        generateColumnList();
        refreshFilterList();
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

        // Show all hidden columns
        document.getElementById('qbt-show-all').addEventListener('click', () => {
            Object.keys(HIDDEN_COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, true);
                const checkbox = document.querySelector(`#qbt-hidden-${columnClass}`);
                if (checkbox) checkbox.checked = true;
            });
        });

        // Hide all hidden columns
        document.getElementById('qbt-hide-all').addEventListener('click', () => {
            Object.keys(HIDDEN_COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, false);
                const checkbox = document.querySelector(`#qbt-hidden-${columnClass}`);
                if (checkbox) checkbox.checked = false;
            });
        });

        // Show all visible columns
        document.getElementById('qbt-show-all-visible').addEventListener('click', () => {
            Object.keys(VISIBLE_COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, true);
                const checkbox = document.querySelector(`#qbt-visible-${columnClass}`);
                if (checkbox) checkbox.checked = true;
            });
        });

        // Hide all visible columns  
        document.getElementById('qbt-hide-all-visible').addEventListener('click', () => {
            Object.keys(VISIBLE_COLUMN_DEFINITIONS).forEach(columnClass => {
                toggleColumn(columnClass, false);
                const checkbox = document.querySelector(`#qbt-visible-${columnClass}`);
                if (checkbox) checkbox.checked = false;
            });
        });

        // Filter controls
        document.getElementById('qbt-add-filter').addEventListener('click', () => {
            const type = document.getElementById('qbt-filter-type').value;
            const mode = document.getElementById('qbt-filter-mode').value;
            const value = document.getElementById('qbt-filter-value').value;
            
            if (value.trim()) {
                addFilter(type, value.trim(), mode);
                document.getElementById('qbt-filter-value').value = '';
            }
        });

        // Enter key to add filter
        document.getElementById('qbt-filter-value').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('qbt-add-filter').click();
            }
        });

        // Clear all filters
        document.getElementById('qbt-clear-filters').addEventListener('click', () => {
            clearAllFilters();
        });
    }

    // Refresh filter list display
    function refreshFilterList() {
        const filterList = document.getElementById('qbt-filter-list');
        if (!filterList) return;
        
        filterList.innerHTML = '';
        
        activeFilters.forEach(filter => {
            const filterType = FILTER_TYPES[filter.type];
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 5px;
                padding: 4px 6px;
                background: #444;
                border-radius: 3px;
                font-size: 10px;
            `;
            
            const modeText = filter.mode === 'exclude' ? '排除' : '仅显示';
            const modeColor = filter.mode === 'exclude' ? '#f44336' : '#4caf50';
            
            item.innerHTML = `
                <div style="flex: 1; overflow: hidden;">
                    <span style="color: ${modeColor}; font-weight: bold;">[${modeText}]</span>
                    <span style="color: #aaa;">${filterType.name}:</span>
                    <span style="color: #fff;">${filter.value}</span>
                </div>
                <button onclick="removeFilter(${filter.id})" style="
                    background: #d32f2f;
                    border: none;
                    color: #fff;
                    padding: 2px 5px;
                    border-radius: 2px;
                    cursor: pointer;
                    font-size: 10px;
                    margin-left: 5px;
                ">×</button>
            `;
            
            filterList.appendChild(item);
        });
        
        updateFilterStatus();
    }

    // Generate column lists in control panel
    function generateColumnList() {
        generateHiddenColumnList();
        generateVisibleColumnList();
    }

    // Generate hidden column list
    function generateHiddenColumnList() {
        const columnList = document.getElementById('qbt-hidden-column-list');
        if (!columnList) return;
        
        columnList.innerHTML = '<h5 style="margin: 0 0 8px 0; color: #ccc; font-size: 11px;">隐藏列管理</h5>';

        Object.entries(HIDDEN_COLUMN_DEFINITIONS).forEach(([columnClass, info]) => {
            // Check visibility in both header and content tables
            const headerElement = document.querySelector(`#torrentsTableFixedHeaderDiv .${columnClass}`) || 
                                 document.querySelector(`#torrentsTableDiv .${columnClass}`) ||
                                 document.querySelector(`#transferList .${columnClass}`);
            const isVisible = headerElement && !headerElement.classList.contains('invisible');
            
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 4px;
                background: #333;
                border-radius: 3px;
            `;

            item.innerHTML = `
                <input type="checkbox" id="qbt-hidden-${columnClass}" ${isVisible ? 'checked' : ''} style="margin-right: 6px;">
                <label for="qbt-hidden-${columnClass}" style="
                    flex: 1;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                ">
                    <span style="font-weight: bold; font-size: 11px;">${info.name}</span>
                    <span style="font-size: 9px; color: #aaa;">${info.description}</span>
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

    // Generate visible column list  
    function generateVisibleColumnList() {
        const columnList = document.getElementById('qbt-visible-column-list');
        if (!columnList) return;
        
        columnList.innerHTML = '<h5 style="margin: 0 0 8px 0; color: #ccc; font-size: 11px;">显示列管理</h5>';

        Object.entries(VISIBLE_COLUMN_DEFINITIONS).forEach(([columnClass, info]) => {
            // Check visibility - for visible columns, default is visible unless explicitly hidden
            const headerElement = document.querySelector(`#torrentsTableFixedHeaderDiv .${columnClass}`) || 
                                 document.querySelector(`#torrentsTableDiv .${columnClass}`) ||
                                 document.querySelector(`#transferList .${columnClass}`);
            const isVisible = !headerElement || !headerElement.classList.contains('invisible');
            
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 4px;
                background: #333;
                border-radius: 3px;
            `;

            item.innerHTML = `
                <input type="checkbox" id="qbt-visible-${columnClass}" ${isVisible ? 'checked' : ''} style="margin-right: 6px;">
                <label for="qbt-visible-${columnClass}" style="
                    flex: 1;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                ">
                    <span style="font-weight: bold; font-size: 11px;">${info.name}</span>
                    <span style="font-size: 9px; color: #aaa;">${info.description}</span>
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
                const allCells = dataRows[0].querySelectorAll('td');
                console.log(`Data cells in first row: ${dataCells.length}`);
                console.log(`Total cells in first row: ${allCells.length}`);
                
                // Log first few cells to understand structure
                for (let i = 0; i < Math.min(5, allCells.length); i++) {
                    const cell = allCells[i];
                    console.log(`Cell ${i}: class="${cell.className}", visible=${!cell.classList.contains('invisible')}`);
                }
            }
        }
        
        // Check some specific columns
        Object.keys(HIDDEN_COLUMN_DEFINITIONS).slice(0, 3).forEach(columnClass => {
            const elements = document.querySelectorAll(`#transferList .${columnClass}`);
            console.log(`Column ${columnClass}: ${elements.length} elements found`);
            
            // Check column index
            const headerRow = contentTable?.querySelector('thead tr');
            if (headerRow) {
                const headers = headerRow.querySelectorAll('th');
                let columnIndex = -1;
                headers.forEach((header, index) => {
                    if (header.classList.contains(columnClass)) {
                        columnIndex = index;
                    }
                });
                console.log(`  Column index: ${columnIndex}`);
                
                if (columnIndex >= 0) {
                    const dataRows = contentTable.querySelectorAll('tbody tr');
                    let cellsFound = 0;
                    dataRows.forEach(row => {
                        if (row.children[columnIndex]) {
                            cellsFound++;
                        }
                    });
                    console.log(`  Data cells by index: ${cellsFound}`);
                }
            }
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
                // Reapply filters when table content changes
                if (activeFilters.length > 0) {
                    setTimeout(applyFilters, 100);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();