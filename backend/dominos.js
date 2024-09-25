const dominos = require('dominos');

const orderStatus = (orderID)=>{
    const tracker = new dominos.Tracker();
    tracker.byId(orderID,(err, result)=>{
        if(err){
            console.error('Error tracking order', err);
            return;
        }
        conmsole.log('Order status', result)
    });
}

module.exports = {orderStatus};