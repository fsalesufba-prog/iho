/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://iho.sqtecnologiadainformacao.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin-sistema/*',
    '/app-empresa/*',
    '/login',
    '/esqueci-senha',
    '/resetar-senha/*'
  ],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin-sistema',
          '/app-empresa',
          '/api/*',
          '/login',
          '/esqueci-senha'
        ]
      }
    ]
  }
}