<?php
/* ============================================================
   INTHA RASA — submit_ulasan.php
   Menerima data form ulasan dan menyimpan ke database MySQL
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

/* ---------- KONFIGURASI DATABASE ---------- */
define('DB_HOST',   'localhost');
define('DB_USER',   'root');          // Ganti dengan username MySQL Anda
define('DB_PASS',   '');              // Ganti dengan password MySQL Anda
define('DB_NAME',   'intharasa_db'); // Ganti dengan nama database Anda
define('DB_CHARSET','utf8mb4');

/* ---------- HANYA TERIMA POST ---------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'pesan' => 'Method tidak diizinkan.']);
    exit;
}

/* ---------- AMBIL & SANITASI INPUT ---------- */
$nama   = trim(strip_tags($_POST['nama']   ?? ''));
$produk = trim(strip_tags($_POST['produk'] ?? ''));
$rating = (int) ($_POST['rating'] ?? 0);
$pesan  = trim(strip_tags($_POST['pesan']  ?? ''));

/* ---------- VALIDASI ---------- */
$errors = [];

if (empty($nama) || mb_strlen($nama) > 100) {
    $errors[] = 'Nama tidak valid.';
}

$produk_valid = [
    'Roti Canai Original Frozen',
    'Cota (Prata Coklat) Frozen',
    'Mozata (Prata Mozzarella) Frozen',
    'Samota (Prata Isi Kari) Frozen',
    'Kue Deram-Deram',
    'Bumbu Kari Frozen',
];
if (!in_array($produk, $produk_valid, true)) {
    $errors[] = 'Produk tidak valid.';
}

if ($rating < 1 || $rating > 5) {
    $errors[] = 'Rating harus antara 1 – 5.';
}

if (empty($pesan) || mb_strlen($pesan) > 500) {
    $errors[] = 'Ulasan tidak valid (max 500 karakter).';
}

if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'pesan' => implode(' ', $errors)]);
    exit;
}

/* ---------- KONEKSI DATABASE ---------- */
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'pesan' => 'Koneksi database gagal.']);
    exit;
}

$conn->set_charset(DB_CHARSET);

/* ---------- BUAT TABEL JIKA BELUM ADA ---------- */
$conn->query("
    CREATE TABLE IF NOT EXISTS ulasan (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nama        VARCHAR(100)   NOT NULL,
        produk      VARCHAR(100)   NOT NULL,
        rating      TINYINT(1)     NOT NULL,
        pesan       TEXT           NOT NULL,
        ip_pengirim VARCHAR(45)    DEFAULT NULL,
        dibuat_pada DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

/* ---------- INSERT DATA ---------- */
$ip = $_SERVER['REMOTE_ADDR'] ?? null;

$stmt = $conn->prepare("
    INSERT INTO ulasan (nama, produk, rating, pesan, ip_pengirim)
    VALUES (?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'pesan' => 'Terjadi kesalahan pada server.']);
    $conn->close();
    exit;
}

$stmt->bind_param('ssiss', $nama, $produk, $rating, $pesan, $ip);

if ($stmt->execute()) {
    echo json_encode([
        'status' => 'sukses',
        'pesan'  => 'Ulasan berhasil disimpan.',
        'id'     => $stmt->insert_id,
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'pesan' => 'Gagal menyimpan ulasan.']);
}

$stmt->close();
$conn->close();
