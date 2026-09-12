// Origin: London src-tauri/src/main.rs, adapted: this app's library name.
// Windows release builds open no console window: this is a desktop app.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    cuber_lib::run()
}
