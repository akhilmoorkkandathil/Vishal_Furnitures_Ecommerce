const cartModel = require('../model/cartSchema');
const { randomUUID } = require('crypto');
const orderModel = require('../model/orderModel')
const { default: ShortUniqueId } = require('short-unique-id');
const moment = require("moment");
let date = moment();
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({ 

// Replace with your key_id 
key_id: process.env.RZP_KEY_ID, 

// Replace with your key_secret 
key_secret: process.env.RZP_KEY_SECRET 
}); 



module.exports = {
orderPage: async(req,res)=>{
    try {
        const userId = req.session.userId;

        const orders = await orderModel.find({userId:userId})
        console.log(orders);
        let obj=[]
    let maps =orders.map((item)=>{
        let test={
            "orderId":item.orderId,
            "price":item.totalPrice,
            "status":item.status,
            "paymentMethod":item.paymentMethod,
            "createdAt":item.createdAt.toString().substring(0, 10),
        }
        obj.push(test)
    })
        await res.render('./user/orderDetails',{login:req.session.user,orders:obj})
    } catch (error) {
        console.log("Orders:",error);
    }
},

placeOrder: async(req,res) => {
    try {
        const payMethode = req.body.paymentMethod;
        const userId = req.session.userId;
        const user = req.session.user;
        const username = user.username;
        const uid = new ShortUniqueId();
        const selectedAddress = user.address[0];
        const cartProducts = await cartModel.find({userId:userId});
        let total=cartProducts[0].total
        console.log(total);
        const items = cartProducts[0].item;
        const orderId=uid.randomUUID(6)
        if(payMethode==="COD"){
            const order = new orderModel({
                orderId: orderId,
                userId: userId,
                userName: username,
                items: items,
                totalPrice: cartProducts[0].total,
                shippingAddress: selectedAddress,
                paymentMethod: payMethode,
                updatedAt: date.format("YYYY-MM-DD HH:mm"),
                createdAt: date.format("YYYY-MM-DD HH:mm"),
                status: "pending",
                
                });
                await order.save();
                await cartModel.updateOne({ userId: userId }, { $set: { item: [] } });
                const cart = await cartModel.find({userId:userId});
                console.log(cart);

        res.redirect('/orders')

        }else{
            console.log("Rasorpay payment started");
            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId,
                };
                razorpayInstance.orders.create(options, function(err, order) {
                if (err) {
                console.error("Error in patment",err);
                return res.redirect('/error')
                }
                console.log(order);
                    // Sending the order object as JSON response
                    res.json(order);
                });
            
        }
            
                
    } catch (error) {
        console.log(error);
        res.redirect('/error')
    }
},

delAdress: async (req,res) => {
    try {
        console.log(req.body);
        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
},
cacelOrder: async (req,res) => {
    try {
        const orderId = req.params.orderId;
        const filter = { orderId: orderId };
        const update = { status: "Cancelled" };

        await orderModel.updateOne(filter, update);
        await res.redirect('/orders')
    } catch (error) {
        console.log(error);
    }
},

orderShipped: async (req,res) => {
try {
    const orderId = req.params.id;
    const orderbtTheId = await orderModel.find({orderId: orderId})
if(orderbtTheId[0].status==="pending"){
    const filter = { orderId: orderId};
    const update = { status: "Shipped" };
    await orderModel.updateOne(filter, { $set: update });
    await res.redirect('/admin/orders')
}else if(orderbtTheId[0].status==="Shipped"){
    const filter = { orderId: orderId };
    const update = { status: "Delivered" };
    await orderModel.updateOne(filter, { $set: update });
    await res.redirect('/admin/orders');
}else{
    await res.redirect('/admin/orders');
}
    
    } catch (error) {
        console.log(error);
    }
},

viewOrderdProducts: async (req,res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.session.userId;
        const orders = await orderModel.find({userId:userId,orderId:orderId})
        console.log(orders[0]);
        let maps =orders.map((item)=>{
            let test={
                "orderId":item.orderId,
                "price":item.totalPrice,
                "status":item.status,
                "paymentMethod":item.paymentMethod,
                "createdAt":item.createdAt.toString().substring(0, 10),
            }
            obj.push(test)
        })
        res.render('./user/orderedProducts',{order:orders})
    } catch (error) {
        console.log(error);
    }
},

verifyPayment: async (req,res) => {
    try {
        console.log(req.body);
    } catch (error) {
        res.redirect('/error')
    }
}
}