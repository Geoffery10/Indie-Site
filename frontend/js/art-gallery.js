document.addEventListener('DOMContentLoaded', function() {
    const artGrid = document.getElementById('art-grid');
    const artStatus = document.getElementById('art-status');
    const modal = document.getElementById('art-modal');
    const modalImg = document.getElementById('full-art-image');
    const closeBtn = document.querySelector('.modal-close');

    let page = 1;
    const pageSize = 12; 
    let isLoading = false;
    let hasMore = true;

    let lastYear = null;
    let lastMonth = null;

    const baseUrl = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.startsWith('192.168') ?
                    'http://192.168.0.122:5000' :
                    'https://indie-api.geoffery10.com';

    async function fetchArt() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        try {
            const response = await fetch(`${baseUrl}/api/art?page=${page}&pageSize=${pageSize}`);
            const data = await response.json();

            if (!data || data.length < pageSize) {
                hasMore = false;
                artStatus.innerHTML = "That's all for now!";
            }

            data.forEach(item => {
                // --- NEW DATE PARSING LOGIC ---
                const itemDate = new Date(item.date);
                const currentYear = itemDate.getFullYear();
                const currentMonth = itemDate.toLocaleString('default', { month: 'long' });

                // Check for Year change
                if (currentYear !== lastYear) {
                    const yearHeader = document.createElement('h2');
                    yearHeader.className = 'grid-header year-header';
                    yearHeader.innerText = currentYear;
                    artGrid.appendChild(yearHeader);
                    lastYear = currentYear;
                    lastMonth = null; // Reset month so it triggers for the new year
                }

                // Check for Month change
                if (currentMonth !== lastMonth) {
                    const monthHeader = document.createElement('h3');
                    monthHeader.className = 'grid-header month-header';
                    monthHeader.innerText = currentMonth;
                    artGrid.appendChild(monthHeader);
                    lastMonth = currentMonth;
                }

                // --- EXISTING ART ITEM LOGIC ---
                const artItem = document.createElement('div');
                artItem.className = 'art-item';
                
                const img = document.createElement('img');
                const imgPath = item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`;
                img.src = `${baseUrl}${imgPath}`;
                img.alt = "Indie Art";
                img.loading = "lazy";

                artItem.appendChild(img);
                
                artItem.addEventListener('click', () => {
                    modal.style.display = "flex";
                    modalImg.src = `${baseUrl}${imgPath}`;
                });

                artGrid.appendChild(artItem);
            });

            page++;
            setTimeout(() => { checkIfMoreNeeded(); }, 100);

        } catch (error) {
            console.error("Error loading art:", error);
            artStatus.innerHTML = "Error loading gallery.";
        } finally {
            isLoading = false;
        }
    }

    // Modal Close Logic
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    // Infinite Scroll Logic (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchArt();
        }
    }, { 
        rootMargin: '200px', // Start loading when text is 200px away from view
        threshold: 0.1 
    });

    observer.observe(artStatus);

    // Initial Load
    fetchArt();
});