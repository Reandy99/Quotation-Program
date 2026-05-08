update public.lead_forms
set
  title = 'Request Event Documentation',
  description = 'Tell us about your event and we will get back to you soon.',
  button_text = 'Submit Inquiry',
  thank_you_message = 'Thank you! Your inquiry has been received.',
  updated_at = now()
where
  lower(coalesce(title, '')) like '%isi form%'
  or lower(coalesce(description, '')) like '%isi form%'
  or lower(coalesce(button_text, '')) like '%bro%'
  or lower(coalesce(thank_you_message, '')) like '%bro%';
