const startBtn = document.getElementById('start-btn');
const subtitlesDiv = document.getElementById('subtitles');

let recognition;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    // Set up the speech recognition object
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true; // Keep recognizing as long as the user speaks
    recognition.interimResults = true; // Show partial results before finishing
    recognition.lang = 'ru-RU'; // Set the language to English

    // Event listener for when speech is recognized
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        subtitlesDiv.textContent = transcript; // Update subtitles
    };

    // Event listener for any errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    // Event listener when speech recognition ends
    recognition.onend = () => {
        console.log('Speech recognition ended.');
    };

    // Start listening when the button is clicked
    startBtn.addEventListener('click', () => {
        recognition.start();
        startBtn.disabled = true;
        startBtn.textContent = 'Listening...';
    });
} else {
    alert('Your browser does not support Speech Recognition.');
}
