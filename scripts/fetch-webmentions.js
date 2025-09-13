#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WEBMENTION_IO_API = 'https://webmention.io/api/mentions.jf2';
const DOMAIN = 'sajalchoudhary.net';
const OUTPUT_FILE = path.join(__dirname, '../src/data/webmentions.json');

// Blocklist of spam domains (from Maggie's script)
const blockList = [
  "www.aol.com",
  "newstrooper.net",
  "uuldesign.com",
  "condepah.com",
  "cashadvaa.com",
  "neckball.com",
  "chruvids.com",
  "czyijiamei.com",
  "cabelov.com",
  "old.billionaireclubcollc.com",
  "jaunenglish.com",
  "puntvisual.com",
  "solomario.com",
  "digitalkoh.com",
  "latribunapanama.com",
  "sahafans.com",
  "live-healthy-and-well.com",
  "www.workidnap.tech",
  "akkalife.com",
  "ict-news-bd.com",
  "truthrow.com",
  "floodrelief2022.com",
  "chapsell.com",
  "unnews.site",
  "www.scriptori.com",
  "cssmixer.com",
  "findvidz.com",
  "starkedsf.com",
  "apollonews.site",
  "unnews.online",
  "faizalpj.com",
  "vimaxdeal.com",
  "bynewmud.com",
  "safallon.xyz",
  "facecapas.com",
  "491magazine.com",
  "wow-onyx.com",
  "heartjournalmagazine.com",
  "momovan.com",
  "bakatube.com",
  "indiatoday.host",
  "www.indiatoday.host",
  "rssfeeds.cloudsite.builders",
  "sharewaredepo.com",
  "pakistanistore.pk",
  "gadgetsearcher.com",
  "pixallus.com",
  "programming.yourworldin90seconds.com",
  "programming.nichedomain.news",
  "marketingsolution.com.au",
  "programming.aplus-review.com",
  "digitalapexgroup.com",
  "technologynews.biz",
  "worldtech.news",
  "programming.webcloning.com",
  "www.sacramentowebdesigngroup.com",
  "htmltreehouse.com",
  "1dmx.org",
  "websitedesign-usa.com",
  "techupd.com",
  "fancyhints.com",
  "techalertnews.com",
  "buzzedly.com",
  "dztechno.com",
  "graphicdon.com",
  "www.newsgosspis.com",
  "www.digitasbuzz.in",
  "gotutoral.com",
  "wpguynews.com",
  "www.klobal.net",
  "www.webmastersgallery.com",
  "pikopong.com",
  "keren.link",
  "ntdln.com",
  "jczh.xyz",
  "pazukong.wordpress.com",
  "fullstackfeed.com",
  "thebrandingstore.net",
  "development-tools.net",
  "itdirectory.my",
  "www.sacramentowebdesigngroup.com",
  "engrmks.com.ng",
  "www.xspdf.com",
  "isokunoffice.club",
  "dinezh.com",
  "www.makemoneyupdaters.com",
  "clicknow.in",
  "nexstair.com",
  "kovtonyuk.inf.ua",
  "postheaven.net",
  "www.legendstrivia.co.uk",
  "squareblogs.net",
  "www.fourthcity.net",
  "www.engrmks.com.ng",
  "711web.com",
  "techupd.com",
  "www.67nj.org",
  "tipsxd.com",
  "www.new.pixel-forge.ca",
  "pixallus.com",
  "wpnewshub.com",
  "tecriter.wordpressarena.com",
  "reddits.contractwebsites.com",
  "wawas-kingdom.com",
  "dztechno.com",
  "wpguynews.com",
  "www.digitasbuzz.in",
  "watchfvsslive.co",
  "gotutoral.com",
  "techfans.co.uk",
  "pikopong.com",
  "marketingsolution.com.au",
  "reportwire.org",
  "www.codeificant.com",
  "tipsxd.com",
  "wpdesigns.live",
  "gigatechnews.com",
  "blogs.thebitx.com",
  "updatetech.xyz",
  "neoweb4u.com",
  "www.websjohn.com",
  "www.webhostpolice.com",
  "lzomedia.com",
  "jateng.co",
  "news.priviw.com",
  "movilgadget.com",
  "kitdeveloper.ru",
  "reactjsexample.com",
  "dentedreality.com.au",
  "platoblockchain.net",
  "aayugcreation.com",
  "www.67nj.org",
  "wpnewshub.com",
  "codinghindi.in",
  "programmer.chimpymail.com",
  "sayed.work",
  "infos.by",
  "data-science-austria.at",
  "www.techyrack.com",
  "opta.live",
  "www.imoneyhub.com",
  "www.askorhelp.com",
  "www.handla.it",
  "webchilli.co.za",
  "indyamariejean.com",
  "hnikoloski.com",
  "www.makemoneyonlinecom.com",
  "underskore.in",
  "codytechs.com",
  "shanuverma.com",
  "technewzroom.com",
  "fiercesite.com",
  "www.essexwebhosts.com",
  "tavarro.com",
  "ecapital.news",
  "i-capitals.com",
  "vcodepedia.com",
  "e-capitals.com",
  "xlera8.com",
  "gadgetofficials.com",
  "coingenius.news",
  "thenewslog.org",
  "zplux.com",
  "tiptipa.com",
  "zephyrnet.com",
  "secretofcss.com",
  "test.designsolutions.online",
  "www.prixleplusbas.xyz",
  "www.nolisa.xyz",
  "datechguru.com",
  "www.cssdersleri.com",
  "www.pixellyft.com",
  "icapital.news",
  "usae.sit",
  "helpbuildweb.com",
  "sharewarepile.com",
  "sharewaredepo.com",
  "www.codersjungle.com",
  "www.monsterstudios.com.ng",
  "technewsbeats.com",
  "kerbco.com",
  "planetdigital963889394.wordpress.com",
  "digitalworld108117254.wordpress.com",
  "digitalnow878391108.wordpress.com",
  "newsdigital742901006.wordpress.com",
  "digitaldamian273090457.wordpress.com",
  "codezero844163712.wordpress.com",
  "deboramontoli.it",
];

async function fetchWebmentions() {
  try {
    console.log(`Fetching webmentions for ${DOMAIN}...`);
    
    const response = await fetch(`${WEBMENTION_IO_API}?target=${encodeURIComponent(`https://${DOMAIN}`)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.children) {
      console.log('No webmentions found');
      return { children: [] };
    }
    
    // Filter out blocked domains
    const filteredMentions = data.children.filter((mention) => {
      const domain = mention.url.split('/')[2];
      const isBlocked = blockList.includes(domain);
      return !isBlocked;
    });
    
    console.log(`Found ${data.children.length} webmentions, ${filteredMentions.length} after filtering`);
    
    return { children: filteredMentions };
  } catch (error) {
    console.error('Error fetching webmentions:', error);
    
    // Return empty data if fetch fails
    return { children: [] };
  }
}

async function main() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const webmentions = await fetchWebmentions();
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(webmentions, null, 2));
    
    console.log(`Webmentions saved to ${OUTPUT_FILE}`);
    console.log(`Total webmentions: ${webmentions.children.length}`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fetchWebmentions };