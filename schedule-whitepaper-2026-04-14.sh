#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://api.repliz.com/public/schedule"
ACCESS_KEY="8004508773"
SECRET_KEY="1W2WIkaACAzRYHMw9akhFSPtj8xMQKMR"

curl_post() {
  local json="$1"
  curl -sS -u "$ACCESS_KEY:$SECRET_KEY" -H "Content-Type: application/json" -X POST "$BASE_URL" -d "$json"
}

# Threads posts
curl_post '{"title":"","description":"Kadang perusahaan sudah invest besar di event, tapi dokumentasinya seadanya. Saya sering lihat tim marketing bingung cari foto yang proper buat report atau sosial media. Di White Paper, fokus saya adalah bikin dokumentasi yang bisa dipakai ulang berkali kali untuk pitch deck, company profile, sampai rekap ke manajemen.","type":"text","medias":[],"scheduleAt":"2026-04-14T01:00:00.000Z","accountId":"69db171284ebdfba15c9ab58"}'

curl_post '{"title":"","description":"Buat saya, corporate photoshoot yang bagus bukan cuma soal lighting dan gear, tapi soal ngerti konteks bisnisnya. Ini perusahaan lagi mau impress investor, rekrut talent baru, atau bangun trust ke client. Jawaban itu yang ngarahin gaya visual yang saya bikin bareng tim.","type":"text","medias":[],"scheduleAt":"2026-04-14T04:00:00.000Z","accountId":"69db171284ebdfba15c9ab58"}'

curl_post '{"title":"","description":"Banyak company profile yang visualnya masih generic banget. Padahal setiap perusahaan punya karakter unik. Waktu kami produksi foto dan video, saya selalu mulai dari ngobrol sama founder atau tim leadership. Dari situ baru diturunin ke visual yang relevan, bukan template.","type":"text","medias":[],"scheduleAt":"2026-04-14T07:00:00.000Z","accountId":"69db171284ebdfba15c9ab58"}'

curl_post '{"title":"","description":"Corporate event itu sering jadi momen paling mahal dalam setahun, tapi kadang dokumentasinya cuma jadi folder di server yang tidak pernah dibuka. Mindset saya sederhana: setiap frame harus bisa punya fungsi lain. Bisa untuk hiring, PR, sampai internal culture story.","type":"text","medias":[],"scheduleAt":"2026-04-14T10:00:00.000Z","accountId":"69db171284ebdfba15c9ab58"}'

# LinkedIn posts
curl_post '{"title":"","description":"Sebagai studio yang fokus di corporate photo dan video, salah satu pertanyaan yang paling sering saya terima adalah: apa bedanya dokumentasi biasa dan dokumentasi yang dirancang untuk B2B?

Buat saya, dokumentasi biasa hanya menjawab: acara ini sudah terjadi.

Dokumentasi yang dirancang untuk B2B menjawab: bagaimana materi visual ini bisa membantu sales, marketing, dan HR bekerja lebih efektif.

Setiap kali White Paper handle corporate event atau company profile, saya selalu tanya dulu: visual ini nanti mau dipakai di mana saja. Slide pitch, landing page, annual report, atau social media. Jawaban itu yang mengarahkan cara kami memotret dan mengedit.

Jadi ketika perusahaan invest di dokumentasi, yang dibeli bukan cuma foto atau video, tapi aset visual yang bisa bekerja lama untuk brand.","type":"text","medias":[],"scheduleAt":"2026-04-14T02:00:00.000Z","accountId":"69ba44a7bcf47d3964974d41"}'

curl_post '{"title":"","description":"Beberapa tahun terakhir saya lihat pola yang menarik di klien B2B. Banyak perusahaan mulai serius membangun employer branding, bukan hanya brand ke customer.

Di White Paper, kami sering diminta bantu produksi visual untuk kebutuhan hiring. Misalnya:
- Foto kegiatan internal yang menunjukkan culture kerja
- Video singkat tentang cara tim berkolaborasi
- Portrait profesional yang tetap terasa human

Calon talent sekarang riset perusahaan lewat LinkedIn dan konten. Kalau visualnya kuat dan jujur, itu bantu banget buat narik orang yang tepat.

Menurut saya, employer branding yang baik selalu dimulai dari cerita yang autentik, baru kemudian diterjemahkan ke visual yang rapi dan konsisten.","type":"text","medias":[],"scheduleAt":"2026-04-14T05:00:00.000Z","accountId":"69ba44a7bcf47d3964974d41"}'

curl_post '{"title":"","description":"Setiap kali kami mengerjakan company profile, saya selalu mengingatkan klien bahwa orang tidak lagi hanya membaca teks, mereka menyerap pengalaman visual.

Beberapa hal yang selalu saya perhatikan saat memotret dan membuat video untuk company profile:
- Apakah orang bisa merasakan suasana kerja hanya dari melihat fotonya
- Apakah leadership terlihat approachable, bukan sekadar formal
- Apakah proses kerja tergambar jelas, bukan hanya logo dan gedung

Di level B2B, hal hal seperti ini yang membangun trust. Client ingin tahu: kalau saya kerja sama dengan perusahaan ini, seperti apa orang orangnya, bagaimana mereka bekerja, dan apakah value mereka selaras dengan saya.

Tugas saya adalah menerjemahkan itu ke visual yang konkret, bukan sekadar estetis.","type":"text","medias":[],"scheduleAt":"2026-04-14T08:00:00.000Z","accountId":"69ba44a7bcf47d3964974d41"}'

curl_post '{"title":"","description":"Salah satu hal yang paling saya nikmati ketika mengerjakan corporate event adalah melihat bagaimana satu hari bisa menghasilkan banyak sekali cerita visual.

Satu sesi keynote bisa melahirkan beberapa konten:
- Highlight untuk LinkedIn perusahaan
- Short clip untuk internal recap
- Foto untuk deck presentasi di masa depan

Supaya itu terjadi, tim produksi harus masuk dengan mindset strategis. Kami di White Paper tidak hanya mencari angle yang bagus, tapi juga momen yang relevan untuk komunikasi bisnis klien ke depan.

Kalau teman teman sering mengadakan event perusahaan, mungkin menarik untuk mulai melihat dokumentasi sebagai investasi konten jangka panjang, bukan sekadar kebutuhan satu hari.","type":"text","medias":[],"scheduleAt":"2026-04-14T11:00:00.000Z","accountId":"69ba44a7bcf47d3964974d41"}'

echo "Done scheduling White Paper posts for 2026-04-14"