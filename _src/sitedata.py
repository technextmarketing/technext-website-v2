# Site-wide data for the TechNext Website v2 build.
# Everything client-facing that is a *claim* (numbers, partner tier, legal details)
# comes from the Brand Hub approved-claims table. Don't add figures that aren't there.

SITE_URL = "https://technextmarketing.github.io/technext-website-v2/"
SITE_NAME = "TechNext"
DEFAULT_DESC = ("TechNext is an Odoo Ready Partner in Singapore. We implement Odoo ERP with a focus on "
                "Accounting, Sales and Inventory, plus websites and social media for growing companies.")

COMPANY = {
    "legal": "TechNext Pte. Ltd.",
    "short": "TechNext",
    "uen": "202699888G",
    "address": ["261 Waterloo Street #03-36", "Singapore 180261"],
    "sales_email": "sales@technext.asia",
    "whatsapp": "+65 8839 6998",
    "whatsapp_link": "https://wa.me/6588396998",
    "linkedin": "https://www.linkedin.com/company/technext-asia",
    "hubs": "Singapore HQ · Vietnam · Philippines",
}

# FormSubmit — no account needed. The first real submission triggers a one-time
# activation email to sales@technext.asia; after that every inquiry lands there.
FORM_ENDPOINT = "https://formsubmit.co/ajax/sales@technext.asia"

# ---------------------------------------------------------------- navigation
# `href` values are site-root relative; build.py prefixes {{ROOT}}.
NAV = [
    {
        "label": "Solution", "id": "solution",
        "columns": [
            {"title": "ERP", "links": [
                {"label": "Odoo ERP System", "href": "solutions/odoo-erp.html", "icon": "layers",
                 "desc": "Accounting, Sales and Inventory on one system."},
            ]},
            {"title": "Marketing", "href": "solutions/marketing.html", "links": [
                {"label": "Website", "href": "solutions/website.html", "icon": "globe",
                 "desc": "Fast, clear sites that explain what you do."},
                {"label": "Social Media Management", "href": "solutions/social-media.html", "icon": "megaphone",
                 "desc": "Steady posting with a plan behind it."},
            ]},
        ],
    },
    {
        "label": "Industries", "id": "industries",
        "columns": [
            {"title": "Industries", "wide": True, "links": [
                {"label": "Medical", "href": "industries/medical.html", "icon": "pulse",
                 "desc": "Clinics and healthcare groups."},
                {"label": "Travel", "href": "industries/travel.html", "icon": "plane",
                 "desc": "Agencies, tours and hospitality."},
                {"label": "Retail", "href": "industries/retail.html", "icon": "bag",
                 "desc": "Stores, POS and stock in one place."},
                {"label": "Ecommerce", "href": "industries/ecommerce.html", "icon": "cart",
                 "desc": "Online orders, fulfilment and books."},
            ]},
        ],
    },
    {
        "label": "Odoo", "id": "odoo",
        "columns": [
            {"title": "Walkthrough", "links": [
                {"label": "Odoo Discovery", "href": "odoo/discovery.html", "icon": "search",
                 "desc": "Map your processes to Odoo apps."},
                {"label": "Odoo Training", "href": "odoo/training.html", "icon": "graduation",
                 "desc": "Role-based sessions for your team."},
                {"label": "Odoo Integration", "href": "odoo/integration.html", "icon": "plug",
                 "desc": "Connect banks, payments and tools."},
                {"label": "Odoo Support", "href": "odoo/support.html", "icon": "lifebuoy",
                 "desc": "Ongoing help after go-live."},
            ]},
            {"title": "Odoo Apps", "href": "odoo/apps.html", "links": [
                {"label": "All Odoo apps", "href": "odoo/apps.html", "icon": "grid",
                 "desc": "The full catalogue, by category."},
                {"label": "Accounting", "href": "odoo/apps.html#finance", "icon": "calculator",
                 "desc": "Our first focus area."},
                {"label": "Sales", "href": "odoo/apps.html#sales", "icon": "trend",
                 "desc": "Quotes to orders to invoices."},
                {"label": "Inventory", "href": "odoo/apps.html#supply-chain", "icon": "box",
                 "desc": "Stock, warehouses and deliveries."},
            ]},
            {"title": "Customization", "links": [
                {"label": "ERP System", "href": "odoo/erp-system.html", "icon": "layers",
                 "desc": "Tailored modules and workflows."},
                {"label": "AI Integration", "href": "odoo/ai-integration.html", "icon": "cpu",
                 "desc": "AI assistants inside Odoo."},
                {"label": "CRM Development", "href": "odoo/crm-development.html", "icon": "usercheck",
                 "desc": "Pipelines built around your sales."},
            ]},
        ],
    },
    {"label": "Case Study", "id": "case-study", "href": "case-studies.html"},
    {"label": "Company", "id": "company", "href": "company.html"},
]

