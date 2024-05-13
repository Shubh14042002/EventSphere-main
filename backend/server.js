const app = require('./app'); // Adjust the path to where your app.js is located

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});