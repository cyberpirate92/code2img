var express = require('express');
var app = express();
var http = require('http').Server(app);
const puppeteer = require('puppeteer');
var port = process.env.PORT || 3000;
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var domToImage = require('dom-to-image');

const hostname = `http://localhost:${port}`;
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

app.post('/api/to-image', async (request, response) => {
    try {
        console.log('');
        console.log('🎉', request.url);
        console.log('ℹ️', `Rendering method: Virtual DOM`);
        
        const theme = request.query['theme'];
        const language = request.query['language'];
        const lineNumbers = request.query['line-numbers'];
        
        let width = DEFAULTS.VIEWPORT.WIDTH;
        let scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        
        if (typeof request.body != 'string') {
            console.log('❌', 'Code snippet missing');
            sendErrorResponse(response, {
                message: 'Code snippet missing, please include it in the request body',
            });
            return;
        }
        
        if (!language || languages.indexOf(language) === -1) {
            console.log('❌', !language ? 'Language not specified' : `Unknown language '${language}'`);
            sendErrorResponse(response, {
                message: !language ? 'language missing: please specify a language' : `Unknown language '${language}'`,
                availableLanguages: languages,
            });
            return;
        }
        
        if (themes.indexOf(theme) === -1) {
            console.log('❌', `Unknown theme '${theme}'`);
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
        
        console.log('ℹ️', `Theme: ${theme}`);
        console.log('ℹ️', `Language: ${language}`);
        console.log('ℹ️', `Line Numbers: ${lineNumbers}`);
        console.log('ℹ️', `Scale Factor: ${scaleFactor}`);
        console.log('ℹ️', `width: ${width}`);
        
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
        
        const pageUrl = `${hostname}/preview-jsdom.html?${queryParams.toString()}`;
        var dom = new JSDOM(``, {
            url: pageUrl,
            contentType: "text/html",
            includeNodeLocations: true,
            storageQuota: 0,
            runScripts: "dangerously",
            resources: 'usable',
        });
        
        let node = dom.window.document.querySelector('#container');
        domToImage.toPng(node, {
            quality: 1,
        }).then(dataUrl => {
            console.log('✅', 'Render successful');
            response.status(200);
            response.contentType('png');
            response.send(dataUrl);
            return;
        }).catch(error => {
            console.error('❌', `Reading file '${pageUrl}' failed`, error);
            response.status(500);
            response.contentType('json');
            response.send(JSON.stringify({
                message: 'Rendering failed',
                error: error.toString(),
            }));
            return;
        });
    } catch (e) {
        console.error(e);
    }
});

app.post('/api/to-image2', async (request, response) => {
    try {
        console.log('');
        console.log('🎉', request.url);
        console.log('ℹ️', `Rendering method: Headless Chromium`);
        
        const theme = request.query['theme'];
        const language = request.query['language'];
        const lineNumbers = request.query['line-numbers'];
        
        let width = DEFAULTS.VIEWPORT.WIDTH;
        let scaleFactor = DEFAULTS.VIEWPORT.DEVICE_SCALE_FACTOR;
        
        if (typeof request.body != 'string') {
            console.log('❌', 'Code snippet missing');
            sendErrorResponse(response, {
                message: 'Code snippet missing, please include it in the request body',
            });
            return;
        }
        
        if (!language || languages.indexOf(language) === -1) {
            console.log('❌', !language ? 'Language not specified' : `Unknown language '${language}'`);
            sendErrorResponse(response, {
                message: !language ? 'language missing: please specify a language' : `Unknown language '${language}'`,
                availableLanguages: languages,
            });
            return;
        }
        
        if (themes.indexOf(theme) === -1) {
            console.log('❌', `Unknown theme '${theme}'`);
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
        
        console.log('ℹ️', `Theme: ${theme}`);
        console.log('ℹ️', `Language: ${language}`);
        console.log('ℹ️', `Line Numbers: ${lineNumbers}`);
        console.log('ℹ️', `Scale Factor: ${scaleFactor}`);
        console.log('ℹ️', `width: ${width}`);
        
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
        
        console.log('ℹ️', 'Preview Page URL', pageUrl);
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
        
        console.log('✅', 'Render successful');
        response.status(200);
        response.contentType('png');
        response.send(image);
        
        await page.close();
        await browser.close();
    } catch (e) {
        console.error(e);
    }
});

function sendErrorResponse(response, responseObject) {
    response.contentType('json');
    response.status(400);
    response.send(responseObject ? JSON.stringify(responseObject) : null);
}

http.listen(port, () => {
    console.log('✅', 'listening on *:' + port);
});