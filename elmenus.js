const axios = require('axios');

async function getElmenusAccessToken(email, password, deviceId) {
    try {

        let data = JSON.stringify({
            "email": email,
            "password": password
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://elmenus.com/api/auth-svc/1.0/auth',
            headers: {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'lang': 'EN',
                'origin': 'https://elmenus.com',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://elmenus.com/',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                'userlat': '[object Object]',
                'userlong': '[object Object]',
                'x-device-id': deviceId
            },
            data: data
        };

        const response = await axios.request(config);
        return response?.data?.accessToken;
    }
    catch (e) {
        console.error("error occured while validating user credentials", e);
        return null;
    }

}

async function getRestaurantId(restaurantName, city, accessToken, deviceId) {
    let config = {
        method: 'get',
        url: `https://www.elmenus.com/2.0/restaurant/autocomplete?q=${restaurantName}&city=${city}`,
        headers: {
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${accessToken}`,
            'cache-control': 'no-cache',
            'client-model': 'WEB',
            'client-version': '5',
            'content-type': 'application/json',
            'device-model': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'lang': 'EN',
            'origin': 'https://elmenus.com',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://elmenus.com/cairo/qedra-48qx',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'x-device-id': deviceId
        }
    };

    const response = await axios.request(config);

    return response?.data?.data[0]?.uuid;
}

async function isAlreadyGroupMember(restaurantUUID, accessToken, deviceId) {
    let data = JSON.stringify({
        "restaurantUUID": restaurantUUID,
        "basketUUID": null
    });

    let config = {
        method: 'post',
        url: 'https://elmenus.com/2.0/basket/state',
        headers: {
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${accessToken}`,
            'cache-control': 'no-cache',
            'client-model': 'WEB',
            'client-version': '5',
            'content-type': 'application/json',
            'device-model': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'lang': 'EN',
            'origin': 'https://elmenus.com',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://elmenus.com/cairo/qedra-48qx',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'x-device-id': deviceId
        },
        data: data
    };

    const response = await axios.request(config);

    return response?.data?.state == 'MEMBER_IN_THIS_GROUP';
}

async function startGroupOrder(restaurantUUID, branchId, zoneId, accessToken, deviceId) {
    try {

        let data = JSON.stringify({
            restaurantUUID: restaurantUUID,
            branchUUID: branchId,
            zoneUUID: zoneId
        });

        let config = {
            method: 'post',
            url: 'https://elmenus.com/2.0/basket/group',
            headers: {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': `Bearer ${accessToken}`,
                'cache-control': 'no-cache',
                'client-model': 'WEB',
                'client-version': '5',
                'content-type': 'application/json',
                'device-model': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                'lang': 'EN',
                'origin': 'https://elmenus.com',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://elmenus.com/cairo/qedra-48qx',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                'x-device-id': deviceId
            },
            data: data
        };

        const response = await axios.request(config);

        return {groupLink: response?.data?.data?.link, groupId: response?.data?.uuid};
    }
    catch (e) {
        console.error("error occured while creating group order", e);
        
        return null;
    }
}

async function addItemToGroupOrder(groupId, item, accessToken, deviceId){
    try {

        let data = JSON.stringify(item);

        let config = {
            method: 'post',
            url: `https://elmenus.com/2.0/basket/group/${groupId}/item`,
            headers: {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': `Bearer ${accessToken}`,
                'cache-control': 'no-cache',
                'client-model': 'WEB',
                'client-version': '5',
                'content-type': 'application/json',
                'device-model': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                'lang': 'EN',
                'origin': 'https://elmenus.com',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://elmenus.com/cairo/qedra-48qx',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                'x-device-id': deviceId
            },
            data: data
        };

        const response = await axios.request(config);

        return response?.data?.data?.link;
    }
    catch (e) {
        console.error("error occured while add item to order", e);
        
        return null;
    }
}


module.exports = { getElmenusAccessToken, isAlreadyGroupMember, startGroupOrder, getRestaurantId, addItemToGroupOrder };
