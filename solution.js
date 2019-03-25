'use strict';

require('colors');
const request = require('request');
const cheerio = require('cheerio');
const baseUrl = 'https://www.bankmega.com/'
const fs = require('fs');

let result = {};
let subCategories = [];

function init() {
    categoriesCollector()
}

function fetchCategories() {
    const url = `${baseUrl}promolainnya.php`;

    return new Promise((resolve, reject) => {
        request(url, function (err, res, body) {
            if (err && res.statusCode !== 200) throw err;

            resolve(body);
        });
    })
}

async function categoriesCollector() {
    const body = await fetchCategories()
    const $ = cheerio.load(body);
    let categories = [];

    $('#subcatpromo').each((i, value) => {
        $(value).find('img').each((j, data) => {
            categories.push(data.attribs.id);                
        });
    });

    detailLinksCollector(categories)
}

async function detailLinksCollector(categories) {    
    await Promise.all(categories.map(async (category, key) => {
        const url = `${baseUrl}ajax.promolainnya.php?product=0&subcat=${key + 1}`;
        const body = await fetchDetailLinks(url)
        const $ = cheerio.load(body);
        
        $('#promolain').each((i, value) => {
            $(value).find('a').each((j, data) => {                                             
                subCategoriesCollector(category, data.attribs.href)
            });
        });
    }))    
}

function fetchDetailLinks(url) {
    return new Promise((resolve, reject) => {
        request(url, function (err, res, body) {
            if (err && res.statusCode !== 200) throw err;
            
            resolve(body)
        })
    })
}

async function subCategoriesCollector(category, link) {
    const body = await fetchSubCategories(link);
    const $ = cheerio.load(body);
    const subCategory = {
        title: $('.titleinside h3')[0]['children'][0]['data'],
        image_url: `${baseUrl}${ $('.keteranganinside img')[0]['attribs']['src']}`,
        area_promo: $('.area b')[0]['children'][0]['data'],
        start_period: $('.periode b')[0]['children'][0]['data'].replace(/[^a-zA-Z0-9 ]/g, "").trim(),
        end_period: $('.periode b')[1]['children'][0]['data'],
        category: category
    }
    
    resultSetter(category, subCategory)
}

function fetchSubCategories(link) {
    const url = `${baseUrl}${link}`;

    return new Promise((resolve, reject) => {
        request(url, function (err, res, body) {
            if (err && res.statusCode !== 200) throw err;

            resolve(body)            
        })
    })
}

function resultSetter(category, subCategory) {
    subCategories = [...subCategories, subCategory]
    result[category] = subCategories
    
    fs.writeFile ("solution.json", JSON.stringify(subCategories, null, 2), function(err) {
        if (err) throw err;
        console.log('complete');
    });
}

init();