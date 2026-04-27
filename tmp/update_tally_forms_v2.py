import os, json, uuid, re, sys
import requests

TOKEN = os.environ.get('TALLY_TOKEN')
if not TOKEN:
    print('Missing env TALLY_TOKEN', file=sys.stderr)
    sys.exit(2)

FORM1_ID = os.environ.get('TALLY_FORM1_ID', 'MerJlg')
FORM2_ID = os.environ.get('TALLY_FORM2_ID', 'J9VJbY')
FORM2_URL = f"https://tally.so/r/{FORM2_ID}"
WA_URL = os.environ.get('WPP_WA_URL', 'https://wa.me/6281295119091')


def u():
    return str(uuid.uuid4())


def slug(s: str):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_')[:64] or 'opt'


def block(type_, groupType=None, payload=None, groupUuid=None, uuid_=None):
    if uuid_ is None:
        uuid_ = u()
    if groupUuid is None:
        groupUuid = u()
    if groupType is None:
        groupType = type_
    return {
        'uuid': uuid_,
        'type': type_,
        'groupUuid': groupUuid,
        'groupType': groupType,
        'payload': payload or {}
    }


def title_and_input(input_type, label_html, payload, name=None):
    g = u()
    blocks = [
        block('TITLE', groupType='QUESTION', groupUuid=g, payload={'html': label_html}),
    ]
    if name:
        payload = {**payload, 'name': name}
    blocks.append(block(input_type, groupType=input_type, groupUuid=g, payload=payload))
    return blocks


def heading2(html):
    return block('HEADING_2', groupType='HEADING_2', payload={'html': html})


def text(html, groupType='TEXT'):
    return block('TEXT', groupType=groupType, payload={'html': html})


def divider():
    return block('DIVIDER', groupType='DIVIDER', payload={})


def hidden_src():
    b_uuid = u()
    return {
        'uuid': b_uuid,
        'type': 'HIDDEN_FIELDS',
        'groupUuid': b_uuid,
        'groupType': 'HIDDEN_FIELDS',
        'payload': {
            'hiddenFields': [
                {'uuid': u(), 'name': 'src'}
            ]
        }
    }


def multiple_choice(label_html, options, required=True, name=None, helper_html=None):
    qg = u()
    mc_uuid = u()
    blocks = [
        block('TITLE', groupType='QUESTION', groupUuid=qg, payload={'html': label_html}),
    ]
    if helper_html:
        blocks.append(block('TEXT', groupType='TEXT', payload={'html': f"<span style='opacity:.8'>{helper_html}</span>"}))
    blocks.append(block('MULTIPLE_CHOICE', groupType='QUESTION', groupUuid=qg, uuid_=mc_uuid, payload={}))
    for i, (text_, opt_name) in enumerate(options):
        payload = {
            'index': i,
            'isFirst': i == 0,
            'isLast': i == len(options) - 1,
            'text': text_,
            'name': opt_name or slug(text_)
        }
        if required and i == 0:
            payload['isRequired'] = True
        blocks.append(block('MULTIPLE_CHOICE_OPTION', groupType='MULTIPLE_CHOICE', groupUuid=mc_uuid, payload=payload))
    return blocks


def form_title(html, cover=None, logo=None):
    payload = {'html': html}
    if cover:
        payload['cover'] = cover
    if logo:
        payload['logo'] = logo
    return {
        'uuid': u(),
        'type': 'FORM_TITLE',
        'groupUuid': u(),
        'groupType': 'TEXT',
        'payload': payload
    }


def thank_you_page(html):
    ty_uuid = u()
    blocks = [
        {
            'uuid': ty_uuid,
            'type': 'PAGE_BREAK',
            'groupUuid': ty_uuid,
            'groupType': 'PAGE_BREAK',
            'payload': {
                'index': 0,
                'isFirst': False,
                'isLast': True,
                'isThankYouPage': True,
                'name': 'Thank you'
            }
        },
        {
            'uuid': u(),
            'type': 'TEXT',
            'groupUuid': ty_uuid,
            'groupType': 'PAGE_BREAK',
            'payload': {'html': html}
        }
    ]
    return blocks


