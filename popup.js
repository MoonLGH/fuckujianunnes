const solveButton = document.getElementById('solveButton');
const statusElement = document.getElementById('status');
const answerDisplay = document.getElementById('answerDisplay');

// Fungsi untuk menampilkan jawaban dan mengatur timer
function displayAnswerAndSetTimer(answerText, isError = false) {
    // Tampilkan elemen jawaban
    answerDisplay.style.display = 'block';
    
    if (isError) {
        answerDisplay.style.backgroundColor = '#fce8e6'; // Warna merah muda untuk error
        answerDisplay.innerHTML = `<strong>ERROR:</strong> ${answerText}`;
    } else {
        answerDisplay.style.backgroundColor = '#e6fce8'; // Warna hijau muda untuk sukses
        answerDisplay.innerHTML = `<strong>JAWABAN:</strong><br>${answerText}`;
    }
    
    // Sembunyikan tombol saat jawaban ditampilkan
    solveButton.style.display = 'none';

    // Set timer untuk menghapus konten setelah 5 detik
    setTimeout(() => {
        answerDisplay.style.display = 'none'; // Sembunyikan elemen
        answerDisplay.innerHTML = '';        // Kosongkan konten
        answerDisplay.style.backgroundColor = 'white'; // Kembalikan warna
        solveButton.style.display = 'block'; // Tampilkan kembali tombol
        statusElement.textContent = 'Status: Siap untuk proses baru.';
    }, 5000); // 5000 milidetik = 5 detik
}

// 1. Logika pengiriman (ketika tombol diklik)
solveButton.addEventListener('click', () => {
    statusElement.textContent = 'Status: Mengambil konten...';
    answerDisplay.style.display = 'none';

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) {
            statusElement.textContent = 'Status: Tidak ada tab aktif.';
            return;
        }
        
        // Mengirim pesan ke content script di tab aktif
        chrome.tabs.sendMessage(tabs[0].id, {action: "getExamContent"}, function(response) {
            if (chrome.runtime.lastError) {
                statusElement.textContent = 'Status: Gagal (Coba Refresh Halaman).';
            } else if (response && response.status === "processing") {
                statusElement.textContent = 'Status: Konten terkirim ke Gemini API. Tunggu jawaban...';
            } else if (response && response.status === "error") {
                statusElement.textContent = `Status: Error - ${response.message}`;
            }
        });
    });
});

// 2. Logika penerimaan (mendengarkan pesan dari background.js)
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "geminiResponse") {
            statusElement.textContent = 'Status: Jawaban Diterima.';
            displayAnswerAndSetTimer(request.answer, request.isError);
        }
    }
);