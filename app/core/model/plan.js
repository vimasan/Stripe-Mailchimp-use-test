class Plan {    

    constructor(product, quantity, status, startDate, startTrial, endTrial) {        
        this.product = product;
        this.quantity = quantity;
        this.status = status;
        this.startDate = startDate;
        this.startTrial = startTrial;
        this.endTrial = endTrial;
    }
}

module.exports = Plan;