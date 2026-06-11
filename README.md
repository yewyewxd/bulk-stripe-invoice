## Bulk download Stripe invoices and payment receipts for free

### Motivation:

When you have way too many customers, it becomes very tedious and time-consuming to download each and every one of their invoice documents on the Stripe dashboard.

Quick math:

```
If you have 100 customers, that's 2 documents x 100 customers x 12 months = 2,400 buttons to click every year
```

### Prerequisites:

1. Know how to edit the code with an IDE and run commands in a terminal
2. Installed Node.js

### Quick Start / Usage:

1. Retrieve secret key in API keys of your Stripe dashboard
2. Create `.env` file in the root folder and add `STRIPE_SECRET=paste_your_secret_key_here` (see `./.env.example`)
3. Set the `FROM` , `TO` date in `index.js`, line 13-14
4. Run `node index` in the terminal when you're ready
5. Give it a few minutes to download
6. Find the result be saved in an `/out` folder, which contains `/invoices` and `/receipts` folders
7. Save them on Google Drive and send it to your accountant (optional)

### Contributing
PRs are welcomed.
