// F1-05 (P1-H): minimal WebView2 host. Embeds the built benchmark page (../dist) and
// exposes no IPC commands; results leave the page via CDP (--remote-debugging-port).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running p1-h shell");
}
