'use strict';

require('colors');
const request = require('request');
const cheerio = require('cheerio');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function init() {    
    fetchCategories();
}

function fetchCategories() {    
    const url = 'https://www.bankmega.com/promolainnya.php';
    
    request(url, function (err, res, body) {
        if (err && res.statusCode !== 200) throw err;
    
        const $ = cheerio.load(body);
        const dom = new JSDOM(body);
        let categories = []
        
        $('#subcatpromo').each((i, value) => {
            $(value).find('img').each((j, data) => {
                categories.push(data.attribs.id);
                // https://www.bankmega.com/ajax.promolainnya.php?product=0&subcat=3
            });
        });

        fetchSubCategories(categories, $, dom)
    });
}

function fetchSubCategories(categories, $, dom) {
    let result = {};
    // let subCategories = [];

    categories.map((value, key) => {
        dom.window.document.getElementById(value).click();
        setTimeout(function(){ resultSetter(result, $, value) }, 5000);
        // $('#promolain').each((i, value) => {
        //     $(value).find('img').each((j, data) => {
        //         subCategories[j] = {
        //            title: data.attribs.title,
        //            imageurl: data.attribs.src
        //        }
        //     });
        // });
        // result[value] = subCategories
    })  
}

function resultSetter(result, $, category) {
    let subCategories = [];

    $('#promolain').each((i, value) => {
        $(value).find('img').each((j, data) => {
            subCategories[j] = {
               title: data.attribs.title,
               imageurl: data.attribs.src
           }
        });
    });
    result[category] = subCategories
    console.log(result);
}

init();