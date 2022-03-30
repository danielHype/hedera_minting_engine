console.clear();
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenInfoQuery,
    TokenMintTransaction,
} = require("@hashgraph/sdk");

// console.log(process.env.OPERATOR_ID)
// console.log(process.env.OPERATOR_PVKEY)

// Configure account and client, and generate needed keys

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Insert content from collectio_array (after updating)

const CID = require("../supporting/collection_array")

console.log(CID)

async function main() {

    //Put token ID in there

    let tokenId = "0.0.27562031";

    // var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client)
    
    const existingSupplyKey = operatorKey;
    console.log("existingSupplyKey  "+existingSupplyKey)

    //Log the token ID

    console.log(`Used token with Token Id: ${tokenId} \n`)


    // MINT NEW BATCH OF NFTS

    let nftGPPG = [];
    for (var i = 25; i < CID.length; i++) {
        nftGPPG[i] = await tokenMinterFcn(CID[i]);
        console.log(`Created NFT ${tokenId} with serial: ${nftGPPG[i].serials[0].low}`);
    }

    // TOKEN MINTER FUNCTION ===============
    async function tokenMinterFcn(CID) {
        mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);

        let mintTxSign = await mintTx.sign(existingSupplyKey);
        let mintTxSubmit = await mintTxSign.execute(client);
        let mintRx = await mintTxSubmit.getReceipt(client);
        return mintRx;

    }

}

main();