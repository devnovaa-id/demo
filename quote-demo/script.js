class RandomQuotesApp {
constructor() {
    // API Configuration
    this.API_URL = 'https://api.devnova.icu/api/tools/puppeteer';
    this.SOURCE_URL = 'https://quotes.toscrape.com';
    
    // State Management
    this.currentQuotes = [];
    this.history = JSON.parse(localStorage.getItem('quotesHistory')) || [];
    this.quoteCounter = parseInt(localStorage.getItem('quoteCounter')) || 1;
    this.currentPage = 1;
    
    // Canvas Configuration
    this.canvas = document.getElementById('quote-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasStyle = {
        width: 600,
        height: 300,
        backgroundColor: '#ffffff',
        textColor: '#212529',
        authorColor: '#4361ee',
        watermarkColor: '#adb5bd',
        fontFamily: 'Merriweather',
        authorFont: 'Inter'
    };
    
    // Initialize the application
    this.initElements();
    this.setupEventListeners();
    this.loadInitialData();
    this.updateTimestamp();
    
    // Start timestamp updater
    setInterval(() => this.updateTimestamp(), 60000);
}

initElements() {
    // Quote Display Elements
    this.quoteText = document.getElementById('quote-text');
    this.quoteAuthor = document.getElementById('quote-author');
    this.authorLink = document.getElementById('author-link');
    this.quoteTags = document.getElementById('quote-tags');
    this.quoteCounterEl = document.getElementById('quote-counter');
    this.totalQuotesEl = document.getElementById('total-quotes');
    this.quoteTimeEl = document.getElementById('quote-time');
    this.lastUpdatedEl = document.getElementById('last-updated');
    this.apiStatusEl = document.getElementById('api-status');
    
    // Containers
    this.loadingEl = document.getElementById('loading');
    this.quoteContainer = document.getElementById('quote-container');
    this.canvasPreview = document.getElementById('canvas-preview');
    this.quotesHistory = document.getElementById('quotes-history');
    
    // Buttons
    this.newQuoteBtn = document.getElementById('new-quote-btn');
    this.copyQuoteBtn = document.getElementById('copy-quote-btn');
    this.tweetQuoteBtn = document.getElementById('tweet-quote-btn');
    this.downloadQuoteBtn = document.getElementById('download-quote-btn');
    this.scrapeNowBtn = document.getElementById('scrape-now-btn');
    this.clearCacheBtn = document.getElementById('clear-cache-btn');
    this.testApiBtn = document.getElementById('test-api-btn');
    this.saveImageBtn = document.getElementById('save-image-btn');
    this.copyImageBtn = document.getElementById('copy-image-btn');
    this.shareImageBtn = document.getElementById('share-image-btn');
    this.closeCanvasBtn = document.getElementById('close-canvas-btn');
    
    // Controls
    this.pageSelect = document.getElementById('page-select');
    this.waitTimeSlider = document.getElementById('wait-time');
    this.waitTimeValue = document.getElementById('wait-time-value');
    this.includeTags = document.getElementById('include-tags');
    this.includeAuthor = document.getElementById('include-author');
    
    // Toast
    this.toast = document.getElementById('toast');
    this.toastIcon = document.getElementById('toast-icon');
    this.toastMessage = document.getElementById('toast-message');
}

setupEventListeners() {
    // Quote Actions
    this.newQuoteBtn.addEventListener('click', () => this.getRandomQuote());
    this.copyQuoteBtn.addEventListener('click', () => this.copyToClipboard());
    this.tweetQuoteBtn.addEventListener('click', () => this.shareOnTwitter());
    this.downloadQuoteBtn.addEventListener('click', () => this.generateCanvasImage());
    
    // Scraping Controls
    this.scrapeNowBtn.addEventListener('click', () => this.scrapeQuotes());
    this.clearCacheBtn.addEventListener('click', () => this.clearCache());
    this.testApiBtn.addEventListener('click', () => this.testApiConnection());
    
    // Canvas Actions
    this.saveImageBtn.addEventListener('click', () => this.saveCanvasImage());
    this.copyImageBtn.addEventListener('click', () => this.copyCanvasImage());
    this.shareImageBtn.addEventListener('click', () => this.shareCanvasImage());
    this.closeCanvasBtn.addEventListener('click', () => this.hideCanvasPreview());
    
    // Settings
    this.waitTimeSlider.addEventListener('input', (e) => {
        this.waitTimeValue.textContent = ${e.target.value}s;
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            this.getRandomQuote();
        }
        if (e.ctrlKey && e.code === 'KeyC') {
            e.preventDefault();
            this.copyToClipboard();
        }
        if (e.ctrlKey && e.code === 'KeyS') {
            e.preventDefault();
            this.scrapeQuotes();
        }
        if (e.code === 'Escape') {
            this.hideCanvasPreview();
        }
    });
}

