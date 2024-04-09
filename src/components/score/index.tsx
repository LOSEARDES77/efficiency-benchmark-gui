import './styles.css';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Score() {
  const [latest, setLatest] = useState(0);
  const [highest, setHighest] = useState(0);

  const updateScore = async () => {
    const latestv: number = await invoke('latest');
    setLatest(latestv);
    const highestv: number = await invoke('highest');
    setHighest(highestv);
  }

  setInterval(updateScore, 1000);

  return (
    <div className='container score'>
      <h2>Score</h2>
      <span>Current Score: {latest}</span>
      <span>Highest Score: {highest}</span>
    </div>
  )
}
