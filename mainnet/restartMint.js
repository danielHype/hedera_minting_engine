console.clear();
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenInfoQuery,
    TokenMintTransaction,
    AccountBalanceQuery,
} = require("@hashgraph/sdk");

// console.log(process.env.OPERATOR_ID)
// console.log(process.env.OPERATOR_PVKEY)

// Configure account and client, and generate needed keys

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
// const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PVKEY);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
// const client = Client.forMainnet().setOperator(operatorId, operatorKey);
const client = Client.forMainnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
// const adminKey = PrivateKey.generate();
// const kycKey = PrivateKey.generate();
// const newKycKey = PrivateKey.generate();
// const pauseKey = PrivateKey.generate();
// const freezeKey = PrivateKey.generate();
// const wipekey = PrivateKey.generate();

//IPFS content identifiers for whch we will create NFTs

// Insert content from collectio_array (after updating)

const CID = require("../supporting/collection_array")


console.log(CID)


async function main() {

    // If we weren't able to grab it, we should throw a new error
    if (operatorId == null ||
        operatorKey == null) {
        throw new Error("Environment variables operatorId and operatorKey must be present");
    }

    //Get the token ID

    let tokenId = "Add Token ID here";

    //Log the token ID

    console.log(`Used NFT with Token Id: ${tokenId} \n`)

    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT

    // var tokenInfo = await tQueryFcn();
    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client)

    console.table(tokenInfo.customFees[0]);

    // MINT NEW BATCH OF NFTS

    cidArray = [];
    for (var i = 3; i < CID.length; i++) {
        cidArray[i] = await tokenMinterFcn(CID[i]);
        console.log(`Created NFT ${tokenId} with serial: ${cidArray[i].serials[0].low}`);
    }


    // TOKEN MINTER FUNCTION ===============
    async function tokenMinterFcn(CID){
        mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);

        let mintTxSign = await mintTx.sign(supplyKey);
        let mintTxSubmit = await mintTxSign.execute(client);
        let mintRx = await mintTxSubmit.getReceipt(client);
        return mintRx;

    }

    // BALANCE CHECKER FUNCTION ==========

    async function bCheckerFcn(id){
        balanceCheckTx = await new AccountBalanceQuery().setAccountId(id).execute(client);
        return [balanceCheckTx.tokens._map.get(tokenId.toString()), balanceCheckTx.hbars];
    }

}

main();