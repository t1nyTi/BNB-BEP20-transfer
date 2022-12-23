import Home from "./pages/Home";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const App = () => {
  function getLibrary(provider) {
    const library = new Web3Provider(provider);
    return library;
  }
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Home />
    </Web3ReactProvider>
  );
};

export default App;
