document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('system-status-placeholder');

    if (placeholder) {
        fetch('/components/system-status.html')
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
                console.error('Error loading system status:', error);
                // Optional: Show a fallback system status
                placeholder.innerHTML = `
                    <div class="system-status panel">
                        <p>Systems status:</p>
                        <p>[ ERROR ]
                    </div>
                `;
            });
    }
});