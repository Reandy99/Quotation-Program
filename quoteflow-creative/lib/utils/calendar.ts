export type CalendarEventInput = {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  location?: string;
};

export function googleCalendarAllDayUrl(input: CalendarEventInput): string {
  const start = input.date.replace(/-/g, '');
  const end = getNextDay(input.date).replace(/-/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${start}/${end}`,
  });
  
  if (input.description) params.set('details', input.description);
  if (input.location) params.set('location', input.location);
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsAllDay(input: CalendarEventInput): string {
  const start = input.date.replace(/-/g, '');
  const end = getNextDay(input.date).replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${now}-${Math.random().toString(36).substr(2, 9)}@quoteflow`;
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QuoteFlow//Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcs(input.title)}`,
  ];
  
  if (input.description) ics.push(`DESCRIPTION:${escapeIcs(input.description)}`);
  if (input.location) ics.push(`LOCATION:${escapeIcs(input.location)}`);
  
  ics.push('END:VEVENT', 'END:VCALENDAR');
  
  return ics.join('\r\n');
}

export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getNextDay(date: string): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function escapeIcs(text: string): string {
  return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
}
