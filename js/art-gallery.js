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
                const artItem = document.createElement('div');
                artItem.className = 'art-item';
                
                const img = document.createElement('img');
                // Ensure the URL is correctly constructed
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
            
            // --- NEW LOGIC: CHECK IF WE NEED MORE TO FILL THE SCREEN ---
            // We wait a tiny bit for the browser to render the new images
            setTimeout(() => {
                checkIfMoreNeeded();
            }, 100);

        } catch (error) {
            console.error("Error loading art:", error);
            artStatus.innerHTML = "Error loading gallery.";
        } finally {
            isLoading = false;
        }
    }

    // New helper function: If the "Loading" text is still visible, fetch the next page immediately
    function checkIfMoreNeeded() {
        if (!hasMore || isLoading) return;

        const rect = artStatus.getBoundingClientRect();
        // If the top of the 'art-status' div is above the bottom of the screen
        if (rect.top < window.innerHeight) {
            fetchArt();
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