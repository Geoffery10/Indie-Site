document.addEventListener('DOMContentLoaded', function() {
    const verseText = document.getElementById('verse-text');
    const verseReference = document.getElementById('verse-reference');

    // Determine the API endpoint based on the environment
    const apiUrl = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.startsWith('192.168') ?
                  'http://192.168.0.122:5000/api/bible-daily-verse' :
                  'https://api.indie.geoffery10.com/api/bible-daily-verse';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            verseText.textContent = data.verse;
            verseReference.textContent = data.reference;
        })
        .catch(error => {
            console.error('Error fetching Bible verse:', error);
            verseText.textContent = 'Could not load verse. Please try again later.';
            verseReference.textContent = '';
        });
});