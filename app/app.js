 /**
 * @fileoverview 
 * @version                               0.1
 *
*/
//-----------------------------------------------------------------------------
// REQUIRED AND CONSTANT
//-----------------------------------------------------------------------------
const reportGenerator = require('./core/utils/reportGenerator');

const productListInitial = [
    {name: 'Product 1 m2', price: [
        {amount: 500, currency: 'eur'}] 
    },
    {name: 'Product 2 m2', price: [
        {amount: 1000, currency: 'eur'}]
    },
    {name: 'Product 3 m2', price: [
        {amount: 1500, currency: 'eur'}]
    }  
]

//-----------------------------------------------------------------------------
//-- PROGRAM
//-----------------------------------------------------------------------------
class App {
    constructor(stripeService, mailService) {
        this.stripeService = stripeService;
        this.mailService = mailService;
    }

    async main(toEmail, fromEmail, parallelCount, genInitialData ) {
        console.log('----- PROGRAM START ----');
    
        try {
            //add starter products to stripe        
            if(genInitialData) {
                for(const plist of productListInitial) {
                    await this.stripeService.addProductAndPrice(plist.name, plist.price);
                }
            }
    
            let arrayClassProduct;
            
            if(parallelCount < 2) {
                //MODE 1 --> Get stripe product listing mode sequential                 
                arrayClassProduct = await this.stripeService.getListProductSequential();              
                
            } else {
                //MODE 2 --> Get stripe product listing mode in parallel with promises
                arrayClassProduct = await this.stripeService.getListProductParallel(parallelCount);  
            }

            //Generate vending listing
            const arrayClassVending = await this.stripeService.getListVending();     
                                
            //generate report for send
            const txtReport = reportGenerator.generateReport(arrayClassProduct, arrayClassVending);           
                                
            //send mail with the report
            const objReturnEmail = await this.mailService.sendEmail(txtReport, toEmail, fromEmail);
            console.log('Mail sent to mailChimp --> ');
            console.log(objReturnEmail);
            
        } catch (err) {
            console.error(err);
        }
    
    }

}

module.exports = App;



