/**
 * Trust Plan Report Generator
 *
 * Generates a professional Word document from TrustPlanData
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';

import { TrustPlanData, AssetAnalysis, AssetRetitling, BeneficiaryChange } from './trustPlanTypes';
import { formatCurrency } from './trustPlanUtils';

// Color constants
const COLORS = {
  primary: '1E3A5F',      // Dark blue
  success: '2E7D32',      // Green
  warning: 'ED6C02',      // Orange
  error: 'D32F2F',        // Red
  headerBg: 'E8E8E8',     // Light gray for table headers
  lightGreen: 'E8F5E9',   // Light green background
  lightRed: 'FFEBEE',     // Light red background
};

/**
 * Generate the Trust Plan Analysis Word document
 */
export async function generateTrustPlanReport(
  data: TrustPlanData,
  clientName: string,
  spouseName?: string
): Promise<void> {
  const { currentPlanAnalysis, trustCenteredPlan } = data;
  const clientNames = spouseName ? `${clientName} and ${spouseName}` : clientName;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          ...createTitlePage(clientNames),

          // Executive Summary
          ...createExecutiveSummary(currentPlanAnalysis, trustCenteredPlan),

          // Current Plan Issues
          ...createCurrentPlanSection(currentPlanAnalysis),

          // Trust-Centered Recommendations
          ...createRecommendationsSection(trustCenteredPlan),

          // Benefits Summary
          ...createBenefitsSection(trustCenteredPlan),

          // Funding Checklist
          ...createFundingChecklist(trustCenteredPlan),

          // Footer
          ...createFooter(),
        ],
      },
    ],
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  const fileName = `Trust_Planning_Analysis_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
}

/**
 * Create title page
 */
function createTitlePage(clientNames: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'TRUST-CENTERED',
          bold: true,
          size: 48,
          color: COLORS.primary,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 0 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'ESTATE PLANNING ANALYSIS',
          bold: true,
          size: 48,
          color: COLORS.primary,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared for:`,
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: clientNames,
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

/**
 * Create executive summary section
 */
function createExecutiveSummary(
  analysis: TrustPlanData['currentPlanAnalysis'],
  plan: TrustPlanData['trustCenteredPlan']
): Paragraph[] {
  const acceptedRetitlings = plan.assetsToRetitle.filter(a => a.accepted);
  const acceptedBeneficiaryChanges = plan.beneficiaryChanges.filter(a => a.accepted);

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Executive Summary',
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'This analysis compares your current estate plan structure with a trust-centered approach. The goal is to identify opportunities to avoid probate, protect beneficiaries, and ensure your assets pass according to your wishes.',
        }),
      ],
      spacing: { after: 300 },
    }),

    // Key Metrics Table
    new Paragraph({
      children: [
        new TextRun({
          text: 'Key Findings',
          bold: true,
          size: 26,
        }),
      ],
      spacing: { before: 200, after: 200 },
    }),

    createMetricsTable([
      ['Metric', 'Current Plan', 'With Trust', 'Improvement'],
      [
        'Total Estate Value',
        formatCurrency(analysis.totalEstateValue),
        formatCurrency(analysis.totalEstateValue),
        '-',
      ],
      [
        'Probate Estate',
        formatCurrency(analysis.probateEstateSecondDeath),
        formatCurrency(plan.projectedBenefits.probateAvoidance.projectedProbateEstate),
        formatCurrency(plan.projectedBenefits.probateAvoidance.savings) + ' saved',
      ],
      [
        'Assets Requiring Probate',
        String(analysis.stats.assetsRequiringProbate),
        String(Math.max(0, analysis.stats.assetsRequiringProbate - acceptedRetitlings.length)),
        `${acceptedRetitlings.length} assets protected`,
      ],
      [
        'Minor Beneficiaries Unprotected',
        String(analysis.stats.minorBeneficiariesUnprotected),
        String(Math.max(0, analysis.stats.minorBeneficiariesUnprotected - plan.projectedBenefits.minorProtection.minorsProtectedByTrust)),
        `${plan.projectedBenefits.minorProtection.minorsProtectedByTrust} now protected`,
      ],
      [
        'Issues Identified',
        String(analysis.allIssues.length),
        'Addressed',
        `${analysis.allIssues.filter(i => i.severity === 'high').length} high priority`,
      ],
    ]),

    new Paragraph({ text: '', spacing: { after: 400 } }),
  ];
}

/**
 * Create current plan analysis section
 */
