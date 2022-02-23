const axios = require ('axios');
const general = require('../methods/general.js')

module.exports = {
    name: 'mal',
    description: "myanimelist",
    execute(message,args){
        
        const TOKEN_URL = 'https://myanimelist.net/v1/oauth2/authorize?'
        const TOKEN_DATA = {
            'client_id': '7dd11103c4d4a7dbd2b0f8708c8da2ac',
            'client_secret': '113f4b2d8e83da880b2017c92a38677fb26c54bd18df68c229c4e93fb344a90d',
            'scope': 'write:users',
            'response_type': 'code',
            'code_challenge': '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU'

        };
        
        const promise = axios.get(TOKEN_URL, data=TOKEN_DATA);
        const dataPromise = promise.then((response) => console.log(response));

    }
        
    
}
