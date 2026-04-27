import os, json, uuid, re, sys
from datetime import datetime
import requests

TOKEN = os.environ.get('TALLY_TOKEN')
if not TOKEN:
    print('Missing env TALLY_TOKEN', file=sys.stderr)
    sys.exit(2)

WA_URL = os.environ.get('WPP_WA_URL', 'https://wa.me/6281295119091')

def u():
    return str(uuid.uuid4())

def slug(s: str):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_')[:64] or 'opt'

def title_input_text(label_html, placeholder, required=True, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "INPUT_TEXT", "groupUuid": g, "groupType": "INPUT_TEXT", "payload": {"isRequired": bool(required), "placeholder": placeholder, **({"name": name} if name else {})}},
    ]
    return blocks

def title_input_email(label_html, placeholder, required=True, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "INPUT_EMAIL", "groupUuid": g, "groupType": "INPUT_EMAIL", "payload": {"isRequired": bool(required), "placeholder": placeholder, **({"name": name} if name else {})}},
    ]
    return blocks

def title_input_phone(label_html, placeholder, required=True, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "INPUT_PHONE_NUMBER", "groupUuid": g, "groupType": "INPUT_PHONE_NUMBER", "payload": {"isRequired": bool(required), "placeholder": placeholder, "internationalFormat": True, "defaultCountryCode": "ID", **({"name": name} if name else {})}},
    ]
    return blocks

def title_input_date(label_html, placeholder, required=True, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "INPUT_DATE", "groupUuid": g, "groupType": "INPUT_DATE", "payload": {"isRequired": bool(required), "placeholder": placeholder, "format": "dd/MM/yyyy", "startWeekOn": "1", **({"name": name} if name else {})}},
    ]
    return blocks

def title_input_time(label_html, placeholder, required=True, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "INPUT_TIME", "groupUuid": g, "groupType": "INPUT_TIME", "payload": {"isRequired": bool(required), "placeholder": placeholder, **({"name": name} if name else {})}},
    ]
    return blocks

def title_textarea(label_html, placeholder, required=False, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "TEXTAREA", "groupUuid": g, "groupType": "TEXTAREA", "payload": {"isRequired": bool(required), "placeholder": placeholder, **({"name": name} if name else {})}},
    ]
    return blocks

def title_file_upload(label_html, required=False, name=None):
    g = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": u(), "type": "FILE_UPLOAD", "groupUuid": g, "groupType": "FILE_UPLOAD", "payload": {
            "isRequired": bool(required),
            "hasMultipleFiles": False,
            "hasMaxFileSize": True,
            "maxFileSize": 25,
            "maxFileSizeUnit": "MB",
            "allowedFiles": {"image/*": [".jpg", ".jpeg", ".png"], "application/*": [".pdf"]},
            **({"name": name} if name else {})
        }},
    ]
    return blocks

def title_multiple_choice(label_html, options, required=True, name=None):
    # options: list of (text, name)
    g = u()
    mc_uuid = u()
    blocks = [
        {"uuid": u(), "type": "TITLE", "groupUuid": g, "groupType": "QUESTION", "payload": {"html": label_html}},
        {"uuid": mc_uuid, "type": "MULTIPLE_CHOICE", "groupUuid": g, "groupType": "QUESTION", "payload": {}},
    ]
    for i, (text, opt_name) in enumerate(options):
        blocks.append({
            "uuid": u(),
            "type": "MULTIPLE_CHOICE_OPTION",
            "groupUuid": mc_uuid,
            "groupType": "MULTIPLE_CHOICE",
            "payload": {
                "index": i,
                "isFirst": i == 0,
                "isLast": i == len(options) - 1,
                "text": text,
                "name": opt_name or slug(text)
            }
        })
    # mark required at option-level? We'll enforce using isRequired on first option too.
    if required and len(options) > 0:
        blocks[2]["payload"]["isRequired"] = True
    return blocks

def hidden_fields_block(names):
    b_uuid = u()
    hidden = []
    for n in names:
        hidden.append({"uuid": u(), "name": n})
    return {
        "uuid": b_uuid,
        "type": "HIDDEN_FIELDS",
        "groupUuid": b_uuid,
        "groupType": "HIDDEN_FIELDS",
        "payload": {"hiddenFields": hidden}
    }

