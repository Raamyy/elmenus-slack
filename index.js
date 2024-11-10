require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { getElmenusAccessToken, isAlreadyGroupMember, startGroupOrder, getRestaurantId, addItemToGroupOrder } = require("./elmenus")
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const CAIRO_CITY_ID = "35185821-2224-11e8-924e-0242ac110011";
const ZAMALEK_ZONE_ID = "7949dafc-35e8-41b8-b9f5-43b1a10c6481";


// users is an object in env following this structure:
/*
{
    "USLACKID1": {"email": "email1", password:"password1"},
    "USLACKID2": {"email": "email2", password:"password2"}
}
*/
let users = JSON.parse(process.env.USERS);
let favOrders = JSON.parse(process.env.FAV_ORDERS);

app.post('/elmenus/order', async (req, res) => {
    try {
        
        let data = req.body;
        let config = {
            method: 'post',
            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/process',
            data: data
        };
        console.log("redirecting to endpoint", config);
        axios.request(config);
    } catch (e) {
        console.error("redirecting to endpoint failed", e?.response?.data);
    }
    res.send({
        "response_type": "in_channel", // show the message on slack
        "text": "لحظات يافندم جاري مراجعة المطعم 📝"
    }); // early respond to confirm message receive    
    
})

app.post('/elmenus/order/process', async (req, res) => {
    try {
        console.log("recieved request", req.body);
        
        let userId = req.body.user_id
        let responseUrl = decodeURIComponent(req.body.response_url);
        let user = users[userId];
        if (!user) {
            await respondToSlack(responseUrl, "Authentication Failed! contact @Raamyy to be able to create orders 😎");
            res.sendStatus(200);
            return;
        }
        let deviceId = generateRandomAlphaNumeric(15);
        let token = await getElmenusAccessToken(user.email, user.password, deviceId);
        if (token == null) {
            await respondToSlack(responseUrl, "Login Failed! contact @Raamyy and make sure of the provided email/password");
            res.sendStatus(200);
            return;
        }
        console.log("generated access token");

        let requestBody = req.body.text.toLowerCase();
        // TODO: in future add more commands here
        let restaurantName = requestBody;
        if (restaurantName == null) {
            await respondToSlack(responseUrl, 'provide restaurant name, for example: /order qedra');
            res.sendStatus(200);
            return;
        }
        let restaurantId = await getRestaurantId(restaurantName, CAIRO_CITY_ID, token, deviceId);
        let branchId = uuidv4(); // somehow generating random branchid just works and elmenus automatically selects suitable branch
        if (restaurantId == null) {
            await respondToSlack(responseUrl, `${restaurantName} is not available right now to be ordered from slack ☹️`);
            res.sendStatus(200);
            return;
        }
        console.log("got restaurant id", restaurantId);
        let isAlreadymember = await isAlreadyGroupMember(restaurantId, token, deviceId);
        if (isAlreadymember) {
            await respondToSlack(responseUrl, "you are already member of the group order :)");
            res.sendStatus(200);
            return;
        }
        let response = await startGroupOrder(restaurantId, branchId, ZAMALEK_ZONE_ID, token, deviceId);
        if (response == null) {
            await respondToSlack(responseUrl, "Creating group order failed ☹️ probably you have an existing cart check it!");
            res.sendStatus(200);
            return;
        }
        let { groupLink, groupId } = response;
        console.log("started group order", groupLink);


        if (favOrders[userId]?.[restaurantId]?.length) {
            let favItems = favOrders[userId][restaurantId];
            for (const item of favItems) {
                let res = await addItemToGroupOrder(groupId, item, token, deviceId);
                if (res == null) {
                    await respondToSlack(responseUrl, `adding ${item.name} failed`);
                }
            }
        }
        console.log("added items");

        await respondToSlack(responseUrl,
            {
                "response_type": "in_channel", // show the message on slack
                "text": `Ordering ${restaurantName} in FIVE!\n\nhttps://www.elmenus.com${groupLink}`
            });
            res.sendStatus(200);

    } catch (e) {
        console.log("error captured", req.body, e);

        await respondToSlack(responseUrl, "Creating group order failed ☹️ try again in a few minuites, aw roo7 e3mlo manual ba2a 😂");
        res.sendStatus(200);
    }
});

async function respondToSlack(resposeURL, response) {
    try {
        if(typeof response == 'string')
        {
            response = {
                "text": response
            }
        }
        let data = JSON.stringify(response);
        let config = {
            method: 'post',
            url: resposeURL,
            data: data
        };
        console.log("sending to slack", config);
        let slackResponse = await axios.request(config);
    } catch (e) {
        console.error("sending to slack failed", e?.response?.data);
    }
}


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