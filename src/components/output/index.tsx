import './styles.css';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import Button from '@mui/material/Button';

import { repo_url, build_cmd, override_repo } from '../settings';

export default function Stdout() {
  const [output, setOutput] = useState('');

  useEffect(() => {
    const pre = document.querySelector('#scrollable');
    if (pre) {
      if (pre.scrollHeight - pre.scrollTop !== pre.clientHeight) {
        pre.scrollTop = pre.scrollHeight;
      }
    }
  }, [output]);

  const runBenchmark = () => {
    invoke('runbench', { repoUrl: repo_url, buildCmd: build_cmd, repoExists: !override_repo });
  };

  const stopBenchmark = () => {
    appWindow.emit('stopbench')
  }

  const clearOutput = () => {
    setOutput('');
  };
  

  function calcoutput(current: string, newoutput: string): string {
    if( current.length === 0) {
      return newoutput;
    }

    if (current.split('\n').includes(newoutput)) {
      return current;
    }

    return current + newoutput + '\n';


  }

  appWindow.listen<string>('build-output', (event) => {
    setOutput((prev) => calcoutput(prev, event.payload));
  });
  return (
    <div className='container stdout'>
      <h2>Output</h2>
      <div className='output' id='scrollable'>
        <div>{output}</div>
      </div>
      <div className='btn-container'>
        <Button variant="outlined" className='runbtn' onClick={runBenchmark}>Run benchmark</Button>
        <div className='spacer'></div>
        <Button variant="outlined" className='stopbtn' onClick={stopBenchmark}>Stop benchmark</Button>
        <div className='spacer'></div>
        <Button variant="outlined" className='clearbtn' onClick={clearOutput}>Clear output</Button>
      </div>
    </div>
  );
}
