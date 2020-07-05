var express = require('express');
var app = express();
var http = require('http').Server(app);
const puppeteer = require('puppeteer');
var port = process.env.PORT || 3000;
const hostname = `http://localhost:${port}`;
const fs = require('fs');
const { performance } = require('perf_hooks');
const Nightmare = require('nightmare');
const screenshotSelector = require('nightmare-screenshot-selector');

Nightmare.action('screenshotSelector', screenshotSelector);

const DEFAULTS = {
    VIEWPORT: {
        WIDTH: 1000,
        HEIGHT: 1000,
        DEVICE_SCALE_FACTOR: 2,
    },
    INDEX_PAGE: 'preview.html',
};

app.use(express.text());

app.use(express.static(__dirname + '/public'));

let themes = [];
let languages = [
    'c', 
    'css', 
    'cpp', 
    'go', 
    'html', 
    'java', 
    'javascript',
    'python',
    'rust',
    'typescript'
];

// https://stackoverflow.com/a/58587764/2526437
let chromiumLaunchOptions = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
];

fs.readdir('./public/prism-themes', (err, files) => {
    themes = files.map(file => file.substring(6, file.length-4)).filter(theme => theme.trim().length > 0);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + `/public/${DEFAULTS.INDEX_PAGE}`);
});

app.get('/api/themes', (request, response) => {
    response.contentType('json');
    response.send(JSON.stringify(themes));
});

app.get('/api/languages', (request, response) => {
    response.contentType('json');
    response.send(JSON.stringify(languages));
});

app.get('/api/previewUrl', (request, response) => {
    response.send({
        hostname
    });
});


// using puppeteer for rendering 
app.post('/api/to-image', async (request, response) => {
    try {
        const tStart = performance.now();
        console.log('');
        console.log('🎉 ', request.url);
        console.log('🛠 ', `Rendering Method: Puppeteer, Chromium headless`);
        
        const theme = request.query['theme'];
        const language = request.query['language'];
        const lineNumbers = request.query['line-numbers'];
        
        let width = DEFAULTS.VIEWPORT.WIDTH;
        let scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        
        if (typeof request.body != 'string') {
            console.log('❌ ', 'Code snippet missing');
            sendErrorResponse(response, {
                message: 'Code snippet missing, please include it in the request body',
            });
            return;
        }
        
        if (!language || languages.indexOf(language) === -1) {
            console.log('❌ ', !language ? 'Language not specified' : `Unknown language '${language}'`);
            sendErrorResponse(response, {
                message: !language ? 'language missing: please specify a language' : `Unknown language '${language}'`,
                availableLanguages: languages,
            });
            return;
        }
        
        if (themes.indexOf(theme) === -1) {
            console.log('❌ ', `Unknown theme '${theme}'`);
            sendErrorResponse(response, {
                message: `Unknown theme: '${theme}'`,
                availableThemes: themes,
            });
            return;
        }
        
        try {
            scaleFactor = parseInt(request.query['scale']) || DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
            scaleFactor = Math.min(Math.max(1, scaleFactor), 5); // Make sure number is in range between 1-5
        } catch (e) {
            scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        }
        
        console.log('🛠 ', `Theme: ${theme}`);
        console.log('🛠 ', `Language: ${language}`);
        console.log('🛠 ', `Line Numbers: ${lineNumbers}`);
        console.log('🛠 ', `Scale Factor: ${scaleFactor}`);
        console.log('🛠 ', `width: ${width}`);
        
        try {
            width = Math.min(Math.abs(parseInt(request.query['width'])), 1920);
        } catch (exception) {
            console.warn('Invalid width', exception);
            width = DEFAULTS.VIEWPORT.WIDTH;
        }
        
        let queryParams = new URLSearchParams();
        theme && queryParams.set('theme', theme);
        language && queryParams.set('language', language);
        queryParams.set('line-numbers', lineNumbers === 'true' ? lineNumbers : 'false');
        queryParams.set('code', request.body);
        
        const queryParamsString = queryParams.toString();
        const pageUrl = `${hostname}/?${queryParamsString}`;
        
        console.log('🛠 ', 'Preview Page URL', pageUrl);
        let browser = await puppeteer.launch({
            args: chromiumLaunchOptions
        });
        const page = await browser.newPage();
        
        await page.setViewport({ 
            deviceScaleFactor: scaleFactor, 
            width: width || DEFAULTS.VIEWPORT.WIDTH, 
            height: DEFAULTS.VIEWPORT.HEIGHT, 
            isMobile: false 
        });
        await page.goto(pageUrl);
        await page.waitForFunction('window.LOAD_COMPLETE === true');
        
        const codeView = await page.$('#container');
        var image = await codeView.screenshot();
        
        console.log('⏰ ', `Operation finished in ${ toSeconds(performance.now() - tStart)} seconds`);
        
        response.status(200);
        response.setHeader('Content-Type', 'image/png');
        response.send(image);
        
        await page.close();
        await browser.close();
    } catch (e) {
        console.error('❌ ', 'Uncaught Exception',e);
    }
});

