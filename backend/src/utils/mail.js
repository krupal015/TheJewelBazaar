import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail = async (options)=>{
   const mailGenerator = new Mailgen ({
    theme:"default",
    product: {
        name:"Task Manager",
        link : "https://taskmanager.com"
    }
    })

    const emailtexual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHtml = mailGenerator.generate(options.mailgenContent)

   const transporter= nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth :{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailtexual,
        html:emailHtml
    }

    try {
        await transporter.sendMail(mail)
    }catch(error){
        console.error("Email service failed silently,make sure that you provided mail trap credentials in .env file")
        console.error("Error: ",error);
        throw error;
    }


}


const emailVerificationMailgenContent = (username,verificationUrl) => {
    return {
        body : {
            name :username,
            intro : "welcome to our app",
            action:{
                instructions: "to verify your email please click on this button",
                button :{
                    color:"rgb(9, 84, 42)",
                    text:"verify your email",
                    url:verificationUrl
                },
            },
            outro:" help?? -- reply to this email"
        }
    }
}


const forgotPasswordMailgenContent =  (username,passwordResetUrl) => {
    return {
        body : {
            name :username,
            intro : "we got a request to reset the password to your account",
            action:{
                instructions: "to reset yoour password please click on this button",
                button :{
                    color:"rgb(20, 150, 76)",
                    text:"reset your password",
                    url:passwordResetUrl
                },
            },
            outro:" help?? -- reply to this email"
        }
    }
}


export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}