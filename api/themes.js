const { themes } = require('../themes');
module.exports = (request, response) => {
    console.log('');
    console.log('🎉 ', request.url);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.json({
        themes
    });
}