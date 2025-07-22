// ==UserScript==
// @name         qBittorrent Table Enhancer
// @namespace    https://github.com/your-username/qbittorrent-table-enhancer
// @version      1.0.0
// @description  Enhance qBittorrent web interface by showing hidden table columns
// @author       Your Name
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

    // Check if we're on a qBittorrent web interface
    function isQBittorrentInterface() {
        return document.title.includes('qBittorrent') || 
               document.querySelector('#downloadPage') || 
               document.querySelector('.mocha') ||
               document.querySelector('#transferList');
    }

    // Main function to enhance the table
    function enhanceTable() {
        if (!isQBittorrentInterface()) {
            return;
        }

        console.log('[qBittorrent Table Enhancer] Detected qBittorrent interface');
        
        // TODO: Add table enhancement logic here
        // This will be implemented to show hidden columns in the torrent table
        
        // For now, just log that the script is running
        console.log('[qBittorrent Table Enhancer] Script loaded successfully');
    }

    // Initialize the enhancement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceTable);
    } else {
        enhanceTable();
    }

    // Also monitor for dynamic content changes
    const observer = new MutationObserver(() => {
        enhanceTable();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();