const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Ditt Client ID, Client Secret och Refresh Token
const CLIENT_ID = '166968239934-ndf6opb0agik9belsk0f5nq3v3luu0ck.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

app.use(bodyParser.json());
app.use(cors());  // Lägg till denna rad

async function sendMail(email, subject, text) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'lulea.delivery@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'lulea.delivery@gmail.com',
            to: email,
            subject: subject,
            text: text,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }
}

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Add user registration logic here (e.g., save to database)

    const emailSubject = 'Welcome to Our Service';
    const emailText = `Hello ${username},\n\nThank you for signing up!\n\nBest regards,\nYour Company`;

    try {
        const emailResult = await sendMail(email, emailSubject, emailText);
        console.log('Email sent:', emailResult);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
