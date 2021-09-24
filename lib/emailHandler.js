/**
 * @Description 邮件发送 
 * @Author ozl
 *
 */
const nodemailer = require('nodemailer')
let smtpTransport = require('nodemailer-smtp-transport');
const config = require('./config')
 
smtpTransport = nodemailer.createTransport(smtpTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
}));
 
/**
 * @param {String} recipient 收件人
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 */
const sendMail = function (recipient, subject, html) {
    return new Promise((callback) => { 
        smtpTransport.sendMail({
            from: config.email.user,
            to: recipient,
            subject: subject,
            html: html
        }, function (error, response) { 
            if (error) {
                console.log(error);
            }
            console.log('发送成功！')
            callback()
        });
    })
}

//sendMail("ouzilin21@163.com","测试","测试")
module.exports = sendMail;