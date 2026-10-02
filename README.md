# BlueStar Appliance Repair — Website

A complete redesign of bluestarrepair.net, built as a fast, responsive, single-page
site with vanilla HTML, CSS and JavaScript. No build step, no dependencies.

## Business details

| | |
|---|---|
| Business | BlueStar Appliance Repair |
| Phone / text | [214-628-3713](tel:2146283713) (24/7) |
| Email | BlueStarApplianceRepair@gmail.com |
| Hours | Mon–Sun, 09:00 am – 08:00 pm |
| Inspection fee | $85 |
| Facebook | https://www.facebook.com/542239655639046 |

Services: washer, dryer, refrigerator, oven, dishwasher and microwave repair.

## Structure

```
index.html            Entry point — all page sections
assets/css/styles.css Design system, layout and responsive rules
assets/js/main.js     Nav, scroll reveal, hours highlight, form handling
favicon.svg           Site icon
site.webmanifest      PWA metadata
robots.txt            Crawler directives
sitemap.xml           Single-page sitemap
```

## Running locally

It is a static site — open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Forms

The quote-request form posts to LeadrVision:

```
POST https://vision.leadrai.com/api/forms/7f52fa255d091d99d47a478cc0e14225
```

- Works as a plain HTML POST with JavaScript disabled; the visitor returns to the
  page with `?submitted=1` and sees the confirmation banner.
- With JavaScript enabled the same URL is called via `fetch()` with a JSON body
  and the confirmation is shown inline without a page reload.
- Hidden fields: `_form` (form name), `_page` (set to `window.location.href`) and
  a `_gotcha` honeypot for spam.
- No file uploads, no third-party form services, no environment variables.

## Accessibility & SEO

Semantic landmarks, a skip link, visible focus states, labelled form fields,
`prefers-reduced-motion` support, descriptive alt text, Open Graph/Twitter cards
and `LocalBusiness` JSON-LD structured data.
