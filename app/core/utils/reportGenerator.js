const CONST_CHAR_MILISECOND = 13;
//-----------------------------------------------------------------------------
//-- FUNCTIONS
//-----------------------------------------------------------------------------
/**
 * Format price with decimal point
 * @param {*} number 
 * @returns 
 */
function priceFormat(number) {
    return number / 100;
}

function priceTotal(amount, quantity, currency) {
    return priceFormat(amount * quantity) + ' ' + currency 
}

/**
 * 
 * @param {number} milisecons 
 * @returns 
 */
function getMultiplicator(milisecons) {
    characters = milisecons.toString().length;
    let multi = '1';
    if(characters < CONST_CHAR_MILISECOND) {
        const dif = CONST_CHAR_MILISECOND - characters;
        multi = multi.concat('0'.repeat(dif));
        
    } 
    
    return parseInt(multi);
}

/**
 * date to string
 * @param {number}  
 */
 function dateFormat(milisecons) {
    if(milisecons) {
        //const txtDate = new Date(parseInt(milisecons + '000')).toISOString();     
        const mult = getMultiplicator(milisecons);
        const txtDate = new Date(milisecons * mult).toISOString();                
        const txtDateFormat = txtDate.substring(0, txtDate.indexOf('.')).replace('T', ' ');

        return txtDateFormat;
    }

    return '';
}

/**
 * generate the html report product
 * @param {array} arrayProduct 
 * @returns 
 */
function generateReportProduct(arrayProduct) {
    const report = [];
    report.push('<h2>Products</h2>');
    report.push('<table style="width:500px" border="1" cellspacing="0">');
    report.push('<tr style="background: #000000;color: #FFFFFF;">' + 
                    '<th style="text-align:left">id</th>' + 
                    '<th style="text-align:left">Product</th>' + 
                    '<th style="text-align:left">Price</th>' +
                    '<th style="text-align:left">Currency</th></tr>');

    for(const pro of arrayProduct) {
        for(const pri of pro.price) {        
            //const priceFormat = pri.amount / 100;
            report.push('<tr><td>' + pro.idProduct + '</td><td>' + 
                                     pro.name + '</td><td>' + 
                                     priceFormat(pri.amount) + '</td><td>' + 
                                     pri.currency + '</td></tr>');
        }

    }

    report.push('</table>');    

    return report.join('');
}

/**
 * generate the html report vending
 * @param {array} arrayVending 
 * @returns 
 */
function generateReportVending(arrayVending) {
    const report = [];
    report.push('<h2>Vending</h2>');
    report.push('<table style="width:1000px" border="1" cellspacing="0">');
    report.push('<tr style="background: #000000;color: #FFFFFF;">' + 
                    '<th style="text-align:left">Name</th>' + 
                    '<th style="text-align:left">Email</th>' + 
                    '<th style="text-align:left">Product</th>' +
                    '<th style="text-align:left">Price</th>' +
                    '<th style="text-align:left">Total</th>' +
                    '<th style="text-align:left">Start Date</th>' +
                    '<th style="text-align:left">Status</th>' +
                    '<th style="text-align:left">Start Trial</th>' +                                    
                    '<th style="text-align:left">End Trial</th></tr>');

    for(const ven of arrayVending) {                
        report.push('<tr><td>' + ven.customer.name + '</td><td>' + 
                                 ven.customer.email + '</td><td>' + 
                                 ven.plan.product.name + '</td><td>' + 
                                 ven.plan.quantity + ' x ' + 
                                 priceFormat(ven.plan.product.price.amount) + ' ' + 
                                    ven.plan.product.price.currency +  '</td><td>' + 
                                 priceTotal(ven.plan.product.price.amount, ven.plan.quantity, 
                                    ven.plan.product.price.currency) + '</td><td>' + 
                                 dateFormat(ven.plan.startDate) + '</td><td>' + 
                                 ven.plan.status + '</td><td>' + 
                                 dateFormat(ven.plan.startTrial) + '</td><td>' +                             
                                 dateFormat(ven.plan.endTrial) + '</td></tr>');
        
    }

    report.push('</table>');        
    
    return report.join('');
}

//-----------------------------------------------------------------------------
//-- CLASS
//-----------------------------------------------------------------------------
class ReportGenerator {
    constructor(){}

    /**
     * Generate the html report
     * @param  {array}
     * @param  {array}
     * @return  {string}
     */
    generateReport(arrayProduct, arrayVending) {
        const txtReport = '<h1>Report HTML</h1>';
        
        const txtReportProduct = generateReportProduct(arrayProduct);
        const txtReportVending = generateReportVending(arrayVending);
        
        return txtReport.concat(txtReportProduct, txtReportVending);
    }
}

//-----------------------------------------------------------------------------
//-- Exports module
//-----------------------------------------------------------------------------
module.exports = ReportGenerator;
