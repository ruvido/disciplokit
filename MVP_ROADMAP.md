# Disciplo MVP: Hyper-Focused Roadmap 🎯

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

4. **Update core logic for updated member user structure**
   - i updated the collection member structure:
   - telegram_name, telegram_id, telegram_username are removed
   - when signup up hook should create data.telegram.name="" ecc unless they are fed as flag in the url
   - added the groups array which points to groups collection listing the groups the member belongs to (so i added members collection in groups as well to list the members in the group;) -> is this approach best practice? we need to know who belongs to what

4. **Dashboard onboarding flow** - Users go to groups page first
   - if they are not connected to telegram (data.telegram is empty) then just show a big centered telegram login widget
   - if they are connected to telegram -> show the list of groups

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