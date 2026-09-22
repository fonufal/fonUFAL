import ical from 'node-ical';

// Public "Sala FonUFAL" Google Calendar — also used for personal room
// bookings, so only events explicitly prefixed "fonUFAL:" (the group's own
// convention for publicly announced activities) are considered.
const CALENDAR_ID = 'gpeffufal@gmail.com';
const CALENDAR_ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const PREFIX = /^fonufal:\s*/i;

export interface UpcomingActivity {
  start: Date;
  title: string;
  description: string;
  url: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Google Calendar's public "view event" page, addressable without a login:
// https://calendar.google.com/calendar/event?eid=<base64("{eventId} {calendarId}")>
function calendarEventUrl(uid: string): string {
  const eventId = uid.replace(/@google\.com$/, '');
  const eid = Buffer.from(`${eventId} ${CALENDAR_ID}`).toString('base64').replace(/=+$/, '');
  return `https://calendar.google.com/calendar/event?eid=${eid}`;
}

export async function getUpcomingActivities(limit = 3): Promise<UpcomingActivity[]> {
  try {
    const data = await ical.async.fromURL(CALENDAR_ICS_URL);
    const now = new Date();
    const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365);
    const occurrences: { start: Date; summary: string; description: string; uid: string }[] = [];

    for (const key in data) {
      const ev: any = data[key];
      if (ev.type !== 'VEVENT' || !ev.summary || !PREFIX.test(ev.summary)) continue;
      if (String(ev.status || '').toUpperCase() === 'CANCELLED') continue;

      // Let node-ical expand the series itself. This is important because
      // Google Calendar represents deleted/modified occurrences with EXDATE
      // and RECURRENCE-ID; expanding ev.rrule manually would ignore those.
      const instances = ical.expandRecurringEvent(ev, {
        from: now,
        to: horizon,
        includeOverrides: true,
        excludeExdates: true,
      });

      for (const instance of instances) {
        if (!instance.start || new Date(instance.start) < now) continue;

        const summary = instance.summary || ev.summary;
        if (!summary || !PREFIX.test(summary)) continue;
        if (String((instance as any).status || '').toUpperCase() === 'CANCELLED') continue;

        occurrences.push({
          start: new Date(instance.start),
          summary,
          description: instance.description || ev.description || '',
          uid: ev.uid,
        });
      }
    }

    occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());

    return occurrences.slice(0, limit).map(o => ({
      start: o.start,
      title: o.summary.replace(PREFIX, '').trim(),
      description: stripHtml(o.description).slice(0, 180),
      url: calendarEventUrl(o.uid),
    }));
  } catch (err) {
    console.error('Failed to fetch fonUFAL calendar activities:', err);
    return [];
  }
}
