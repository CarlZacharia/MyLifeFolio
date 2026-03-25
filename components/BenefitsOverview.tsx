'use client';

import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Chip, Card, CardContent, Grid,
  AppBar, Toolbar, Button, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const benefits = [
  { icon: "🚨", title: "Emergency medical crisis", desc: "When someone is unconscious or incapacitated, first responders and family instantly access medications, allergies, prior surgeries, blood type, physicians, specialists, and hospital preferences — no hunting through drawers or calling around.", tags: ["Medical Data", "Care Decisions"], cat: "Emergency" },
  { icon: "📋", title: "Hospital admission from a distance", desc: "A family member in another state gets the ER call. Rather than being helpless, they can pull up every medical detail, insurance cards, advance directives, and the patient's preferred hospital — and communicate it all to the care team immediately.", tags: ["Medical Data", "Insurance Coverage", "Care Decisions", "Legal Documents"], cat: "Emergency" },
  { icon: "🔍", title: "'I can't reach Mom' — welfare check", desc: "If a parent isn't answering calls and lives alone, family logs into MyLifeFolio to find friends, neighbors, and nearby contacts who can physically check on them — often faster than calling 911.", tags: ["My People & Advisors", "Personal Information"], cat: "Emergency" },
  { icon: "📄", title: "Finding the power of attorney when it's needed most", desc: "Authorized family members can access the POA document immediately — no scrambling through filing cabinets during a crisis. The client decides in advance exactly who can see which documents.", tags: ["Legal Documents", "Documents Vault"], cat: "Estate & Legal" },
  { icon: "🏦", title: "Settling the estate without the scavenger hunt", desc: "When someone passes, the family knows every account, investment, real property, business interest, and digital asset — and who to call. Months of detective work become days.", tags: ["Financial Life", "Documents Vault", "Digital Life"], cat: "Estate & Legal" },
  { icon: "🏠", title: "Locating assets the family didn't know existed", desc: "Life insurance policies, safe deposit boxes, unclaimed retirement accounts, cryptocurrency wallets, and business ownership interests are all documented — not lost forever.", tags: ["Financial Life", "Documents Vault", "Digital Life"], cat: "Estate & Legal" },
  { icon: "⚖️", title: "Avoiding ancillary probate in multiple states", desc: "When real property in multiple states is documented alongside the trust or deed, the estate attorney immediately knows what needs to be addressed — no surprise probate filings.", tags: ["Financial Life", "Legal Documents"], cat: "Estate & Legal" },
  { icon: "💻", title: "Securing digital life after death", desc: "Online accounts, subscriptions, social media, domain names, and cryptocurrency are documented with credentials and instructions — preventing both account hijacking and permanent loss of digital assets.", tags: ["Digital Life", "Documents Vault"], cat: "Estate & Legal" },
  { icon: "🧠", title: "Early dementia — capture everything now", desc: "When a diagnosis arrives, there's a window. The person can record wishes, preferences, family history, and care instructions while they still can — preserving their voice for when it matters most.", tags: ["Medical Data", "Care Decisions", "Legacy & Life Story"], cat: "Aging & Cognitive" },
  { icon: "🔄", title: "Memory changes become immediately visible", desc: "When the record is complete and current, gaps and inconsistencies in what someone can recall become apparent — a useful early indicator for family and physicians.", tags: ["Medical Data", "Personal Information"], cat: "Aging & Cognitive" },
  { icon: "🏥", title: "Nursing home or memory care admission", desc: "Staff immediately understand the resident's routine, diet, preferences, religious practices, social history, and family contacts — enabling truly person-centered care from day one.", tags: ["Care Decisions", "Personal Information", "Family & Dependents"], cat: "Aging & Cognitive" },
  { icon: "🧬", title: "Family health history for future generations", desc: "Medical conditions, hereditary risks, and family health patterns documented here give children and grandchildren information that can literally save lives.", tags: ["Medical Data", "Family & Dependents"], cat: "Legacy" },
  { icon: "📖", title: "The stories that would otherwise be lost", desc: "Life stories, reflections, memories, letters to family, and personal history — the things people wish they had asked their grandparents. Once gone, they're gone. Here they're preserved.", tags: ["Legacy & Life Story"], cat: "Legacy" },
  { icon: "🎥", title: "Video legacy for grandchildren not yet born", desc: "Video messages, recorded memories, and personal reflections can be stored and left for grandchildren, great-grandchildren, or anyone who comes later.", tags: ["Legacy & Life Story"], cat: "Legacy" },
  { icon: "😮", title: "Surprises and the things only you know", desc: "Hidden generosity, meaningful objects with stories, the origin of a family name, a secret recipe, an act of courage — things that define a person but often die with them.", tags: ["Legacy & Life Story"], cat: "Legacy" },
  { icon: "🧾", title: "Medicaid planning — a complete asset picture", desc: "When a family comes to an elder law attorney for Medicaid planning, MyLifeFolio delivers a complete, organized financial and legal snapshot — cutting intake time dramatically.", tags: ["Financial Life", "Legal Documents", "Documents Vault"], cat: "Professional" },
  { icon: "👨‍⚖️", title: "Attorney and advisor coordination", desc: "The estate planning attorney, financial advisor, CPA, and insurance agent are all named and contactable in one place — enabling the team to coordinate without the client as the messenger.", tags: ["My People & Advisors", "Legal Documents"], cat: "Professional" },
  { icon: "📬", title: "Beneficiary designation conflicts caught early", desc: "With all accounts, policies, and beneficiary designations documented alongside the estate plan, inconsistencies are visible before they create disasters.", tags: ["Financial Life", "Family & Dependents", "Legal Documents"], cat: "Professional" },
  { icon: "🌐", title: "Recurring subscriptions nobody knows about", desc: "Subscription services billed to accounts that continue charging after death — streaming, software, memberships — are documented and can be cancelled promptly.", tags: ["Digital Life", "Financial Life"], cat: "Professional" },
  { icon: "🎗️", title: "End of life wishes honored, not guessed at", desc: "Funeral preferences, burial wishes, religious preferences, and prepaid arrangements are documented so that family isn't making heartbreaking guesses during the worst week of their lives.", tags: ["End of Life Issues", "Care Decisions"], cat: "End of Life" },
  { icon: "📜", title: "Advance directives where they're actually needed", desc: "Healthcare surrogates and agents can find and present the advance directive, living will, and DNR documents immediately — not after it's too late to matter.", tags: ["End of Life Issues", "Legal Documents", "Documents Vault"], cat: "End of Life" },
  { icon: "🔐", title: "Granular access control — you decide who sees what", desc: "The client controls exactly which sections each authorized person can view. A healthcare agent sees medical data. A financial trustee sees accounts. Adult children see what you choose. Privacy is preserved.", tags: ["All sections"], cat: "Platform" },
  { icon: "📱", title: "One place, always current, always accessible", desc: "No more filing cabinets, multiple binders, scattered email folders, or Post-it notes in a sock drawer. One secure, organized, web-accessible record that is always where you left it.", tags: ["All sections"], cat: "Platform" },
  { icon: "🤝", title: "Peace of mind for the whole family", desc: "Perhaps the most underrated benefit: the person completing it knows their family will be okay. The family knows they won't be helpless. Everyone sleeps better.", tags: ["All sections"], cat: "Platform" },
];

