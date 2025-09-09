<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <!-- Date formatting template -->
  <xsl:template name="format-date">
    <xsl:param name="date-string"/>
    
    <!-- Parse RFC 2822 format: "Mon, 08 Sep 2025 17:52:00 GMT" -->
    <xsl:variable name="day" select="substring($date-string, 6, 2)"/>
    <xsl:variable name="month-str" select="substring($date-string, 9, 3)"/>
    <xsl:variable name="year" select="substring($date-string, 13, 4)"/>
    <xsl:variable name="time" select="substring($date-string, 18, 5)"/>
    
    <xsl:variable name="month-name">
      <xsl:choose>
        <xsl:when test="$month-str = 'Jan'">January</xsl:when>
        <xsl:when test="$month-str = 'Feb'">February</xsl:when>
        <xsl:when test="$month-str = 'Mar'">March</xsl:when>
        <xsl:when test="$month-str = 'Apr'">April</xsl:when>
        <xsl:when test="$month-str = 'May'">May</xsl:when>
        <xsl:when test="$month-str = 'Jun'">June</xsl:when>
        <xsl:when test="$month-str = 'Jul'">July</xsl:when>
        <xsl:when test="$month-str = 'Aug'">August</xsl:when>
        <xsl:when test="$month-str = 'Sep'">September</xsl:when>
        <xsl:when test="$month-str = 'Oct'">October</xsl:when>
        <xsl:when test="$month-str = 'Nov'">November</xsl:when>
        <xsl:when test="$month-str = 'Dec'">December</xsl:when>
      </xsl:choose>
    </xsl:variable>
    
    <xsl:value-of select="$month-name"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="number($day)"/>
    <xsl:text>, </xsl:text>
    <xsl:value-of select="$year"/>
    <xsl:text> at </xsl:text>
    <xsl:value-of select="$time"/>
  </xsl:template>

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
            
            .post-metadata {
              color: #9ca3af;
            }
            
            .post-date-link {
              color: #a78bfa;
            }
            
            .post-date-link:hover {
              color: #c4b5fd;
            }
            
            .tag {
              color: #a78bfa;
              border-color: #a78bfa;
            }
            
            .tag:hover {
              color: #c4b5fd;
              border-color: #c4b5fd;
              background: rgba(167, 139, 250, 0.1);
            }
            
            .category-tag {
              color: #fbbf24;
              border-color: #f59e0b;
            }
            
            .category-tag:hover {
              background: rgba(245, 158, 11, 0.1);
              border-color: #f59e0b;
            }
            
            .post-description {
              color: #d1d5db;
            }
            
            .post-mobile-metadata {
              border-top-color: #374151;
              color: #9ca3af;
            }
            
            .post-meta-divider {
              color: #4b5563;
            }
            
            .back-link-text {
              color: #77a3ff;
              border-color: rgba(119, 163, 255, 0.3);
              background: rgba(119, 163, 255, 0.05);
            }
            
            .back-link-text:hover {
              background: rgba(119, 163, 255, 0.1);
              border-color: #77a3ff;
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
          
          .back-link {
            margin-top: 1rem;
          }
          
          .back-link-text {
            display: inline-flex;
            align-items: center;
            color: rgb(var(--color-accent));
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
            border: 1px solid rgba(var(--color-accent), 0.3);
            border-radius: 6px;
            background: rgba(var(--color-accent), 0.05);
            transition: all 0.2s ease;
          }
          
          .back-link-text:hover {
            background: rgba(var(--color-accent), 0.1);
            border-color: rgb(var(--color-accent));
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
            padding: 0;
            border-bottom: 1px solid rgb(var(--color-border));
            background: transparent;
            transition: all 0.2s ease;
          }
          
          .post:hover {
            transform: translateY(-1px);
          }
          
          .post:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          /* Desktop Layout */
          .post-desktop {
            display: none;
          }
          
          @media (min-width: 1024px) {
            .post-desktop {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 2rem;
              padding: 1.5rem 0;
            }
          }
          
          /* Mobile Layout */
          .post-mobile {
            display: block;
            padding: 1.5rem 0;
          }
          
          @media (min-width: 1024px) {
            .post-mobile {
              display: none;
            }
          }
          
          /* Metadata styling */
          .post-metadata {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            font-size: 0.875rem;
            color: #6b7280;
            text-align: right;
            padding-right: 1rem;
            align-items: flex-end;
          }
          
          .post-date-link {
            text-decoration: none;
            transition: all 0.2s ease;
            color: #8b5cf6;
            font-weight: 500;
          }
          
          .post-date-link:hover {
            color: #7c3aed;
            text-decoration: underline;
          }
          
          .post-tags-sidebar {
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            align-items: flex-end;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
          
          .tag {
            display: inline-block;
            color: #8b5cf6;
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            border: 1px solid #8b5cf6;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s ease;
            background: transparent;
            white-space: nowrap;
          }
          
          .tag:hover {
            color: #7c3aed;
            border-color: #7c3aed;
            background: rgba(139, 92, 246, 0.05);
          }
          
          /* Content styling */
          .post-title {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 0.75rem;
            color: rgb(var(--color-text-primary));
            text-decoration: none;
            display: block;
            transition: color 0.2s ease;
          }
          
          .post-title:hover {
            color: #3b82f6;
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
            color: #8b5cf6;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }
          
          .post-categories {
            display: flex;
            gap: 0.5rem;
          }
          
          .category-tag {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: lowercase;
            letter-spacing: 0.05em;
            color: #ca8a04;
            background: transparent;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            border: 1px solid #eab308;
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          
          .category-tag:hover {
            background: rgba(234, 179, 8, 0.05);
            border-color: #ca8a04;
          }
          
          .post-description {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          
          .read-more {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            margin-top: 1rem;
            display: inline-block;
            transition: all 0.2s ease;
          }
          
          .read-more:hover {
            color: #2563eb;
            text-decoration: underline;
          }
          
          /* Mobile specific styling */
          .post-mobile-title {
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 0.75rem;
            color: rgb(var(--color-text-primary));
            text-decoration: none;
            display: block;
            transition: color 0.2s ease;
          }
          
          .post-mobile-title:hover {
            color: #3b82f6;
          }
          
          .post-mobile-metadata {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .post-meta-divider {
            color: #d1d5db;
          }
          
          .post-tags-inline {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
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
          
          @media (max-width: 1024px) {
            .post-desktop {
              display: none;
            }
            
            .post-mobile {
              display: block;
            }
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
            
            .post-mobile-metadata {
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
            <div class="back-link">
              <a href="https://sajalchoudhary.net" class="back-link-text">← Go back to sajalchoudhary.net</a>
            </div>
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
            <div class="back-link" style="margin-top: 1rem;">
              <a href="https://sajalchoudhary.net" class="back-link-text">← Go back to sajalchoudhary.net</a>
            </div>
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
                <!-- Desktop Layout -->
                <div class="post-desktop">
                  <!-- Left column: Metadata -->
                  <div class="post-metadata">
                    <a href="{link}" class="post-date-link">
                      <xsl:call-template name="format-date">
                        <xsl:with-param name="date-string" select="pubDate"/>
                      </xsl:call-template>
                    </a>
                    <xsl:if test="category[1]">
                      <div class="post-categories">
                        <span class="category-tag">
                          <xsl:value-of select="category[1]"/>
                        </span>
                      </div>
                    </xsl:if>
                    <xsl:if test="category[position() > 1]">
                      <div class="post-tags-sidebar">
                        <xsl:for-each select="category[position() > 1]">
                          <a href="/tags/{translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')}/" class="tag">
                            <xsl:value-of select="translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                          </a>
                        </xsl:for-each>
                      </div>
                    </xsl:if>
                  </div>
                  
                  <!-- Right column: Content -->
                  <div class="post-content">
                    <a href="{link}" class="post-title">
                      <xsl:value-of select="title"/>
                    </a>
                    
                    <xsl:if test="description and description != ''">
                      <div class="post-description">
                        <xsl:value-of select="description"/>
                      </div>
                    </xsl:if>
                  </div>
                </div>
                
                <!-- Mobile Layout -->
                <div class="post-mobile">
                  <div class="post-content">
                    <a href="{link}" class="post-mobile-title">
                      <xsl:value-of select="title"/>
                    </a>
                    
                    <xsl:if test="description and description != ''">
                      <div class="post-description">
                        <xsl:value-of select="description"/>
                      </div>
                    </xsl:if>
                  </div>
                  
                  <!-- Mobile metadata after content -->
                  <div class="post-mobile-metadata">
                    <a href="{link}" class="post-date-link">
                      <xsl:call-template name="format-date">
                        <xsl:with-param name="date-string" select="pubDate"/>
                      </xsl:call-template>
                    </a>
                    <xsl:if test="category[1]">
                      <div class="post-meta-divider">•</div>
                      <div class="post-categories">
                        <span class="category-tag">
                          <xsl:value-of select="category[1]"/>
                        </span>
                      </div>
                    </xsl:if>
                    <xsl:if test="category[position() > 1]">
                      <div class="post-meta-divider">•</div>
                      <div class="post-tags-inline">
                        <xsl:for-each select="category[position() > 1]">
                          <a href="/tags/{translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')}/" class="tag">
                            <xsl:value-of select="translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                          </a>
                        </xsl:for-each>
                      </div>
                    </xsl:if>
                  </div>
                </div>
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