# ---------------------------------------------------------------- Odoo apps
# Official Odoo app catalogue, grouped the way odoo.com groups it.
APP_CATEGORIES = [
    {"id": "finance", "title": "Finance", "icon": "calculator", "focus": True,
     "apps": [
         ("Accounting", "Journals, bank sync, tax reports and closing.", True),
         ("Invoicing", "Send invoices and collect payments online.", True),
         ("Expenses", "Capture receipts and approve claims."),
         ("Spreadsheet (BI)", "Live pivots and dashboards on Odoo data."),
         ("Documents", "File storage with workflows and OCR."),
         ("Sign", "Legally binding e-signatures."),
     ]},
    {"id": "sales", "title": "Sales", "icon": "trend", "focus": True,
     "apps": [
         ("CRM", "Leads, pipeline and activities.", True),
         ("Sales", "Quotations, orders and upsells.", True),
         ("Point of Sale — Shop", "Offline-ready retail checkout."),
         ("Point of Sale — Restaurant", "Tables, kitchen printing, bills."),
         ("Subscriptions", "Recurring billing and renewals."),
         ("Rental", "Book, pick up and return assets."),
     ]},
    {"id": "websites", "title": "Websites", "icon": "globe",
     "apps": [
         ("Website Builder", "Drag-and-drop pages with SEO tools."),
         ("eCommerce", "Online store tied to stock and accounting."),
         ("Blog", "Articles with scheduling and SEO."),
         ("Forum", "Community Q&A."),
         ("Live Chat", "Chat with visitors from Discuss."),
         ("eLearning", "Courses, quizzes and certifications."),
     ]},
    {"id": "supply-chain", "title": "Supply Chain", "icon": "box", "focus": True,
     "apps": [
         ("Inventory", "Multi-warehouse stock, barcodes, replenishment.", True),
         ("Manufacturing", "Bills of materials and work orders."),
         ("PLM", "Engineering changes and versions."),
         ("Purchase", "RFQs, vendor pricelists, receipts.", True),
         ("Maintenance", "Preventive and corrective requests."),
         ("Quality", "Control points and quality alerts."),
     ]},
    {"id": "hr", "title": "Human Resources", "icon": "briefcase",
     "apps": [
         ("Employees", "Directory, contracts and org chart."),
         ("Recruitment", "Job posts, applicants and interviews."),
         ("Time Off", "Leave requests and allocations."),
         ("Appraisals", "Reviews and goals."),
         ("Referrals", "Employee referral programme."),
         ("Fleet", "Vehicles, contracts and costs."),
         ("Payroll", "Salary rules and payslips."),
     ]},
    {"id": "marketing", "title": "Marketing", "icon": "megaphone",
     "apps": [
         ("Social Marketing", "Schedule and track posts."),
         ("Email Marketing", "Campaigns, lists and A/B tests."),
         ("SMS Marketing", "Text campaigns with tracking."),
         ("Events", "Registrations, tickets and badges."),
         ("Marketing Automation", "Multi-step flows on triggers."),
         ("Surveys", "Forms, quizzes and feedback."),
     ]},
    {"id": "services", "title": "Services", "icon": "wrench",
     "apps": [
         ("Project", "Tasks, stages and milestones."),
         ("Timesheets", "Time tracking billed to projects."),
         ("Field Service", "On-site jobs with worksheets."),
         ("Helpdesk", "Tickets, SLAs and knowledge base."),
         ("Planning", "Shift and resource scheduling."),
         ("Appointments", "Online booking calendars."),
     ]},
    {"id": "productivity", "title": "Productivity", "icon": "zap",
     "apps": [
         ("Discuss", "Chat, channels and notifications."),
         ("Approvals", "Request and approve anything."),
         ("IoT", "Connect scales, printers and devices."),
         ("VoIP", "Calls from inside Odoo."),
         ("Knowledge", "Wiki pages linked to records."),
         ("WhatsApp", "Templates and conversations."),
     ]},
]

# ---------------------------------------------------------------- icons
# 24px stroke icons (Lucide-style). Used via {{icon:name}} in partials.
_S = ('<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>')
ICONS = {
    "layers": _S % '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    "globe": _S % '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "megaphone": _S % '<path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    "pulse": _S % '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    "plane": _S % '<path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/>',
    "bag": _S % '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    "cart": _S % '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    "search": _S % '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
    "graduation": _S % '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    "plug": _S % '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6v4a6 6 0 0 0 12 0V8z"/>',
    "lifebuoy": _S % '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m4.93 19.07 4.24-4.24"/>',
    "grid": _S % '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    "calculator": _S % '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
    "trend": _S % '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    "box": _S % '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    "cpu": _S % '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    "usercheck": _S % '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    "users": _S % '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "check": _S % '<path d="M20 6 9 17l-5-5"/>',
    "arrow": _S % '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "mail": _S % '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    "chat": _S % '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    "pin": _S % '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    "shield": _S % '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    "file": _S % '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "receipt": _S % '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    "truck": _S % '<rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    "factory": _S % '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/>',
    "briefcase": _S % '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    "calendar": _S % '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "wrench": _S % '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    "zap": _S % '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    "bars": _S % '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
    "clock": _S % '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "x": _S % '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "menu": _S % '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    "chevron": _S % '<path d="m6 9 6 6 6-6"/>',
    "bank": _S % '<path d="M3 10h18"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9"/><path d="M2 21h20"/><path d="m12 3 10 6H2z"/>',
    "refresh": _S % '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
    "target": _S % '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "database": _S % '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
    "sparkle": _S % '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    "quote": _S % '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M9 11h2"/>',
    "camera": _S % '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    "layout": _S % '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    "lock": _S % '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "star": _S % '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    "smile": _S % '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    "code": _S % '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    "send": _S % '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
}
