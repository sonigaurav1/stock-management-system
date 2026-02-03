/** next-sitemap.config.js */
module.exports = {
  siteUrl: 'https://digitaldukan.vercel.app', // change to your actual site URL
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000, // split large sitemaps like Vercel does (sitemap-0.xml etc)
  outDir: './public'
  // To add dynamic routes, see https://github.com/sonigaurav1/next-sitemap#dynamic-routes
};