const categories = ["All", "Emergency", "Estate & Legal", "Aging & Cognitive", "Legacy", "Professional", "End of Life", "Platform"];

interface BenefitsOverviewProps {
  onNavigateBack: () => void;
}

const BenefitsOverview = ({ onNavigateBack }: BenefitsOverviewProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const theme = useTheme();

  const filtered = useMemo(
    () => activeCategory === "All" ? benefits : benefits.filter(b => b.cat === activeCategory),
    [activeCategory]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onNavigateBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Source Sans 3", sans-serif' }}>
            MyLifeFolio
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Why MyLifeFolio?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Every stage of life brings moments when the right information, in the right hands, makes all the difference.
          </Typography>
        </Box>

        {/* Category filter bar */}
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              variant={activeCategory === cat ? "filled" : "outlined"}
              color={activeCategory === cat ? "primary" : "default"}
              onClick={() => setActiveCategory(cat)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Showing {filtered.length} of {benefits.length} scenarios
        </Typography>

        {/* Benefit cards grid */}
        <Grid container spacing={2}>
          {filtered.map((b, i) => (
            <Grid item xs={12} key={i}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ fontSize: 28, minWidth: 40, lineHeight: 1 }}>{b.icon}</Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {b.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {b.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {b.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BenefitsOverview;
