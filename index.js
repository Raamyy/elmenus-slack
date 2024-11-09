require('dotenv').config()
const express = require('express');
const cors = require('cors');
const {getElmenusAccessToken, isAlreadyGroupMember, startGroupOrder} = require("./elmenus")

const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));



let restaurants = {
    "qedra": {
        uuid: "36615d5b-2224-11e8-924e-0242ac110011",
        branchId: "53016855-96f2-4a17-ab59-03daf2e3a543"
    }
}

const ZAMALEK_ZONE_ID = "7949dafc-35e8-41b8-b9f5-43b1a10c6481"

// users is an object in env following this structure:
/*
{
    "USLACKID1": {"email": "email1", password:"password1"},
    "USLACKID2": {"email": "email2", password:"password2"}
}
*/
let users = JSON.parse(process.env.USERS);

app.post('/elmenus/order', async (req, res) => {
    let user = users[req.body.user_id];
    if(!user){
        res.send("Authentication Failed! contact @Raamyy to be able to create orders :sunglasses:");
        return;
    }
    let deviceId = generateRandomAlphaNumeric(15);
    let token = await getElmenusAccessToken(user.email, user.password, deviceId);
    if(token == null){
        res.send("Login Failed! contact @Raamyy and make sure of the provided email/password");
        return;
    }
    let requestBody = req.body.text.toLowerCase();
    // TODO: in future add more commands here
    let restaurantName = requestBody;
    let restaurantId = restaurants[restaurantName]?.uuid;
    let branchId = restaurants[restaurantName]?.branchId;
    if(restaurantId == null){
        res.send(`${restaurantName} is not available right now to be ordered from slack :frown:`);
        return;
    }
    let isAlreadymember = await isAlreadyGroupMember(restaurantId, token, deviceId);
    if (isAlreadymember) {
        res.send("you are already member of the group order :)");
        return;
    }
    let groupLink = await startGroupOrder(restaurantId, branchId, ZAMALEK_ZONE_ID, token, deviceId);
    if (groupLink == null) {
        res.send("Creating group order failed :frown: try again in a few minuites, aw roo7 e3mlo manual ba2a :joy:");
        return;
    }
    res.json({
        "response_type": "in_channel", // show the message on slack
        "text": `Ordering in FIVE!\n\n${groupLink}`
    });
});



function generateRandomAlphaNumeric(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


let port = process.env.PORT || 4000;
app.listen(port, () => console.log("started listening on port " + port));