def blocks_form1():
    blocks = []

    blocks.append(form_title(
        "<b>WhitePaper Photography — Request Quote</b><br/>"
        "Isi 2–3 menit. Kami prioritaskan jadwal <b>≤14 hari</b>.<br/>"
        "<span style='opacity:.8'>Kalau jadwal kamu lebih longgar, pakai form Plan Ahead.</span>"
    ))
    blocks.append(hidden_src())

    blocks.append(heading2('1) Jadwal'))
    blocks += title_and_input('INPUT_DATE', 'Tanggal pemotretan (≤14 hari)', {
        'isRequired': True,
        'placeholder': 'Pilih tanggal',
        'format': 'dd/MM/yyyy',
        'startWeekOn': '1'
    }, name='shoot_date')

    blocks += title_and_input('INPUT_TEXT', 'Jam liputan', {
        'isRequired': True,
        'placeholder': 'Contoh: 09.00–12.00 WIB'
    }, name='shoot_time')

    blocks += title_and_input('INPUT_TEXT', 'Lokasi (kota + venue/alamat)', {
        'isRequired': True,
        'placeholder': 'Contoh: SCBD, Jakarta Selatan — The Ritz-Carlton'
    }, name='location')

    blocks.append(divider())
    blocks.append(heading2('2) Kebutuhan'))

    blocks += multiple_choice('Layanan', [
        ('Corporate Event Photography', 'corporate_event'),
        ('Company Profile / Branding Photography', 'company_profile'),
        ('Interior / Architectural Photography', 'interior')
    ], required=True, name='service')

    blocks += multiple_choice('Durasi', [
        ('Half-day (±2–3 jam)', 'half_day'),
        ('Full-day (±4–6 jam)', 'full_day')
    ], required=True, name='duration')

    blocks += title_and_input('INPUT_NUMBER', 'Estimasi pax / skala', {
        'isRequired': True,
        'placeholder': 'Contoh: 300',
        'hasMinNumber': True,
        'minNumber': 1,
        'thousandsSeparator': '.',
        'decimalSeparator': ','
    }, name='pax')

    blocks += multiple_choice('Output', [
        ('Foto saja', 'photo_only'),
        ('Foto + video', 'photo_video')
    ], required=True, name='output')

    blocks.append(divider())
    blocks.append(heading2('3) Budget'))

    blocks += title_and_input('INPUT_NUMBER', 'Budget estimasi (angka)', {
        'isRequired': True,
        'placeholder': 'Contoh: 15000000',
        'hasMinNumber': True,
        'minNumber': 1,
        'thousandsSeparator': '.',
        'decimalSeparator': ','
    }, name='budget')

    blocks.append(text("<span style='opacity:.8'>Angka kasar saja untuk cek kecocokan scope. Tidak ditampilkan publik.</span>"))

    blocks.append(divider())
    blocks.append(heading2('4) Kontak'))

    blocks += title_and_input('INPUT_TEXT', 'Perusahaan & industri', {
        'isRequired': True,
        'placeholder': 'Contoh: PT ABC — FMCG'
    }, name='company')

    blocks += title_and_input('INPUT_TEXT', 'Nama PIC + jabatan', {
        'isRequired': True,
        'placeholder': 'Contoh: Sari — Marketing Manager'
    }, name='pic')

    blocks += title_and_input('INPUT_PHONE_NUMBER', 'WhatsApp aktif', {
        'isRequired': True,
        'placeholder': '08xx / +62…',
        'internationalFormat': True,
        'defaultCountryCode': 'ID'
    }, name='whatsapp')

    blocks += title_and_input('INPUT_EMAIL', 'Email kerja', {
        'isRequired': True,
        'placeholder': 'you@company.com'
    }, name='email')

    blocks += title_and_input('INPUT_LINK', 'Referensi / brief link (opsional)', {
        'isRequired': False,
        'placeholder': 'Drive / Notion / Pinterest / website…'
    }, name='ref_link')

    blocks += title_and_input('TEXTAREA', 'Catatan singkat (opsional)', {
        'isRequired': False,
        'placeholder': 'Highlight momen, requirement khusus, dll.'
    }, name='notes')

    blocks += title_and_input('FILE_UPLOAD', 'Upload rundown / agenda (opsional)', {
        'isRequired': False,
        'hasMultipleFiles': False,
        'hasMaxFileSize': True,
        'maxFileSize': 25,
        'maxFileSizeUnit': 'MB',
        'allowedFiles': {'image/*': ['.jpg', '.jpeg', '.png'], 'application/*': ['.pdf']}
    }, name='rundown')

    ty_html = (
        "<b>Terima kasih—detailnya sudah kami terima.</b><br/>"
        "Untuk mempercepat, chat via WhatsApp (nomor di website) lalu paste teks berikut:<br/>"
        "<pre>Nama PIC: [Nama] — [Jabatan]\nPerusahaan/Industri: [Perusahaan] — [Industri]\n"
        "Layanan: [Corporate Event / Company Profile / Interior]\nTanggal & Jam: [Tanggal], [Jam]\n"
        "Lokasi: [Kota + Venue/Alamat]\nSkala/Pax: [Pax/Skala]\nBudget: [Angka]\n"
        "Catatan: [Singkat]\n\n"
        "Halo WhitePaper Photography, saya ingin cek ketersediaan & penawaran untuk project di atas. Terima kasih.</pre>"
        f"<a href=\"{WA_URL}\">Buka WhatsApp</a><br/>"
        f"<div style='opacity:.8;margin-top:8px'>Jadwal lebih dari 14 hari? Isi <a href=\"{FORM2_URL}\">Plan Ahead form</a>.</div>"
    )
    blocks += thank_you_page(ty_html)

    return blocks


