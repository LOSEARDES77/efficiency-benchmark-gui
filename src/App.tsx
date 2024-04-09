import Battery from "./components/battery";
import Cpu from "./components/cpu";
import Eta from "./components/eta";
import Score from "./components/score";
import Settings from "./components/settings";
import Stdout from "./components/output";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Score />
      <Eta />
      <Cpu />
      <Battery />
      <Settings />
      <Stdout />
    </ThemeProvider>
  );
}

export default App;


