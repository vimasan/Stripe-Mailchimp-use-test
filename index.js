 /**
 * @fileoverview 
 * @version                               0.1
 *
*/
//-----------------------------------------------------------------------------
// REQUIRED AND CONSTANT
//-----------------------------------------------------------------------------
const stripe = require('stripe')('sk_test_51JAXKSDoo8mUbs6REYisjzslLdM5SCMqOXx08prNwO2yjPHD46HMJSVsfjVagKbJ6vlqk9HftFS7CsU1Y7FaaxUN00RKkuXagA');
const mailchimp = require('@mailchimp/mailchimp_transactional')('p-fFnuEdlO75138YVIEbxA');

const toEmail = 'victor@jumesa.com';
const fromEmail = 'victor@jumesa.com';

const productListInitial = [
    {name: 'Product 1', amount: 500, currency: 'eur'},
    {name: 'Product 2', amount: 1000, currency: 'eur'},
    {name: 'Product 3', amount: 1500, currency: 'eur'}
]

//-----------------------------------------------------------------------------
//-- CLASS 
//-----------------------------------------------------------------------------
class Price {
    constructor(amount, currency) {
        this.amount = amount;
        this.currency = currency;
    }
}

class Product {
    constructor(idProduct, name, price) {
        this.idProduct = idProduct;
        this.name = name;
        this.price = price;
    }
}


//-----------------------------------------------------------------------------
//-- FUNCTIONS
//-----------------------------------------------------------------------------
 /**
 * add products to stripe 
 * @param  {string}
 * @return  {promise}
 */
function addProduct(name) {
    return stripe.products.create({
        name: name
    });    
}

/**
 * add prices to stripe products 
 * @param  {string}
 * @param  {number}
 * @param  {string}
 * @return  {promise}
 */
function addPrice(idProduct, amount, currency) {
    return stripe.prices.create({
        unit_amount: amount,
        currency: currency,
        recurring: {interval: 'month'},
        product: idProduct,
    });
}

/**
 * add the set of product and price
 * @param  {string}
 * @param  {number}
 * @param  {string}
 */
async function addProductAndPrice(name, amount, currency) {
    const product = await addProduct(name);
    if(product) {
        const price = await addPrice(product.id, amount, currency);
        if(price) {
            console.log('Product (' + name + ') inserted correctly');
        }
    }
}

/**
 * Generate the html report
 * @param  {array}
 * @return  {string}
 */
function generateReport(arrayProduct) {
    const report = [];
    report.push('<h2>Report HTML</h2>');
    report.push('<table style="width:500px" border="1" cellspacing="0">');
    report.push('<tr style="background: #000000;color: #FFFFFF;">' + 
                    '<th style="text-align:left">id</th>' + 
                    '<th style="text-align:left">Product</th>' + 
                    '<th style="text-align:left">Price</th>' +
                    '<th style="text-align:left">Currency</th></tr>');

    for(const pro of arrayProduct) {
        for(const pri of pro.price) {        
            const priceFormat = pri.amount / 100;
            report.push('<tr><td>' + pro.idProduct + '</td><td>' + 
                                     pro.name + '</td><td>' + 
                                     priceFormat + '</td><td>' + 
                                     pri.currency + '</td></tr>');
        }

    }

    report.push('</table>');    
    
    return report.join('');
}

/**
 * Pring mail of mailchip
 */
async function pingMail() {
    const response = await mailchimp.users.ping();
    console.log(response);
}

/**
 * Send email to mailchimp
 * @param  {string}
 * @return  {promise}
 */
function sendEmail(txtHtml) {
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

//-----------------------------------------------------------------------------
//-- PROGRAM
//-----------------------------------------------------------------------------
async function main() {
    console.log('----- PROGRAM START ----');

    try {
        //add starter products to stripe
        for(const p of productListInitial) {
            addProductAndPrice(p.name, p.amount, p.currency);
        }

        //Get stripe product listing
        let arrayProduct = [];
        const productList = await stripe.products.list();

        for(const prodData of productList.data) {            
             
            const priceList = await stripe.prices.list({
                product: prodData.id
            });
            
            const arrayPrices = [];  
            for(const pricData of priceList.data) {
                arrayPrices.push(new Price(pricData.unit_amount, pricData.currency));
                
            }

            const product = new Product(prodData.id, prodData.name, arrayPrices)
            arrayProduct.push(product);                                                
                                    
        }        

        //generate report for send
        const txtReport = generateReport(arrayProduct);    
        
        //send mail with the report
        const returnEmail = await sendEmail(txtReport);
        console.log('Mail sent to mailChimp --> ');
        console.log(returnEmail);
        
    } catch (err) {
        console.error(err);
    }

}

//--- run program
main().then(() => {
    console.log('---- FINISHED PROGRAM ----');
})


