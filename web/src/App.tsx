import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getAddress, isAddress } from 'viem';
import { BrowserRouter, NavLink, Route, Routes, useSearchParams } from 'react-router-dom';
import { ACCOUNT, chain, explorer, net, otherNet, hrefFor, wagmiConfig } from './chain';
import { ChainSwitch } from './components/ChainSwitch';
import { Wallet } from './components/Wallet';
import { TxStatusPanel } from './components/TxStatus';
import { Account } from './pages/Account';

const queryClient = new QueryClient();

function useAccountParam() {
  const [params] = useSearchParams();
  const raw = params.get('account') ?? '';
  return isAddress(raw) ? getAddress(raw) : ACCOUNT;
}

function Footer() {
  const account = useAccountParam();
  return (
    <footer className="foot">
      <span>
        Chiron on {chain.name}, chain {chain.id}. Figures are live chain reads at the block shown under the headline.{' '}
        The same account contract is live on <a className="link" href={hrefFor(otherNet.key)}>{otherNet.name}</a>.
      </span>
      <a className="link" href={explorer.address(account)} target="_blank" rel="noreferrer">
        The deployed account on {net.explorerName}
      </a>
    </footer>
  );
}

function Header() {
  return (
    <header className="top">
      <NavLink to="/" className="wordmark" aria-label="Chiron home">
        <svg className="mark" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="3" height="14" rx="1" /><rect x="15" y="3" width="3" height="14" rx="1" /><rect x="5" y="8.5" width="10" height="3" rx="1" /></svg>
        CHIRON
      </NavLink>
      <ChainSwitch />
      <Wallet />
    </header>
  );
}

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="shell">
            <main className="main">
              <Header />
              <Routes>
                <Route path="/" element={<Account />} />
              </Routes>
              <Footer />
            </main>
          </div>
          <TxStatusPanel />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
