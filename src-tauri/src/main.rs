// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    env::set_current_dir,
    fs::{copy, create_dir_all, metadata, read_dir, remove_dir_all, remove_file, File}, 
    io::{BufRead, BufReader, Write}, process::{Command, Stdio}, 
    sync::mpsc::{channel, Receiver, Sender}, 
    thread::{self, sleep}, 
    time::Duration
};

use efficiency_benchmark::{execute_build_command, get_battery_percentage, get_highest_score, get_latest_score, is_plugged};
use battery::units::time::second;
use tauri::{Runtime, Window};
use chrono::Local;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn percentage() -> u8 {
    get_battery_percentage()
}


#[tauri::command]
fn status() -> bool {
    is_plugged(true)
}


#[tauri::command]
async fn cpu() -> usize {
    use sysinfo::{System, RefreshKind, CpuRefreshKind};

    let mut s = System::new_with_specifics(
        RefreshKind::new().with_cpu(CpuRefreshKind::everything()),
    );

    // Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    // Refresh CPUs again.
    s.refresh_cpu();

    let cpus = s.cpus();
    let mut average = 0.0;
    for cpu in cpus {
        average += cpu.cpu_usage();
    }

    (average / cpus.len() as f32) as usize
    

}

#[tauri::command]
fn latest() -> u32 {
    let app_dir = std::env::var("EFFICIENCY_BENCHMARK_GUI_APP_DIR").expect("Failed to get app directory");

    return get_latest_score(&app_dir)
}

#[tauri::command]
fn highest() -> u32 {
    let app_dir = std::env::var("EFFICIENCY_BENCHMARK_GUI_APP_DIR").expect("Failed to get app directory");


    return get_highest_score(&app_dir)
}

#[tauri::command]
async fn runbench<R: Runtime>(window: Window<R>, repo_url: String, build_cmd: String, repo_exists: bool) -> Result<(), String> {
    let app_dir = std::env::var("EFFICIENCY_BENCHMARK_GUI_APP_DIR").expect("Failed to get app directory");
    let source_dir = format!("{}/repo-dir", app_dir);
    let build_dir = format!("{}/build-dir", app_dir);
    let output = bench(&repo_url, &build_cmd, &source_dir, &build_dir, repo_exists);

    thread::spawn(move || {
        for line in output {
            window.emit("build-output", line).expect("Failed to emit build output");
        };
    });

  Ok(())
}
// remember to call `.manage(MyState::default())`
#[tauri::command]
async fn eta() -> String {
    if is_plugged(true) {
        return "∞".to_string();
    }
    let manager = battery::Manager::new().unwrap();
    let battery = match manager.batteries().unwrap().next(){
        Some(battery) => battery.unwrap(),
        None => return "∞".to_string()
    };

    let time = match battery.time_to_empty(){
        Some(time) => time.get::<second>(),
        None => return "∞".to_string()
    };
    if time.is_finite() {
        let hours = (time / 3600.0) as u32;
        let minutes = ((time % 3600.0) / 60.0) as u32;
        let seconds = (time % 60.0) as u32;
        return format!("{}h {}m {}s", hours, minutes, seconds);
    }
    
    return "∞".to_string();
}


fn main() {
  std::env::set_var("CARGO_PKG_NAME", "efficiency-benchmark-gui");
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path_resolver().app_local_data_dir().expect("Failed to get app directory");
            std::env::set_var("EFFICIENCY_BENCHMARK_GUI_APP_DIR", app_dir.to_str().expect("Failed to convert app directory to string"));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![percentage, status, cpu, eta, latest, highest, runbench])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn bench(repo_url: &str, build_command: &str, source_dir: &str, build_dir: &str, repo_exists: bool) -> impl Iterator<Item = String>{
    let (sender, receiver): (Sender<String>, Receiver<String>) = channel();
    let repo_url = repo_url.to_owned();
    let build_command = build_command.to_owned();
    let source_dir = source_dir.to_owned();
    let build_dir = build_dir.to_owned();
    thread::spawn(move || {
        if !repo_exists {
            if metadata(&source_dir).is_ok() {
                remove_dir_all(&source_dir).unwrap();
            }
            let mut command = Command::new("git")
                .arg("clone")
                .arg("--progress")
                .arg(&repo_url)
                .arg("--recursive")
                .arg(&source_dir)
                .stdout(Stdio::inherit())
                .spawn()
                .expect("failed to clone repository");
    
            let reader = BufReader::new(command.stderr.take().expect("failed to get stdout"));
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        println!("AOJSHJFHASHJHF {}", line);
                        sender.send(line).unwrap(); // Add the output line to the vector
                    },
                    Err(_) => {},
                }
            }
        
            command.wait().expect("failed to wait for command");
        }
    
        if metadata(&build_dir).is_ok() {
            remove_dir_all(&build_dir).unwrap();
        }
    
        
        if is_plugged(false) {
            sender.send("Please unplug the system to start the benchmarking".to_string()).unwrap();
            loop {
                if !is_plugged(true){
                    break;
                }
                sleep(Duration::from_secs(1));
            }
        }
        
        let current_time = Local::now().format("%d-%m-%Y_%H:%M").to_string();
        let logfile = &format!("benchmark-{}.log", current_time);
        if metadata(logfile).is_ok() {
            remove_file(logfile).unwrap();
        }
        
        loop {
            // Copy build dir
            sender.send("Copying repo".to_string()).unwrap();
            copy_dir(&source_dir, &build_dir).expect("failed to copy src directory");
    
            set_current_dir(&build_dir).unwrap();
            
            // Build
            sender.send("Building".to_string()).unwrap();
            let output = execute_build_command(&build_command).into_iter();
            for line in output {
                sender.send(line).unwrap();
            }
            
            // Delete build dir
            set_current_dir("..").unwrap();
            remove_dir_all(&build_dir).unwrap();
            
            // Add score
            sender.send("Build successful!".to_string()).unwrap();
            
            add_one(logfile);
        }
    });

    receiver.into_iter()
}


fn add_one(logfile: &str) {
    
    if !metadata(logfile).is_ok() {
        let mut file = File::create(logfile).unwrap();
        file.write_all("0".as_bytes()).unwrap();
    }

    let mut reader = BufReader::new(File::open(logfile).unwrap());
    let mut score = Vec::new(); // Change the type of score to Vec<u8>
    reader.read_until(b'\n', &mut score).unwrap();
    let score = String::from_utf8_lossy(&score).parse::<u32>().unwrap(); // Parse the score as u32
    let score = score + 1; // Increment the score
    let mut file = File::create(logfile).unwrap();
    file.write_all(score.to_string().as_bytes()).unwrap();
    println!("Current Score: {}", score);
    sleep(Duration::from_secs(1));
}

fn copy_dir(src: &str, dest: &str) -> std::io::Result<()> {
    if !metadata(dest).is_ok() || metadata(dest).unwrap().is_dir()  {
        create_dir_all(dest)?;
    }

    // Iterate over entries in the source directory
    for entry in read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        #[cfg(target_os = "windows")]
        let dest_path = format!("{}\\{}", dest, path.file_name().unwrap().to_str().unwrap());
        #[cfg(not(target_os = "windows"))]
        let dest_path = format!("{}/{}", dest, path.file_name().unwrap().to_str().unwrap());
        if path.is_dir() {
            copy_dir(&path.to_str().unwrap(), &dest_path)?;
        } else {
            copy(&path, &dest_path)?;
        }
    }
    Ok(())
}