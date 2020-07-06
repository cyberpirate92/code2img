const { languages } = require('../languages');

module.exports = (request, response) => {
    console.log('');
    console.log('🎉 ', request.url);
    response.json({
        languages
    });
}