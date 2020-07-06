const fs = require('fs');

module.exports = (request, response) => {
    console.log('');
    console.log('🎉 ', request.url);
    fs.readdir('./public/prism-themes', (error, files) => {
        if (error) {
            response.status(500);
            response.json({
                error
            });
        }
        if (files) {
            const themes = files.map(file => file.substring(6, file.length-4)).filter(theme => theme.trim().length > 0);
            response.json({
                themes
            });
        }
    });
}