def make_form1_blocks():
    blocks = []

    # Form title
    blocks.append({
        "uuid": u(),
        "type": "FORM_TITLE",
        "groupUuid": u(),
        "groupType": "TEXT",
        "payload": {
            "html": "<b>Request Quote (≤14 Hari)</b><br/>Isi form singkat ini untuk cek ketersediaan & penawaran <b>WhitePaper Photography</b>. Khusus kebutuhan yang berlangsung <b>≤ 14 hari</b> dan sudah punya kisaran investasi yang jelas."
        }
    })

    # Hidden field for source tracking
    blocks.append(hidden_fields_block(["src"]))

    # Service
    blocks += title_multiple_choice(
        "Pilih layanan",
        [
            ("Corporate Event Photography", "corporate_event"),
            ("Company Profile / Branding Photography", "company_profile"),
            ("Interior / Architectural Photography", "interior"),
        ],
        required=True,
        name="service"
    )

    # Date & time
    blocks += title_input_date("Tanggal acara (maks. 14 hari ke depan)", "Pilih tanggal", required=True, name="event_date")
    blocks += title_input_time("Jam liputan", "Contoh: 09.00–12.00 WIB", required=True, name="event_time")

    # Location
    blocks += title_input_text("Lokasi (kota + venue/alamat)", "Contoh: SCBD, Jakarta Selatan — The Ritz-Carlton", required=True, name="location")

    # Pax/scale
    blocks += title_input_text("Estimasi pax / skala acara", "Contoh: 80 pax / 1 ballroom / 3 ruangan", required=True, name="pax")

    # Budget range (single question, combined options)
    budget_opts = [
        ("Corporate Event — 3–5 jt", "event_3_5"),
        ("Corporate Event — 5–8 jt", "event_5_8"),
        ("Corporate Event — 8–12 jt", "event_8_12"),
        ("Corporate Event — 12 jt+", "event_12_plus"),
        ("Company Profile — 12–18 jt", "cp_12_18"),
        ("Company Profile — 18–25 jt", "cp_18_25"),
        ("Company Profile — 25–35 jt", "cp_25_35"),
        ("Company Profile — 35 jt+", "cp_35_plus"),
        ("Interior — 5–8 jt", "int_5_8"),
        ("Interior — 8–12 jt", "int_8_12"),
        ("Interior — 12–20 jt", "int_12_20"),
        ("Interior — 20 jt+", "int_20_plus"),
    ]
    blocks += title_multiple_choice(
        "Range investasi (sesuaikan layanan)",
        budget_opts,
        required=True,
        name="budget_range"
    )

    # Company & PIC
    blocks += title_input_text("Perusahaan & industri", "Contoh: PT ___ / FMCG", required=True, name="company")
    blocks += title_input_text("Nama PIC", "Nama lengkap", required=True, name="pic_name")
    blocks += title_input_text("Jabatan PIC", "Contoh: Marketing Manager", required=True, name="pic_role")

    # Contact
    blocks += title_input_phone("WhatsApp aktif (untuk konfirmasi cepat)", "08xx / +62…", required=True, name="pic_whatsapp")
    blocks += title_input_email("Email (untuk quotation & invoice)", "you@company.com", required=True, name="pic_email")

    # Optional brief + upload
    blocks += title_textarea("Brief singkat (opsional)", "Tujuan, highlight momen, style, output yang dibutuhkan.", required=False, name="brief")
    blocks += title_file_upload("Upload rundown / agenda (PDF/JPG/PNG) — opsional", required=False, name="rundown")

    # Custom thank-you page
    ty_uuid = u()
    blocks.append({
        "uuid": ty_uuid,
        "type": "PAGE_BREAK",
        "groupUuid": ty_uuid,
        "groupType": "PAGE_BREAK",
        "payload": {
            "index": 0,
            "isFirst": False,
            "isLast": True,
            "isThankYouPage": True,
            "name": "Thank you"
        }
    })

    ty_text = (
        "<b>Terima kasih—detailnya sudah kami terima.</b><br/>"
        "Untuk mempercepat proses, silakan chat via WhatsApp (nomor di website) lalu paste teks berikut (boleh edit seperlunya):"
        "<pre>Nama PIC: [Nama] — [Jabatan]\nPerusahaan/Industri: [Perusahaan] — [Industri]\n"
        "Layanan: [Corporate Event / Company Profile / Interior]\nTanggal & Jam: [Tanggal], [Jam]\n"
        "Lokasi: [Kota + Venue/Alamat]\nSkala/Pax: [Pax/Skala]\nRange investasi: [Range]\n"
        "Brief singkat: [Isi singkat]\nRundown: [Sudah diupload di form / akan saya kirim menyusul]\n\n"
        "Halo WhitePaper Photography, saya ingin cek ketersediaan & penawaran untuk project di atas. Terima kasih.</pre>"
        f"<a href=\"{WA_URL}\">Chat WhatsApp sekarang</a>"
    )
    blocks.append({
        "uuid": u(),
        "type": "TEXT",
        "groupUuid": ty_uuid,
        "groupType": "PAGE_BREAK",
        "payload": {"html": ty_text}
    })

    return blocks

