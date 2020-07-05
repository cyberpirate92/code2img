const queryParams = new URLSearchParams(window.location.search);

const DEFAULTS = {
    FONT_SIZE: '13px',
    THEME: 'vsc-dark-plus',
};

let theme = queryParams.get('theme') || DEFAULTS.THEME;
const code = queryParams.get('code');
const language = queryParams.get('language');
const codeView = document.querySelector('#code');
const codeContainer = document.querySelector('#code-container');
const showLineNumbers = queryParams.has('line-numbers') && queryParams.get('line-numbers') === 'true';

if (language) {
    codeContainer.classList.add(`language-${language}`);
}

if (showLineNumbers) {
    codeContainer.classList.add('line-numbers');
}

injectTheme(theme);
injectStylesheetForTheme('./base.css');

if (code) {
    codeView.textContent = code;
    console.log('code set');
} else {
    codeView.textContent = 'No code snippet provided';
    console.warn('code not set');
}

console.log(`Theme: ${theme}`);
console.log(`Language: ${language}`);
console.log(`Line Numbers: ${showLineNumbers}`);

function injectStylesheetForTheme(stylesheetUrl) {
    let link = document.createElement('link');
    link.href = stylesheetUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

function injectTheme(themeName) {
    injectStylesheetForTheme(`./prism-themes/prism-${themeName}.css`);
}

window.LOAD_COMPLETE = true;