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
        Chiron on {chain.name}, chain {chain.id}. Every figure is a chain read at the block shown beside it.{' '}
        The same account contract is live on <a href={hrefFor(otherNet.key)}>{otherNet.name}</a>.
      </span>
      <a href={explorer.address(account)} target="_blank" rel="noreferrer">
        The deployed account on {net.explorerName}
      </a>
    </footer>
  );
}

function Rail() {
  const account = useAccountParam();
  return (
    <aside className="rail">
      <NavLink to="/" className="mark" aria-label="Chiron, the account" />
      <a className="rail-acct" href={explorer.address(account)} target="_blank" rel="noreferrer" title={account}>
        Account {account.slice(0, 6)}...{account.slice(-4)}
      </a>
    </aside>
  );
}

function Header() {
  return (
    <header className="top">
      <NavLink to="/" className="wordmark">
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
            <Rail />
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
