import { Connection, clusterApiUrl } from "@solana/web3.js";

const globalForConnection = globalThis as unknown as {
  solanaConnection: Connection | undefined;
};

/**
 * Returns a singleton Solana RPC connection.
 * Reads SOLANA_RPC_URL (custom RPC) and SOLANA_NETWORK (devnet | testnet | mainnet-beta)
 * from environment variables.
 */
export function getConnection(): Connection {
  if (globalForConnection.solanaConnection) {
    return globalForConnection.solanaConnection;
  }

  const network = (process.env.SOLANA_NETWORK || "mainnet-beta") as
    | "devnet"
    | "testnet"
    | "mainnet-beta";

  const endpoint = process.env.SOLANA_RPC_URL || clusterApiUrl(network);

  const connection = new Connection(endpoint, {
    commitment: "confirmed",
  });

  if (process.env.NODE_ENV !== "production") {
    globalForConnection.solanaConnection = connection;
  }

  return connection;
}
