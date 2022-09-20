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
    TokenInfo,
    TokenNftInfo,
    AccountUpdateTransaction,
    Transfer,
} = require("@hashgraph/sdk");

// console.log(process.env.OPERATOR_ID)
// console.log(process.env.OPERATOR_PVKEY)

// Configure account and client, and generate needed keys

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
// const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PVKEY);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_KEY);
// const client = Client.forMainnet().setOperator(operatorId, operatorKey);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const collectorId = AccountId.fromString(process.env.COLLECTOR_ID)

const supplyKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const adminKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
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


    // DEFINE CUSTOM FEE SCHEDULE

    let nftCustomFee = await new CustomRoyaltyFee()
        .setNumerator(15)
        .setDenominator(100)
        .setFeeCollectorAccountId(collectorId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(54)));

    // CREATE NFT WITH CUSTOM FEE

    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Pride Pandas")
        .setTokenSymbol("PP")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        // .setKycKey(kycKey)
        // .setPauseKey(pauseKey)
        // .setFreezeKey(freezeKey)
        // .setWipeKey(wipekey)
        .freezeWith(client)
        .sign(treasuryKey)

    //Sign the transaction with the treasury key

    let nftCreateSign = await nftCreate.sign(adminKey);

    //Submit the transaction to a Hedera network

    let nftCreateSubmit = await nftCreateSign.execute(client);

    //Get the transaction receipt

    let nftCreateRx = await nftCreateSubmit.getReceipt(client);

    //Get the token ID

    let tokenId = nftCreateRx.tokenId;

    //Log the token ID

    console.log(`Created NFT with Token Id: ${tokenId} \n`)

    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT

    // var tokenInfo = await tQueryFcn();
    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client)

    console.table(tokenInfo.customFees[0]);

    // MINT NEW BATCH OF NFTS

    cidArray = [];
    for (var i = 0; i < CID.length; i++) {
        cidArray[i] = await tokenMinterFcn(CID[i]);
        console.log(`Created NFT ${tokenId} with serial: ${cidArray[i].serials[0].low}`);
    }


    // TOKEN MINTER FUNCTION ===============
    async function tokenMinterFcn(CID) {
        mintTx = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);

        let mintTxSign = await mintTx.sign(supplyKey);
        let mintTxSubmit = await mintTxSign.execute(client);
        let mintRx = await mintTxSubmit.getReceipt(client);
        return mintRx;

    }

    

}

main();