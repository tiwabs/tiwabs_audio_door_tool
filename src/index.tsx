import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom";
import { GlobalStyle } from './styles/GlobalStyle'
import { Header } from './components/Header/Header'
import { Home } from './components/Home/Home'

ReactDOM.render(
  <MantineProvider theme={{ colorScheme: 'dark', focusRing: 'never' }}>
      <GlobalStyle />
      <Header />
      <Home />
  </MantineProvider>
, document.getElementById("root"));
