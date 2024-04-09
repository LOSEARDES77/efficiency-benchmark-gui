import './styles.css';
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function Eta() {
  const [eta, setEta] = useState("");

  const getEta = async () => {
    const etav: string = await invoke("eta");
    setEta(etav);
  }

  useEffect(() => {
    getEta();
    const interval = setInterval(getEta, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container eta">
      <h2>Estimated Time</h2>
      <div className="eta-usage">
        ETA: {eta}
      </div>
    </div>
  )
}
