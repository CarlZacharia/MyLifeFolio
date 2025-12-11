# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Extract Files
Extract the `estate-planning-app` folder to your desired location.

### Step 2: Install Dependencies
```bash
cd estate-planning-app
npm install
```

This will install all required packages:
- Next.js
- React
- Material-UI (MUI)
- Date pickers
- Axios
- TypeScript

### Step 3: Configure n8n Webhook

**Option A: Using n8n Cloud**
1. Log into your n8n cloud account
2. Create a new workflow
3. Add a Webhook node
4. Copy the webhook URL (looks like: `https://yourinstance.app.n8n.cloud/webhook/estate-planning`)

**Option B: Using Self-Hosted n8n**
1. Access your n8n instance
2. Create a new workflow
3. Add a Webhook node
4. Use your webhook URL (looks like: `https://your-domain.com/webhook/estate-planning`)

### Step 4: Update Environment Variable
Edit `.env.local` file:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-actual-webhook-url-here
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Open in Browser
Navigate to: http://localhost:3000

You should see the Estate Planning Questionnaire!

## 🧪 Test the Form

1. Fill out the first section (Personal Data)
2. Click "Continue" to move through sections
3. Click "Submit Questionnaire" on the final page
4. Check your n8n workflow to see the data arrive

## 📧 Set Up n8n Email Notifications

Quick n8n workflow to email you the submissions:

1. **Webhook Node** (Trigger)
   - Method: POST
   - Path: `/estate-planning`

2. **Function Node** (Format Data)
   ```javascript
   return {
     json: {
       subject: `New Estate Planning Form: ${items[0].json.formData.name}`,
       body: `
         Name: ${items[0].json.formData.name}
         Email: ${items[0].json.formData.email}
         Phone: ${items[0].json.formData.cellPhone}
         
         Full data: ${JSON.stringify(items[0].json.formData, null, 2)}
       `
     }
   };
   ```

3. **Email Node** (Send Email)
   - To: your@email.com
   - Subject: `{{$json.subject}}`
   - Body: `{{$json.body}}`

4. **Respond to Webhook Node**
   - Response Code: 200
   - Response Body: `{"success": true}`

## 🚀 Deploy to Production

### Deploy to Vercel (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variable: `NEXT_PUBLIC_N8N_WEBHOOK_URL`
5. Deploy!

Your form will be live at: `https://your-project.vercel.app`

### Deploy to Your Own Server

```bash
npm run build
npm start
```

Or use a process manager like PM2:
```bash
npm install -g pm2
npm run build
pm2 start npm --name "estate-planning" -- start
```

## 🔒 Secure Your Webhook (Optional)

Add authentication to prevent unauthorized submissions:

1. Add to `.env.local`:
```env
NEXT_PUBLIC_N8N_AUTH_TOKEN=your_secret_token_here
```

2. Update `app/page.tsx` submit function:
```typescript
const response = await axios.post(webhookUrl, {
  formData,
  submittedAt: new Date().toISOString(),
}, {
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_AUTH_TOKEN}`
  }
});
```

3. In n8n Webhook node, add header authentication

## 📱 Customize for Your Firm

### Change Colors
Edit `app/layout.tsx` line 11:
```typescript
main: '#1a237e', // Change to your color
```

### Change Firm Info
Edit `app/page.tsx` header section:
- Firm name
- Address
- Phone number

### Add Logo
1. Place logo in `public/logo.png`
2. Add to header in `app/page.tsx`:
```typescript
<img src="/logo.png" alt="Logo" style={{ height: 60 }} />
```

## 🆘 Common Issues

**"Cannot find module" error**
- Run `npm install` again

**Form won't submit**
- Check n8n webhook URL in `.env.local`
- Test webhook with curl
- Check browser console for errors

**Styling looks broken**
- Clear browser cache
- Restart dev server

**Date picker not working**
- Make sure `date-fns` is installed
- Check browser console for errors

## 📚 Next Steps

1. **Customize sections** - Add/remove fields as needed
2. **Add validation** - Implement required fields validation
3. **Email confirmations** - Send client confirmation email from n8n
4. **PDF generation** - Generate PDF from n8n workflow
5. **Database storage** - Store submissions in database via n8n
6. **Analytics** - Track form completions

## 💡 Tips

- Test thoroughly before going live
- Use n8n's test webhook feature during development
- Keep your n8n workflows organized
- Document your customizations
- Backup your n8n workflows regularly

## 🎯 Production Checklist

- [ ] n8n webhook tested and working
- [ ] Environment variables configured
- [ ] Firm information updated
- [ ] Colors customized (optional)
- [ ] Tested on mobile devices
- [ ] Email notifications working
- [ ] Confirmation page customized
- [ ] SSL certificate configured (for production)
- [ ] Analytics added (optional)
- [ ] Backup strategy in place

---

Need help? Check the main README.md for detailed documentation!
