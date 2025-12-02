require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const Stripe = require('stripe')
const archiver = require('archiver')
const { default: pLimit } = require('p-limit')

// --- CONFIG ---
const STRIPE_SECRET = process.env.STRIPE_SECRET
const OUT_DIR = './out'
const INVOICES_ZIP = path.join(OUT_DIR, 'invoices.zip')
const RECEIPTS_ZIP = path.join(OUT_DIR, 'receipts.zip')

// Concurrency limit for simultaneous downloads
const MAX_CONCURRENT_DOWNLOADS = 20

// Change these to the month/time-range you want:
const FROM = Math.floor(new Date('2025-11-01T00:00:00').getTime() / 1000)
const TO = Math.floor(new Date('2025-11-30T23:59:59').getTime() / 1000)
// ------------

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2023-10-16' })

async function downloadFileToZip(url, zipEntryName, archive) {
  const resp = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    auth: { username: STRIPE_SECRET, password: '' },
  })

  archive.append(resp.data, { name: zipEntryName })
}

async function downloadInvoices() {
  console.log('\n=== Downloading Invoices ===')

  const params = {
    limit: 100,
    created: { gte: FROM, lte: TO },
    status: 'paid',
  }

  const invoices = await stripe.invoices.list(params)
  let count = 0
  let total = 0

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const output = fs.createWriteStream(INVOICES_ZIP)
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(output)

  const limit = pLimit(MAX_CONCURRENT_DOWNLOADS)
  const tasks = invoices.data
    .filter((inv) => inv.total > 0 && inv.paid && inv.invoice_pdf)
    .map((inv) =>
      limit(async () => {
        const createdDate = new Date(inv.created * 1000)
          .toISOString()
          .slice(0, 10)
        const filename = `${createdDate}_invoice_${inv.id}.pdf`
        await downloadFileToZip(inv.invoice_pdf, filename, archive)
        console.log(`📄 Invoice added to ZIP: ${filename}`)
        total += inv.total
        count++
      })
    )

  await Promise.all(tasks)

  await archive.finalize()
  console.log(`✅ Finished ${count} invoices into ${INVOICES_ZIP}`)
  console.log(`Total earned: $${(total / 100).toFixed(2)}`)
}

async function downloadReceipts() {
  console.log('\n=== Downloading Receipts ===')

  const params = {
    limit: 100,
    created: { gte: FROM, lte: TO },
  }

  const charges = await stripe.charges.list(params)
  let count = 0
  let total = 0

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const output = fs.createWriteStream(RECEIPTS_ZIP)
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(output)

  const limit = pLimit(MAX_CONCURRENT_DOWNLOADS)
  const tasks = charges.data
    .filter((ch) => ch.paid && ch.receipt_url)
    .map((ch) =>
      limit(async () => {
        const createdDate = new Date(ch.created * 1000)
          .toISOString()
          .slice(0, 10)
        const filename = `${createdDate}_receipt_${ch.id}.pdf`
        const pdfUrl = ch.receipt_url.replace(/(\?s=.*)$/i, '/pdf$1')
        await downloadFileToZip(pdfUrl, filename, archive)
        console.log(`🧾 Receipt added to ZIP: ${filename}`)
        total += ch.amount
        count++
      })
    )

  await Promise.all(tasks)

  await archive.finalize()
  console.log(`✅ Finished ${count} receipts into ${RECEIPTS_ZIP}`)
  console.log(`Total earned: $${(total / 100).toFixed(2)}`)
}

async function downloadAll() {
  await downloadInvoices()
  await downloadReceipts()
  console.log('\n🎉 DONE — Invoices & Receipts zipped!')
}

downloadAll().catch((err) => {
  console.error('❌ Error:', err)
})
