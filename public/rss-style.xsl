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
          :root {
            /* Light theme colors - warm cream */
            --color-bg: 255, 252, 245;
            --color-bg-secondary: 250, 245, 235;
            --color-text-primary: 33, 33, 33;
            --color-text-secondary: 117, 117, 117;
            --color-accent: 0, 102, 204;
            --color-border: 235, 231, 225;
            --color-accent-bg: 240, 249, 255;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              /* Dark theme colors - warm dark brown */
              --color-bg: 35, 30, 28;
              --color-bg-secondary: 45, 38, 34;
              --color-text-primary: 255, 250, 240;
              --color-text-secondary: 209, 213, 219;
              --color-accent: 77, 159, 255;
              --color-border: 85, 75, 70;
              --color-accent-bg: 30, 41, 59;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: rgb(var(--color-text-primary));
            background: rgb(var(--color-bg));
            padding: 2rem 1rem;
            transition: background-color 0.5s ease, color 0.3s ease;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(var(--color-bg-secondary), 0.9);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            border: 1px solid rgb(var(--color-border));
            backdrop-filter: blur(10px);
          }
          
          .header {
            padding: 3rem 2rem 2rem 2rem;
            border-bottom: 1px solid rgb(var(--color-border));
            background: rgba(var(--color-bg-secondary), 0.7);
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: rgb(var(--color-text-primary));
            line-height: 1.25;
          }
          
          .header .description {
            font-size: 1.25rem;
            color: rgb(var(--color-text-secondary));
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          
          .rss-info {
            background: rgba(var(--color-accent-bg), 0.5);
            border-left: 4px solid rgb(var(--color-accent));
            padding: 1.5rem 2rem;
            margin: 0;
            border-radius: 0;
          }
          
          .rss-info h2 {
            color: rgb(var(--color-text-primary));
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          
          .rss-info p {
            color: rgb(var(--color-text-secondary));
            margin-bottom: 1rem;
            line-height: 1.7;
          }
          
          .rss-url {
            background: rgba(var(--color-bg), 0.8);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 0.9rem;
            color: rgb(var(--color-text-primary));
            word-break: break-all;
            border: 1px solid rgb(var(--color-border));
          }
          
          .content {
            padding: 2rem;
            background: rgba(var(--color-bg-secondary), 0.3);
          }
          
          .posts-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid rgb(var(--color-border));
          }
          
          .posts-header h2 {
            color: rgb(var(--color-text-primary));
            font-size: 1.5rem;
            font-weight: 600;
          }
          
          .post-count {
            background: rgb(var(--color-accent));
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
          }
          
          .post {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border-bottom: 1px solid rgb(var(--color-border));
            background: rgba(var(--color-bg-secondary), 0.5);
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          
          .post:hover {
            background: rgba(var(--color-bg-secondary), 0.8);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1);
          }
          
          .post:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .post-title {
            font-size: 1.375rem;
            font-weight: 600;
            color: rgb(var(--color-text-primary));
            text-decoration: none;
            margin-bottom: 0.75rem;
            display: block;
            transition: color 0.2s ease;
            line-height: 1.4;
          }
          
          .post-title:hover {
            color: rgb(var(--color-accent));
          }
          
          .post-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.875rem;
            color: rgb(var(--color-text-secondary));
          }
          
          .post-date {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-weight: 500;
          }
          
          .post-categories {
            display: flex;
            gap: 0.5rem;
          }
          
          .category-tag {
            background: rgba(var(--color-accent), 0.1);
            color: rgb(var(--color-accent));
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid rgba(var(--color-accent), 0.2);
          }
          
          .post-description {
            color: rgb(var(--color-text-secondary));
            line-height: 1.7;
            margin-bottom: 1rem;
          }
          
          .read-more {
            color: rgb(var(--color-accent));
            text-decoration: none;
            font-weight: 500;
            margin-top: 1rem;
            display: inline-block;
            transition: all 0.2s ease;
          }
          
          .read-more:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
          }
          
          .footer {
            background: rgba(var(--color-bg-secondary), 0.7);
            padding: 2rem;
            text-align: center;
            color: rgb(var(--color-text-secondary));
            font-size: 0.875rem;
            border-top: 1px solid rgb(var(--color-border));
          }
          
          .footer a {
            color: rgb(var(--color-accent));
            text-decoration: none;
            font-weight: 500;
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
            
            .post {
              padding: 1rem;
            }
          }
          
          .icon {
            width: 1rem;
            height: 1rem;
            display: inline-block;
            vertical-align: middle;
            opacity: 0.7;
          }
          
          /* Add some nice visual elements */
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, rgb(var(--color-accent)), rgba(var(--color-accent), 0.3));
          }
          
          .container {
            position: relative;
          }
          
          /* Smooth transitions for all interactive elements */
          a, .post, .post-title, .read-more {
            transition: all 0.2s ease;
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