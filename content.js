// content.js

// 1. LISTENER KEYBOARD (Alt + O)
document.addEventListener('keydown', function(event) {
    // Cek jika tombol Alt ditekan bersamaan dengan tombol O
    if (event.altKey && (event.key === 'o' || event.key === 'O')) {
        event.preventDefault(); // Mencegah aksi default browser jika ada
        
        // Tampilkan notifikasi "Sedang berpikir..."
        showNotification("Sedang mencari jawaban...", "loading");

        // Ambil teks dari halaman (bisa seleksi teks atau seluruh body)
        let queryText = window.getSelection().toString();
        if (!queryText) {
            queryText = document.body.innerText; // Ambil semua jika tidak ada yang di-highlight
        }

        // Kirim ke background.js
        chrome.runtime.sendMessage({
            action: "askGemini",
            pageContent: queryText
        });
    }
});

// 2. MENERIMA JAWABAN DARI BACKGROUND
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "displayAnswer") {
        showNotification(request.answer, request.isError ? "error" : "success");
    }
});

// 3. FUNGSI MEMBUAT NOTIFIKASI HTML
function showNotification(text, type) {
    // Hapus notifikasi lama jika ada
    const oldNotif = document.getElementById("gemini-overlay-notif");
    if (oldNotif) oldNotif.remove();

    // Buat elemen DIV baru
    const notif = document.createElement("div");
    notif.id = "gemini-overlay-notif";
    
    // Styling langsung via JS agar tidak butuh file CSS terpisah
    notif.style.position = "fixed";
    notif.style.bottom = "20px";
    notif.style.right = "20px";
    notif.style.maxWidth = "400px";
    notif.style.padding = "15px";
    notif.style.borderRadius = "8px";
    notif.style.zIndex = "999999";
    notif.style.fontFamily = "Arial, sans-serif";
    notif.style.fontSize = "14px";
    notif.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    notif.style.transition = "opacity 0.5s ease";
    notif.style.whiteSpace = "pre-wrap"; // Agar enter/baris baru terbaca

    // Warna berdasarkan tipe
    if (type === "loading") {
        notif.style.backgroundColor = "#2196F3"; // Biru
        notif.style.color = "#fff";
    } else if (type === "error") {
        notif.style.backgroundColor = "#F44336"; // Merah
        notif.style.color = "#fff";
    } else {
        notif.style.backgroundColor = "#333"; // Hitam/Gelap
        notif.style.color = "#fff";
        notif.style.border = "1px solid #555";
    }

    notif.innerText = text;

    // Masukkan ke body HTML
    document.body.appendChild(notif);

    // HILANG OTOMATIS SETELAH 10 DETIK (Jika bukan loading)
    if (type !== "loading") {
        setTimeout(() => {
            notif.style.opacity = "0";
            setTimeout(() => notif.remove(), 500); // Hapus elemen setelah fade out
        }, 10000); // 10000 ms = 10 detik
    }
}