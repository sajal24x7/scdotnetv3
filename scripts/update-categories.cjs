const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../src/content');

function isPoem(title, content, tags, filename) {
  // Heuristics for poems
  return (
    (tags && tags.some(tag => /\bpoem(s)?\b|poetry|spoken word|haiku|sonnet/i.test(tag))) ||
    /\bpoem(s)?\b|poetry|haiku|sonnet/i.test(title) ||
    /\bpoem(s)?\b|poetry|haiku|sonnet/i.test(filename) ||
    /^#?\d+ in an year of mornings/i.test(title) ||
    /<br\s*\/?>(\s*\n)?/i.test(content) ||
    (content.split('\n').length < 40 && content.match(/<p>.*<\/p>/g)?.length > 5) ||
    (tags && tags.includes('yearOfMornings')) ||
    (tags && tags.includes('poems'))
  );
}

function isStory(title, content, tags, filename) {
  // Heuristics for stories
  return (
    (tags && tags.some(tag => /\bstory|stories|fiction|short story|narrative\b/i.test(tag))) ||
    /\bstory|stories|fiction|short story|narrative\b/i.test(title) ||
    /\bstory|stories|fiction|short story|narrative\b/i.test(filename) ||
    /Once upon a time|short story|fiction|narrative/i.test(content) ||
    content.includes('<!--kg-card-begin: html-->') ||
    content.includes("He's gone; the Lord") ||
    content.includes('Letters to an imaginary girlfriend')
  );
}

function isEvergreen(title, content, tags) {
  // Heuristics for evergreen
  return (
    /evergreen/i.test(title) ||
    (tags && tags.some(tag => /evergreen|writing is|reading|books|design|tech|life|mindset|lessons|advice|review|guide|how to|tips|reflection|habit|philosophy|principle|timeless/i.test(tag))) ||
    /writing is|reading|books|design|tech|life|mindset|lessons|advice|review|guide|how to|tips|reflection|habit|philosophy|principle|timeless/i.test(content)
  );
}

function isNordletter(category) {
  return category === 'nordletter';
}

function updateCategories() {
  const years = fs.readdirSync(POSTS_DIR).filter(dir => /^\d{4}$/.test(dir));
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  let summary = [];

  years.forEach(year => {
    const yearDir = path.join(POSTS_DIR, year);
    const posts = fs.readdirSync(yearDir).filter(file => file.endsWith('.md'));

    posts.forEach(post => {
      const postPath = path.join(yearDir, post);
      const content = fs.readFileSync(postPath, 'utf8');
      const { data, content: markdownContent } = matter(content);
      const title = data.title || '';
      const tags = data.tags || [];
      const oldCategory = data.category;
      const filename = post;

      // Skip nordletter
      if (isNordletter(oldCategory)) {
        skipped++;
        summary.push(`SKIPPED (nordletter): ${post}`);
        return;
      }

      let newCategory = 'blog';
      if (isPoem(title, markdownContent, tags, filename)) {
        newCategory = 'poems';
      } else if (isStory(title, markdownContent, tags, filename)) {
        newCategory = 'stories';
      } else if (isEvergreen(title, markdownContent, tags)) {
        newCategory = 'evergreen';
      }

      if (oldCategory !== newCategory) {
        data.category = newCategory;
        const newContent = matter.stringify(markdownContent, data);
        fs.writeFileSync(postPath, newContent);
        updated++;
        summary.push(`UPDATED: ${post} from ${oldCategory} to ${newCategory}`);
      } else {
        unchanged++;
      }
    });
  });

  // Print summary
  console.log('--- Category Update Summary ---');
  summary.forEach(line => console.log(line));
  console.log(`\nTotal updated: ${updated}`);
  console.log(`Total unchanged: ${unchanged}`);
  console.log(`Total skipped (nordletter): ${skipped}`);
}

updateCategories(); 