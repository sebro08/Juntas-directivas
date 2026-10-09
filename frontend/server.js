const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist/frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Angular app listening on port ${port}`);
});
