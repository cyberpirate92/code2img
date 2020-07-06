const { themes } = require('../themes');
module.exports = (request, response) => {
    console.log('');
    console.log('🎉 ', request.url);
    response.json({
        themes
    });
}