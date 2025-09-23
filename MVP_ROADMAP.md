# Disciplo MVP: Hyper-Focused Roadmap 🎯

## 📊 **Implementation Status** (Current State)

### ✅ **COMPLETED FEATURES**
- **Member Structure Updated** - New `telegram` JSON field, `admin` boolean, `banned` boolean
- **Groups System** - Groups collection with moderator assignments
- **Group Membership** - `group_members` collection for member-group relations
- **Telegram Integration** - Bot flow, login widget, hooks for telegram linking
- **Basic Dashboard** - Groups page with join/leave functionality
- **Admin Detection** - Admin boolean in members, admin menu items
- **Signup Requests Collection** - Complete database schema with proper field types
- **Config-driven Signup System** - Dynamic signup forms based on database configurations
- **Form Validation & UX** - Complete validation, Italian error messages, accessibility features
- **Email Uniqueness Constraints** - Unique indexes on email for signup_requests and members
- **UTF-8 Support in PocketBase** - Proper handling of accented characters in hooks
- **Options Reference System** - Dynamic dropdown menus loaded from database (regions, hobbies, etc.)
- **Signup-Direct Strategy** - Bot-initiated signup with telegram prefill and direct member creation

### 🔄 **IN PROGRESS**
- **Admin Approval Workflow** - Signup form completed, needs admin/moderator approval system integration

### ❌ **CRITICAL MISSING** (MVP Blockers)
- **Admin Approval Flow** - No signup request/admin approval system
- **Email Verification** - Profile mentions verification but no flow implemented
- **Password Reset Flow** - Only basic "forgot password" link exists, no implementation
- **Profile Editing** - Profile page exists but no edit functionality
- **Member Search (Admin)** - No admin dashboard for member management

---

## 🚀 **SIGNUP-DIRECT STRATEGY** (COMPLETED)

### **✅ Architecture & Implementation**
- **Token-based Signup Flow** - Secure signup links with Telegram user prefill
- **Database Migration** - `telegram_invite_tokens` collection for token management
- **Bot Integration** - Automatic token generation when users join Telegram groups
- **SvelteKit Integration** - URL parameter parsing and form prefilling
- **Security Implementation** - SHA-256 token hashing and 24-hour expiration
- **Collection Targeting** - Direct member creation (bypasses approval workflow)
- **Cleanup System** - Automatic removal of expired tokens via PocketBase hooks

### **✅ Completed Components**
1. **Bot Token Generation** - `config.js:generateSignupToken()` with crypto security
2. **Chat Member Handling** - Automatic token creation for new group members
3. **Server-side Validation** - Token verification and user data extraction
4. **Frontend Prefill** - Name field automatically populated from Telegram data
5. **Member Creation** - Direct insertion into `members` collection with telegram data
6. **Token Management** - Status tracking (pending → used) and cleanup automation

### **🔗 Flow Summary**
1. User joins Telegram group → Bot detects new member
2. Bot generates secure token → Sends signup link via private message
3. User clicks link → SvelteKit loads form with prefilled Telegram data
4. User completes form → Member created directly + token marked as used
5. System cleanup → Expired tokens automatically removed

---

## 🔥 **Priority Implementation Plan**

### **PHASE 1: Admin Approval Flow** (IMMEDIATE PRIORITY)

#### **Database: ✅ Collection - signup_requests** (COMPLETED & FUNCTIONAL)
```javascript
signup_requests: {
  // Initial signup info (minimal barrier)
  name: text,                    // Full name
  email: email (UNIQUE),         // REQUIRED for communication, unique constraint
  birth_year: number,            // Age verification (1930-2007 range)
  location: select([             // Italian regions + international (loaded from signup-options)
    "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
    "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
    "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto", "Estero"
  ]),
  location_details: text,        // Only visible if location = "Estero"
  relationship_status: select(["Celibe", "Sposato", "Fidanzato"]),
  motivation: textarea,          // "Perché vuoi entrare nei gruppi" (500 char limit)

  // Admin workflow
  assigned_group: relation(groups),  // Admin assigns to local group
  status: select(["pending", "assigned", "reviewed", "accepted"]),
  // Auto-generated: created, updated
}
```
**✅ IMPLEMENTED**: PocketBase collection created with all field types, validation rules, access permissions, and unique email constraint. Frontend form fully functional with Italian error messages and accessibility features.

