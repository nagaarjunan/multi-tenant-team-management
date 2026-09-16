# Multi-Tenant SaaS — Frontend Architecture & UX Specification

**Version:** V1  
**Status:** Implementation baseline  
**Product:** Global multi-tenant SaaS product management / daily execution platform

## 1. Purpose

Define the frontend behavior for a global SaaS product-management and team-execution platform.

The product must support organizations in India, UK, Japan, US, and other markets while keeping the user experience simple.

**Core principle:** Simple UI, sophisticated authorization underneath.

Users should understand:
- Which organization they are using
- Their organization role
- Which teams/products/projects they can access
- What work they need to do
- What they can manage

Users should not need to understand permission keys, tenant IDs, scopes, or policy engines.

---

## 2. Multi-Tenant Product Model

```text
YOUR SaaS PLATFORM
│
├── Platform Administration
│   └── SUPER_ADMIN
│
└── Customer Organizations
    ├── Organization A — India
    ├── Organization B — UK
    └── Organization C — Japan
```

Each organization is an isolated tenant with its own users, teams, products, projects, tasks, daily updates, blockers, reports, settings, and subscription.

---

## 3. Role Model

### Platform role

`SUPER_ADMIN`

Internal SaaS/platform role. It is not a customer organization role and must never appear in the customer role selector.

### Organization roles

Only three built-in customer roles:

```text
OWNER
ADMIN
MEMBER
```

Do not create global roles for:
`TEAM_LEAD`, `PRODUCT_OWNER`, `PROJECT_OWNER`, `PROJECT_MANAGER`, `PRODUCT_MANAGER`, `DEVELOPER`, `DESIGNER`, `QA`, `ENGINEERING_MANAGER`.

These are responsibilities, memberships, or job titles.

---

## 4. Organization Roles

### OWNER

Highest authority inside a customer organization.

Frontend can expose:
- Organization settings
- Members and invitations
- Role management
- Teams
- Products
- Projects
- Operational reports
- Billing
- Subscription
- Ownership transfer
- Organization deletion

### ADMIN

Operational organization administrator.

Frontend can expose:
- Members/invitations
- Teams
- Products
- Projects
- Tasks
- Daily execution
- Blockers
- Reports
- Operational settings

Admin must not receive UI controls for:
- Creating/promoting Admins
- Ownership transfer
- Billing/subscription management
- Organization deletion

### MEMBER

Normal organization user.

Frontend exposes work relevant to the member's access:
- My Work
- Assigned teams
- Assigned products/projects
- Tasks
- Daily updates
- Blockers
- Comments
- Attachments
- Permitted reports

**UI hiding is not security. The backend remains the final authorization authority.**

---

## 5. Team Model

A Team is a resource, not a role.

```text
Organization
├── Backend Team
├── Frontend Team
├── QA Team
└── Design Team
```

A user can belong to multiple teams.

```text
Priya
├── Backend Team
└── QA Team
```

### Team Lead

Team Lead is a team-level responsibility, not an organization role.

```text
Priya
Organization Role = MEMBER

Backend Team
Lead = Priya
```

Recommended representation:

```text
Team
├── Members
└── Team Lead: Priya
```

Do not display `TEAM_LEAD` as a global role.

---

## 6. Product and Project Model

Products and projects use membership/access rather than global roles.

```text
Organization
├── Teams
│
└── Products
    └── E-Commerce Platform
        ├── Authentication Project
        ├── Payment Project
        └── Dashboard Project
```

Do not create Product Owner or Project Owner roles.

---

## 7. Frontend Information Architecture

```text
APP
├── Dashboard
├── My Work
│   ├── My Tasks
│   ├── My Daily Updates
│   └── My Blockers
├── Teams
├── Products
├── Projects
├── Tasks
├── Daily Execution
├── Blockers
├── Reports
├── Notifications
└── Organization Settings
    ├── General
    ├── Members
    ├── Invitations
    ├── Roles / Access
    ├── Security
    ├── Billing
    └── Danger Zone
```

