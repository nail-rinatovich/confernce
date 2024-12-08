const startBtn = document.getElementById('start-btn');
const subtitlesDiv = document.getElementById('subtitles');
const createConferenceBtn = document.getElementById('create-conference-btn');
const joinConferenceBtn = document.getElementById('join-conference-btn');
const joinForm = document.getElementById('join-form');
const conferenceCodeInput = document.getElementById('conference-code');

let recognition;
let ws;  // WebSocket connection
let conferenceCode = null;  // Store the current conference code

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    // Set up the speech recognition object
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    // Event listener for when speech is recognized
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        subtitlesDiv.textContent = transcript;

        // Send recognized speech to the server
        if (ws && ws.readyState === WebSocket.OPEN && conferenceCode) {
            ws.send(JSON.stringify({ conferenceCode, transcript }));
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
    };

    startBtn.addEventListener('click', () => {
        recognition.start();
        startBtn.disabled = true;
        startBtn.textContent = 'Listening...';
    });

    // WebSocket setup (connect to the server)
    ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'transcript') {
            subtitlesDiv.textContent = message.transcript;  // Update subtitles
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    // Create Conference button
    createConferenceBtn.addEventListener('click', () => {
        const code = generateConferenceCode();
        conferenceCode = code;
        alert('Conference created! Conference code: ' + conferenceCode);

        // Send the conference code to the server
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'create', conferenceCode }));
        }

        // Show the join form
        joinForm.style.display = 'block';
    });

    // Join Conference button
    joinConferenceBtn.addEventListener('click', () => {
        const code = conferenceCodeInput.value.trim();
        if (code) {
            conferenceCode = code;
            alert('Joined conference with code: ' + conferenceCode);

            // Send the conference code to the server
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'join', conferenceCode }));
            }

            // Hide the join form
            joinForm.style.display = 'none';
        }
    });

} else {
    alert('Your browser does not support Speech Recognition.');
}

// Function to generate a random conference code (e.g., a 6-digit code)
function generateConferenceCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}
