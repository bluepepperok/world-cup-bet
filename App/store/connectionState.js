import { createGlobalState } from "react-hooks-global-state";

const connectionState = {
  connected: false,
  accountConnected: null,
  balance: 0,
  tokenAddress: "",
  fixedBetAmount: 0,
};

export const { useGlobalState } = createGlobalState(connectionState);
