# CHIRON demo script

Length: 2:50. Screen recording at 1440 wide, voiceover as Kamal. Every link below is live; nothing is signed and no funds move during the demo.

App: LIVE_URL/?chain=robinhood

| Time | Shot (on screen) | Voiceover |
|---|---|---|
| 0:00-0:15 | App opens on Robinhood Chain testnet. Cursor rests on the network badge "Robinhood Chain Testnet · chain 46630". | This is Chiron, a trading account for an AI agent on Robinhood Chain. Everything on this page is read live from the chain. |
| 0:15-0:35 | Zoom on the big "3", the red "4 calls refused" chip and the cap left today. | The agent made three trades inside the limits I set. Four calls were refused, and none of the money they asked for was spent. |
| 0:35-0:55 | Click the trust link "Agent TDX quote verified on chain". Explorer opens the `registerAgent` transaction. | Before this agent could trade at all, the account checked an Intel TDX attestation from the machine it runs in, onchain, in a Stylus contract. Only code I approved gets in. |
| 0:55-1:15 | Back in the app, scroll to the four-check strip. Hover each step and its "refused here" count. | Every call goes through four checks: a verified agent, approved code, room under the cap, and a receipt from the model I pinned. The strip shows where each refusal happened. |
| 1:15-1:35 | Scroll to the caps chart. Point at the refused mark past the red cap line. | Here is the cap. This red mark is the agent asking for 10.000001 when the cap is 10. One millionth over, and it reverts. |
| 1:35-1:50 | Open the over-cap tx on the explorer: reverted `ExceedsPerTradeCap(10000001, 10000000)`. | That is the real transaction. Reverted, balances unchanged. |
| 1:50-2:10 | Open the stolen-signer tx: reverted `MeasurementNotApproved`. | This one is someone else's genuine TDX quote sent at my account. The hardware is real, but the code was never approved, so it is refused. |
| 2:10-2:30 | Back in the app, click "Recheck every receipt". Chips turn to "3 of 3 receipts verified". | Anyone can recheck every trade's model receipt right in the browser, with nothing to sign. |
| 2:30-2:42 | Click the header switch to Arbitrum. The same page loads for chain 421614. | The same account contract runs on Arbitrum Sepolia, behind one switch. |
| 2:42-2:50 | Back on Robinhood Chain, rest on the hero. | Chiron: who is trading, inside what limits, and on whose advice, all with proof. |

## Links used in the demo

- App: LIVE_URL/?chain=robinhood (Arbitrum: LIVE_URL/?chain=arbitrum)
- Agent admitted, `registerAgent` success: https://explorer.testnet.chain.robinhood.com/tx/0x1f15df28041e7b8938ca6653eb5a75231f525568ab015644ec535796caa68134 (the app's trust link points at the latest admission of the current agent)
- Trade executed inside the cap: https://explorer.testnet.chain.robinhood.com/tx/0xe50522661b55c797071b56e43aaf2bc91d37c9745a295ff6a5976883dd4ddfa2
- Over-cap refusal: https://explorer.testnet.chain.robinhood.com/tx/0xb1adb7231fbd38b77489769d7db754b30f36fa9b1ba97bf14f51980f3b12528c
- Someone else's TDX quote refused: https://explorer.testnet.chain.robinhood.com/tx/0xf98156ad950c82abe4ce3ab0eac3da0ae860d1abd91fdb9eb545aa87e7e2fcc8
- Account: https://explorer.testnet.chain.robinhood.com/address/0x9c69A43F16E994Ce45e9EE896E2D01369b0Aaa6D
