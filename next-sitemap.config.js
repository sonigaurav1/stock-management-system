/** next-sitemap.config.js */
module.exports = {
  siteUrl: 'https://digitaldukan.vercel.app', // change to your actual site URL
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000, // split large sitemaps like Vercel does (sitemap-0.xml etc)
  outDir: './public'
  // If you need to add dynamic routes, see notes below
};
