const App = require('./app/app');
const StripeService = require('./app/core/service/stripeService');
const MailService = require('./app/core/service/mailService');
const ReportGenerator = require('./app/core/utils/reportGenerator');

const TO_EMAIL = 'victor@jumesa.com';
const FROM_EMAIL = 'victor@jumesa.com';
const PARALLEL_COUNT = 2; //Number of simultaneous requests (mode 2), if is less than 2 (mode 1)
const GENERATE_INITIAL_DATA = false; 

const stripeService = new StripeService();
const mailService = new MailService();
const reportGenerator = new ReportGenerator()

//--- run program
const app = new App(stripeService, mailService, reportGenerator);
app.main(TO_EMAIL, FROM_EMAIL, PARALLEL_COUNT, GENERATE_INITIAL_DATA).then(() => {
    console.log('---- FINISHED PROGRAM ----');
});
