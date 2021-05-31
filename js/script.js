const RANDOM_QUOTE_API_URL = 'http://api.quotable.io/random';
const quoteBox = document.getElementById("quoteBox");
const quoteInput = document.getElementById("quoteInput");
const statsSection = document.getElementById("stats");
const resetButton = document.getElementById("resetButton");
const timeLimit = 60;

let seconds = timeLimit;
let minutes = timeLimit/60;
let typedChars = 0;
let wrongTypedChars = 0;
let errors = 0;

function endGame() {
    getStats();
}

function renderStats(accuracy, wpm) {
    const accuracyText = document.createElement('p');
    accuracyText.innerHTML = "Accuracy = "+accuracy;
    const wpmText = document.createElement('p');
    wpmText.innerHTML = "Words per minute (WPM) = "+wpm;
    statsSection.append(accuracyText, wpmText);
}

function getStats() {
    console.log("Typed chars: "+typedChars);
    console.log("Wrong chars: "+wrongTypedChars);
    var accuracy, WPM;
    if (typedChars == 0){
        accuracy = 0;
        WPM = 0;
    } else {
        accuracy = (((typedChars - (wrongTypedChars + errors))/typedChars)*100).toFixed(2);
        WPM =  Math.floor((typedChars/5)/minutes);
    }
    console.log("Accuracy: "+accuracy);
    console.log("WPM: "+WPM);
    renderStats(accuracy, WPM);
}

function startTimer() {
    var timer = setInterval(function() {
        if (seconds == 0) {
            document.getElementById("timer").innerHTML = seconds;
            clearInterval(timer);
            quoteInput.disabled = true;
            endGame();
        } else {
            document.getElementById("timer").innerHTML = seconds;
            seconds -= 1;
        }
    }, 1000)
}

function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL).then(response => response.json()).then(data => data.content).catch(error => console.log(error))
}

async function renderNewQuote() {
    const quote = await getRandomQuote();
    quoteBox.innerHTML = '';
    quote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerHTML = char;
        quoteBox.appendChild(charSpan);
    });
    quoteInput.value = null;

}

quoteInput.addEventListener('focus', startTimer);

quoteInput.addEventListener('input', () => {
    const correctQuote = quoteBox.querySelectorAll('span');
    const userQuote = quoteInput.value.split('');

    typedChars+=1;
    errors = 0

    correctQuote.forEach((charSpan, index) => {
        const scannedChar = userQuote[index]

        if (scannedChar == null) {
            charSpan.classList.remove('correct');
            charSpan.classList.remove('incorrect');
        } else if (scannedChar == charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.add('remove');
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.add('correct');
            errors+=1;
            console.log("wrong chars: "+errors);
        }
    })

    if (userQuote.length == correctQuote.length) {
        wrongTypedChars += errors;
        renderNewQuote();
    }
});

resetButton.addEventListener('click', function() {
    quoteInput.disabled = false;
    quoteInput.value = '';
    quoteInput.blur();
    typedChars = 0;
    wrongTypedChars = 0;
    errors = 0;
    seconds = timeLimit;
    document.getElementById("timer").innerHTML = timeLimit;

    while(statsSection.firstChild) {
        statsSection.firstChild.remove();
    }

    renderNewQuote();
});

renderNewQuote()