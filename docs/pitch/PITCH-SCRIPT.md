# CHIRON pitch script (Colosseum brief)

Brief: "Tell us what you're building, and tell us why you're the people to build it. Nothing fancy required. We're interested in how you think and communicate."

Target: under 2 minutes spoken, about 250 words. Read as Kamal, to camera.

## Script

Hi, I'm Kamal. I'm building Chiron.

Robinhood just announced agents that trade for you. You give an agent an allowance and some limits. But Robinhood also says it does not check or audit the agents. So you are trusting that the software holding the key is the software you picked.

Chiron is a trading account for an AI agent on Robinhood Chain. You fund it and set caps, like an allowance. Before the agent's key can trade, the account checks a hardware attestation from the machine the agent runs in. If the code is not the code you approved, the key is never let in. Every trade then records which model made the decision, and that record can be checked by anyone.

So the account can say three things with proof: who is trading, inside what limits, and on whose advice.

Why me? Because this is already running, not a slide.

The agent has traded Tesla stock tokens on Robinhood Chain testnet, and its refusals are onchain too. When it asked for a trade over its cap, the account reverted it and no money moved.

And the attestation check works against a real attacker. I took a genuine Intel TDX quote from someone else's machine, aimed it at my account, and the contract rejected it, because that code was never approved.

Every one of those is a public transaction you can open right now.

Next is mainnet, with real owners setting real limits. Thanks for listening.

## Sources (not spoken)

- Robinhood Agents announcement and the "does not control, supervise, monitor, recommend, or audit agents" line: https://robinhood.com/us/en/newsroom/hood-summit-2026/ (quoted in `docs/SUBMISSION.md`).
- Agent trade, TSLA bought inside the cap, `TradeExecuted` with the served model hash: https://explorer.testnet.chain.robinhood.com/tx/0xe50522661b55c797071b56e43aaf2bc91d37c9745a295ff6a5976883dd4ddfa2
- Over-cap trade refused, `ExceedsPerTradeCap(10000001, 10000000)`, balances unchanged: https://explorer.testnet.chain.robinhood.com/tx/0xb1adb7231fbd38b77489769d7db754b30f36fa9b1ba97bf14f51980f3b12528c
- Someone else's genuine TDX quote (Phala gateway) sent to `registerAgent`, reverted `MeasurementNotApproved(0xfd34caab...0149)`, `agent()` unchanged: https://explorer.testnet.chain.robinhood.com/tx/0xf98156ad950c82abe4ce3ab0eac3da0ae860d1abd91fdb9eb545aa87e7e2fcc8 (row "Stolen signer" in `docs/e2e/robinhood-testnet-agent-account.md`)
- The approved agent admitted by the same check, `registerAgent` success, 2,584,842 gas: https://explorer.testnet.chain.robinhood.com/tx/0x1f15df28041e7b8938ca6653eb5a75231f525568ab015644ec535796caa68134
- The onchain TDX quote verifier (Stylus, Rust): `verifier/src/lib.rs`; account logic: `contracts/`; full transaction list: `docs/e2e/robinhood-testnet-agent-account.md`; track section: `docs/SUBMISSION.md` ("Robinhood Chain track").
