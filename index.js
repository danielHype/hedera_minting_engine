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
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
const bobId = AccountId.fromString(process.env.BOB_ID);
const bobKey = PrivateKey.fromString(process.env.BOB_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();
// const kycKey = PrivateKey.generate();
// const newKycKey = PrivateKey.generate();
// const pauseKey = PrivateKey.generate();
// const freezeKey = PrivateKey.generate();
// const wipekey = PrivateKey.generate();

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

    nftLeaf = [];
    for (var i = 0; i < CID.length; i++) {
        nftLeaf[i] = await tokenMinterFcn(CID[i]);
        console.log(`Created NFT ${tokenId} with serial: ${nftLeaf[i].serials[0].low}`);
    }

    // metadata scheme: https://github.com/hashgraph/hedera-improvement-proposal/blob/master/HIP/hip-10.md

    // Setting metadta: CID leads to metadata.json 
    //
    //async function tokenMinterFcn(CID) {
    //     mintTx = await new TokenMintTransaction()
    //         .setTokenId(tokenId)
    //         .setMetadata([Buffer.from(CID)])
    //         .freezeWith(client);
    // 

    // Add Metadata: https://docs.hedera.com/guides/getting-started/try-examples/create-and-transfer-your-first-nft

    // BURN THE LAST NFT IN THE COLLECTION

    let tokenBurnTx = await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setSerials([CID.length])
        .freezeWith(client)
        .sign(supplyKey);

    let tokenBurnSubmit = await tokenBurnTx.execute(client);
    let tokenBurnRx = await tokenBurnSubmit.getReceipt(client);
    console.log(`\nBurn NFT with serial ${CID.length}: ${tokenBurnRx.status}`);


    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.log(`Current NFT Supply: ${tokenInfo.totalSupply}`);

    // MANUAL ASSOCIATION FOR ALICE'S ACCOUNT

    let associateAliceTx = await new TokenAssociateTransaction()
        .setAccountId(aliceId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(aliceKey);

    let associateAliceTxSubmit = await associateAliceTx.execute(client);
    let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);
    console.log(`\n- Alice NFT manual association: ${associateAliceRx.status}`);

    // AUTO-ASSOCIATION

    let associateTx = await new AccountUpdateTransaction()
    .setAccountId(aliceId)
    .setMaxAutomaticTokenAssociations(100)
    .freezeWith(client)
    .sign(aliceKey)
    let associateTxSubmit = await associateTx.execute(client);
    let associateRx = await associateTxSubmit.getReceipt(client);

    console.log(`Alice NFT Auto-association: ${associateRx.status} \n` )


    // MANUAL ASSOCIATION FOR BOB'S ACCOUNT

    let associateBobTx = await new TokenAssociateTransaction()
        .setAccountId(bobId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(bobKey);

    let associateBobTxSubmit = await associateBobTx.execute(client);
    let associateBobRx = await associateBobTxSubmit.getReceipt(client);
    console.log(`\n- Bob NFT manual association: ${associateBobRx.status}`);


    // BALANCE CHECK 1

    tB = await bCheckerFcn(treasuryId);
    aB = await bCheckerFcn(aliceId);
    bB = await bCheckerFcn(bobId);
    console.log(`- Treasury Balance: ${tB[0]}   NFTs of ID: ${tokenId} and ${tB[1]}`);
    console.log(`- Alice Balance: ${aB[0]}   NFTs of ID: ${tokenId} and ${aB[1]}`);
    console.log(`- Bob Balance: ${bB[0]}   NFTs of ID: ${tokenId} and ${bB[1]}`);

    // 1st BALANCE CHECK

    let tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, 2, treasuryId, aliceId)
    .freezeWith(client)
    .sign(treasuryKey);

    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    console.log(`\n  NFT transfer Treasury -> Alice Status: ${tokenTransferRx.status} \n`)


   // 2st BALANCE CHECK

     tB = await bCheckerFcn(treasuryId);
     aB = await bCheckerFcn(aliceId);
     bB = await bCheckerFcn(bobId);
     console.log(`- Treasury Balance: ${tB[0]} NFTs of ID: ${tokenId} and ${tB[1]}`);
     console.log(`- Alice Balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
     console.log(`- Bob Balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);
 

    // 2st NFT TRANSFER NFT Alice -> Bob

    let tokenTransferTx2 = await new TransferTransaction()
    .addNftTransfer(tokenId, 2, aliceId, bobId)
    .addHbarTransfer(aliceId, 100)
    .addHbarTransfer(bobId, -100)
    .freezeWith(client)
    .sign(aliceKey)

    let tokenTransferTx2Sign = await tokenTransferTx2.sign(bobKey);
    let tokenTransferSubmit2 = await tokenTransferTx2Sign.execute(client);
    let tokenTransferRx2 = await tokenTransferSubmit2.getReceipt(client);

    console.log(`\n NFT transfer Alce Status: ${tokenTransferRx2.status} \n`)

     // 3rd BALANCE CHECK

     tB = await bCheckerFcn(treasuryId);
     aB = await bCheckerFcn(aliceId);
     bB = await bCheckerFcn(bobId);
     console.log(`- Treasury Balance: ${tB[0]} NFTs of ID: ${tokenId} and ${tB[1]}`);
     console.log(`- Alice Balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
     console.log(`- Bob Balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);



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