function createCurrentPlanSection(analysis: TrustPlanData['currentPlanAnalysis']): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Current Plan Analysis',
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
    }),
  ];

  // Issues Section
  if (analysis.allIssues.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Issues Identified',
            bold: true,
            size: 26,
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );

    // High priority issues
    const highIssues = analysis.allIssues.filter(i => i.severity === 'high');
    if (highIssues.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'High Priority Issues',
              bold: true,
              color: COLORS.error,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      highIssues.forEach(issue => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: '• ', bold: true }),
              new TextRun({ text: issue.title, bold: true }),
              new TextRun({ text: ': ' + issue.description }),
            ],
            indent: { left: 360 },
            spacing: { after: 80 },
          })
        );
      });
    }

    // Medium priority issues
    const mediumIssues = analysis.allIssues.filter(i => i.severity === 'medium');
    if (mediumIssues.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Medium Priority Issues',
              bold: true,
              color: COLORS.warning,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      mediumIssues.forEach(issue => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: '• ', bold: true }),
              new TextRun({ text: issue.title, bold: true }),
              new TextRun({ text: ': ' + issue.description }),
            ],
            indent: { left: 360 },
            spacing: { after: 80 },
          })
        );
      });
    }
  }

  // Asset Analysis Table
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Asset-by-Asset Analysis',
          bold: true,
          size: 26,
        }),
      ],
      spacing: { before: 300, after: 200 },
    })
  );

  const assetTableData = [
    ['Asset', 'Value', 'Current Ownership', 'At 1st Death', 'At 2nd Death'],
    ...analysis.assetAnalyses.map(asset => [
      asset.description.substring(0, 40) + (asset.description.length > 40 ? '...' : ''),
      formatCurrency(asset.value),
      asset.currentOwnershipForm || '-',
      getPassageLabel(asset.passageMethodFirstDeath),
      getPassageLabel(asset.passageMethodSecondDeath),
    ]),
  ];

  paragraphs.push(createMetricsTable(assetTableData));
  paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  return paragraphs;
}

/**
 * Create recommendations section
 */
function createRecommendationsSection(plan: TrustPlanData['trustCenteredPlan']): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Trust-Centered Recommendations',
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
  ];

  // Trust Details
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Proposed Trust Structure',
          bold: true,
          size: 26,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Trust Name: ', bold: true }),
        new TextRun({ text: plan.trustName }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Trust Type: ', bold: true }),
        new TextRun({ text: plan.trustType === 'joint_revocable' ? 'Joint Revocable Living Trust' : 'Individual Revocable Living Trust' }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Grantors: ', bold: true }),
        new TextRun({ text: plan.grantors.join(', ') }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Successor Trustees: ', bold: true }),
        new TextRun({ text: plan.successorTrustees.join(', ') || 'To be designated' }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Distribution Age: ', bold: true }),
        new TextRun({ text: `${plan.distributionPlan.distributionAge} years old` }),
      ],
      spacing: { after: 200 },
    })
  );

  // Assets to Retitle
  const acceptedRetitlings = plan.assetsToRetitle.filter(a => a.accepted);
  if (acceptedRetitlings.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Assets to Retitle to Trust',
            bold: true,
            size: 26,
          }),
        ],
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `The following ${acceptedRetitlings.length} asset(s) should be retitled to the trust to avoid probate:`,
          }),
        ],
        spacing: { after: 150 },
      })
    );

    const retitlingTableData = [
      ['Asset', 'Value', 'Current Title', 'New Title', 'Method'],
      ...acceptedRetitlings.map(r => [
        r.assetDescription.substring(0, 30) + (r.assetDescription.length > 30 ? '...' : ''),
        formatCurrency(r.assetValue),
        r.currentTitle.substring(0, 25) + (r.currentTitle.length > 25 ? '...' : ''),
        r.proposedTitle.substring(0, 25) + (r.proposedTitle.length > 25 ? '...' : ''),
        r.method === 'deed' ? 'New Deed' : 'Account Retitle',
      ]),
    ];

    paragraphs.push(createMetricsTable(retitlingTableData));
  }

  // Beneficiary Changes
  const acceptedChanges = plan.beneficiaryChanges.filter(a => a.accepted);
  if (acceptedChanges.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Beneficiary Designation Changes',
            bold: true,
            size: 26,
          }),
        ],
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `The following ${acceptedChanges.length} beneficiary designation(s) should be updated:`,
          }),
        ],
        spacing: { after: 150 },
      })
    );

    const beneficiaryTableData = [
      ['Asset', 'Value', 'Current Beneficiary', 'Proposed Beneficiary'],
      ...acceptedChanges.map(c => [
        c.assetDescription.substring(0, 30) + (c.assetDescription.length > 30 ? '...' : ''),
        formatCurrency(c.assetValue),
        c.currentBeneficiary || 'None',
        c.proposedBeneficiary,
      ]),
    ];

    paragraphs.push(createMetricsTable(beneficiaryTableData));
  }

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  return paragraphs;
}

