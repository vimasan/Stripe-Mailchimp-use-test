const mailchimp = require('@mailchimp/mailchimp_transactional')('p-fFnuEdlO75138YVIEbxA');

class MailService {
    constructor() {}
    /**
     * Ping mail of mailchip
     */
    async pingMail() {
        const response = await mailchimp.users.ping();
        console.log(response);
    }

    /**
     * Send email to mailchimp
     * @param  {string}
     * @return  {promise}
     */
    sendEmail(txtHtml, toEmail, fromEmail) {
        let msgBody = {
            message: {            
                to:[
                    {email: toEmail}
                ],            
                from_email: fromEmail,
                subject: 'Report html',
                html: txtHtml
            },
            async:true
        };

        return  mailchimp.messages.send(msgBody);    
    }

}

//-----------------------------------------------------------------------------
//-- Export module
//-----------------------------------------------------------------------------
module.exports = MailService;
