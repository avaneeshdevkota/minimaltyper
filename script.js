async function getArticleID() {

    let url = "https://en.wikipedia.org/w/api.php?origin=*"; 

    let params = {
        action: "query",
        format: "json",
        list: "random",
        rnlimit: "1",
        rnnamespace: "0"
    };

    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

    try {
        let response = await fetch(url);
        let json = await response.json();
        return json.query.random[0].id;
    }

    catch(error) {
        console.log(error);
    }
}

async function getArticleContent(articleID) {
    
        let url = "https://en.wikipedia.org/w/api.php?origin=*"; 
    
        let params = {
            action: "query",
            format: "json",
            prop: "extracts",
            exintro: "",
            explaintext: "",
            pageids: articleID
        };
    
        Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    
        try {
            let response = await fetch(url);
            let json = await response.json();
            return json.query.pages[articleID].extract;
        }
    
        catch(error) {
            console.log(error);
        }
}

function preprocessText(text) {

    let word_array = text.split(' ');
    let n = word_array.length;

    if (n > 60) {
        word_array = word_array.slice(0, 60);
    }

    text = word_array.join(' ');
    text = text.toLowerCase();
    text = text.replace(/[^a-z\s]/g, '');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    return text;
}

function splitWord(word, index) {

    let ch_array = word.split('');
    let n = ch_array.length;

    for (let i = 0; i < n; i++) {
        ch_array[i] = `<span id = ${index}>${ch_array[i] === ' ' ? '&nbsp;' : ch_array[i]}</span>`;
        index += 1;
    }

    ch_array.push(`<span id = ${index}>&nbsp;</span>`);
    return [ch_array.join(''), index + 1];
}

function toInnerHTML(str) {

    word_array = str.split(' ');
    let index = 0;

    for (let i = 0; i < word_array.length; i++) {
        [insideSpan, index] = splitWord(word_array[i], index);
        word_array[i] = `<div class = 'word'>${insideSpan}</div>`;
    }

    return word_array.join('');
};

async function getRandomArticle() {

    const articleID = await getArticleID();
    const articleContent = await getArticleContent(articleID);
    let text = preprocessText(articleContent);
    let textInner = toInnerHTML(text);
    return [text, textInner];
}

async function main() {

    let [text, textInner] = await getRandomArticle();
    let userTyped = [];

    let textContainer = document.createElement('div');
    textContainer.setAttribute('id', 'textContainer');


    textContainer.innerHTML = textInner;

    let stopwatch = document.createElement('div');
    stopwatch.setAttribute('id', 'stopwatch');
    stopwatch.textContent = '00:00';
    
    let banner = document.createElement('div');
    banner.setAttribute('id', 'banner');
    banner.textContent = 'Press Enter to start typing.';
    
    let started = false;
    let startTime;

    document.body.appendChild(banner);
    document.body.appendChild(textContainer);

    cursorElement.textContent = '|';
    updateCursor();

    document.onkeydown = (e) => {

        const pressedKey = e.key;

        if (!started && pressedKey === 'Enter') {

            started = true;
            banner.remove();
            document.body.insertBefore(stopwatch, textContainer);

            startTime = new Date().getTime();

            setInterval(() => {
                let currentTime = new Date().getTime();
                let elapsedTime = currentTime - startTime;
                let minutes = Math.floor(elapsedTime / 60000);
                let seconds = Math.floor((elapsedTime % 60000) / 1000);
                stopwatch.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            }, 1000);
        }

        else if (started) {
    
            if (pressedKey === 'Backspace') {
        
                previousIndex = currentIndex - 1 < 0 ? 0 : currentIndex - 1
                document.getElementById(previousIndex).style.color = '#cbcbcb';
                document.getElementById(previousIndex).style.textDecoration = 'none';
                currentIndex = previousIndex;
                
                if (userTyped.length > 0) {
                    userTyped.pop();
                }
            }
        
            else if (pressedKey === text[currentIndex]) {

                document.getElementById(currentIndex).style.color = '#818181';
                currentIndex += 1;
            }
        
            else if (pressedKey !== text[currentIndex]) {
        
                if (text[currentIndex] === ' ') {
                    document.getElementById(currentIndex).style.textDecoration = 'underline';
                }
        
                document.getElementById(currentIndex).style.color = '#c30101';
                currentIndex += 1;
            }

            if (pressedKey.length == 1 && pressedKey.match(/[a-z ]/i)) {
                userTyped.push(pressedKey);
            }
        
            if (currentIndex === text.length) {

                textContainer.remove();
                stopwatch.remove();

                let wpm = Math.floor(text.split(' ').length / (parseInt(stopwatch.textContent.split(':')[0]) + parseInt(stopwatch.textContent.split(':')[1]) / 60));
                let accuracy = calculateAccuracy(userTyped, text);
                let logoh1 = document.getElementById('minimal');

                let wpmElement = document.createElement('div');
                let accuracyElement = document.createElement('div');

                wpmElement.setAttribute('id', 'wpm');
                accuracyElement.setAttribute('id', 'accuracy');

                logoh1.textContent = 'Your Results';
                wpmElement.textContent = `WPM: ${wpm}`;
                accuracyElement.textContent = `Accuracy: ${accuracy * 100}%`;

                document.body.appendChild(wpmElement);
                document.body.appendChild(accuracyElement);
            }

            updateCursor();
        }
    }
}

function calculateAccuracy(userTyped, text) {

    let n = text.length;
    let correct = 0;

    for (let i = 0; i < n; i++) {
        console.log(text[i], userTyped[i]);
        if (text[i] === userTyped[i]) {
            correct += 1;
        }
    }

    return Math.round(correct / n * 100) / 100;
}

function updateCursor() {

    cursorElement.remove();
    const parentElement = document.getElementById(currentIndex).parentElement;
    parentElement.insertBefore(cursorElement, document.getElementById(currentIndex));
}

let cursorElement = document.createElement('span');
cursorElement.setAttribute('id', 'cursor');
let currentIndex = 0;
main();