async loadInitialData() {
    this.showLoading();
    
    // Check for cached data
    const cachedQuotes = localStorage.getItem('cachedQuotes');
    const lastScrape = localStorage.getItem('lastScrapeTime');
    
    if (cachedQuotes && lastScrape) {
        const lastScrapeDate = new Date(lastScrape);
        const now = new Date();
        const hoursDiff = (now - lastScrapeDate) / (1000 * 60 * 60);
        
        if (hoursDiff < 6) {
            this.currentQuotes = JSON.parse(cachedQuotes);
            this.updateStats();
            this.showToast('Loaded quotes from cache', 'info');
            this.getRandomQuote();
            this.hideLoading();
            return;
        }
    }
    
    // Scrape fresh quotes
    await this.scrapeQuotes();
}

async scrapeQuotes() {
    this.showLoading();
    this.apiStatusEl.textContent = 'Scraping...';
    this.apiStatusEl.className = 'stat-value status-offline';
    
    const page = this.pageSelect.value === 'random' 
        ? Math.floor(Math.random() * 10) + 1 
        : parseInt(this.pageSelect.value);
    
    const waitTime = parseFloat(this.waitTimeSlider.value) * 1000;
    
    const config = {
        url: ${this.SOURCE_URL}/page/${page}/,
        type: 'data',
        waitUntil: 'networkidle2',
        timeout: 30000,
        waitForTimeout: waitTime,
        viewport: { width: 1920, height: 1080 },
        extractors: {
            selectors: {
                quotes: {
                    selector: '.quote',
                    multiple: true,
                    type: 'html'
                }
            }
        }
    };
    
    try {
        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });
        
        if (!response.ok) {
            throw new Error(API Error: ${response.status});
        }
        
        const data = await response.json();
        
        if (data.success && data.data?.standard?.custom?.quotes) {
            this.processQuotes(data.data.standard.custom.quotes, page);
            this.apiStatusEl.textContent = 'Live';
            this.apiStatusEl.className = 'stat-value status-live';
            this.showToast(Successfully scraped ${this.currentQuotes.length} quotes from page ${page}, 'success');
            
            // Cache the quotes
            localStorage.setItem('cachedQuotes', JSON.stringify(this.currentQuotes));
            localStorage.setItem('lastScrapeTime', new Date().toISOString());
            
            // Update last updated time
            this.lastUpdatedEl.textContent = new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Display a random quote
            this.getRandomQuote();
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        console.error('Scraping failed:', error);
        this.apiStatusEl.textContent = 'Offline';
        this.apiStatusEl.className = 'stat-value status-offline';
        this.showToast(Scraping failed: ${error.message}. Using cached quotes., 'error');
        this.useFallbackQuotes();
        this.getRandomQuote();
    } finally {
        this.hideLoading();
    }
}

processQuotes(quotesHTML, page) {
    this.currentQuotes = [];
    const parser = new DOMParser();
    
    quotesHTML.forEach(html => {
        try {
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract quote text
            const textEl = doc.querySelector('.text');
            let text = textEl ? textEl.textContent.trim() : '';
            text = text.replace(/^"|"$/g, '');
            
            // Extract author
            const authorEl = doc.querySelector('.author');
            const author = authorEl ? authorEl.textContent.trim() : 'Unknown';
            
            // Extract author link
            const authorLinkEl = doc.querySelector('a[href^="/author/"]');
            const authorLink = authorLinkEl ? ${this.SOURCE_URL}${authorLinkEl.getAttribute('href')} : '';
            
            // Extract tags
            const tags = [];
            const tagEls = doc.querySelectorAll('.tag');
            tagEls.forEach(tagEl => {
                const tagText = tagEl.textContent.trim();
                const tagLink = ${this.SOURCE_URL}${tagEl.getAttribute('href')};
                if (tagText) {
                    tags.push({
                        text: tagText,
                        link: tagLink
                    });
                }
            });
            
            if (text && author) {
                this.currentQuotes.push({
                    id: Date.now() + Math.random(),
                    text,
                    author,
                    authorLink,
                    tags,
                    timestamp: new Date().toISOString(),
                    sourcePage: page
                });
            }
        } catch (error) {
            console.warn('Failed to parse quote HTML:', error);
        }
    });
    
    this.updateStats();
    this.currentPage = page;
}

