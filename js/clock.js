function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    
    // Format the time as hh:mm AM/PM
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    const strTime = hours + ':' + minutes + ' ' + ampm;
    clockElement.textContent = strTime;
}

// Update immediately, then every 1 second
updateClock();
setInterval(updateClock, 1000);