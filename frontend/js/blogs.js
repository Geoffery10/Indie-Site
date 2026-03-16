document.addEventListener('DOMContentLoaded', function() {
    const blogList = document.getElementById('blog-list');
    const blogStatus = document.getElementById('blog-status');

    let page = 1;
    const pageSize = 5; // Load 5 blogs at a time
    let isLoading = false;
    let hasMore = true;

    // Detect Environment
    const baseUrl = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.startsWith('192.168') ?
                    'http://192.168.0.122:5000' :
                    'https://indie-api.geoffery10.com';

    async function fetchBlogs() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        try {
            const response = await fetch(`${baseUrl}/api/blogs?page=${page}&pageSize=${pageSize}`);
            const data = await response.json();

            // Check if we reached the end
            if (!data.articles || data.articles.length === 0) {
                hasMore = false;
                blogStatus.innerHTML = ""; // Clear loading text
                blogStatus.style.padding = "0";
                return;
            }

            // Loop through articles and create the HTML cards
            data.articles.forEach(article => {
                const card = document.createElement('a');
                card.className = 'article-card panel';
                
                // Point to a generic viewer page, passing the Markdown ID
                card.href = `/view-blog.html?id=${encodeURIComponent(article.link)}`;
                
                // Format the Date (e.g., 2/25/2026)
                const dateObj = new Date(article.date);
                const dateStr = dateObj.toLocaleDateString('en-US');

                // Handle the thumbnail URL
                let thumbSrc = article.thumbnail;
                if(thumbSrc.startsWith('/')) {
                    thumbSrc = `${baseUrl}${thumbSrc}`;
                }

                card.innerHTML = `
                    <img src="${thumbSrc}" class="article-thumb" alt="${article.title}">
                    <div class="article-info">
                        <h2>${article.title}</h2>
                        <p>${article.description}</p>
                        <p class="timestamp">${dateStr}</p>
                    </div>
                `;

                blogList.appendChild(card);
            });

            page++;
            
            // If we got fewer items than requested, we are at the end
            if (data.articles.length < pageSize) {
                hasMore = false;
                blogStatus.innerHTML = "";
            } else {
                // Check if screen is full, if not load more immediately
                setTimeout(checkIfMoreNeeded, 100);
            }

        } catch (error) {
            console.error("Error loading blogs:", error);
            blogStatus.innerHTML = "Error loading blogs.";
        } finally {
            isLoading = false;
        }
    }

    function checkIfMoreNeeded() {
        if (!hasMore || isLoading) return;
        const rect = blogStatus.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            fetchBlogs();
        }
    }

    // Infinite Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchBlogs();
        }
    }, { rootMargin: '200px', threshold: 0.1 });

    observer.observe(blogStatus);

    // Initial Load
    fetchBlogs();
});
