import "./App.css";
import Battery from "./compinents/Battery";
import Cpu from "./compinents/Cpu";
import Eta from "./compinents/Eta";
import Score from "./compinents/Score";
import Settings from "./compinents/Settings";
import Stdout from "./compinents/Stdout";
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
