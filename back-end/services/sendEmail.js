const axios = require('axios');

const sendEmail = async (options) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        sender: {
          name: 'ECMS',
          email: process.env.EMAIL_FROM
        },
        to: [
          {
            email: options.email
          }
        ],
        subject: options.subject,
        htmlContent: options.html
      }
    });

    return response.data;
  } catch (error) {
    console.error('Email Error:', error.response?.data || error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
