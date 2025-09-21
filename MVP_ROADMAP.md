# Disciplo MVP: Hyper-Focused Roadmap 🎯

## 📊 **Implementation Status** (Current State)

### ✅ **COMPLETED FEATURES**
- **Member Structure Updated** - New `telegram` JSON field, `admin` boolean, `banned` boolean
- **Groups System** - Groups collection with moderator assignments
- **Group Membership** - `group_members` collection for member-group relations
- **Telegram Integration** - Bot flow, login widget, hooks for telegram linking
- **Basic Dashboard** - Groups page with join/leave functionality
- **Admin Detection** - Admin boolean in members, admin menu items

### 🔄 **IN PROGRESS**
- **Signup Flow** - Basic implementation exists, needs approval system integration

### ❌ **CRITICAL MISSING** (MVP Blockers)
- **Admin Approval Flow** - No signup request/admin approval system
- **Email Verification** - Profile mentions verification but no flow implemented
- **Password Reset Flow** - Only basic "forgot password" link exists, no implementation
- **Profile Editing** - Profile page exists but no edit functionality
- **Member Search (Admin)** - No admin dashboard for member management

---

## 🔥 **Priority Implementation Plan**

### **PHASE 1: Admin Approval Flow** (IMMEDIATE PRIORITY)

#### **Database: New Collection - signup_requests**
```javascript
signup_requests: {
  // Initial signup info (minimal barrier)
  name: text,                    // Full name
  email: email,                  // REQUIRED for communication
  date_of_birth: date,           // Age verification
  location: select([             // Italian regions + international
    "Lombardia", "Lazio", "Campania", "Veneto", "Emilia-Romagna",
    "Piemonte", "Sicilia", "Toscana", "Puglia", "Calabria",
    "Sardegna", "Liguria", "Marche", "Abruzzo", "Friuli-Venezia Giulia",
    "Trentino-Alto Adige", "Umbria", "Basilicata", "Molise",
    "Valle d'Aosta", "Estero"
  ]),
  location_details: text,        // Only visible if location = "Estero"
  relationship_status: select(["Celibe", "Sposato", "Fidanzato"]),
  motivation: textarea,          // "Perché vuoi entrare nei gruppi"

  // Admin workflow
  assigned_group: relation(groups),  // Admin assigns to local group
  status: select(["pending", "assigned", "reviewed", "accepted"]),
  created: date,
  updated: date
}
```

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

### **Immediate (Start Now)**
1. Create `signup_requests` PocketBase collection
2. Build simplified signup form
3. Create admin dashboard for request management
4. Implement notification hooks

### **This Week**
- Complete admin approval flow
- Test end-to-end workflow
- Build moderator approval interface

### **Next Week**
- Email verification system
- Account completion flow
- Testing and polish

**Focus**: One phase at a time, ship working features incrementally.