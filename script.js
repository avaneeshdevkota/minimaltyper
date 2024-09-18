function preprocessText(text) {

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

function updateCursor() {

    cursorElement.remove();
    const parentElement = document.getElementById(currentIndex).parentElement;
    parentElement.insertBefore(cursorElement, document.getElementById(currentIndex));
}

let typeText = "There was a leak in the boat. Nobody had yet noticed it, and nobody would for the next couple of hours. This was a problem since the boat was heading out to sea and while the leak was quite small at the moment, it would be much larger when it was ultimately discovered. John had planned it exactly this way.";
typeText = preprocessText(typeText);

let textContainer = document.createElement('div');
textContainer.setAttribute('id', 'textContainer')
textContainer.innerHTML = toInnerHTML(typeText);
document.body.appendChild(textContainer);


let currentIndex = 0;
let cursorElement = document.createElement('span');
cursorElement.setAttribute('id', 'cursor');
cursorElement.textContent = '|';

updateCursor();

document.onkeydown = (e) => {

    const pressedKey = e.key;

    if (pressedKey === 'Backspace') {

        previousIndex = currentIndex - 1 < 0 ? 0 : currentIndex - 1
        document.getElementById(previousIndex).style.color = '#cbcbcb';
        document.getElementById(previousIndex).style.textDecoration = 'none';
        currentIndex = previousIndex;
    }

    else if (pressedKey === typeText[currentIndex]) {
        document.getElementById(currentIndex).style.color = '#818181';
        currentIndex += 1
    }

    else if (pressedKey !== typeText[currentIndex]) {

        if (typeText[currentIndex] === ' ') {
            document.getElementById(currentIndex).style.textDecoration = 'underline';
        }

        document.getElementById(currentIndex).style.color = '#c30101';
        currentIndex += 1;
    }

    if (currentIndex === typeText.length) {
        alert('You have successfully typed the text.');
    }

    updateCursor();
}