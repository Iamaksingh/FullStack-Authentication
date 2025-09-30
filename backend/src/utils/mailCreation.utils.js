import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const emailVerificationMailGenContent = (username,verificationUrl)=>{
    return {
        body : { 
            name: username,
            intro: "hey thanks for registering, we welcome you",
            action: {
                instructions:"click on the below button to verify email",
                button: {
                    color: "#22BC66",
                    text: "verify",
                    link: verificationUrl                    
                }
            },
            outro: "Need help? please respond to this email "
        }
    };
};

const ResetPasswordMailGenContent = (username,passwordResetUrl)=>{
    return {
        body : {
            name: username,
            intro: "hey you requested password reset",
            action: {
                instructions:"click on the below button to Reset password",
                button: {
                    color: "#22BC66",
                    text: "Reset your Password",
                    link: passwordResetUrl                    
                }
            },
            outro: "if you did not request ignore this message"
        }
    };
};

const sendEmail = async (options)=>{
    const mailGenerator = new Mailgen({
        theme:'default',
        product:{
            name: "task Manager",
            link: "https://taskmanagerlink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Use generic SMTP envs (works with Gmail or any SMTP). Falls back to Mailtrap vars if present.
    const smtpHost = process.env.SMTP_HOST || process.env.MAILTRAP_SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.MAILTRAP_SMTP_PORT || 587);
    const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"; // true for 465, false for 587
    const smtpUser = process.env.SMTP_USER || process.env.MAILTRAP_SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.MAILTRAP_SMTP_PASS;

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    const mail = {
        from: process.env.SMTP_FROM || "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail);
        console.info("Email sent to:", options.email, "subject:", options.subject);
        return true;
    } catch (error) {
        console.error("email system failed to deliver please check credentials");
        console.error("error -> ", error);
        return false;
    }

}

export {sendEmail,emailVerificationMailGenContent,ResetPasswordMailGenContent};