import TextField from '@mui/material/TextField'
import './Settings.css'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button';
import { invoke } from '@tauri-apps/api/tauri';

let repo_url = '';
let build_cmd = '';
let override_repo = false;



export default function Settings() {
  
  async function loadConfig(){
    const [repoUrl, buildCmd, overrideRepo, failed]: [string, string, boolean, boolean] = await invoke('loadsettings');
    console.log('Config loaded:', { repoUrl, buildCmd, overrideRepo });
    if (failed) {
      console.error('Failed to load config, using defaults');
    }
    repo_url = repoUrl;
    build_cmd = buildCmd;
    override_repo = overrideRepo;
    
    (getElementByXpath("//*[@id=\"outlined-basic repo-url\"]") as HTMLInputElement).value = repoUrl;
    (getElementByXpath('//*[@id="outlined-basic build-cmd"]') as HTMLInputElement).value = buildCmd;
    (getElementByXpath('//*[@id="override-repo"]') as HTMLInputElement).checked = overrideRepo;
    saveConfig();
  } 
  loadConfig();


  async function saveConfig(){
    let url = (getElementByXpath("//*[@id=\"outlined-basic repo-url\"]") as HTMLInputElement).value;
    let buildCommand = (getElementByXpath('//*[@id="outlined-basic build-cmd"]') as HTMLInputElement).value;
    let override = (getElementByXpath('//*[@id="override-repo"]') as HTMLInputElement).checked;
    
    repo_url = url;
    build_cmd = buildCommand;
    override_repo = override;
    let status: boolean = await invoke('savesettings', { repoUrl: url, buildCmd: build_cmd, overrideRepo: override });
    if (!status) {
      console.error('Failed to save config');
    }else{
      console.log('Config saved:', { url, buildCommand, override });
    }

  }

  function getElementByXpath(path : string) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }




  return (
    <div className="container settings">
      <h2>Settings</h2>
      <form id='settings-form'>
        <TextField id="outlined-basic repo-url" label="Repository URL" type='url' variant="outlined" />
        <TextField id="outlined-basic build-cmd" label="Build Command" variant="outlined" />
        <FormControlLabel control={<Checkbox id='override-repo' defaultChecked />} label="Override Repository" />
        
        <Button variant="outlined" onClick={saveConfig}>Save config</Button>
      </form>
    </div>
  )
}

export { repo_url, build_cmd, override_repo }
