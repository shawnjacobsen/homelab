// exposes functions to email specified client

const nodemailer = require("nodemailer");
const gmail_creds = require(__dirname + "/email_secret.json");

//  gateways
const gateways = {
	'sprint': 'messaging.sprintpcs.com'
}

// setup transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: gmail_creds.email,
		pass: gmail_creds.password
	},
});

// send notification
async function sendText(number, gatewayAlias, subject, text) {
	const fullAddress = `${number}@${gateways[gatewayAlias]}`;

	let mailOptions = {
		from: gmail_creds.email,
		to: fullAddress,
		subject: subject,
		text: text
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error.message);
		}
		console.log(`successfully sent message to ${fullAddress}`)
	});
}

module.exports = {sendText};

