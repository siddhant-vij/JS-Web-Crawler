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

async function crawlPage(currentURL) {
  try {
    const res = await fetch(currentURL)
    if (res.status >= 400) {
      console.error(`HTTP error ${res.status}: ${res.statusText}`)
      return
    }
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) {
      console.error(`Content type was not text/html: ${contentType}`)
      return
    }
    const body = await res.text()
    console.log(body)
  } catch (err) {
    console.error(`Error fetching ${currentURL}: ${err.message}`)
  }
}


module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage
}