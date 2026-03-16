document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('navigation-placeholder');

    if (placeholder) {
        fetch('/components/navigation.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                placeholder.innerHTML = data;
            })
            .catch(error => {
                console.error('Error loading navigation:', error);
                // Optional: Show a fallback navigation
                placeholder.innerHTML = `
                    <nav class="navigation panel">
                        <a href="/index.html" class="nav-btn">Home</a>
                        <a href="/projects.html" class="nav-btn">Projects</a>
                        <a href="/blogs.html" class="nav-btn">Blog</a>
                    </nav>
                `;
            });
    }
});