getRandomQuote() {
    if (this.currentQuotes.length === 0) {
        this.showToast('No quotes available. Please scrape first.', 'warning');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * this.currentQuotes.length);
    const quote = this.currentQuotes[randomIndex];
    
    this.displayQuote(quote);
    this.addToHistory(quote);
    
    // Update counter
    this.quoteCounter++;
    this.quoteCounterEl.textContent = this.quoteCounter;
    localStorage.setItem('quoteCounter', this.quoteCounter.toString());
}

displayQuote(quote) {
    // Update quote text
    this.quoteText.textContent = "${quote.text}";
    
    // Update author
    this.quoteAuthor.textContent = quote.author;
    
    // Update author link
    if (quote.authorLink) {
        this.authorLink.href = quote.authorLink;
        this.authorLink.style.display = 'flex';
    } else {
        this.authorLink.style.display = 'none';
    }
    
    // Update tags
    this.quoteTags.innerHTML = '';
    if (this.includeTags.checked && quote.tags.length > 0) {
        quote.tags.forEach(tag => {
            const tagEl = document.createElement('a');
            tagEl.className = 'tag';
            tagEl.href = tag.link;
            tagEl.target = '_blank';
            tagEl.textContent = tag.text;
            tagEl.title = View more quotes tagged "${tag.text}";
            this.quoteTags.appendChild(tagEl);
        });
    } else if (this.includeTags.checked) {
        const noTags = document.createElement('span');
        noTags.className = 'tag';
        noTags.textContent = 'No tags';
        noTags.style.opacity = '0.6';
        this.quoteTags.appendChild(noTags);
    }
    
    // Show the quote container
    this.hideLoading();
    this.quoteContainer.classList.remove('hidden');
    this.quoteContainer.classList.add('fade-in');
    
    // Hide canvas preview
    this.hideCanvasPreview();
}

addToHistory(quote) {
    // Remove existing duplicate
    const existingIndex = this.history.findIndex(item => item.id === quote.id);
    if (existingIndex !== -1) {
        this.history.splice(existingIndex, 1);
    }
    
    // Add to beginning of history
    this.history.unshift({
        ...quote,
        displayNumber: this.quoteCounter
    });
    
    // Keep only last 10 quotes in history
    if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
    }
    
    localStorage.setItem('quotesHistory', JSON.stringify(this.history));
    this.renderHistory();
}

renderHistory() {
    this.quotesHistory.innerHTML = '';
    
    if (this.history.length === 0) {
        this.quotesHistory.innerHTML = 
            <div class="empty-history">
                <i class="fas fa-inbox"></i>
                <p>No history yet. Start scraping quotes!</p>
            </div>
        ;
        return;
    }
    
    this.history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.addEventListener('click', () => this.loadHistoryQuote(index));
        
        const quoteEl = document.createElement('p');
        quoteEl.className = 'history-quote';
        const shortText = item.text.length > 80 
            ? item.text.substring(0, 80) + '...' 
            : item.text;
        quoteEl.textContent = "${shortText}";
        
        const authorEl = document.createElement('p');
        authorEl.className = 'history-author';
        authorEl.textContent = — ${item.author} (#${item.displayNumber});
        
        historyItem.appendChild(quoteEl);
        historyItem.appendChild(authorEl);
        this.quotesHistory.appendChild(historyItem);
    });
}

loadHistoryQuote(index) {
    const quote = this.history[index];
    this.displayQuote(quote);
    this.showToast('Loaded quote from history', 'info');
}

