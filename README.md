# Digglesby.com S3 Blog Post Uploader

This project contains a super simple upload tool to upload blog posts to [my personal blog](https://www.digglesby.com). Posts are converted to JSON files containing markdown, images are automatically resized and compressed for optimization, and files are synced to S3.

# Usage

Sync new files
```bash
npm run upload
```

Reset CACHE_ID for one post
```bash
npm run rebuild-post [PostName]
```

Reset CACHE_ID for all posts
```bash
npm run rebuild-all
```

# What does it do?

My blog works by calling an AWS lambda function that returns a manifest.json file from S3. The `manifest.json` file contains metadata for every blog post on my site.

Every blog post is stored locally in `/posts`. Every post directory contains `post.md` `/media` and `meta.json`.
* `post.md` is the post text as markdown
* `/media` is a directory containing all images or files used in the post.
* `meta.json` is a JSON file containing all metadata such as the URL slug, the title of the post, the date it was posted ect.

This tool
* Maps each post to a unique "CACHE_ID" (a unique string that can be reset to invalidate any caching)
* Generates resized versions of all images in `/media` for optimization
* Generates a `post.json` file which combines the data from `meta.json` and the text from `post.md`
* Saves all files locally to `/bin`;
* Syncs `/bin` to an S3 bucket to upload

From there the website requests `manifest.json` and requests each `post.json` as needed.

# Why does it do this?

My goal for my blog is to keep in running as long as possible as cheaply as possible. The low traffic my blog generates means that my use case fits really well with AWS Lambda for pricing, so the site is built using Next.js and Serverless.js to run on Lambda.

I also wanted a way to save blog data without having to pay for and maintain a database while also ensuring I had a local copy of everything.

I also wanted full control of the site content so an off the shelf solution like Hugo didn't fit well.

Please full free to [visit my blog](https://www.digglesby.com) and I'll be uploading the web side of this project soon.
