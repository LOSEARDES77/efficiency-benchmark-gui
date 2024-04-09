import './styles.css';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react'


export default function Battery() {
    const [percentage, setPercentage] = useState(0);
  const [isPlugged, setPlugged] = useState(false);

  const getBattery = async () => {
    const per: number = await invoke("percentage")
    setPercentage(per);
    const plugged: boolean = await invoke("status")
    setPlugged(plugged);
  };

  useEffect(() => {
    getBattery();
    const interval = setInterval(getBattery, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container battery">
      <h2>Battery Info</h2>
        <span>Percentage: {percentage}%</span>
        <span>Charging: {isPlugged ? "Yes" : "No"}</span>
    </div>
  )
}
