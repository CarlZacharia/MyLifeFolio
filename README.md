# Estate Planning Questionnaire - Next.js Application

A professional, multi-section estate planning questionnaire for MyLifeFolio law firm. Built with Next.js, TypeScript, and Material-UI, designed to submit data directly to n8n workflows.

## 🎯 Features

- **7-Section Questionnaire** covering all aspects of estate planning
- **Professional Material-UI Design** for a trustworthy, polished appearance
- **Responsive Layout** works on desktop, tablet, and mobile
- **Dynamic Form Arrays** for children, grandchildren, assets, beneficiaries, etc.
- **Progress Stepper** showing completion status
- **n8n Integration** for backend workflow automation
- **TypeScript** for type safety
- **Form State Management** using React Context

## 📋 Sections Included

1. **Personal Data** - Client and spouse information
2. **Marital Information** - Marriage details and prior marriages
3. **Children** - Children and grandchildren information
4. **Dispositive Intentions** - Beneficiary designations and distributions
5. **Fiduciaries** - Executor, Trustee, and Guardian selections
6. **Assets** - Real estate, bank accounts, life insurance, etc.
7. **Review & Submit** - Final review and submission

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- n8n instance running (for backend webhook)

### Installation

1. **Clone or extract the project**
```bash
cd estate-planning-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Edit `.env.local` and set your n8n webhook URL:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/estate-planning
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 n8n Webhook Configuration

### Setting Up the Webhook in n8n

1. **Create a new workflow in n8n**

2. **Add a Webhook node** (trigger)
   - Method: POST
   - Path: `/estate-planning` (or your preferred path)
   - Response Mode: "Respond Immediately"
   - Response Code: 200

3. **Process the data**
   Add nodes to handle the submitted data:
   - **Extract data** from webhook
   - **Send email** to attorneys with form data
   - **Store in database** (if needed)
   - **Create PDF** from form data
   - **Add to CRM** (if integrated)
   - **Send confirmation email** to client

### Example n8n Workflow Structure

```
Webhook (Trigger)
    ↓
Set Variables (extract form data)
    ↓
[Branch 1] Send Email to Attorney
    ↓
[Branch 2] Store in Database
    ↓
[Branch 3] Send Confirmation to Client
    ↓
Respond to Webhook
```

### Sample n8n Email Node Configuration

**To:** info@mylifefolio.com
**Subject:** New Estate Planning Questionnaire Submitted
**Body:**
```
New estate planning questionnaire received:

Client Name: {{$json.formData.name}}
Email: {{$json.formData.email}}
Phone: {{$json.formData.cellPhone}}
Spouse: {{$json.formData.spouseName}}

Submitted: {{$json.submittedAt}}

[View full details in attached JSON or database]
```

### Webhook Response

The application expects a `200 OK` response from n8n. On success, the user sees a "Thank You" page. On error, an error message is displayed.

## 📁 Project Structure

```
estate-planning-app/
├── app/
│   ├── layout.tsx          # Root layout with MUI theme
│   └── page.tsx            # Main questionnaire page with stepper
├── components/
│   ├── PersonalDataSection.tsx
│   ├── MaritalInfoSection.tsx
│   ├── ChildrenSection.tsx
│   ├── DispositiveIntentionsSection.tsx
│   ├── FiduciariesSection.tsx
│   └── AssetsSection.tsx
├── lib/
│   └── FormContext.tsx     # Form state management
├── .env.local              # Environment variables
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🎨 Customization

### Change Theme Colors

Edit `app/layout.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Change to your firm's color
    },
  },
});
```

### Add More Sections

1. Create new component in `components/`
2. Add to FormContext interface
3. Add to steps array in `app/page.tsx`
4. Add case in `renderStepContent()`

### Modify Form Fields

Edit the relevant section component in `components/` folder. All form data is stored in the FormContext.

## 🔐 Data Security

- All data is transmitted over HTTPS
- No data is stored in browser localStorage
- Data is sent directly to your secure n8n instance
- Implement proper authentication in your n8n webhook if needed

### Adding Authentication to n8n Webhook

If you want to add a secret token:

1. Update `.env.local`:
```env
NEXT_PUBLIC_N8N_AUTH_TOKEN=your_secret_token
```

2. Modify the submit function in `app/page.tsx`:
```typescript
const response = await axios.post(webhookUrl, formData, {
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_AUTH_TOKEN}`
  }
});
```

3. Configure n8n webhook to validate the token

## 📱 Responsive Design

The form automatically adapts to different screen sizes:
- **Desktop:** Multi-column layout
- **Tablet:** 2-column layout
- **Mobile:** Single column, stack fields vertically

## 🧪 Testing

### Test Locally

1. Start the development server
2. Fill out the form
3. Click submit
4. Check your n8n workflow to verify data reception

### Test n8n Webhook

Use curl to test your webhook:
```bash
curl -X POST https://your-n8n-instance.com/webhook/estate-planning \
  -H "Content-Type: application/json" \
  -d '{"formData":{"name":"Test User","email":"test@example.com"}}'
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_N8N_WEBHOOK_URL`
4. Deploy

### Deploy to Other Platforms

- **Netlify:** Works with Next.js
- **AWS Amplify:** Supports Next.js
- **Self-hosted:** Build with `npm run build` and serve with `npm start`

## 📊 Data Structure

### Form Data JSON Structure

```json
{
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "birthDate": "1960-01-15T00:00:00.000Z",
    "spouseName": "Jane Doe",
    "children": [
      {
        "name": "Child Name",
        "address": "123 Main St",
        "birthDate": "1990-01-01",
        "relationship": "son"
      }
    ],
    "realEstate": [
      {
        "owner": "Joint",
        "street": "456 Oak Ave",
        "city": "Bonita Springs",
        "state": "FL",
        "zip": "34134",
        "value": "500000",
        "mortgageBalance": "200000",
        "costBasis": "300000"
      }
    ],
    // ... all other fields
  },
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Troubleshooting

### "Webhook URL not configured" error
- Check that `.env.local` exists and has `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- Restart the dev server after changing .env.local

### Form submission fails
- Check n8n webhook is running and accessible
- Check browser console for errors
- Verify n8n webhook URL is correct
- Test webhook with curl

### Styling issues
- Clear browser cache
- Check MUI components are properly imported
- Verify emotion/styled is installed

## 📝 Adding More Asset Types

To add stocks/bonds or retirement accounts sections:

1. Add to FormContext interface:
```typescript
stocksBonds: Array<{
  owner: string;
  description: string;
  amount: string;
}>;
```

2. Add handlers in AssetsSection component
3. Add UI similar to existing asset sections

## 🤝 Support

For questions or issues:
- Email: info@mylifefolio.com
- Phone: (239) 345-4545

## 📄 License

Proprietary - MyLifeFolio

## 🔄 Updates

To update dependencies:
```bash
npm update
```

To upgrade to latest versions:
```bash
npm install @mui/material@latest @mui/x-date-pickers@latest next@latest react@latest react-dom@latest
```

---

Built with ❤️ for MyLifeFolio
