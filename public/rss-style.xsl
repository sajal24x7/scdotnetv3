<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="rss/channel/title"/></title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #f7fafc;
            padding: 2rem 1rem;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          
          .header {
            padding: 3rem 2rem 2rem 2rem;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1a202c;
          }
          
          .header .description {
            font-size: 1.25rem;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          
          .rss-info {
            background: #f8fafc;
            border-left: 4px solid #667eea;
            padding: 1.5rem 2rem;
            margin: 0;
          }
          
          .rss-info h2 {
            color: #4a5568;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }
          
          .rss-info p {
            color: #718096;
            margin-bottom: 1rem;
          }
          
          .rss-url {
            background: #edf2f7;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            color: #2d3748;
            word-break: break-all;
            border: 1px solid #e2e8f0;
          }
          
          .content {
            padding: 2rem;
          }
          
          .posts-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .posts-header h2 {
            color: #2d3748;
            font-size: 1.5rem;
          }
          
          .post-count {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
          }
          
          .post {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .post:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .post-title {
            font-size: 1.375rem;
            font-weight: 600;
            color: #2d3748;
            text-decoration: none;
            margin-bottom: 0.75rem;
            display: block;
            transition: color 0.2s ease;
          }
          
          .post-title:hover {
            color: #667eea;
          }
          
          .post-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
            color: #718096;
          }
          
          .post-date {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          
          .post-categories {
            display: flex;
            gap: 0.5rem;
          }
          
          .category-tag {
            background: #edf2f7;
            color: #4a5568;
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .post-description {
            color: #4a5568;
            line-height: 1.7;
            margin-bottom: 1rem;
          }
          
          .read-more {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            margin-top: 1rem;
            display: inline-block;
          }
          
          .read-more:hover {
            text-decoration: underline;
          }
          
          .footer {
            background: #f8fafc;
            padding: 2rem;
            text-align: center;
            color: #718096;
            font-size: 0.875rem;
          }
          
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 640px) {
            body {
              padding: 1rem 0.5rem;
            }
            
            .header {
              padding: 2rem 1rem;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .content,
            .rss-info,
            .footer {
              padding: 1.5rem 1rem;
            }
            
            .posts-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
            
            .post-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
          }
          
          .icon {
            width: 1rem;
            height: 1rem;
            display: inline-block;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="rss/channel/description"/></p>
          </div>
          
          <div class="rss-info">
            <h2>📡 Web Feed</h2>
            <p>This is a web feed, also known as an RSS or Atom feed. Subscribe by copying the URL below or from the address bar into your newsreader.</p>
            <div class="rss-url" id="feed-url">
              <!-- This will be populated by JavaScript -->
            </div>
            <script>
              document.getElementById('feed-url').textContent = window.location.href;
            </script>
            <p style="margin-top: 1rem;">
              Visit <a href="https://aboutfeeds.com/" target="_blank" rel="noopener">About Feeds</a> to get started with newsreaders and subscribing. It's free.
            </p>
          </div>
          
          <div class="content">
            <div class="posts-header">
              <h2>Recent Posts</h2>
              <div class="post-count">
                <xsl:value-of select="count(rss/channel/item)"/> posts
              </div>
            </div>
            
            <xsl:for-each select="rss/channel/item">
              <article class="post">
                <a href="{link}" class="post-title">
                  <xsl:value-of select="title"/>
                </a>
                
                <div class="post-meta">
                  <div class="post-date">
                    <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                    <xsl:value-of select="substring(pubDate, 1, 16)"/>
                  </div>
                  
                  <xsl:if test="category">
                    <div class="post-categories">
                      <xsl:for-each select="category">
                        <span class="category-tag">
                          <xsl:value-of select="."/>
                        </span>
                      </xsl:for-each>
                    </div>
                  </xsl:if>
                </div>
                
                <xsl:if test="description and description != ''">
                  <div class="post-description">
                    <xsl:value-of select="description"/>
                  </div>
                </xsl:if>
                
                <a href="{link}" class="read-more">Read full post →</a>
              </article>
            </xsl:for-each>
          </div>
          
          <div class="footer">
            <p>
              Subscribe to this feed using any RSS reader. 
              <a href="https://aboutfeeds.com/">Learn more about RSS feeds</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 