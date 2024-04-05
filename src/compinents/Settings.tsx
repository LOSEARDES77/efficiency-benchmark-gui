import TextField from '@mui/material/TextField'
import './Settings.css'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button';


let repo_url = '';
let build_cmd = '';
let override_repo = false;

export default function Settings() {

  function saveConfig(){
    const url = (getElementByXpath("//*[@id=\"outlined-basic repo-url\"]") as HTMLInputElement).value;
    const buildCommand = (getElementByXpath('//*[@id="outlined-basic build-cmd"]') as HTMLInputElement).value;
    const override = (getElementByXpath('//*[@id="override-repo"]') as HTMLInputElement).checked;
    repo_url = url;
    build_cmd = buildCommand;
    override_repo = override;
    console.log('Config saved:', { repo_url, build_cmd, override_repo });
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
