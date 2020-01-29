
I decided, having some free time, to finally update this blog and look at how it works.

## Motivation

My goal for this blog is to keep in running as long as possible as cheaply as possible. The low traffic it generates means that the use case fits really well with AWS Lambda for pricing. To leverage this the site is built using Next.js and Serverless.js to run on Lambda. However I also wanted a way to save blog data without having to pay for and maintain a database while also ensuring I had a local copy of everything, and I also wanted full control of the site content so an off the shelf solution like Hugo didn't fit well.

So I decided to leverage S3 to act as both my file store, and my "database" for listing blog posts. I needed a way to know what posts there were and sort them in order of time posted.

I also wanted to be able to serve images:
![Bird having fun with a mirror, an example of the important images I can now put on my blog.](media/Bird.jpg)

## Retrieving Blog Posts

The blog retrieving an index of posts by calling an AWS lambda function that returns a `manifest.json` file from S3. The `manifest.json` file contains metadata for every blog post on the site.

Here's an example of `manifest.json` :

```json
[
  {
    "key":"28f18583-d389-4598-84e0-ebf9810ba2fd",
    "date":1515650723000,
    "title":"Image Test",
    "url":"image-test-please-ignore",
    "summary":"Testing images please ignore"
  },
  {
    "key":"2e64df10-41b7-4b68-885a-34dc9f0d043c",
    "date":1515650723000,
    "title":"Making Digglesby.com",
    "url":"making-digglesby-com-isomorphic-react-next-js",
    "summary":"An adventure through isomorphic web development."
  },
  {
    "key":"e1795d22-05e9-43ab-a4bc-ecd5e194e5b6",
    "date":1515565711000,
    "title":"Hello World",
    "url":"hello-world",
    "summary":"Welcome my blog! I will mostly be posting about my personal projects here, aswell as general things I find interesting."
    }
  ]
```

`key` here is a reference to an S3 folder at https://blog.digglesby.com

Because every file is served behind a Cloudfront CDN, assets are cached by browsers, so posts need to be able to be invalidated easily and effectively. My solution to this was to serve the `manifest.json` through a lambda function since the `manifest.json` file needs to be revalidated every time and be served from the same location, and have the tool invalidate post data by renaming their listing in `manifest.json` and directory in S3.

## The Upload Tool

Every blog post is stored locally on my machine as `/posts`. Every post directory contains `post.md` `/media` and `meta.json`.
* `post.md` is the post text as markdown
* `/media` is a directory containing all images or files used in the post.
* `meta.json` is a JSON file containing all metadata such as the URL slug, the title of the post, the date it was posted ect.

The post upload tool:
* Maps each post to a unique "CACHE_ID" (a unique string that can be reset to invalidate any caching)
* Generates resized versions of all images in `/media` for optimization
* Generates a `post.json` file which combines the data from `meta.json` and the text from `post.md`
* Saves all files locally to `/bin`;
* Syncs `/bin` to an S3 bucket to upload


## Closing thoughts

While this setup is a little bizarre and fairly work intensive, the overall cost of the blog is nearly entirely usage based (with the exception of the domain name and email service), and very cheap.

You can take a look at the projects here:
https://github.com/digglesby/digglesby-blog
https://github.com/digglesby/digglesby-blog-posts
