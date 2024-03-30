const { JSDOM } = require('jsdom')

function normalizeURL(url) {
  const urlObj = new URL(url)
  let fullPath = `${urlObj.host}${urlObj.pathname}`
  if (fullPath.length > 0 && fullPath.slice(-1) === '/') {
    fullPath = fullPath.slice(0, -1)
  }
  return fullPath
}

function getURLsFromHTML(htmlBody, baseURL) {
  const dom = new JSDOM(htmlBody)
  const aElements = dom.window.document.querySelectorAll('a')
  const urls = []
  for (const aElement of aElements) {
    if (aElement.href.slice(0, 1) === '/') {
      try {
        urls.push(new URL(aElement.href, baseURL).href)
      } catch (err) {
        console.log(`${err.message}: ${aElement.href}`)
      }
    } else {
      try {
        urls.push(new URL(aElement.href).href)
      } catch (err) {
        console.log(`${err.message}: ${aElement.href}`)
      }
    }
  }
  return urls
}

async function crawlPage(baseURL, currentURL, pages) {
  const domain = new URL(baseURL).hostname
  if (new URL(currentURL).hostname !== domain) {
    return pages
  }
  const normalizedURL = normalizeURL(currentURL)
  if (pages[normalizedURL]) {
    pages[normalizedURL] += 1
    return pages
  } else {
    pages[normalizedURL] = 1
  }
  console.log(`Crawling ${currentURL}`)
  try {
    const res = await fetch(currentURL)
    if (res.status >= 400) {
      console.error(`HTTP error ${res.status}: ${res.statusText}`)
      return pages
    }
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) {
      console.error(`Content type was not text/html: ${contentType}`)
      return pages
    }
    const body = await res.text()
    const urls = getURLsFromHTML(body, baseURL)
    for (const url of urls) {
      pages = await crawlPage(baseURL, url, pages)
    }
  } catch (err) {
    console.error(`Error fetching ${currentURL}: ${err.message}`)
  }
  return pages
}


module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage
}