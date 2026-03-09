# Membership Project - Extended Task Plan

Based on the full requirements (including CRM, Finance, Volunteering, and Voting features), here is a comprehensive breakdown of the remaining work. You can assign these "Areas" to different specialized agents.

## ✅ Completed (Baseline)
- Initial Next.js project setup and routing.
- Supabase database schema (`profiles`, `memberships`, `payments`) and Row-Level Security.
- User signup, login, and basic dashboard.
- Multi-step application form with age validation and photo upload.
- Admin dashboard layout, basic member list view, and committee approval workflow.

---

## 💳 Area 1: Payment & Finance Linkage (Assign to Agent 1)
*Focus: Tracking money, resolving bank transfers via text-parsing, and pushing recurring subscriptions.*
- [ ] **Dynamic Fee Constant:** Ensure the £10 minimum membership fee is an editable administrator constant in the system so it can be changed over time.
- [ ] **Payment Source Truth System:** Build a unified module to log exactly how a user paid (SumUp, BACS online, Wire, or Cash/Cheque with collector's name).
- [ ] **SumUp & Recurring Prioritization:** Provide a clear UI heavily encouraging SumUp Online *Recurring* subscriptions (e.g., auto-charging on Jan 1st every year). Clearly mark these users in the system as "Ongoing" versus standard "One-off" payments.
- [ ] **Intelligent Bank Transfer Reconciliation:** Build a dashboard for the Finance Team that allows them to copy/paste a raw block of text (from a bank statement). The system should automatically parse the names/amounts and intelligently suggest which pending members the payments belong to, rather than forcing fully manual matching.
- [ ] **Payment Status Dashboard:** Provide a clear view of who has paid, who is pending, and who has an unknown standing order origin.

## 📋 Area 2: Advanced Admin CRM & Voting (Assign to Agent 2)
*Focus: Advanced member management, annual audits, direct device communication, and elections.*
- [ ] **Advanced Member Management (Complaints & Notes):** Expand the Admin view to include a "Complaints & Incidents" log and a "Notes & Volunteering" record for each person.
- [ ] **Direct Device Communication Links:** Build "Quick Contact" links on each member's profile that trigger an email, SMS, or WhatsApp message directly from the administrator's physical device (using native `mailto:`, `sms:`, and `wa.me` URL links).
- [ ] **Annual Details Audit (Auto-Updating):** Create an automated annual communication flow that asks members to confirm or update their Mobile/Email/Address. Allow them to securely update their own record via an embedded system link or basic reply parser.
- [ ] **Democratic Voting System (Bi-annual):** Create an election/voting portal in the Admin dashboard. Assign strictly one vote to every paid-up member for that specific election year. Provide a UI to record postal votes and allow live electronic voting through the member portal, culminating in an automated vote count.
- [ ] **CRM Chat & Ticketing UI:** Create a dedicated pane for admins to record historical chronological communications (chasing missing info, unpaid fees).
- [ ] **Excel Export:** Implement a "Download to Excel / CSV" feature for the whole member list.
- [ ] **Mass Communication:** Build a tool to mass-email or mass-text filtered segments (e.g., "Unpaid Members").

## 📰 Area 3: Member Portal & Noticeboard (Assign to Agent 3)
*Focus: The logged-in experience for approved members.*
- [ ] **Volunteer & Donation Preferences (Sign-up Flow):** Add a required section during application/renewal where members opt-in to volunteering and donating (Financial donors, Produce/food donors, Volunteer general time, Youth club, Cleaners, Administrators, Parking attendants, Delivery/Ordering).
- [ ] **Message Notice Board:** Build a central feed/dashboard for members to securely view society-wide updates, newsletters, and financial details when logged in.
- [ ] **Notification Center:** Display individual messages sent by the Admin in the user's portal.
- [ ] **WhatsApp Community Link:** Provide the secure WhatsApp invite link post-approval.
- [ ] **OCR/AI Integration (Admin tool):** Auto-fill the manual entry form from scanned PDF/Image forms using vision APIs, then send the user a link to claim their logged-in account.
