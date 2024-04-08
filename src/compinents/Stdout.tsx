import './Stdout.css';
import { repo_url, build_cmd, override_repo } from './Settings';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/tauri';

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


  appWindow.listen<string>('build-output', (event) => {
    setOutput((prevOutput) => prevOutput + '\n' + event.payload);
  });
  return (
    <div className='container stdout'>
      <h2>Output</h2>
      <div className='output' id='scrollable'>
        <div>{output}</div>
      </div>

      <Button variant="outlined" onClick={runBenchmark}>Run benchmark</Button>
    </div>
  );
}
