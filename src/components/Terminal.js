import { ApiClient } from '../api/client.js';

class DataBridge {
    constructor() {
        this.buffer = [];
        this.init();
    }

    async init() {
        // High-frequency polling with memory management
        setInterval(async () => {
            const payload = await ApiClient.fetchStream();
            if (payload) this.updateUI(payload);
        }, 3000);
    }

    updateUI(data) {
        const feed = document.querySelector('#api-feed');
        // Hanya simpan 50 log terakhir supaya browser tidak crash (Performance Optimization)
        if (this.buffer.length > 50) this.buffer.shift(); 
        
        this.buffer.push(data);
        feed.innerHTML = this.render();
    }

    render() {
        return this.buffer.map(item => `
            <div class="log-entry">
                <span class="timestamp">${new Date().toISOString()}</span>
                <code class="payload">${JSON.stringify(item)}</code>
            </div>
        `).join('');
    }
}
