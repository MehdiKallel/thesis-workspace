'use strict';
const fs = require('fs');
const prompt = require('prompt-sync')();

async function getInput() {
    let array = [];
    let max = prompt('What should be the maximum transaction payload size in Bytes?');
    let min = prompt('What should be the minimum transaction payload size in Bytes?');
    let number = prompt('How many objects do you want to generate?');
    array.push(max);
    array.push(min);
    array.push(number);
    return array;
}



async function createRandomObj(fieldCount) {
    let generatedObj = {};
    for (let i = 0; i < fieldCount; i++) {
        generatedObj['Q' + i] = '';
    }
    return generatedObj;
}


async function generateData(target, object) {
    while ((Buffer.byteLength(JSON.stringify(object)) < target)) {
        for (let key in object) {
            // eslint-disable-next-line no-prototype-builtins
            if (object.hasOwnProperty(key)) {
                object[key] = object[key] + '-';
            }
        }
    }
    return object;
}

async function populate() {
    let data = [];
    let results = await getInput();
    let base = await createRandomObj(10);
    for (let i = 0; i < results[2]; i++) {
        let min = Math.ceil(results[1]);
        let max = Math.floor(results[0]);
        let target = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(target);
        generateData(target, base).then(function (value) {
            data.push(value);
        });
    }
    return data;
}

populate().then(function (data) {
    console.log(Buffer.byteLength(JSON.stringify(data[0])));
    let jsonData = JSON.stringify(data);
    fs.writeFile('../complaints.json', jsonData, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('complaints data was generated successfully!');
    });
});
