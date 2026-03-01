document.addEventListener('DOMContentLoaded', function() {
    const projectList = document.getElementById('project-list');
    const projectStatus = document.getElementById('project-status');

    let page = 1;
    const pageSize = 5; // Load 5 projects at a time
    let isLoading = false;
    let hasMore = true;

    // Detect Environment
    const baseUrl = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.startsWith('192.168') ?
                    'http://192.168.0.122:5000' :
                    'https://indie-api.geoffery10.com';

    async function fetchProjects() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        try {
            const response = await fetch(`${baseUrl}/api/projects?page=${page}&pageSize=${pageSize}`);
            const data = await response.json();

            // Check if we reached the end
            if (!data.articles || data.articles.length === 0) {
                hasMore = false;
                projectStatus.innerHTML = ""; // Clear loading text
                projectStatus.style.padding = "0";
                return;
            }

            // Loop through articles and create the HTML cards
            data.articles.forEach(article => {
                const card = document.createElement('a');
                card.className = 'article-card panel';
                
                // Point to a generic viewer page, passing the Markdown ID
                card.href = `/view-project.html?id=${encodeURIComponent(article.link)}`;
                
                // Format the Date (e.g., 2/25/2026)
                const dateObj = new Date(article.date);
                const dateStr = dateObj.toLocaleDateString('en-US');

                // Handle the thumbnail URL (API now handles rewriting, so it might be absolute or relative)
                // If it starts with /api, prepend base url. If it's http, leave it.
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

                projectList.appendChild(card);
            });

            page++;
            
            // If we got fewer items than requested, we are at the end
            if (data.articles.length < pageSize) {
                hasMore = false;
                projectStatus.innerHTML = "";
            } else {
                // Check if screen is full, if not load more immediately
                setTimeout(checkIfMoreNeeded, 100);
            }

        } catch (error) {
            console.error("Error loading projects:", error);
            projectStatus.innerHTML = "Error loading projects.";
        } finally {
            isLoading = false;
        }
    }

    function checkIfMoreNeeded() {
        if (!hasMore || isLoading) return;
        const rect = projectStatus.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            fetchProjects();
        }
    }

    // Infinite Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchProjects();
        }
    }, { rootMargin: '200px', threshold: 0.1 });

    observer.observe(projectStatus);

    // Initial Load
    fetchProjects();
});