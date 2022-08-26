console.clear();


const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

console.log(path.join(basePath, "/supporting/collection_array.txt"));
const { baseUri } = require(path.join(basePath, "/supporting/collection_array.txt"));


// Writing to filen
const writeStream = fs.createWriteStream(`${basePath}/supporting/collection_array.txt`);
const pathName = writeStream.path;


// Instructions/ Setup

const CID_baseURI = "bafybeifw4yljxpvg2xepvn7id6jxzet5cdollvoq5f4m7nmhss3gdmodce" // e.g. first part of "Qmc2eUqWJi1fCHpGZ3ApmZgB77cCJU7jLBtztC3fW12gF1/1.json"
const collectionSize = 3333; 

// Workflow

CIDarray = [];
for (var i = 1; i < collectionSize+1; i++) {
    let currentCID = `${CID_baseURI}/${i}.json`
    console.log(`Current CID  ${currentCID}`);
    CIDarray.push(currentCID);
    
    if(i === collectionSize){
console.log(CIDarray)

writeStream.write("[")
// write each value of the array on the file breaking line
CIDarray.forEach(value => writeStream.write(`'${value}',\n`));

writeStream.write("]")
// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
   
   console.log(`wrote all the array data to file ${pathName}`);
});

// handle the errors on the write process
writeStream.on('error', (err) => {
    console.error(`There is an error writing the file ${pathName} => ${err}`)
});

// close the stream
writeStream.end();

    }
}


