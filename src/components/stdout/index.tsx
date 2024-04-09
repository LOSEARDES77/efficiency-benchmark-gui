import './styles.css';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import Button from '@mui/material/Button';

import { repo_url, build_cmd, override_repo } from '../settings';

export default function Stdout() {
  const [output, setOutput] = useState('');

  useEffect(() => {
    const pre = document.querySelector('#scrollable');
    if (pre) {
      pre.scrollTop = pre.scrollHeight;
    }
  }, [output]);

  const runBenchmark = () => {
    console.log('Running benchmark');
    invoke('runbench', { repoUrl: repo_url, buildCmd: build_cmd, repoExists: !override_repo });
  };

  const stopBenchmark = () => {
    console.log('Stopping benchmark');
    appWindow.emit('stopbench')
  }


  appWindow.listen<string>('build-output', (event) => {
    let arr = output.split('\n');
    console.log('Array:', arr)
    console.log('Output:', event.payload);
    console.log('Includes:', arr.includes(event.payload));
    if (!arr.includes(event.payload)) {
      setOutput((prevOutput) => prevOutput + '\n' + event.payload);
    }
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
      </div>
    </div>
  );
}
