document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar-left');

    hamburgerBtn.addEventListener('click', () => {
        // Toggles the 'active' class on the sidebar-left element
        sidebar.classList.toggle('active');
    });
});