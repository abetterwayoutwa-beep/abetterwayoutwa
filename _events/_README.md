# Events

One file per event. Files starting with `_` (like this one) are ignored by Jekyll.

**File name** = `YYYY-MM-DD-short-name.html`. The date and short name come from the
file name, and the event's page is `/events/YYYY/short-name.html`.

The site builds everything from these files:

- Homepage "Next event" banner: the soonest event dated today or later
- `events.html` "Upcoming": every event dated today or later
- `events-YEAR.html` archive: every past event of that year, newest first
- `/events/YEAR/short-name.html`: a page for every event (its Facebook preview uses the first poster)

The site rebuilds every day, so an event moves to the archive the day after it happens.

## Fields (front matter)

```yaml
---
title: "Event name"                 # HTML allowed (&amp; for &)
where: "Address line"
upcoming:                           # shown before the event
  text: |
    <p>Paragraph…</p>
  facts:                            # label/value rows under the text
    - label: "When"
      value: "5:00 – 7:00 PM"
  note: "Small print under the facts (HTML allowed)"
recap:                              # shown after the event (falls back to upcoming)
  text: |
    <p>How it went…</p>
  facts: []
  note: ""
home:                               # optional short title/line for the homepage banner
  title: "Short title"
  line: "Place. Time."
posters:                            # flyers; the first one is the share image
  - src: "/images/flyer.jpg"
    alt: "Describe the flyer"
photos:
  - src: "/images/photo-1.jpg"
    alt: "Describe the photo"
photo_grid: true                    # even 4-column grid (use when all photos are the same shape)
videos:
  - youtube: "VIDEO_ID"
    title: "Video title"
---
```

Images: put the original photo in `images/` and reference it by path. Width, height,
and the small WebP versions are generated automatically in CI (`_tools/images.py`).
A wrong image path fails the build before anything goes live.

For a new year, copy `events-2026.html` to `events-2027.html` and change `year:` and `title:`.
