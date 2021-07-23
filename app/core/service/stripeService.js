const stripe = require('stripe')('sk_test_51JAXKSDoo8mUbs6REYisjzslLdM5SCMqOXx08prNwO2yjPHD46HMJSVsfjVagKbJ6vlqk9HftFS7CsU1Y7FaaxUN00RKkuXagA');

const Product = require('../model/product');
const Price = require('../model/price');
const Customer = require('../model/customer');
const Plan = require('../model/plan');
const Vending = require('../model/vending');

//-----------------------------------------------------------------------------
//-- PRIVATE METHODS
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
 * process price promises and returns product class
 * @param  {promise}
 * @param  {list}
 * @return  {array}
 */
    async function processPricePromises(pricePromises, productList) {
    arrayClass = [];
    const priceList = await Promise.all(pricePromises);

    for(const price of priceList) {   
        const arrayPrices = []; 
        
        if(price.data.length > 0) {                 
            const prodData = productList.data.find(el => el.id === price.data[0].product);                                         
            for(const pricData of price.data) {                
                arrayPrices.push(new Price(pricData.id, pricData.unit_amount, pricData.currency));
                
            }
        
            const product = new Product(prodData.id, prodData.name, arrayPrices);
            arrayClass.push(product);
        }    
                                
    }   
    
    return arrayClass;
}

function generateClassVending(objSuscription, objCustomer, objProduct) {
    const customerClass = new Customer(objCustomer.id, objCustomer.name, objCustomer.email);
    const priceClass = new Price(objSuscription.plan.id, objSuscription.plan.amount, objSuscription.plan.currency);
    const productClass = new Product(objProduct.id, objProduct.name, priceClass);
    const planClass = new Plan(productClass, objSuscription.quantity, objSuscription.status, 
        objSuscription.start_date, objSuscription.trial_start, objSuscription.trial_end);

    return new Vending(customerClass, planClass);
}

//-----------------------------------------------------------------------------
//-- CLASS
//-----------------------------------------------------------------------------
class StripeService {
    constructor(){}

    /**
     * add the set of product and price
     * @param  {string}
     * @param  {number}
     * @param  {string}
     */
    async addProductAndPrice(name, prices) {
        if(prices.length > 0) {
            const product = await addProduct(name);
            if(product) {
            
                for(const p of prices) {            
                    const price = await addPrice(product.id, p.amount, p.currency);
                    if(price) {
                        console.log('Product (' + name + ' with price ' + p.amount + ' ' + p.currency +') inserted correctly');    
                    }
                    
                }
            }
        } else {
            console.log('Product (' + name + ') not prices');    
        }
    }

    /**
     * Get stripe product listing mode secuential
     * @return  {array}
     */
    async getListProductSequential() {
        let arrayClassProduct = [];
        const productList = await stripe.products.list();

        for(const prodData of productList.data) {                 
            const priceList = await stripe.prices.list({
                product: prodData.id
            });
            
            const arrayPrices = [];  
            for(const pricData of priceList.data) {
                arrayPrices.push(new Price(pricData.id, pricData.unit_amount, pricData.currency));
                
            }

            const product = new Product(prodData.id, prodData.name, arrayPrices)
            arrayClassProduct.push(product);                                                
                                    
        }

        return arrayClassProduct;
    }

    /**
     * Get stripe product listing mode with promises
     * @param  {number}
     * @return  {array}
     */
    async getListProductParallel(parrallelCount) {
        let arrayClassProduct = [];
        let priceListPromises = [];
        const productList = await stripe.products.list();

        let contParallel = parrallelCount;
        for(const prodData of productList.data) {            
            
            if(contParallel > 0) {
                priceListPromises.push(
                    stripe.prices.list({
                        product: prodData.id
                    })
                );

                contParallel--;
            }

            if(contParallel === 0 ) {
                const arrayClassProductAux = await processPricePromises(priceListPromises, productList);
                arrayClassProduct = arrayClassProduct.concat(arrayClassProductAux);
                                                
                priceListPromises = [];                
                contParallel = parrallelCount;
            }            
            
        }           
        
        //// Process the remaining elements
        if(contParallel > 0) {
            const arrayClassProductAux = await processPricePromises(priceListPromises, productList);
            arrayClassProduct = arrayClassProduct.concat(arrayClassProductAux);
        }  
        
        return arrayClassProduct;

    } 

    /**
     * Get stripe vending listing mode secuential
     * @returns 
     */
    async getListVendingSequential() {
        let arrayClassVending = [];

        const subscriptionList = await stripe.subscriptions.list();

        for(const objSuscription of subscriptionList.data) {

            const objCustomer = await stripe.customers.retrieve(objSuscription.customer);                        
            const objProduct = await stripe.products.retrieve(objSuscription.plan.product);
          
            const vendingClass = generateClassVending(objSuscription, objCustomer, objProduct);

            arrayClassVending.push(vendingClass);

        }
        
        return arrayClassVending;
    }

    /**
     * Get stripe vending listing mode paralell
     * @returns 
     */
     async getListVendingParallel() {
        let arrayClassVending = [];
        let customerListPromises = [];
        let productListPromises = [];

        const subscriptionList = await stripe.subscriptions.list();

        for(const objSuscription of subscriptionList.data) {
            customerListPromises.push(stripe.customers.retrieve(objSuscription.customer));
            productListPromises.push(stripe.products.retrieve(objSuscription.plan.product));

        }

        const customerList = await Promise.all(customerListPromises);
        const productList = await Promise.all(productListPromises);

        for(const objSuscription of subscriptionList.data) {
            const objProduct = productList.find(el => el.id === objSuscription.plan.product);
            const objCustomer = customerList.find(el => el.id === objSuscription.customer);
       
            const vendingClass = generateClassVending(objSuscription, objCustomer, objProduct);    

            arrayClassVending.push(vendingClass);

        }
        
        return arrayClassVending;
    }    

}

//-----------------------------------------------------------------------------
//-- Export module
//-----------------------------------------------------------------------------
module.exports = StripeService;