Navigation should be permission-aware.

---

## 8. Global Application Shell

```text
┌─────────────────────────────────────────────────────┐
│ Logo │ Organization Switcher │ Search │ Bell │ User │
├──────────────┬──────────────────────────────────────┤
│ Sidebar      │ Main Content                         │
│              │                                      │
│ Dashboard    │                                      │
│ My Work      │                                      │
│ Teams        │                                      │
│ Products     │                                      │
│ Projects     │                                      │
│ Tasks        │                                      │
│ Updates      │                                      │
│ Blockers     │                                      │
│ Reports      │                                      │
│ Settings     │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

## 9. Organization Switcher

Users can belong to multiple organizations.

```text
Organization Switcher
├── Acme India
├── Acme UK
└── Startup Japan
```

Flow:

```text
Select Organization
→ Set active organization context
→ Clear organization-scoped cached state
→ Load permissions
→ Load navigation
→ Load organization data
```

Tenant-specific cache keys must include the organization ID.

Example:

```text
["organizations", organizationId, "teams"]
["organizations", organizationId, "projects"]
["organizations", organizationId, "tasks"]
```

---

## 10. Authentication Flow

```text
Landing
→ Sign Up / Sign In
→ Authenticate
→ Check organization memberships
→ No organization?
      → Create Organization / Join Invitation
→ One organization?
      → Enter organization
→ Multiple organizations?
      → Organization selector
→ Dashboard
```

---

## 11. Organization Creation Flow

```text
Sign Up
→ Create Organization
→ Organization Details
→ Select Plan
→ Payment / Trial
→ Organization Created
→ Creator becomes OWNER
→ Onboarding
```

Onboarding can guide the Owner through:

```text
Organization
→ Invite Members
→ Create Teams
→ Create Product
→ Create Project
→ Create Tasks
→ Start Daily Execution
```

---

## 12. Subscription Flow

```text
Plan Selection
→ Checkout
→ Payment / Trial
→ Organization Creation
→ Owner Dashboard
```

Distinguish two denial types:

**Permission denial**
> You don't have permission to export reports.

**Plan denial**
> Report export is available on the Professional plan. Upgrade to continue.

---

## 13. Member Management

Owner/Admin:

```text
Organization Settings
→ Members
```

Example:

```text
Members
------------------------------------------------
Name       Email              Role       Status
------------------------------------------------
Tanaka     ...                Owner      Active
Yuki       ...                Admin      Active
Priya      ...                Member     Active
Ken        ...                Member     Active
```

Actions depend on effective permissions.

---

## 14. Invitation Flow

```text
Members
→ Invite Member
→ Email
→ Select Role
   ├── Admin (Owner only)
   └── Member
→ Send
→ PENDING
```

Invitation states:

```text
PENDING
ACCEPTED
REVOKED
EXPIRED
```

Owner transfer is separate; Owner is not a normal invitation role.

---

## 15. Accept Invitation Flow

```text
Invitation Link
→ Validate invitation
→ Existing user? Sign In
→ New user? Sign Up
→ Show organization
→ Accept
→ Membership ACTIVE
→ Organization dashboard
```

---

## 16. Role Change Flow

Owner:

```text
Members
→ Select existing member
→ Change Role
→ Admin / Member
→ Confirm
→ Save
→ Audit log
```

Admin must not be able to self-elevate or create another Admin unless a future policy explicitly grants it.

---

## 17. Team Creation Flow

Owner/Admin:

```text
Teams
→ Create Team
→ Team Name
→ Add Members
→ Optional Team Lead
→ Create
```

Team page:

```text
Backend Team
-------------------------
Team Lead: Priya

