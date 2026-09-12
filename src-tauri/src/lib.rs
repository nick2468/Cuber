//! Origin: London src-tauri/src/lib.rs, adapted: this app's folder and names, and no plugins.
//! The Tauri shell around the Cuber web app.
//!
//! It does almost nothing on purpose. The app is the same web build that runs
//! in a browser; the only reason for the wrapper is a real window on Windows,
//! with the cube, the theme and the speed kept where clearing browser data
//! cannot reach them.
//!
//! The one thing it does do is choose where the window keeps its WebView2
//! profile. Tauri's default is a folder named after the bundle identifier,
//! which on this machine would mean `%LOCALAPPDATA%\com.nick.cuber` for an app
//! called Cuber. The identifier itself deliberately does not change - NSIS keys
//! the install on the product name, the identifier is invisible, and changing
//! it later would put a second app beside the first - so the folder is pointed
//! somewhere sensible instead. Sensible is NOT `%LOCALAPPDATA%\Cuber`: that is
//! the install folder itself.
//!
//! That is why the window is built here rather than left to `tauri.conf.json`.
//! Every setting still lives in the config: the window is declared there with
//! `"create": false`, and `WebviewWindowBuilder::from_config` reads that same
//! declaration back. Nothing is copied by hand, so nothing can drift.
//!
//! No plugins. The trainer loads `fs` and `dialog` because it keeps a progress
//! file; this app reads and writes no files at all (spec 11.4).

use tauri::{Manager, WebviewWindowBuilder};

/// The app's own folder under the user's local data folder.
///
/// NOT `Cuber`, which is the INSTALL folder: the NSIS installer's
/// `InstallLocation` for `installMode: currentUser` is `%LOCALAPPDATA%\Cuber`.
/// Putting the profile there would mean an uninstall wiping the remembered
/// cube whether or not the user asked for it, so the profile goes in a sibling
/// folder that an unticked uninstall leaves alone. The frontend has the same
/// literal in `src/storage/paths.ts`, and the uninstaller's hook has it in
/// `src-tauri/installer-hooks.nsh`.
const LOCAL_FOLDER: &str = "Cuber Data";

/// The browser profile inside it: cache, cookies and local storage.
const WEBVIEW_FOLDER: &str = "WebView2";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Cloned so the borrow of the config ends here: the builder below
            // wants the app handle, and holding both at once would not compile.
            let window = app
                .config()
                .app
                .windows
                .first()
                .cloned()
                .expect("tauri.conf.json declares the main window");

            let mut builder = WebviewWindowBuilder::from_config(app.handle(), &window)?;
            // A machine that cannot say where its local data folder is falls
            // back to Tauri's own choice, which is the behaviour this app had
            // before. Failing to open a window over a folder name would be a
            // worse trade than an untidy folder.
            if let Ok(local) = app.path().local_data_dir() {
                builder = builder.data_directory(local.join(LOCAL_FOLDER).join(WEBVIEW_FOLDER));
            }
            builder.build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the Cuber window");
}