def blocks_form2():
    blocks = []

    blocks.append(form_title(
        "<b>WhitePaper Photography — Plan Ahead</b><br/>"
        "Untuk kebutuhan <b>&gt;14 hari</b>. Kami bantu planning supaya eksekusi rapi."
    ))
    blocks.append(hidden_src())

    blocks.append(heading2('1) Rencana'))
    blocks += title_and_input('INPUT_DATE', 'Perkiraan tanggal', {
        'isRequired': True,
        'placeholder': 'Pilih tanggal',
        'format': 'dd/MM/yyyy',
        'startWeekOn': '1'
    }, name='target_date')

    blocks += title_and_input('INPUT_TEXT', 'Kota/area', {
        'isRequired': True,
        'placeholder': 'Jakarta / Tangerang / dst.'
    }, name='area')

    blocks.append(divider())
    blocks.append(heading2('2) Kebutuhan'))

    blocks += multiple_choice('Layanan', [
        ('Corporate Event Photography', 'corporate_event'),
        ('Company Profile / Branding Photography', 'company_profile'),
        ('Interior / Architectural Photography', 'interior')
    ], required=True, name='service')

    blocks += title_and_input('TEXTAREA', 'Konteks singkat (opsional)', {
        'isRequired': False,
        'placeholder': 'Tujuan, output, highlight momen, dll.'
    }, name='notes')

    blocks.append(divider())
    blocks.append(heading2('3) Kontak'))

    blocks += title_and_input('INPUT_TEXT', 'Perusahaan & industri', {
        'isRequired': True,
        'placeholder': 'Contoh: PT ABC — FMCG'
    }, name='company')

    blocks += title_and_input('INPUT_TEXT', 'Nama PIC + jabatan', {
        'isRequired': True,
        'placeholder': 'Contoh: Sari — Marketing Manager'
    }, name='pic')

    blocks += title_and_input('INPUT_PHONE_NUMBER', 'WhatsApp aktif', {
        'isRequired': True,
        'placeholder': '08xx / +62…',
        'internationalFormat': True,
        'defaultCountryCode': 'ID'
    }, name='whatsapp')

    blocks += title_and_input('INPUT_EMAIL', 'Email kerja', {
        'isRequired': True,
        'placeholder': 'you@company.com'
    }, name='email')

    blocks += title_and_input('INPUT_LINK', 'Referensi / brief link (opsional)', {
        'isRequired': False,
        'placeholder': 'Drive / Notion / Pinterest / website…'
    }, name='ref_link')

    ty_html = (
        "<b>Terima kasih!</b><br/>"
        "Kami akan balas dengan opsi slot & rekomendasi timeline."
    )
    blocks += thank_you_page(ty_html)

    return blocks


def patch_form(form_id, name, blocks):
    url = f'https://api.tally.so/forms/{form_id}'
    body = {
        'name': name,
        'status': 'PUBLISHED',
        'blocks': blocks,
        'settings': {
            'language': 'id',
            'hasProgressBar': False,
            'hasPartialSubmissions': False,
            'pageAutoJump': True,
            'saveForLater': True
        }
    }
    r = requests.patch(url, headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }, json=body, timeout=60)
    if r.status_code != 200:
        print('Patch failed', form_id, r.status_code, r.text, file=sys.stderr)
        sys.exit(1)
    return r.json()


def main():
    f1 = patch_form(FORM1_ID, 'WhitePaper Photography — Request Quote (≤14 Hari)', blocks_form1())
    f2 = patch_form(FORM2_ID, 'WhitePaper Photography — Plan Ahead (>14 Hari)', blocks_form2())
    out = {
        'form1': f1,
        'form2': f2,
        'form1_url': f'https://tally.so/r/{FORM1_ID}',
        'form2_url': f'https://tally.so/r/{FORM2_ID}'
    }
    print(json.dumps(out, indent=2))

if __name__ == '__main__':
    main()