Members
- Priya
- Arun
- John
- David
```

Only organization members can be added.

---

## 18. Team Lead Flow

```text
Team Settings
→ Team Lead
→ Select existing team member
→ Confirm
→ Save
→ Audit log
```

If the selected person is not a team member, the frontend must prevent selection and the backend must reject the operation.

If a Team Lead is removed from the team, the UI should require clearing or reassigning the responsibility.

---

## 19. Product Flow

```text
Products
→ Create Product
→ Name
→ Description
→ Add Members / Access
→ Create
```

Product page:

```text
E-Commerce Platform
├── Overview
├── Projects
├── Members
├── Tasks
├── Activity
└── Reports
```

No Product Owner role selector.

---

## 20. Project Flow

```text
Product
→ Projects
→ Create Project
→ Name
→ Description
→ Dates / Status
→ Members
→ Create
```

Project page:

```text
Payment Integration
├── Overview
├── Board
├── Tasks
├── Members
├── Activity
├── Blockers
└── Reports
```

No Project Owner role selector.

---

## 21. Task UI

Task fields:

```text
Title
Description
Status
Priority
Assignee
Due Date
Project
Team
Labels
Comments
Attachments
```

Possible statuses:

```text
TODO
IN_PROGRESS
BLOCKED
DONE
```

Actions such as Edit, Assign, Change Status, and Delete must be permission-aware.

---

## 22. Daily Execution

Core workflow:

```text
Tasks
→ Yesterday
→ Today
→ Blockers
→ Progress
→ Team Summary
```

Daily update UI:

```text
Today's Update

Yesterday
[ What did you complete? ]

Today
[ What are you working on? ]

Blockers
[ Anything blocking you? ]

[Save Update] [Publish]
```

---

## 23. Blockers

Members can report blockers.

```text
Create Blocker
├── Title
├── Description
├── Related Task
├── Severity
└── Team
```

Management actions such as Assign, Resolve, Reopen, and Escalate depend on effective permissions/scope.

---

## 24. Reports

Possible reports:

```text
Organization Reports
Team Reports
Product Reports
Project Reports
Daily Execution Reports
Workload Reports
Blocker Reports
Progress Reports
```

Reports must respect authorization scope.

A Team Lead's team access must not automatically grant access to unrelated teams.

---

## 25. RBAC in Frontend

RBAC means:

```text
ROLE
  ↓
PERMISSIONS
```

Use a centralized authorization API:

```ts
can("member.invite")
can("team.create")
can("team.lead.assign")
can("product.create")
can("project.create")
can("task.update")
can("report.export")
```

Resource-aware:

```ts
can("task.update", task)
can("report.view", report)
can("team.member.manage", team)
```

Avoid scattering:

```ts
if (user.role === "ADMIN") { ... }
```

throughout the application.

Prefer:

```ts
if (can("team.create")) { ... }
```

This keeps the FE ready for future custom roles without rewriting components.

---

## 26. Permission Concepts

### Permission

What can the user do?

```text
task.update
report.export
team.create
```

### Scope

Where can the user do it?

```text
SELF
TEAM
PROJECT
PRODUCT
ORGANIZATION
PLATFORM
```

Example:

```text
daily_update.update → SELF
team.report.view → TEAM
task.update → PROJECT
member.manage → ORGANIZATION
```

### Resource Membership

Which resources can the user access?

```text
Teams
Products
Projects
```

---

## 27. Effective Authorization Model

```text
USER
 ↓
ACTIVE ORGANIZATION
 ↓
ORGANIZATION MEMBERSHIP
 ↓
ORGANIZATION ROLE
 ↓
PERMISSION
 ↓
RESOURCE MEMBERSHIP
 ↓
SCOPE
 ↓
RESOURCE RELATIONSHIP
 ↓
PLAN ENTITLEMENT
 ↓
