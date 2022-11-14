export function getChainId(network) {
  if (network === "mainnet") return 1;
  if (network === "goerli") return 5;
  throw new Error("Unknown network");
}
