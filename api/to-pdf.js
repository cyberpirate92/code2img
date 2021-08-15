const { themes } = require('../themes');
const chromium = require('chrome-aws-lambda');
const { performance } = require('perf_hooks');
const { languages } = require('../languages');

const DEFAULTS = {
    VIEWPORT: {
        WIDTH: 1000,
        HEIGHT: 1000,
        DEVICE_SCALE_FACTOR: 2,
    },
    INDEX_PAGE: 'preview.html',
};

const fonts = [
    "Inconsolata.ttf",
    "NotoColorEmoji.ttf",
    "FiraCode-Regular.ttf",
    "FiraCode-Bold.ttf",
    "DejaVuSansMono.ttf",
    "DejaVuSansMono-Bold.ttf",
    "UbuntuMono-Regular.ttf",
    "UbuntuMono-Bold.ttf",
    "RobotoMono-Bold.ttf",
    "RobotoMono-Regular.ttf"
];

function toSeconds(ms) {
    const x = ms/1000;
    return x.toFixed(2);
}

function sendErrorResponse(response, responseObject) {
    response.status(400);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.json(responseObject);
}

/**
 * Trim end of lines if it is a multi line string
 * @type {string} 
 */
function trimLineEndings(text) {
    let trimmedText = text;
    if (text && typeof text === 'string') {
        trimmedText = text.split('\n').map(line => line.trimEnd()).join('\n');
    }
    return trimmedText;
}

module.exports = async (request, response) => {
    try {
        const hostname =  process.env.NODE_ENV === 'production' ? "https://code2img.vercel.app" : "http://localhost:3000";
        const tStart = performance.now();
        console.log('');
        console.log('🎉 ', request.url);
        console.log('🛠 ', `Environment: ${process.env.NODE_ENV}`);
        console.log('🛠 ', `Rendering Method: Puppeteer, Chromium headless`);
        console.log('🛠 ', `Hostname: ${hostname}`);
        
        let theme = request.query['theme'];
        let language = request.query['language'];
        let lineNumbers = request.query['line-numbers'];
        let backgroundPadding = request.query['padding'] || '';
        let backgroundColor = request.query["background-color"] || '';
        let backgroundImage = request.query["background-image"] || '';
        let showBackground = request.query["show-background"] || 'true';
        
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
        
        if (backgroundPadding) {
            try {
                let padding = parseInt(backgroundPadding);
                backgroundPadding = Math.min(Math.max(0, padding), 10); // Make sure number is in range between 1-10
            } catch (error) {
                backgroundPadding = 0;
            }
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
        console.log('🛠 ', `Background Color: ${backgroundColor}`);
        console.log('🛠 ', `Background Image: ${backgroundImage}`);
        console.log('🛠 ', `Show Background: ${showBackground}`);
        console.log('🛠 ', `Background Padding: ${backgroundPadding}`);
        
        try {
            width = Math.min(Math.abs(parseInt(request.query['width'])), 1920);
        } catch (exception) {
            console.warn('Invalid width', exception);
            width = DEFAULTS.VIEWPORT.WIDTH;
        }

        let trimmedCodeSnippet = trimLineEndings(request.body);
        
        let queryParams = new URLSearchParams();
        theme && queryParams.set('theme', theme);
        language && queryParams.set('language', language);
        queryParams.set('line-numbers', lineNumbers === 'true' ? lineNumbers : 'false');
        queryParams.set('code', trimmedCodeSnippet);
        queryParams.set('background-image', backgroundImage);
        queryParams.set('background-color', backgroundColor);
        queryParams.set('show-background', showBackground);
        queryParams.set('padding', backgroundPadding);
        
        const queryParamsString = queryParams.toString();
        const pageUrl = `${hostname}/preview.html?${queryParamsString}`;
        
        fonts.forEach(async (font) => {
            const fontUrl = `https://raw.githack.com/cyberpirate92/code2img/master/public/fonts/${font}`;
            console.log('🛠 ', `Loading ${fontUrl}`);
            await chromium.font(fontUrl);
        });
        
        console.log('🛠 ', 'Preview Page URL', pageUrl);
        let browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        });
        
        const page = await browser.newPage();
        await page.goto(pageUrl, {
            waitUntil: 'networkidle2',
        });

        // set window header background same as the body
        await page.evaluate(() => {
            let background = '';
            const codeContainer = document.getElementById('code-container');
            const windowHeader = document.getElementById('header');
            if (codeContainer && windowHeader) {
                background = window.getComputedStyle(codeContainer, null).getPropertyValue('background');
                windowHeader.style.background = background;
            }
            return background;
        });
        
        await page.setViewport({ 
            deviceScaleFactor: scaleFactor, 
            width: width || DEFAULTS.VIEWPORT.WIDTH, 
            height: DEFAULTS.VIEWPORT.HEIGHT, 
            isMobile: false 
        });
    
        var pdfStream = await page.pdf();
    
        console.log('⏰ ', `Operation finished in ${ toSeconds(performance.now() - tStart)} seconds`);
        
        response.status(200);
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', 'attachment; filename=code.pdf');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.send(pdfStream);
        
        await page.close();
        await browser.close();
    } catch (e) {
        console.error('❌ ', 'Uncaught Exception',e);
    }
}