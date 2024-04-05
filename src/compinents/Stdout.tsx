import './Stdout.css'
import { repo_url, build_cmd, override_repo } from './Settings'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'

export default function Stdout() {
  const [output, setOutput] = useState('')

  const runBenchmark = async () => {

    await invoke('runbench', {repoUrl : repo_url, buildCmd : build_cmd, repoExists: !override_repo})
  }

  appWindow.listen<string>('build-output', (event) => {
    setOutput(event.payload)
    console.log('Output: ', event.payload)
  });

  return (
    <div className='container stdout'>
      <h2>Output</h2>
      <div className='output'>
        <pre>{output}</pre> {/* Use <pre> tag to display output as-is */}
      </div>
      <Button variant="outlined" onClick={runBenchmark}>Run benchmark</Button>
    </div>
  )
}