async generateCanvasImage() {
    this.showToast('Generating image...', 'info');
    
    const originalText = this.downloadQuoteBtn.innerHTML;
    this.downloadQuoteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    this.downloadQuoteBtn.disabled = true;
    
    try {
        // Set fixed canvas size
        this.canvas.width = this.canvasStyle.width;
        this.canvas.height = this.canvasStyle.height;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = this.canvasStyle.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw decorative left border
        this.ctx.fillStyle = this.canvasStyle.authorColor;
        this.ctx.fillRect(0, 0, 6, this.canvas.height);
        
        // Get quote data
        const text = this.quoteText.textContent.replace(/^"|"$/g, '');
        const author = this.quoteAuthor.textContent;
        
        // Draw quote text with wrapping
        this.ctx.fillStyle = this.canvasStyle.textColor;
        this.ctx.font = italic 24px "${this.canvasStyle.fontFamily}";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const maxWidth = this.canvas.width - 80;
        const lineHeight = 32;
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = this.ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        // Calculate starting Y position
        const startY = (this.canvas.height / 2) - ((lines.length * lineHeight) / 2);
        
        // Draw each line
        lines.forEach((line, index) => {
            this.ctx.fillText(line, this.canvas.width / 2, startY + (index * lineHeight));
        });
        
        // Draw author
        this.ctx.fillStyle = this.canvasStyle.authorColor;
        this.ctx.font = bold 20px "${this.canvasStyle.authorFont}";
        this.ctx.fillText(— ${author}, this.canvas.width / 2, startY + (lines.length * lineHeight) + 20);
        
        // Draw watermark
        this.ctx.fillStyle = this.canvasStyle.watermarkColor;
        this.ctx.font = '12px "Inter"';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Generated by DevNova Quotes', this.canvas.width - 20, this.canvas.height - 15);
        
        // Show canvas preview
        this.showCanvasPreview();
        this.showToast('Image generated successfully!', 'success');
        
    } catch (error) {
        console.error('Canvas generation failed:', error);
        this.showToast('Failed to generate image', 'error');
    } finally {
        this.downloadQuoteBtn.innerHTML = originalText;
        this.downloadQuoteBtn.disabled = false;
    }
}

saveCanvasImage() {
    try {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = quote-${timestamp}.png;
        link.href = dataURL;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Image saved successfully!', 'success');
    } catch (error) {
        console.error('Failed to save image:', error);
        this.showToast('Failed to save image', 'error');
    }
}

async copyCanvasImage() {
    try {
        this.canvas.toBlob(async (blob) => {
            try {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                this.showToast('Image copied to clipboard!', 'success');
            } catch (error) {
                // Fallback: convert to data URL and use execCommand
                const dataURL = this.canvas.toDataURL('image/png');
                const textArea = document.createElement('textarea');
                textArea.value = dataURL;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Image URL copied to clipboard!', 'success');
            }
        });
    } catch (error) {
        console.error('Failed to copy image:', error);
        this.showToast('Failed to copy image', 'error');
    }
}

shareCanvasImage() {
    this.showToast('Sharing feature coming soon!', 'info');
    // Future implementation for social sharing
}

showCanvasPreview() {
    this.canvasPreview.classList.remove('hidden');
    this.canvasPreview.classList.add('fade-in');
}

hideCanvasPreview() {
    this.canvasPreview.classList.add('hidden');
}

async copyToClipboard() {
    const quote = this.quoteText.textContent;
    const author = this.quoteAuthor.textContent;
    const textToCopy = ${quote}\n\n— ${author}\n\nGenerated by DevNova Random Quotes Generator;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        this.showToast('Quote copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.showToast('Quote copied to clipboard!', 'success');
    }
}

