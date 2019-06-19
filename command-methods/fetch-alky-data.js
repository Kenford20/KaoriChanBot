const fetch = require('node-fetch');

module.exports = async function fetchAlky(alkyAPI) {
    try {
        const alkyData = await fetch(alkyAPI, {
            method: 'GET',
            header: {"Content-Type": "application/json"}
        }).then(response => response.json());

        if(alkyData.drinks) {
            let i = 1;
            let ingredient = 'strIngredient' + i;
            let alkyIngredients = '';

            while(alkyData.drinks[0][ingredient]) {
                ingredient = 'strIngredient' + i;
                alkyIngredients += `${alkyData.drinks[0][ingredient]}, `;
                i++;
            }
            return [alkyData.drinks[0], alkyIngredients];
        } else {
            return Promise.reject('Senpai, you dunk?? Thats an invalid alky name!');
        }
    } catch(err) {
        console.log('throw')
        throw err;
    }
}