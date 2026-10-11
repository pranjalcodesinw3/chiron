import { hrefFor, net, NETS, type ChainKey } from '../chain';

/** Which network the page reads. A plain link per network: switching reloads, so every read and the wallet target follow. */
export function ChainSwitch() {
  return (
    <nav className="chainsw" aria-label="Network">
      {(Object.keys(NETS) as ChainKey[]).map((k) => {
        const n = NETS[k];
        const on = k === net.key;
        return (
          <a key={k} href={hrefFor(k)} className={on ? 'on' : undefined} aria-current={on ? 'true' : undefined} title={`${n.name}, chain ${n.id}`}>
            <span className={`dot ${k}`} aria-hidden="true" />
            {n.short}
            <span className="chainsw-id">{n.id}</span>
          </a>
        );
      })}
    </nav>
  );
}
