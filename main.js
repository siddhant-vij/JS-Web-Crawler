const { crawlPage } = require('./crawl.js')
const { printReport } = require('./report.js')

async function main() {
  if (process.argv.length < 3) {
    console.log('Error: no website provided')
    return
  }
  if (process.argv.length > 3) {
    console.log('Error: too many arguments provided')
    return
  }

  const baseURL = process.argv[2]
  // Test: https://wagslane.dev

  console.log(`starting crawl of: ${baseURL}...`)

  const pages = await crawlPage(baseURL, baseURL, {})

  printReport(pages)
}

main()