/**
 * Create benefits section
 */
function createBenefitsSection(plan: TrustPlanData['trustCenteredPlan']): Paragraph[] {
  const benefits = plan.projectedBenefits;

  return [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Benefits of Trust-Centered Planning',
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),

    // Probate Avoidance
    new Paragraph({
      children: [
        new TextRun({
          text: '1. Probate Avoidance',
          bold: true,
          size: 26,
          color: COLORS.success,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `By implementing this trust-centered plan, you will remove ` }),
        new TextRun({ text: formatCurrency(benefits.probateAvoidance.savings), bold: true }),
        new TextRun({ text: ` from the probate estate. This means these assets will pass to your beneficiaries without court involvement, delays, or public record.` }),
      ],
      spacing: { after: 150 },
    }),

    // Minor Protection
    new Paragraph({
      children: [
        new TextRun({
          text: '2. Minor Beneficiary Protection',
          bold: true,
          size: 26,
          color: COLORS.success,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${benefits.minorProtection.minorsProtectedByTrust} minor beneficiary(ies) will be protected by the trust. ` }),
        new TextRun({ text: `Their inheritance will be managed by a trustee until they reach age ${benefits.minorProtection.protectedUntilAge}, ` }),
        new TextRun({ text: `ensuring the funds are used for their benefit and not squandered.` }),
      ],
      spacing: { after: 150 },
    }),

    // Incapacity Protection
    new Paragraph({
      children: [
        new TextRun({
          text: '3. Incapacity Protection',
          bold: true,
          size: 26,
          color: COLORS.success,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: benefits.incapacityPlanning.benefit }),
        new TextRun({ text: ` This avoids the need for a court-supervised guardianship if you become unable to manage your affairs.` }),
      ],
      spacing: { after: 150 },
    }),

    // Privacy
    new Paragraph({
      children: [
        new TextRun({
          text: '4. Privacy',
          bold: true,
          size: 26,
          color: COLORS.success,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${benefits.privacy.assetsPrivate} of your assets will remain private, as trust documents are not filed with the court. ` }),
        new TextRun({ text: `Only probate proceedings become public record, exposing your assets, debts, and beneficiaries to anyone who wishes to look.` }),
      ],
      spacing: { after: 150 },
    }),

    // Additional Benefits
    new Paragraph({
      children: [
        new TextRun({
          text: '5. Additional Benefits',
          bold: true,
          size: 26,
          color: COLORS.success,
        }),
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun({ text: 'Faster Distribution: ', bold: true }),
        new TextRun({ text: 'Trust assets can be distributed immediately, while probate typically takes 6-18 months.' }),
      ],
      indent: { left: 360 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun({ text: 'Reduced Costs: ', bold: true }),
        new TextRun({ text: 'Probate fees (attorney, executor, court) typically run 3-7% of estate value.' }),
      ],
      indent: { left: 360 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun({ text: 'Avoid Multiple Probates: ', bold: true }),
        new TextRun({ text: 'If you own property in multiple states, a trust avoids separate probate proceedings in each state.' }),
      ],
      indent: { left: 360 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun({ text: 'Contest Protection: ', bold: true }),
        new TextRun({ text: 'Trusts are harder to contest than Wills because the trust has been operating during your lifetime.' }),
      ],
      indent: { left: 360 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun({ text: 'Easy Updates: ', bold: true }),
        new TextRun({ text: 'Trust amendments are simple and private. Will changes require new witnesses and notarization.' }),
      ],
      indent: { left: 360 },
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Create funding checklist section
 */
function createFundingChecklist(plan: TrustPlanData['trustCenteredPlan']): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Trust Funding Checklist',
          bold: true,
          size: 32,
          color: COLORS.primary,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'IMPORTANT: A trust is only effective for assets that are properly transferred to it. Use this checklist to ensure all assets are properly funded.',
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    }),
  ];

  // Group by category
  const acceptedRetitlings = plan.assetsToRetitle.filter(a => a.accepted);
  const acceptedChanges = plan.beneficiaryChanges.filter(a => a.accepted);

  // Real Estate
  const realEstateItems = acceptedRetitlings.filter(r => r.assetId.startsWith('realEstate'));
  if (realEstateItems.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Real Estate - Deeds to Record',
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    realEstateItems.forEach(item => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '☐ ' }),
            new TextRun({ text: item.assetDescription }),
            new TextRun({ text: ` (${formatCurrency(item.assetValue)})`, color: '666666' }),
          ],
          indent: { left: 360 },
          spacing: { after: 60 },
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Action: Contact attorney to prepare and record new deed transferring property to trust.',
            italics: true,
            color: '666666',
          }),
        ],
        indent: { left: 360 },
        spacing: { after: 150 },
      })
    );
  }

  // Bank/Investment Accounts to Retitle
  const accountItems = acceptedRetitlings.filter(r =>
    r.assetId.startsWith('bankAccount') || r.assetId.startsWith('nonQualified')
  );
  if (accountItems.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Bank & Investment Accounts to Retitle',
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    accountItems.forEach(item => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '☐ ' }),
            new TextRun({ text: item.assetDescription }),
            new TextRun({ text: ` (${formatCurrency(item.assetValue)})`, color: '666666' }),
          ],
          indent: { left: 360 },
          spacing: { after: 60 },
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Action: Contact institution to retitle account to trust. Bring Certificate of Trust.',
            italics: true,
            color: '666666',
          }),
        ],
        indent: { left: 360 },
        spacing: { after: 150 },
      })
    );
  }

  // Beneficiary Designation Changes
  if (acceptedChanges.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Beneficiary Designation Changes',
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    acceptedChanges.forEach(item => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '☐ ' }),
            new TextRun({ text: item.assetDescription }),
            new TextRun({ text: ` → ${item.proposedBeneficiary}`, bold: true }),
            new TextRun({ text: ` (${formatCurrency(item.assetValue)})`, color: '666666' }),
          ],
          indent: { left: 360 },
          spacing: { after: 60 },
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Action: Contact plan administrator/insurance company for beneficiary change form.',
            italics: true,
            color: '666666',
          }),
        ],
        indent: { left: 360 },
        spacing: { after: 150 },
      })
    );
  }

  // Personal Property Assignment
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Personal Property Assignment',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '☐ ' }),
        new TextRun({ text: 'Sign Assignment of Personal Property to Trust document' }),
      ],
      indent: { left: 360 },
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Action: This single document transfers ownership of all tangible personal property (furniture, jewelry, artwork, collectibles, etc.) to the trust.',
          italics: true,
          color: '666666',
        }),
      ],
      indent: { left: 360 },
      spacing: { after: 200 },
    })
  );

  // Important Note about Retirement Accounts
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'IMPORTANT NOTE ABOUT RETIREMENT ACCOUNTS',
          bold: true,
          color: COLORS.error,
        }),
      ],
      spacing: { before: 300, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'IRAs, 401(k)s, and other retirement accounts should NOT be retitled to the trust. Only the beneficiary designation should be changed. Retitling a retirement account to a trust would cause immediate taxation of the entire account.',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  return paragraphs;
}

/**
 * Create footer
 */
function createFooter(): Paragraph[] {
  return [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'This analysis is for informational purposes only and does not constitute legal advice. Please consult with your attorney before making any changes to your estate plan.',
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'MyLifeFolio',
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '26811 South Bay Dr. Ste 270',
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Bonita Springs, Florida 34134',
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Tel: (239) 345-4545',
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'www.zbblaw.com',
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

/**
 * Helper: Create a metrics table
 */
function createMetricsTable(data: string[][]): Table {
  const rows = data.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    return new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell,
                  bold: isHeader,
                  size: 20,
                }),
              ],
            }),
          ],
          shading: isHeader
            ? { fill: COLORS.headerBg, type: ShadingType.SOLID }
            : undefined,
        })
      ),
    });
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    },
  });
}

/**
 * Helper: Get passage method label
 */
function getPassageLabel(method: string): string {
  switch (method) {
    case 'probate':
      return 'Probate';
    case 'joint_survivorship':
      return 'To Survivor';
    case 'beneficiary_designation':
      return 'To Beneficiary';
    case 'trust':
      return 'Via Trust';
    case 'deed_remainder':
      return 'To Remainderman';
    case 'operation_of_law':
      return 'By Law';
    default:
      return method;
  }
}
