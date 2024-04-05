import { invoke } from '@tauri-apps/api/tauri'
import './Cpu.css'
import { useEffect, useState } from 'react'

export default function Cpu() {
  const [cpu, setCpu] = useState(2)

  const getCpu = async () => {
    const cpuUsage: number = await invoke('cpu')
    setCpu(cpuUsage)
  }

  useEffect(() => {
    getCpu()
    const interval = setInterval(getCpu, 1000)
    return () => clearInterval(interval)
  }, [] );

  return (
    <div className='container cpu'>
      <h2>Cpu usage</h2>
      <div className='cpu-usage'>
          Usage: {cpu}%
      </div>
    </div>
  )
}
