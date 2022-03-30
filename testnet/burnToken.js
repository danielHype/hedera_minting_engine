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

const supplyKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const adminKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
// const kycKey = PrivateKey.generate();
// const newKycKey = PrivateKey.generate();
// const pauseKey = PrivateKey.generate();
// const freezeKey = PrivateKey.generate();
// const wipekey = PrivateKey.generate();

var tokenId = "0.0.29515819";

async function tokenBurnerFcn() {

//Burn 1,000 tokens and freeze the unsigned transaction for manual signing
const transaction = await new TokenBurnTransaction()
     .setTokenId(tokenId)
     .setSerials([166])
    //  .addSerial(166)
     .freezeWith(client);

//Sign with the supply private key of the token 
const signTx = await transaction.sign(supplyKey);

//Submit the transaction to a Hedera network    
const txResponse = await signTx.execute(client);

//Request the receipt of the transaction
const receipt = await txResponse.getReceipt(client);
    
//Get the transaction consensus status
const transactionStatus = receipt.status;

console.log("The transaction consensus status " +transactionStatus.toString());

//v2.0.7

}

tokenBurnerFcn();