shareOnTwitter() {
    const quote = this.quoteText.textContent.replace(/^"|"$/g, '');
    const author = this.quoteAuthor.textContent;
    const text = "${quote}" — ${author};
    const url = https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=Quotes,Inspiration,DevNova`;
    
    window.open(url, '_blank', 'width=550,height=420');
}

async testApiConnection() {
    this.showToast('Testing API connection...', 'info');
    
    try {
        const response = await fetch(this.API_URL, {
            method: 'OPTIONS'
        });
        
        if (response.ok) {
            this.showToast('API connection successful!', 'success');
            this.apiStatusEl.textContent = 'Live';
            this.apiStatusEl.className = 'stat-value status-live';
        } else {
            throw new Error(HTTP ${response.status});
        }
    } catch (error) {
        this.showToast(API connection failed: ${error.message}, 'error');
        this.apiStatusEl.textContent = 'Offline';
        this.apiStatusEl.className = 'stat-value status-offline';
    }
}

clearCache() {
    localStorage.removeItem('cachedQuotes');
    localStorage.removeItem('lastScrapeTime');
    localStorage.removeItem('quotesHistory');
    localStorage.removeItem('quoteCounter');
    
    this.currentQuotes = [];
    this.history = [];
    this.quoteCounter = 1;
    this.quoteCounterEl.textContent = '1';
    
    this.updateStats();
    this.renderHistory();
    this.showToast('All cache cleared successfully!', 'success');
}

useFallbackQuotes() {
    this.currentQuotes = [
        {
            id: 1,
            text: "The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.",
            author: "Albert Einstein",
            authorLink: "https://quotes.toscrape.com/author/Albert-Einstein",
            tags: [
                { text: "change", link: "https://quotes.toscrape.com/tag/change/" },
                { text: "deep-thoughts", link: "https://quotes.toscrape.com/tag/deep-thoughts/" },
                { text: "thinking", link: "https://quotes.toscrape.com/tag/thinking/" },
                { text: "world", link: "https://quotes.toscrape.com/tag/world/" }
            ],
            timestamp: new Date().toISOString(),
            sourcePage: 1
        },
        {
            id: 2,
            text: "It is our choices, Harry, that show what we truly are, far more than our abilities.",
            author: "J.K. Rowling",
            authorLink: "https://quotes.toscrape.com/author/J-K-Rowling",
            tags: [
                { text: "abilities", link: "https://quotes.toscrape.com/tag/abilities/" },
                { text: "choices", link: "https://quotes.toscrape.com/tag/choices/" }
            ],
            timestamp: new Date().toISOString(),
            sourcePage: 1
        },
        {
            id: 3,
            text: "There are only two ways to live your life. One is as though nothing is a miracle. The other is as though everything is a miracle.",
            author: "Albert Einstein",
            authorLink: "https://quotes.toscrape.com/author/Albert-Einstein",
            tags: [
                { text: "inspirational", link: "https://quotes.toscrape.com/tag/inspirational/" },
                { text: "life", link: "https://quotes.toscrape.com/tag/life/" },
                { text: "live", link: "https://quotes.toscrape.com/tag/live/" },
                { text: "miracle", link: "https://quotes.toscrape.com/tag/miracle/" },
                { text: "miracles", link: "https://quotes.toscrape.com/tag/miracles/" }
            ],
            timestamp: new Date().toISOString(),
            sourcePage: 1
        }
    ];
    
    this.updateStats();
    this.showToast('Using fallback quotes', 'warning');
}

updateStats() {
    this.totalQuotesEl.textContent = this.currentQuotes.length;
    this.lastUpdatedEl.textContent = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

updateTimestamp() {
    const now = new Date();
    this.quoteTimeEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

showLoading() {
    this.loadingEl.classList.remove('hidden');
    this.quoteContainer.classList.add('hidden');
    this.canvasPreview.classList.add('hidden');
}

hideLoading() {
    this.loadingEl.classList.add('hidden');
    this.quoteContainer.classList.remove('hidden');
}

showToast(message, type = 'info') {
    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    // Set color based on type
    const colors = {
        success: '#4cc9f0',
        error: '#f94144',
        warning: '#f8961e',
        info: '#4361ee'
    };
    
    this.toastIcon.className = fas ${icons[type]}`;
    this.toast.style.borderLeftColor = colors[type];
    this.toastMessage.textContent = message;
    
    // Show toast
    this.toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        this.toast.classList.remove('show');
    }, 3000);
}
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
// Create and initialize the app
const app = new RandomQuotesApp();

// Expose app globally for debugging (optional)
window.quoteApp = app;

// Additional initialization if needed
console.log('Random Quotes Generator initialized successfully!');
});