ALLOW / DENY
```

The frontend should consume effective authorization information from the backend rather than becoming the source of truth for security.

---

## 28. Route Protection

Example routes:

```text
/dashboard
/tasks
/teams
/products
/projects
/reports
/settings/members
/settings/billing
/settings/security
/settings/danger-zone
```

Protected routes should check access before rendering sensitive content.

Unauthorized result:

```text
403
You don't have permission to access this page.
```

The API must independently enforce authorization.

---

## 29. Page vs Action Permissions

Viewing and changing are separate.

Example:

```text
project.view = YES
project.delete = NO
```

A Member may see a project while not seeing its Delete action.

Button permissions:

```text
[Invite Member]  → member.invite
[Change Role]    → role.assign
[Remove]         → member.remove
[Export]         → report.export
```

---

## 30. Permission-Aware Navigation

Owner/Admin may see:

```text
Dashboard
My Work
Teams
Products
Projects
Tasks
Daily Execution
Blockers
Reports
Settings
```

Member may see:

```text
Dashboard
My Work
My Teams
My Products
My Projects
Tasks
Daily Execution
Blockers
Reports (if permitted)
```

Navigation should be generated from effective access where practical.

---

## 31. Loading States

Support:

```text
AUTH_LOADING
ORGANIZATION_LOADING
PERMISSION_LOADING
DATA_LOADING
```

Do not briefly display privileged controls before authorization state is known.

Recommended:

```text
Session loading
→ Organization loading
→ Authorization loading
→ Render authorized UI
```

---

## 32. Empty States

No teams:

```text
No teams yet.

Create your first team to organize your people and work.

[Create Team]
```

Only show the Create CTA when the user has permission.

No tasks:

```text
You're all caught up.

No tasks are assigned to you.
```

---

## 33. Error States

### 401

```text
You need to sign in.
```

### 403 Permission

```text
You don't have permission to perform this action.
```

### 403 Plan

```text
This feature is not available on your current plan.
[Upgrade Plan]
```

### 404

```text
We couldn't find that resource.
```

Do not reveal another organization's resource existence.

---

## 34. Organization Switching Safety

When switching tenants:

```text
Current Organization
→ Select New Organization
→ Clear tenant-scoped state/cache
→ Load new organization
→ Load new membership
→ Load new permissions
→ Load new navigation
→ Load new data
```

Never display stale data from the previous organization.

---

## 35. Frontend State

Recommended:

```text
Auth State
├── user
└── session

Organization State
├── organizations
├── activeOrganization
└── membership

Authorization State
├── role
├── permissions
└── access

UI State
├── sidebar
├── dialogs
├── filters
└── preferences
```

Use a dedicated server-state/data-fetching layer for server data instead of duplicating all API data into global client state.

---

## 36. Recommended Authorization Hook

Concept:

```ts
const {
  can,
  role,
  organization
} = useAuthorization();
```

Examples:

```ts
can("member.invite")
can("team.create")
can("team.lead.assign")
can("task.update")
can("report.export")
```

Resource examples:

```ts
can("task.update", task)
can("team.member.manage", team)
```

---

## 37. Super Admin Frontend

Super Admin should have a separate platform console:

```text
SUPER ADMIN CONSOLE
├── Dashboard
├── Organizations
├── Subscriptions
├── Plans
├── Platform Users
├── Support
├── Audit Logs
├── Security
└── Platform Settings
```

Do not mix platform administration into the normal customer sidebar.

For customer support access:

```text
Super Admin
→ Select Organization
→ Enter Reason
→ Temporary Support Access
→ Audit actions
→ Access expires
```

---

## 38. Client Portal — Future

If external clients are introduced, do not automatically make them normal Members.

```text
Organization
├── Internal Users
│   ├── Owner
│   ├── Admin
│   └── Member
│
└── External Users
    └── Client Portal Access
```

Client access should be explicitly limited to shared projects/reports/milestones.

---

## 39. International SaaS Requirements

Organizations may exist globally.

Frontend must support:

- Timezone
- Locale
- Date format
- Time format
- Currency
- Language
- Week start day

Daily execution timestamps must use the configured timezone rules.

Avoid hardcoded India/UK/Japan assumptions.

---

## 40. Audit UI

Authorized users should be able to view privileged actions.

Example:

```text
Audit Log

09:41  Yuki changed Priya role
       MEMBER → ADMIN

09:35  Yuki created Backend Team

