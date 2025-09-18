# Disciplo MVP: Hyper-Focused Roadmap 🎯

## 🏗️ **Priority #1: Database Schema Redesign** (MUST DO FIRST)

### **New Clean Schema Design**

#### **Platform Level (members collection)**
```javascript
members: {
  id,
  email,
  name,
  admin: false,        // Platform admin privileges
  banned: false,       // Platform-wide ban (admin only)
  telegram: {          // Telegram integration data
    id: "",
    username: "",
    name: ""
  },
  data: {              // Custom signup form data
    // Any custom fields from signup forms
  },
  created (auto),      // PocketBase auto timestamp
  updated (auto)       // PocketBase auto timestamp
}
```

#### **Group Level (group_members junction collection)**
```javascript
group_members: {
  id,
  member_id (relation to members),
  group_id (relation to groups),
  moderator: false,    // Group moderator privileges
  status: "pending|active|left",  // Group participation flow
  invited_by (relation to members, optional),
  created (auto),      // When they joined/requested
  updated (auto)       // Last status change
}
```

### **Key Changes from Current Implementation**
1. **Replace bidirectional arrays** with proper junction table
2. **Move telegram data** from separate fields to `telegram` object
3. **Platform-wide ban** in members (not group-specific)
4. **Clean status flow** for group membership
5. **Separate concerns**: Platform admin vs Group moderator

### **Migration Tasks**
- [ ] Create new `group_members` collection
- [ ] Migrate existing member-group relationships
- [ ] Update all PocketBase hooks to use new schema
- [ ] Update frontend queries and components
- [ ] Update bot logic for group member management
- [ ] Remove old bidirectional array fields

---

## 🔥 **Critical MVP Features** (Absolutely Essential)

### **Core User Experience**
1. **Password Reset Flow** - Mandatory for any real platform
   - Email-based password reset workflow
   - Secure token generation and validation
   - User-friendly reset form

2. **Email Verification** - Security essential
   - Email verification on signup
   - Resend verification email functionality
   - Block unverified users from accessing platform

3. **Profile Editing** - Users must edit basic info
   - Edit name, email, telegram username
   - Update profile photo/avatar
   - Change password functionality

### **Admin-Controlled Onboarding**
4. **User Signup Request Flow** - User requests signup → Admin email notification → Admin approval button → User welcome email
   - User submits signup request form
   - Admin receives email notification with user details
   - One-click approval/rejection buttons in email
   - Automatic welcome email to approved users
   - Admin dashboard to manage pending requests

5. **Basic Member Search** - Find members by email/name (admin only)
   - Search members by email or name
   - Filter by role (admin/moderator/member)
   - Quick actions on search results

## 🎯 **Architecture Must-Haves** (Don't Ship Without These)

### **Security & Reliability**
6. **API Rate Limiting** - Prevent abuse attacks
   - Implement rate limiting middleware
   - Different limits for auth vs data endpoints
   - IP-based limiting with proper headers

7. **Database Backup Strategy** - Don't lose data
   - Automated daily backups
   - Backup verification process
   - Easy restore procedure

8. **Error Tracking** - Know when things break
   - Centralized error logging
   - Error alerting for critical issues
   - User-friendly error pages

### **Performance**
9. **Basic Caching** - Cache expensive PocketBase queries
   - Cache member lists and group data
   - Implement cache invalidation strategy
   - Redis or in-memory caching

10. **Database Indexing** - Speed up member/group lookups
    - Index on email, telegram_id, telegram_username
    - Index on member role and status
    - Index on group names and IDs

## 📊 **Essential Metrics** (Minimum Viable Analytics)

11. **Member Growth Dashboard** - Track signups over time
    - Weekly/monthly signup trends
    - Member status breakdown (pending/active/inactive)
    - Group membership statistics

---

## **Implementation Priority**

### **Phase 1: Security & Stability**
- Items 6, 7, 8, 10 (Rate limiting, backups, error tracking, indexing)

### **Phase 2: Core User Features**
- Items 1, 2, 3 (Password reset, email verification, profile editing)

### **Phase 3: Admin Experience**
- Items 4, 5, 11 (Signup flow, member search, analytics)

### **Phase 4: Performance**
- Item 9 (Caching)

---

**Hyper-Focused MVP**: 11 features total. Each one solves a critical pain point that blocks real production usage. Perfect for exclusive communities where admins want to vet every member.

**Success Criteria**: Platform can handle 100+ members with admin approval workflow, secure authentication, and basic analytics.