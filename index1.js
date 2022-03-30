console.clear();
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
    TokenSupplyType,
    TokenMintTransaction,
    TokenBurnTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    TokenAssociateTransaction,
    TokenUpdateTransaction,
    TokenGrantKycTransaction,
    TokenRevokeKycTransaction,
    ScheduleCreateTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
} = require("@hashgraph/sdk");

// console.log(process.env.OPERATOR_ID)
// console.log(process.env.OPERATOR_PVKEY)

// Configure account and client, and generate needed keys

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
// const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PVKEY);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
const bobId = AccountId.fromString(process.env.BOB_ID);
const bobKey = PrivateKey.fromString(process.env.BOB_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();
const kycKey = PrivateKey.generate();
const newKycKey = PrivateKey.generate();
const pauseKey = PrivateKey.generate();
const freezeKey = PrivateKey.generate();
const wipekey = PrivateKey.generate();

//IPFS content identifiers for whch we will create NFTs

CID = [
    "IPDS Files go here",
    "IPDS Files go here",
    "IPDS Files go here",
    "QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa",
]


async function main() {

    //   //Grab your Hedera testnet account ID and private key from your .env file
    //   const operatorId = process.env.MY_ACCOUNT_ID;
    //   const myPrivateKey = process.env.MY_PRIVATE_KEY;


    // If we weren't able to grab it, we should throw a new error
    if (operatorId == null ||
        operatorKey == null) {
        throw new Error("Environment variables operatorId and operatorKey must be present");
    }


    // DEFINE CUSTOM FEE SCHEDULE

    let nftCustomFee = await new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(10)
        .setFeeCollectorAccountId(treasuryId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

    // CREATE NFT WITH CUSTOM FEE

    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("GPPG Collection Test")
        .setTokenSymbol("GPPG")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        .setKycKey(kycKey)
        .setPauseKey(pauseKey)
        .setFreezeKey(freezeKey)
        .setWipeKey(wipekey)
        .freezeWith(client);
    //    .sign(treasuryKey);

    console.log("nftCreate    " + nftCreate);
    console.log("CID.length    " + CID.length);
    //Sign the transaction with the treasury key

    let nftCreateSign = await nftCreate.sign(adminKey);
    // console.log("nftCreateSign    " + JSON.stringify(nftCreateSign));


    //Submit the transaction to a Hedera network

    let nftCreateSubmit = await nftCreateSign.execute(client);
    console.log("nftCreateSubmit    " + nftCreateSubmit);

    //Get the transaction receipt

    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    console.log("nftCreateRx    " + nftCreateRx);

    //Get the token ID

    let tokenId = nftCreateRx.tokenId;

    //Log the token ID

    console.log(`Creatd NFT with Token Id: ${tokenId} \n`)

    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT

    // var tokenInfo = await tQueryFcn();
    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client)

    console.table(tokenInfo.customFees[0]);



}

main();