#### **Status Flow & Workflow**
1. **User submits signup** → `status: "pending"` + notify admin
2. **Admin assigns to group** → `status: "assigned"` + notify group moderator
3. **Moderator approves** → `status: "reviewed"` + notify admin
4. **Admin final approval** → `status: "accepted"` + send completion link + create member

#### **Notification System**
1. **New signup request** → Email admin with user details
2. **Admin assigns to group** → Email/Telegram group moderator
3. **Moderator approves** → Email admin "member ready for approval"
4. **Admin final approval** → Email user with account completion link

#### **UI Components Required**
- **Simplified Signup Form** - Only essential info, low barrier
- **Admin Dashboard** - Pending requests + group assignment dropdown
- **Moderator Dashboard** - Assigned requests + approval button
- **Account Completion Flow** - Password + telegram + other existing fields

#### **Post-Approval Account Completion**
After admin final approval → User receives email with secure completion link:
- **Set Password** (required for login)
- **Connect Telegram** (existing widget/bot flow)
- **Additional Profile Info** (any other current signup requirements)
- **Create Member Record** + delete signup_request

---

### **PHASE 2: Email Verification** (NEXT PRIORITY)

#### **Email Verification Flow**
- Email verification tokens and validation
- Resend verification email functionality
- Block unverified users from accessing platform
- Integration with existing member creation

---

### **PHASE 3: Core User Features** (LOWER PRIORITY)

#### **Password Reset Flow**
- Email-based password reset workflow
- Secure token generation and validation
- User-friendly reset form

#### **Profile Editing**
- Edit name, email, basic info
- Change password functionality
- Update telegram connection

#### **Member Search (Admin)**
- Search members by email/name
- Filter by role (admin/moderator/member)
- Quick actions on search results

---

## 🎯 **PHASE 4: Infrastructure & Performance** (PRODUCTION READY)

### **Security & Reliability**
- **API Rate Limiting** - Prevent abuse attacks
- **Database Backup Strategy** - Automated daily backups
- **Error Tracking** - Centralized error logging and alerting
- **Database Indexing** - Optimize member/group lookups

### **Performance**
- **Basic Caching** - Cache expensive PocketBase queries
- **Member Growth Analytics** - Track signup trends and statistics

---

## 🎯 **Success Criteria**

### **Phase 1 Complete** (Admin Approval MVP)
✅ Platform can handle secure member approval workflow
✅ Admins can assign new members to local groups
✅ Moderators can approve/reject assigned members
✅ Automated notification system works end-to-end
✅ Account completion flow creates full member accounts

### **Phase 2 Complete** (Email Verification)
✅ All members have verified email addresses
✅ Unverified users blocked from platform access

### **Full MVP Complete**
✅ Platform ready for 100+ member community
✅ Secure authentication with password reset
✅ Complete admin tools for member management
✅ Production-grade security and monitoring

---

## 📋 **Next Actions**

### **✅ COMPLETED**
1. ~~Create `signup_requests` PocketBase collection~~ - **DONE**
2. ~~Build simplified signup form~~ - **DONE** - `/signup` page with full validation
3. ~~Implement config-driven form system~~ - **DONE** - Dynamic forms from database
4. ~~Add email uniqueness constraints~~ - **DONE** - Prevents duplicate signups
5. ~~Italian error messages and UX~~ - **DONE** - Complete user experience

### **Immediate (Start Now)**
6. **Create admin dashboard for request management** - List pending requests with assign action
7. **Update existing signup to redirect** - Point current signup to new approval flow (if needed)

### **This Week**
- **Build moderator approval interface** - Dashboard for moderators to approve assigned requests
- **Implement notification hooks** - Email/Telegram notifications for workflow steps
- **Test end-to-end workflow** - Complete signup → admin assign → moderator approve → member creation

### **Next Week**
- **Account completion flow** - Post-approval password setup + telegram connection
- **Email verification system** - Verify emails during account completion
- **Polish and testing** - UI improvements and workflow testing

**Current Focus**: Frontend signup form using new `signup_requests` collection.