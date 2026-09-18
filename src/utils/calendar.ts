import ical from 'node-ical';

// Public "Sala FonUFAL" Google Calendar — also used for personal room
// bookings, so only events explicitly prefixed "fonUFAL:" (the group's own
// convention for publicly announced activities) are considered.
const CALENDAR_ICS_URL = 'https://calendar.google.com/calendar/ical/gpeffufal%40gmail.com/public/basic.ics';
const PREFIX = /^fonufal:\s*/i;

export interface UpcomingActivity {
  start: Date;
  title: string;
  description: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getUpcomingActivities(limit = 3): Promise<UpcomingActivity[]> {
  try {
    const data = await ical.async.fromURL(CALENDAR_ICS_URL);
    const now = new Date();
    const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365);
    const occurrences: { start: Date; summary: string; description: string }[] = [];

    for (const key in data) {
      const ev: any = data[key];
      if (ev.type !== 'VEVENT' || !ev.summary || !PREFIX.test(ev.summary)) continue;

      if (ev.rrule) {
        for (const d of ev.rrule.between(now, horizon, true)) {
          occurrences.push({ start: new Date(d), summary: ev.summary, description: ev.description || '' });
        }
      } else if (ev.start && new Date(ev.start) >= now) {
        occurrences.push({ start: new Date(ev.start), summary: ev.summary, description: ev.description || '' });
      }
    }

    occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());

    return occurrences.slice(0, limit).map(o => ({
      start: o.start,
      title: o.summary.replace(PREFIX, '').trim(),
      description: stripHtml(o.description).slice(0, 180),
    }));
  } catch (err) {
    console.error('Failed to fetch fonUFAL calendar activities:', err);
    return [];
  }
}