// using nightmare for rendering
app.post('/api/to-image2', async (request, response) => {
    const tStart = performance.now();
    try {
        console.log('');
        console.log('🎉 ', request.url);
        console.log('🛠 ', `Rendering Method: Nightmare, electron headless`);
        
        const theme = request.query['theme'];
        const language = request.query['language'];
        const lineNumbers = request.query['line-numbers'];
        
        let width = DEFAULTS.VIEWPORT.WIDTH;
        let scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        
        if (typeof request.body != 'string') {
            console.log('❌ ', 'Code snippet missing');
            sendErrorResponse(response, {
                message: 'Code snippet missing, please include it in the request body',
            });
            return;
        }
        
        if (!language || languages.indexOf(language) === -1) {
            console.log('❌ ', !language ? 'Language not specified' : `Unknown language '${language}'`);
            sendErrorResponse(response, {
                message: !language ? 'language missing: please specify a language' : `Unknown language '${language}'`,
                availableLanguages: languages,
            });
            return;
        }
        
        if (themes.indexOf(theme) === -1) {
            console.log('❌ ', `Unknown theme '${theme}'`);
            sendErrorResponse(response, {
                message: `Unknown theme: '${theme}'`,
                availableThemes: themes,
            });
            return;
        }
        
        try {
            scaleFactor = parseInt(request.query['scale']) || DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
            scaleFactor = Math.min(Math.max(1, scaleFactor), 5); // Make sure number is in range between 1-5
        } catch (e) {
            scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        }
        
        console.log('🛠 ', `Theme: ${theme}`);
        console.log('🛠 ', `Language: ${language}`);
        console.log('🛠 ', `Line Numbers: ${lineNumbers}`);
        console.log('🛠 ', `Scale Factor: ${scaleFactor}`);
        console.log('🛠 ', `width: ${width}`);
        
        try {
            width = Math.min(Math.abs(parseInt(request.query['width'])), 1920);
        } catch (exception) {
            console.warn('Invalid width', exception);
            width = DEFAULTS.VIEWPORT.WIDTH;
        }
        
        let queryParams = new URLSearchParams();
        theme && queryParams.set('theme', theme);
        language && queryParams.set('language', language);
        queryParams.set('line-numbers', lineNumbers === 'true' ? lineNumbers : 'false');
        queryParams.set('code', request.body);
        
        const queryParamsString = queryParams.toString();
        const pageUrl = `${hostname}/?${queryParamsString}`;
        
        console.log('🛠 ', 'Preview Page URL', pageUrl);
        let nightmare = new Nightmare({
            show: false,
        });
        nightmare.viewport(width || DEFAULTS.VIEWPORT.WIDTH, DEFAULTS.VIEWPORT.HEIGHT);
        nightmare
        .goto(pageUrl)
        .screenshotSelector('#container')
        .then(image => {
            console.log('⏰ ', `Operation finished in ${ toSeconds(performance.now() - tStart)} seconds`);
            response.status(200);
            response.setHeader('Content-Type', 'image/png');
            response.send(image);
            nightmare.end();
        }).catch(error => {
            console.log('⏰ ', `Operation finished in ${ toSeconds(performance.now() - tStart)} seconds`);
            console.log('❌ ', 'Nightmare operation error', error);
            nightmare.end();
        });
    } catch (e) {
        console.log('⏰ ', `Operation finished in ${ toSeconds(performance.now() - tStart)} seconds`);
        console.error('❌ ', 'Uncaught Exception', e);
    }
});

function sendErrorResponse(response, responseObject) {
    response.contentType('json');
    response.status(400);
    response.send(responseObject ? JSON.stringify(responseObject) : null);
}

function toSeconds(ms) {
    const x = ms/1000;
    return x.toFixed(2);
}

http.listen(port, () => {
    console.log('✅ ', 'listening on *:' + port);
});