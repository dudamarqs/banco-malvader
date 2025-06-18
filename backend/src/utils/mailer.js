const nodemailer = require('nodemailer');

// Configura o "transportador" de e-mail usando as credenciais do .env
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou outro serviço de e-mail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Envia um e-mail com o código OTP para o usuário.
 * @param {string} userEmail - O e-mail do destinatário.
 * @param {string} otp - O código OTP a ser enviado.
 */
async function sendOtpEmail(userEmail, otp) {
    const mailOptions = {
        from: `"Banco Malvader" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Seu Código de Acesso Único',
        html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2>Seu Código de Acesso</h2>
                <p>Use o código abaixo para concluir seu login no sistema do Banco Malvader.</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
                    ${otp}
                </p>
                <p>Este código é válido por 5 minutos.</p>
                <hr>
                <p style="font-size: 12px; color: #777;">Se você не solicitou este código, por favor, ignore este e-mail.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de OTP enviado para ${userEmail}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de OTP para ${userEmail}:`, error);
        throw new Error('Falha ao enviar e-mail de OTP.');
    }
}

module.exports = { sendOtpEmail };