const fetch = require('node-fetch');

module.exports = async function fetchAlky(alkyAPI) {
    try {
        const response = await fetch(alkyAPI, {
            method: 'GET',
            header: {"Content-Type": "application/json"}
        });
        const data = await response.json();

        if(data.drinks) {
            let i = 1;
            let ingredient = 'strIngredient' + i;
            let alkyIngredients = '';

            while(data.drinks[0][ingredient]) {
                ingredient = 'strIngredient' + i;
                alkyIngredients += `${data.drinks[0][ingredient]}, `;
                i++;
            }
            return [data.drinks[0], alkyIngredients];
        } else {
            return Promise.reject('Senpai, you dunk?? Thats an invalid alky name!');
        }
    } catch(err) {
        console.log('throw')
        throw err;
    }
}