const dotenv = require("dotenv");
const { Connection } = require("@solana/web3.js");
const Transaction = require("./Transaction");

dotenv.config();

async function app() {
  const connection = new Connection(process.env.RPC_ENDPOINT, "confirmed");
  const signature =
    "5mNMzwTDLWMx1EfTLXet9gTNr3smGxbKYiwJnr22kVRTGKuhG2sixtF3nxwELT9YS8yQkDvR7ZzUJDCCzCBkn8X";

  const transaction = new Transaction(signature, connection);
  const transactionDetails = await transaction.getTransactionDetails();
  await transaction.setTransactionDetails(transactionDetails);
  const blockTime = await transaction.getBlockTime();
  const signer = await transaction.getSigner();
  const transactionActions = await transaction.getTransactionActions();
  const fee = await transaction.getFee();
  const priorityFee = await transaction.getPriorityFee();

  const data = {
    blockTime,
    signer,
    fee,
    priorityFee,
    transactionActions,
  };
  console.log(JSON.stringify(data, null, 2));
}

app();
