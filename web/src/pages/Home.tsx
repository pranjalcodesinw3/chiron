import { useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { ACCOUNT, chain, explorer, modelName, VERIFIER } from '../chain';
import { GateLog } from '../components/GateLog';
import { Code, HexValue, Stamp } from '../components/Stamp';
import { useAtBlock } from '../hooks/useAtBlock';
import { fmtToken, fmtWhen, short } from '../lib/format';
import { buildGateRows, useGateLog } from './account/gateRows';
import { readAccount, ZERO_ADDR, type Snapshot } from './account/read';

function Check({ title, how, errors, children }: { title: string; how: ReactNode; errors: string[]; children: ReactNode }) {
  return (
    <li className="check">
      <div className="check-what">
        <h3 className="t-subject">{title}</h3>
        <p className="small">{how}</p>
      </div>
      <div className="check-live">{children}</div>
      <div className="check-err">
        {errors.map((e) => (
          <Code key={e}>{e}</Code>
        ))}
      </div>
    </li>
  );
}

function Checks({ snap, block, verifierBytes }: { snap?: Snapshot; block?: bigint; verifierBytes?: number }) {
  const usdg = snap?.tokens.find((t) => t.symbol.includes('USD'));
  const pending = 'reading';
  return (
    <section className="block" aria-labelledby="checks-h">
      <div className="block-head">
        <h2 id="checks-h" className="t-section">What the account checks before an agent&apos;s trade goes through</h2>
        {block !== undefined && <Stamp block={block} />}
      </div>
      <ol className="checks">
        <Check
          title="Intel hardware signed the agent's quote"
          how="A Stylus program walks the Intel TDX quote to Intel's root certificate inside the transaction. The quote carries the agent's key."
          errors={['SignatureInvalid', 'QeReportDataMismatch']}
        >
          <HexValue value={VERIFIER} head={4} tail={4} href={explorer.address(VERIFIER)} />
          <span className="small">{verifierBytes ? `Stylus program, ${verifierBytes.toLocaleString('en-US')} bytes on chain` : pending}</span>
        </Check>
        <Check title="The code it runs is on the owner's list" how="The quote's measurement, a hash of the agent's whole software stack, must be one the owner approved." errors={['MeasurementNotApproved']}>
          {!snap ? (
            <span className="small">{pending}</span>
          ) : snap.approved.length ? (
            snap.approved.map((m) => <HexValue key={m} value={m} head={6} tail={4} />)
          ) : (
            <>
              <b>none approved now</b>
              <span className="small">so no agent can be admitted</span>
            </>
          )}
        </Check>
        <Check title="The quote is fresh and made for this account" how="It must sign over this account's nonce for a block at most 256 blocks old, and it can be spent once." errors={['NonceMismatch', 'StaleRefBlock', 'QuoteAlreadyUsed']}>
          {!snap ? (
            <span className="small">{pending}</span>
          ) : snap.agent === ZERO_ADDR ? (
            <>
              <b>agent seat empty</b>
              <span className="small">no key can sign a trade</span>
            </>
          ) : (
            <>
              <HexValue value={snap.agent} head={4} tail={4} href={explorer.address(snap.agent)} />
              <span className="small">admitted until {fmtWhen(snap.agentExpiry)}</span>
            </>
          )}
        </Check>
        <Check title="The trade names the model that decided it" how="Each trade carries Phala's signed inference receipt. The served model must match the owner's pin, and a receipt is spent once." errors={['ModelMismatch', 'ReceiptAlreadyUsed']}>
          {!snap ? <span className="small">{pending}</span> : <b>{modelName(snap.requestedModelHash) ?? short(snap.requestedModelHash)}</b>}
          <span className="small">the pinned model</span>
        </Check>
        <Check title="The trade fits the owner's caps" how="A per-trade cap, a rolling 24-hour cap, and a line above which the trade waits for the owner." errors={['ExceedsPerTradeCap', 'DailyCapExceeded', 'NeedsApproval']}>
          {!usdg ? (
            <span className="small">{pending}</span>
          ) : (
            <>
              <b className="tnum">{fmtToken(usdg.limits.perTrade, usdg.decimals)} {usdg.symbol} a trade</b>
              <span className="small tnum">
                {fmtToken(usdg.limits.daily, usdg.decimals)} a day, owner approves above {fmtToken(usdg.limits.approvalAbove, usdg.decimals)}
              </span>
            </>
          )}
        </Check>
      </ol>
    </section>
  );
}

export function Home() {
  useEffect(() => {
    document.title = 'Chiron: an AI agent trades only from code Arbitrum has checked';
  }, []);
  const client = usePublicClient({ chainId: chain.id });
  const log = useGateLog(ACCOUNT);
  const snapQ = useAtBlock(['account', ACCOUNT], (c, b) => readAccount(c, ACCOUNT, b));
  const verifier = useQuery({
    queryKey: ['code', VERIFIER],
    enabled: !!client,
    staleTime: Infinity,
    queryFn: async () => ((await client!.getCode({ address: VERIFIER })) ?? '0x').length / 2 - 1,
  });
  const snap = snapQ.data?.value;
  const rows = useMemo(
    () => (log.data ? buildGateRows(log.data.logs, log.data.refusals, log.data.times, snap?.tokens ?? []) : undefined),
    [log.data, snap],
  );

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1 className="t-display">An AI agent trades from this account only after Arbitrum has checked the code it runs.</h1>
          <p className="lede">
            The owner approves the agent&apos;s code. A contract verifies the agent&apos;s Intel TDX quote against that approval before its key can
            sign a trade, and every trade records the model that decided it. Each line on the right is a transaction you can open and recheck.
          </p>
          <div className="cta">
            <Link className="btn" to="/account">Open the account</Link>
            <Link className="btn line" to="/verify">Verify a transaction</Link>
          </div>
        </div>
        <aside className="panel" aria-label="Gate log" aria-busy={!rows}>
          <div className="panel-head">
            <span className="t-label">Gate log · {short(ACCOUNT)}</span>
            {log.data && <Stamp block={log.data.head} label="block" />}
          </div>
          {log.isError ? (
            <div className="alarm" role="alert">
              <b>Could not read the chain.</b>
              <button className="textbtn" type="button" onClick={() => log.refetch()}>Read again</button>
            </div>
          ) : rows ? (
            <GateLog rows={rows} />
          ) : (
            <p className="panel-wait small">Reading the account&apos;s events and refusals from Arbitrum Sepolia.</p>
          )}
          {log.data?.refusalsError && <p className="panel-note small">Refusals are enumerated by Blockscout, which did not answer ({log.data.refusalsError}).</p>}
        </aside>
      </section>
      <Checks snap={snap} block={snapQ.data?.block} verifierBytes={verifier.data} />
    </>
  );
}
