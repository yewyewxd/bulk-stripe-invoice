## Bulk download Stripe invoices and payment receipts for free

### Why I made this:

I own a SaaS business and it's profitable (thank God). [Stripe](https://stripe.com/) is the primary payment processor. As a good boi, I pay my taxes, and I need documents to back it up. According to my accountant, I need the invoice and payment receipt issued to EACH customer. I have way too much customers (thank God again) and can't possibly download each and every customer's documents on the Stripe dashboard.

Quick math:

```
If you have 100 customers, that's 2 documents x 100 customers x 12 months = 2,400 buttons to click every year
```

Obviously there is some existing solution out there BUT:

1. I don't want to expose my secret key in any ways
2. Why would I pay for an app to do something so simple that I can build in 3 minutes (with ChatGPT hehe)

Enough yapping, let's get into the meat.

### Prerequisites:

1. Know how to edit the code with an IDE and run commands in a terminal
2. Installed Node.js

### How to use:

1. Retrieve secret key in API keys of your Stripe dashboard
2. Create `.env` file in the root folder and add `STRIPE_SECRET=paste_your_secret_key_here` (see `./.env.example`)
3. Set the `FROM` , `TO` date in `index.js`, line 13-14
4. Run `node index` in the terminal when you're ready
5. Give it a few minutes to download
6. Find the result be saved in an `/out` folder, which contains `/invoices` and `/receipts` folders
7. Save them on Google Drive and send it to your accountant (optional)
