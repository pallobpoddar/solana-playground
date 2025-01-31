const { decodeInstructionData } = require("./decoder");
const programAccounts = require("./programAccounts.json");

class Transaction {
  constructor(signature, connection) {
    this.signature = signature;
    this.connection = connection;
  }

  async getTransactionDetails() {
    const transactionDetails = await this.connection.getTransaction(
      this.signature,
      {
        maxSupportedTransactionVersion: 0,
      }
    );

    return transactionDetails;
  }

  async setTransactionDetails(transactionDetails) {
    this.details = transactionDetails;
  }

  async getBlockTime() {
    return new Date(this.details.blockTime * 1000).toString();
  }

  async getSigner() {
    return this.details.transaction.message.staticAccountKeys[0].toBase58();
  }

  async getFee() {
    return `${this.details.meta.fee / 1000000000} SOL`;
  }

  async getPriorityFee() {
    const computeBudgetProgramId =
      "ComputeBudget111111111111111111111111111111";
    const computeBudgetProgramIdIndex =
      this.details.transaction.message.staticAccountKeys.findIndex(
        (staticAccountKey) =>
          staticAccountKey.toString() === computeBudgetProgramId
      );
    let computeBudgetInstructions =
      this.details.transaction.message.compiledInstructions.filter(
        (compiledInstruction) =>
          compiledInstruction.programIdIndex === computeBudgetProgramIdIndex
      );

    computeBudgetInstructions = computeBudgetInstructions.map(
      (instruction) => ({
        ...instruction,
        data: decodeInstructionData(instruction.data),
      })
    );

    let units, microLamports;
    computeBudgetInstructions.map((instruction) => {
      if (instruction.data.discriminator === 2) {
        units = instruction.data.units;
      } else if (instruction.data.discriminator === 3) {
        microLamports = instruction.data.microLamports;
      }
    });

    const priorityFee = (units * microLamports) / 1000000 / 1000000000;

    return priorityFee ? `${priorityFee.toFixed(10)} SOL` : null;
  }

  async getTransactionActions() {
    const transactionActions =
      this.details.transaction.message.compiledInstructions.map(
        (compiledInstruction) => {
          const programId =
            this.details.transaction.message.staticAccountKeys[
              compiledInstruction.programIdIndex
            ].toBase58();

          const program = {
            name: Object.keys(programAccounts).find(
              (programAccount) => programAccounts[programAccount] === programId
            ),
            id: programId,
          };

          const accounts = compiledInstruction.accountKeyIndexes.map(
            (accountKeyIndex) => {
              const key =
                this.details.transaction.message.staticAccountKeys[
                  accountKeyIndex
                ]?.toBase58();
              const name = Object.keys(programAccounts).find(
                (programAccount) => programAccounts[programAccount] === key
              );

              return {
                name,
                key,
              };
            }
          );

          // eslint-disable-next-line no-unused-vars
          const { programIdIndex, accountKeyIndexes, data, ...rest } =
            compiledInstruction;

          return {
            ...rest,
            program,
            accounts,
          };
        }
      );
    return transactionActions;
  }
}

module.exports = Transaction;
