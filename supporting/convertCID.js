const CID = require('cids')

let imgCID = new CID('QmXiE6TJJsG2heLDDZrStP76R3rq7aHRkUYdXhcq3guAF7').toV1().toString('base32')
// → bafybeieliaqne2nkmmi4naxtjy7abynay5zet6zaighkxjkhq3krj5tzyy

console.log(imgCID)


let jsonCID = new CID('QmdGJNjq7VuZafw6ZDybcgiAeWNkm9ayg9ujh4GLp1cZGM').toV1().toString('base32')
// → bafybeig5yh6tbcnfsiy7dwj4ldyyqiul6tjvrtghm7boxzn6awm2me7dci
console.log(jsonCID)