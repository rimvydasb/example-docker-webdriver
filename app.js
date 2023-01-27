const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

//----------------------------------------------------------------------------------------------------------------------
// Functions
//----------------------------------------------------------------------------------------------------------------------
function normalizeWebPageName(webpageName) {
    // Replace all slashes with underscores
    webpageName = webpageName.replace(/\//g, '_');

    // Remove all non-alphanumeric characters
    webpageName = webpageName.replace(/[^a-zA-Z0-9_]/g, '');

    return webpageName;
}

function normalizeWebPageName(webpageName) {
    // Remove the http or https prefix
    webpageName = webpageName.replace(/(http|https):\/\//g, "");
    // Replace all slashes with underscores
    webpageName = webpageName.replace(/\//g, '_');

    // Remove all non-alphanumeric characters
    webpageName = webpageName.replace(/[^a-zA-Z0-9_]/g, '');

    return webpageName;
}

//----------------------------------------------------------------------------------------------------------------------
// Methods
//----------------------------------------------------------------------------------------------------------------------

app.post('/screenshot', async (req, res) => {
    const url = req.body.url;

    // Create a new instance of the chrome driver
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments('--headless'))
        .build();

    // Navigate to the website
    await driver.get(url);

    // Take a screenshot
    let image = await driver.takeScreenshot();

    // Save the screenshot to the drive
    fs.writeFileSync('screenshot.png', image, 'base64');

    // Close the driver
    await driver.quit();

    res.send("Screenshot taken successfully!");
});

app.get('/getscreenshots', async (req, res) => {
    // Define the directory where the screenshots are stored
    const directory = 'screenshots/';

    // Read the directory and get all the files
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.log("Error reading screenshot directory: ", err);
            res.status(500).send("Error reading screenshot directory");
        } else {
            // Send the list of files as a JSON response
            res.json({ files });
        }
    });
});

app.get('/getscreenshot/:screenshot_id', async (req, res) => {
    // Get the screenshot file name from the URL parameter
    const screenshot_id = req.params.screenshot_id;

    // Define the directory where the screenshots are stored
    const directory = 'screenshots/';

    // Create the file path
    const filePath = directory + screenshot_id;

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If file not found, send a 401 status response
            res.status(401).send("File not found");
        } else {
            // If file found, send the file as a download
            res.download(filePath);
        }
    });
});

//----------------------------------------------------------------------------------------------------------------------
// Start the server
//----------------------------------------------------------------------------------------------------------------------

app.listen(3001, () => {
    console.log("Server running on port 3001");
});



