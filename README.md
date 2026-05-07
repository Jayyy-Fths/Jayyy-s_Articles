# Jayyy-s_Articles

A professional static article hub with search, filters, comments, sharing, and newsletter signup.

## Features

- Article list with search, category, and tag filters
- Featured story preview on the homepage
- Dark mode toggle for the entire site
- Individual article pages with author, date, reading time, tags, and featured image
- Related article suggestions on each article page
- Reader comments stored locally
- Copyable share link for each article
- Newsletter signup form with local storage support

## How to use

1. Open `index.html` in your browser.
2. Add or edit articles in `articles.js`.
3. Each article should include:
   - `slug`
   - `title`
   - `category`
   - `tags`
   - `author`
   - `date`
   - `readingTime`
   - `image`
   - `excerpt`
   - `content`
4. Refresh the page after saving changes.
5. Share articles with links like:

`article.html?slug=market-outlook-q2`

## Notes

- The newsletter signup and comments are saved in browser local storage for demonstration.
- This is a static site, so you can host it on any static hosting service.