def make_form2_blocks():
    blocks = []
    blocks.append({
        "uuid": u(),
        "type": "FORM_TITLE",
        "groupUuid": u(),
        "groupType": "TEXT",
        "payload": {
            "html": "<b>Plan Ahead (&gt;14 Hari)</b><br/>Kalau kebutuhan kamu masih &gt;14 hari, isi form ini supaya kami bisa bantu planning dari awal."
        }
    })
    blocks.append(hidden_fields_block(["src"]))

    blocks += title_multiple_choice(
        "Pilih layanan",
        [
            ("Corporate Event Photography", "corporate_event"),
            ("Company Profile / Branding Photography", "company_profile"),
            ("Interior / Architectural Photography", "interior"),
        ],
        required=True,
        name="service"
    )

    blocks += title_input_date("Perkiraan tanggal (lebih dari 14 hari)", "Pilih tanggal", required=True, name="target_date")
    blocks += title_input_text("Kota/area", "Jakarta / Tangerang / dst.", required=True, name="area")
    blocks += title_input_text("Perusahaan & industri", "Contoh: PT ___ / FMCG", required=True, name="company")
    blocks += title_input_text("Nama PIC", "Nama lengkap", required=True, name="pic_name")
    blocks += title_input_text("Jabatan PIC", "Contoh: Marketing Manager", required=True, name="pic_role")
    blocks += title_input_phone("WhatsApp aktif", "08xx / +62…", required=True, name="pic_whatsapp")
    blocks += title_input_email("Email", "you@company.com", required=True, name="pic_email")
    blocks += title_textarea("Notes (opsional)", "Konteks singkat, tujuan, ekspektasi output.", required=False, name="notes")

    ty_uuid = u()
    blocks.append({
        "uuid": ty_uuid,
        "type": "PAGE_BREAK",
        "groupUuid": ty_uuid,
        "groupType": "PAGE_BREAK",
        "payload": {
            "index": 0,
            "isFirst": False,
            "isLast": True,
            "isThankYouPage": True,
            "name": "Thank you"
        }
    })
    blocks.append({
        "uuid": u(),
        "type": "TEXT",
        "groupUuid": ty_uuid,
        "groupType": "PAGE_BREAK",
        "payload": {"html": f"<b>Terima kasih!</b><br/>Kalau kamu mau, kamu bisa chat via WhatsApp untuk diskusi awal: <a href=\"{WA_URL}\">{WA_URL}</a>"}
    })

    return blocks


def create_form(blocks, name_hint):
    url = 'https://api.tally.so/forms'
    body = {
        'status': 'PUBLISHED',
        'blocks': blocks,
        'settings': {
            'language': 'id',
            'hasPartialSubmissions': False,
            'hasProgressBar': False
        }
    }
    r = requests.post(url, headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }, json=body, timeout=60)
    if r.status_code not in (200, 201):
        print('Create failed', name_hint, r.status_code, r.text, file=sys.stderr)
        sys.exit(1)
    return r.json()


def main():
    f1 = create_form(make_form1_blocks(), 'form1')
    f2 = create_form(make_form2_blocks(), 'form2')
    out = {
        'form1': f1,
        'form2': f2,
        'form1_url': f"https://tally.so/r/{f1['id']}",
        'form2_url': f"https://tally.so/r/{f2['id']}",
    }
    print(json.dumps(out, indent=2))

if __name__ == '__main__':
    main()