09:20  Tanaka invited Ken
       Role: MEMBER
```

Filters:

```text
User
Action
Resource
Date
```

---

## 41. Frontend Security Boundary

Frontend responsibilities:

```text
Protect routes
Protect UI actions
Manage active tenant context
Clear tenant-specific state
Handle 401/403
Avoid leaking unauthorized data through cache
Never expose secrets
```

Backend responsibilities:

```text
Authenticate
→ Identify tenant
→ Verify membership
→ Verify tenant isolation
→ Check permission
→ Check resource membership
→ Check scope
→ Check plan
→ Audit privileged operations
```

The frontend is never the final security boundary.

---

## 42. Recommended FE Project Structure

```text
src/
├── app/
│   ├── auth/
│   ├── organizations/
│   └── dashboard/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── organization/
│   ├── members/
│   ├── teams/
│   ├── products/
│   ├── projects/
│   ├── tasks/
│   ├── daily-updates/
│   ├── blockers/
│   ├── reports/
│   └── billing/
│
├── auth/
│   ├── session/
│   ├── organization-context/
│   └── authorization/
│
├── permissions/
│   ├── catalog/
│   ├── can/
│   └── guards/
│
├── hooks/
│   ├── useCurrentUser
│   ├── useActiveOrganization
│   ├── usePermissions
│   └── useAuthorization
│
├── services/
│   ├── auth
│   ├── organizations
│   ├── teams
│   ├── products
│   ├── projects
│   ├── tasks
│   └── reports
│
└── types/
```

---

## 43. Final Role Architecture

```text
YOUR SaaS PLATFORM
│
└── SUPER_ADMIN

CUSTOMER ORGANIZATION
│
├── OWNER
├── ADMIN
└── MEMBER
```

Separate concepts:

```text
TEAM
├── Members
└── leadId

PRODUCT
└── Members / Access

PROJECT
└── Members / Access
```

Authorization:

```text
RBAC
+
Resource Membership
+
Scope
+
Resource Relationship
+
Tenant Isolation
+
Plan Entitlement
```

---

## 44. End-to-End Customer Journey

```text
VISITOR
 ↓
SIGN UP
 ↓
SELECT PLAN
 ↓
SUBSCRIPTION
 ↓
CREATE ORGANIZATION
 ↓
CREATOR = OWNER
 ↓
ONBOARDING
 ↓
INVITE MEMBERS
 ↓
OWNER CREATES / ASSIGNS ADMINS
 ↓
OWNER / ADMIN CREATES TEAMS
 ↓
ADD TEAM MEMBERS
 ↓
OPTIONALLY ASSIGN TEAM LEAD
 ↓
CREATE PRODUCTS
 ↓
CREATE PROJECTS
 ↓
ASSIGN ACCESS
 ↓
CREATE TASKS
 ↓
TEAM EXECUTES WORK
 ↓
DAILY UPDATES
 ↓
BLOCKERS
 ↓
REPORTS
 ↓
AI SUMMARY / INSIGHTS
```

---

## 45. V1 Frontend Implementation Order

1. Authentication
2. Organization creation
3. Organization switcher
4. Active organization context
5. Owner dashboard
6. Members
7. Invitations
8. Owner/Admin/Member role UI
9. Teams
10. Team membership
11. Team Lead responsibility
12. Products
13. Product membership
14. Projects
15. Project membership
16. Tasks
17. Daily Updates
18. Blockers
19. Reports
20. Permission-aware navigation/actions
21. Subscription/plan UI
22. Audit UI
23. Responsive/mobile UI
24. Internationalization/timezone handling

---

## 46. Final Product Principle

The customer experience should be:

> **Create your company → invite your people → organize teams → create products/projects → assign work → execute daily → track blockers → understand progress.**

The customer should not need to understand RBAC, scopes, tenant IDs, or authorization policies.

The backend can be enterprise-grade while the frontend remains simple.

**End of Frontend Architecture & UX Specification — V1**
