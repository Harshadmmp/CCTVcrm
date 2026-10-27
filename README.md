# SecureVision — CCTV Installation and Service Management System

A complete, professional, responsive React admin web application built for CCTV security solution providers, system integrators, and installation businesses in India.

## Key Features

### 1. Five Main Navigation Modules
1. **Dashboard (`/`)**: Executive operations overview with 6 summary metric cards, quarterly installation trend charts, workflow stage distribution, upcoming site visits calendar, and quick-add enquiry modal.
2. **Enquiries & Workflow Workbench (`/workflow`)**: Centralized command center managing the end-to-end business lifecycle with live count tabs (`All`, `Pending`, `Quotation Sent`, `Confirmed`, `Ongoing`, `Completed`), contextual action triggers, and global search.
3. **Products & Services (`/products`)**: Comprehensive catalog of CCTV hardware (Dome, Bullet, NVRs, Storage, PoE Switches, SMPS) and labor/installation charges with active status controls.
4. **Technicians (`/technicians`)**: Field technician directory tracking specializations (CCTV Installation, DVR/NVR Setup, Networking, Maintenance), contact numbers, and live active job allocations.
5. **Reports (`/reports`)**: Business analytics, order-to-invoice revenue tracking (avoiding double-counting), technician performance matrix, printable reports, and client-side CSV exports.

### 2. Centered Modal Dialogs (No Full-Page Jumps)
All routine operations open centered modals with dark backdrop blur:
- **Add Enquiry Modal**: Customer name, Indian phone number validation, address, requirements, camera count, and source.
- **Schedule Site Visit Modal**: Prefills enquiry details, sets inspection date/time, technician assignment, and visit outcome.
- **Create / Edit Quotation Modal**: Multi-line item selector, live quantity & line total calculation, subtotal, discount, and GST-inclusive grand total in INR.
- **Quotation Preview & Customer Decision**: Print/Save PDF, WhatsApp dispatch preview, and explicit customer approval recording.
- **Create Order Modal**: Copies approved quotation data without duplicate manual re-entry and prevents duplicate order creation.
- **Assign Technician Modal**: Allocates active staff with auto-filled contact information.
- **Update Work Status Modal**: Enforces start dates for 'In Progress', completion dates and mandatory checklist sign-offs for 'Completed'.
- **Follow-up Modal**: Phone, WhatsApp, and in-person communication log with next action dates.
- **Create & Review Invoice**: Strict two-step billing (office review explicitly required before sending invoice).
- **Comprehensive Dossier Modal**: Multi-tab drilldown with audit trails, milestone timeline, and contextual actions.

### 3. Business Rules Enforced
1. **New enquiries start as Pending.**
2. **Site visit completion prerequisite**: Quotation creation and sending is locked until a required site visit is explicitly marked as `Completed`.
3. **Explicit customer approval**: WhatsApp messages or previews never count as approval. Order creation is unlocked only after explicit approval is recorded.
4. **Duplicate order prevention**: Only one order can ever be created from an approved quotation.
5. **Technician assignment**: Sourced from the live active technician team.
6. **Work status date & checklist rules**: `In Progress` requires a start date; `Completed` requires a completion date and all 5 installation checklist items checked.
7. **Invoicing from completed orders**: Invoices can only be drafted for completed installations.
8. **Office review enforcement**: Invoices must be marked as `Reviewed` by office staff before `Send Invoice` is enabled.
9. **Inclusive GST**: Applicable taxes are included in Grand Total without exposing separate tax rate selectors or unconfigured taxes.
10. **INR Currency Formatting**: Consistent Indian formatting (`₹1,25,000`).

---

## Quick Start Instructions

### Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run preview
```

### Resetting Demo Data
At any time, click the **Reset Demo Data** button in the top navigation bar to restore the sample database back to the realistic default state.

