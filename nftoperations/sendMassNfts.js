console.clear();
require("dotenv").config();
const fetch = require("node-fetch");

const {
  AccountId,
  PrivateKey,
  Client,
  TransferTransaction,
} = require("@hashgraph/sdk");

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

const TREASURY_ID = AccountId.fromString(process.env.OPERATOR_ID);
const TREASURY_KEY = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

// Client for Mainnet
// const client = Client.forMainnet().setOperator(operatorId, operatorKey);

// Client for Testnet
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// const HEDERA_API_BASE_URL = "https://mainnet-public.mirrornode.hedera.com";
const HEDERA_API_BASE_URL = "https://testnet.mirrornode.hedera.com";

const tokenIdToSend = "0.0.34359655";
const accountReceiver = "0.0.26305510";

const MAX_BATCH_SIZE = 8;

async function sendMassNfts() {
  const allSerialsHeld = await getSerialsForTokenOnWallet(
    tokenIdToSend,
    operatorId
  );

  const nft_token_id = tokenIdToSend;

  try {
    for (let b = 0; b < allSerialsHeld.length; b++) {
      let startingPoint = b + MAX_BATCH_SIZE * b;
      let endPoint = b + MAX_BATCH_SIZE * b + MAX_BATCH_SIZE;
      let currentBatch = allSerialsHeld.slice(startingPoint, endPoint);

      let tokenTransferTx = await new TransferTransaction();

      for (let i = 0; i < currentBatch.length; i++) {
        let currentSerial = currentBatch[i].serial_number;

        tokenTransferTx.addNftTransfer(
          nft_token_id,
          currentSerial,
          operatorId,
          accountReceiver
        );
      }

      // SEND TOKENS

      tokenTransferTx.freezeWith(client);

      const tokenTransferTxSign = await tokenTransferTx.sign(TREASURY_KEY);
      let tokenTransferSubmit = await tokenTransferTxSign.execute(client);
      let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
      console.log(`Transfer status : ${tokenTransferRx.status} \n`);

      console.log(
        `${currentBatch.length} NFTs with token ID ${nft_token_id} were sent to ${accountReceiver}. Batch ${startingPoint} to ${endPoint}`
      );
    }

    // NFTsStillTosend = parseInt(nftsToSend) - parseInt(currentNFTSent);
  } catch (error) {
    console.log("Error while sending NFT: ", error);
  }
}

async function getSerialsForTokenOnWallet(tokenId, accountId) {
  let flag = true;
  let token_data = [];

  try {
    let apiUri = `/api/v1/accounts/${accountId}/nfts`;

    const options = {
      method: "GET",
      json: true,
      gzip: true,
    };

    do {
      const url = `${HEDERA_API_BASE_URL}${apiUri}`;
      console.log("url, ", url);
      const data = await fetch(url, options);

      if (!data.ok) {
        return [];
      }

      const result = await data.json().then(async (x) => {
        try {
          if (!x.nfts) {
            flag = false;
            return [];
          }

          const current_token_data = x.nfts;

          flag = x.links.next != null;
          if (x.links.next) {
            apiUri = x.links.next;
          }

          return current_token_data;
        } catch (error) {
          flag = false;
          return [];
        }
      });

      token_data = token_data.concat(result);
    } while (flag);
  } catch (error) {
    flag = false;
    return [];
  }

  const filteredTokenData = token_data.filter(function (el) {
    return el.token_id == tokenId;
  });

  return filteredTokenData;
}

sendMassNfts();
