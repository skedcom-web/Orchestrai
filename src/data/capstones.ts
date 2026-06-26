export type CapstoneComplexity = 'beginner' | 'intermediate' | 'advanced';

export type CapstoneDomain =
  | 'Education'
  | 'HR'
  | 'IT Operations'
  | 'Agriculture'
  | 'Healthcare'
  | 'Operations';

export interface Capstone {
  id: string;
  domain: CapstoneDomain;
  complexity: CapstoneComplexity;
  title: string;
  brief: string;
  actors: string[];
  masters: string[];
  transactionEntity: string;
  workflow: string[];
  trainerExtension: string;
}

export const UNIVERSAL_REPORTS = ['Summary Report', 'Status Report', 'Activity Report'];
export const UNIVERSAL_ROLES = ['Admin', 'Manager', 'User'];
export const BUILD_PLAN = {
  day1: 'Authentication · Layout · Routing',
  day2: 'Dashboard · Master Data',
  day3: 'Transactions',
  day4: 'Workflow · Comments · Attachments',
  day5: 'Reports · RBAC · Deployment · Documentation'
};

export const CAPSTONES: Capstone[] = [
  { id: 'CAP-01', domain: 'Education', complexity: 'intermediate', title: 'Student Complaint Resolution Tracker', brief: 'Track student complaints across departments with assignment, resolution, and escalation tracking.', actors: ['Student', 'Faculty', 'Admin'], masters: ['Department', 'Category', 'Priority'], transactionEntity: 'Complaint', workflow: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'], trainerExtension: 'Escalation Matrix' },
  { id: 'CAP-02', domain: 'Education', complexity: 'intermediate', title: 'Placement Drive Management', brief: 'Manage the end-to-end placement lifecycle from company registration to candidate joining.', actors: ['Student', 'Placement Officer', 'Admin'], masters: ['Company', 'Skill Category', 'Drive'], transactionEntity: 'Placement Application', workflow: ['Registered', 'Shortlisted', 'Interviewed', 'Selected', 'Joined'], trainerExtension: 'Placement Analytics' },
  { id: 'CAP-03', domain: 'Education', complexity: 'beginner', title: 'Internship Tracker', brief: 'Track internship applications from request through completion with feedback.', actors: ['Student', 'Mentor', 'Admin'], masters: ['Organization', 'Domain', 'Duration'], transactionEntity: 'Internship Request', workflow: ['Applied', 'Reviewed', 'Approved', 'Completed', 'Closed'], trainerExtension: 'Feedback Module' },
  { id: 'CAP-04', domain: 'Education', complexity: 'intermediate', title: 'College Event Management', brief: 'Manage campus events from planning to registration to certification.', actors: ['Student', 'Event Coordinator', 'Admin'], masters: ['Event Category', 'Venue', 'Sponsor'], transactionEntity: 'Event Registration', workflow: ['Draft', 'Published', 'Registered', 'Completed', 'Archived'], trainerExtension: 'Certificate Generator' },
  { id: 'CAP-05', domain: 'Education', complexity: 'beginner', title: 'Laboratory Equipment Booking', brief: 'Manage lab equipment reservations with approval and return tracking.', actors: ['Student', 'Lab Incharge', 'Admin'], masters: ['Lab', 'Equipment', 'Time Slot'], transactionEntity: 'Booking', workflow: ['Requested', 'Approved', 'Allocated', 'Returned', 'Closed'], trainerExtension: 'Availability Calendar' },
  { id: 'CAP-06', domain: 'HR', complexity: 'intermediate', title: 'Leave Management', brief: 'Handle employee leave requests with multi-level approval and balance tracking.', actors: ['Employee', 'Manager', 'HR Admin'], masters: ['Leave Type', 'Department', 'Holiday Calendar'], transactionEntity: 'Leave Request', workflow: ['Draft', 'Submitted', 'Review', 'Approved', 'Closed'], trainerExtension: 'Leave Balance Calculator' },
  { id: 'CAP-07', domain: 'HR', complexity: 'intermediate', title: 'Recruitment Pipeline Tracker', brief: 'Track candidate pipeline from application through onboarding.', actors: ['Recruiter', 'Hiring Manager', 'Admin'], masters: ['Position', 'Skill', 'Source'], transactionEntity: 'Candidate', workflow: ['Applied', 'Screening', 'Interview', 'Offer', 'Joined'], trainerExtension: 'Interview Feedback' },
  { id: 'CAP-08', domain: 'HR', complexity: 'beginner', title: 'Employee Onboarding Tracker', brief: 'Coordinate onboarding tasks across IT, HR, and Manager with verification.', actors: ['New Hire', 'Buddy', 'HR Admin'], masters: ['Task Template', 'Department', 'Role'], transactionEntity: 'Onboarding Task', workflow: ['Created', 'Assigned', 'In Progress', 'Completed', 'Verified'], trainerExtension: 'Checklist Automation' },
  { id: 'CAP-09', domain: 'HR', complexity: 'intermediate', title: 'Employee Training Tracker', brief: 'Track training assignments, completions, and certification expiry.', actors: ['Employee', 'L&D Manager', 'Admin'], masters: ['Course', 'Instructor', 'Skill'], transactionEntity: 'Training Assignment', workflow: ['Assigned', 'Started', 'Completed', 'Certified', 'Archived'], trainerExtension: 'Certification Alerts' },
  { id: 'CAP-10', domain: 'HR', complexity: 'advanced', title: 'Performance Review Workflow', brief: 'Conduct goal-based performance reviews with multi-stage approval.', actors: ['Employee', 'Manager', 'HR Reviewer'], masters: ['Review Cycle', 'Goal Category', 'Rating Scale'], transactionEntity: 'Review', workflow: ['Draft', 'Submitted', 'Review', 'Approved', 'Completed'], trainerExtension: 'Goal Dashboard' },
  { id: 'CAP-11', domain: 'IT Operations', complexity: 'advanced', title: 'Change Request Management', brief: 'Govern IT change requests with impact analysis and rollback planning.', actors: ['Requester', 'CAB Member', 'IT Admin'], masters: ['Change Type', 'System', 'Risk Level'], transactionEntity: 'Change Request', workflow: ['Raised', 'Analysis', 'Approved', 'Implemented', 'Closed'], trainerExtension: 'Impact Assessment' },
  { id: 'CAP-12', domain: 'IT Operations', complexity: 'intermediate', title: 'IT Asset Management', brief: 'Manage IT asset lifecycle from procurement to retirement.', actors: ['Employee', 'IT Asset Manager', 'Admin'], masters: ['Asset Type', 'Vendor', 'Location'], transactionEntity: 'Asset Assignment', workflow: ['Registered', 'Assigned', 'In Use', 'Returned', 'Retired'], trainerExtension: 'Lifecycle Dashboard' },
  { id: 'CAP-13', domain: 'IT Operations', complexity: 'intermediate', title: 'Service Desk Ticketing', brief: 'Run an internal IT helpdesk with SLA tracking and assignment routing.', actors: ['Requester', 'Agent', 'Admin'], masters: ['Category', 'Priority', 'SLA Policy'], transactionEntity: 'Ticket', workflow: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'], trainerExtension: 'SLA Dashboard' },
  { id: 'CAP-14', domain: 'IT Operations', complexity: 'advanced', title: 'API Incident Tracker', brief: 'Track production API incidents through investigation, fix, and RCA.', actors: ['On-Call Engineer', 'Service Owner', 'Admin'], masters: ['API Service', 'Severity', 'Environment'], transactionEntity: 'Incident', workflow: ['Detected', 'Investigating', 'Fixing', 'Monitoring', 'Closed'], trainerExtension: 'RCA Repository' },
  { id: 'CAP-15', domain: 'IT Operations', complexity: 'advanced', title: 'Release Readiness Tracker', brief: 'Coordinate release approvals across Dev, QA, and Ops with go-live gates.', actors: ['Release Manager', 'QA Lead', 'Admin'], masters: ['Product', 'Environment', 'Release Type'], transactionEntity: 'Release', workflow: ['Planned', 'Development', 'Testing', 'Approved', 'Released'], trainerExtension: 'Go-Live Checklist' },
  { id: 'CAP-16', domain: 'Agriculture', complexity: 'intermediate', title: 'Farmer Advisory Request Portal', brief: 'Route farmer advisory requests to agronomists with inspection and recommendation.', actors: ['Farmer', 'Agronomist', 'Admin'], masters: ['Crop', 'Region', 'Advisory Category'], transactionEntity: 'Advisory Request', workflow: ['Submitted', 'Assigned', 'Inspection', 'Recommendation', 'Closed'], trainerExtension: 'Crop Analytics' },
  { id: 'CAP-17', domain: 'Agriculture', complexity: 'beginner', title: 'Farm Equipment Booking', brief: 'Manage shared farm equipment bookings across cooperative members.', actors: ['Farmer', 'Equipment Coordinator', 'Admin'], masters: ['Equipment', 'Time Slot', 'Location'], transactionEntity: 'Equipment Booking', workflow: ['Requested', 'Approved', 'Allocated', 'Returned', 'Closed'], trainerExtension: 'Utilization Dashboard' },
  { id: 'CAP-18', domain: 'Agriculture', complexity: 'intermediate', title: 'Organic Produce Marketplace', brief: 'List, review, and sell organic produce with buyer ratings.', actors: ['Seller', 'Buyer', 'Admin'], masters: ['Produce Category', 'Certification', 'Region'], transactionEntity: 'Produce Listing', workflow: ['Listed', 'Reviewed', 'Published', 'Sold', 'Completed'], trainerExtension: 'Buyer Ratings' },
  { id: 'CAP-19', domain: 'Agriculture', complexity: 'intermediate', title: 'Crop Inspection Tracker', brief: 'Schedule and conduct crop inspections with photographic evidence.', actors: ['Farmer', 'Inspector', 'Admin'], masters: ['Crop', 'Inspection Type', 'Region'], transactionEntity: 'Inspection', workflow: ['Scheduled', 'Visited', 'Inspected', 'Reported', 'Closed'], trainerExtension: 'Inspection Calendar' },
  { id: 'CAP-20', domain: 'Agriculture', complexity: 'beginner', title: 'Farm Visit Scheduling', brief: 'Coordinate farm visits between farmers and extension officers.', actors: ['Farmer', 'Extension Officer', 'Admin'], masters: ['Visit Type', 'Region', 'Time Slot'], transactionEntity: 'Visit Request', workflow: ['Requested', 'Scheduled', 'Confirmed', 'Visited', 'Closed'], trainerExtension: 'Geo Tracking' },
  { id: 'CAP-21', domain: 'Healthcare', complexity: 'intermediate', title: 'Patient Appointment System', brief: 'Book and manage outpatient appointments with consultation notes.', actors: ['Patient', 'Doctor', 'Admin'], masters: ['Specialty', 'Doctor', 'Time Slot'], transactionEntity: 'Appointment', workflow: ['Booked', 'Confirmed', 'Consulted', 'Completed', 'Closed'], trainerExtension: 'Doctor Dashboard' },
  { id: 'CAP-22', domain: 'Healthcare', complexity: 'intermediate', title: 'Laboratory Sample Tracker', brief: 'Track laboratory samples from collection through delivery of results.', actors: ['Patient', 'Lab Technician', 'Admin'], masters: ['Test', 'Lab', 'Sample Type'], transactionEntity: 'Sample', workflow: ['Collected', 'Received', 'Processing', 'Completed', 'Delivered'], trainerExtension: 'Sample Analytics' },
  { id: 'CAP-23', domain: 'Healthcare', complexity: 'advanced', title: 'Blood Donation Management', brief: 'Match donors to recipients with verification and donation history.', actors: ['Donor', 'Camp Coordinator', 'Admin'], masters: ['Blood Group', 'Camp', 'Hospital'], transactionEntity: 'Donation Request', workflow: ['Registered', 'Verified', 'Matched', 'Donated', 'Closed'], trainerExtension: 'Donor History' },
  { id: 'CAP-24', domain: 'Healthcare', complexity: 'intermediate', title: 'Medical Camp Management', brief: 'Plan, publish, and conduct medical camps with volunteer coordination.', actors: ['Volunteer', 'Camp Manager', 'Admin'], masters: ['Camp Type', 'Location', 'Sponsor'], transactionEntity: 'Camp Registration', workflow: ['Planned', 'Published', 'Registered', 'Conducted', 'Closed'], trainerExtension: 'Volunteer Tracking' },
  { id: 'CAP-25', domain: 'Healthcare', complexity: 'beginner', title: 'Wellness Challenge Tracker', brief: 'Engage employees in wellness challenges with leaderboards.', actors: ['Participant', 'Coach', 'Admin'], masters: ['Challenge Category', 'Metric', 'Reward'], transactionEntity: 'Challenge Participation', workflow: ['Created', 'Joined', 'Active', 'Completed', 'Archived'], trainerExtension: 'Leaderboard' },
  { id: 'CAP-26', domain: 'Operations', complexity: 'intermediate', title: 'Vendor Registration & Approval', brief: 'Onboard vendors with document verification and scorecard tracking.', actors: ['Vendor', 'Procurement Officer', 'Admin'], masters: ['Vendor Category', 'Compliance Type', 'Region'], transactionEntity: 'Vendor Registration', workflow: ['Registered', 'Verified', 'Reviewed', 'Approved', 'Active'], trainerExtension: 'Vendor Scorecard' },
  { id: 'CAP-27', domain: 'Operations', complexity: 'intermediate', title: 'Purchase Request Management', brief: 'Govern purchase requests with budget validation and multi-level approval.', actors: ['Requester', 'Finance Approver', 'Procurement Admin'], masters: ['Cost Center', 'Vendor', 'Item Category'], transactionEntity: 'Purchase Request', workflow: ['Draft', 'Submitted', 'Approved', 'Purchased', 'Closed'], trainerExtension: 'Budget Validation' },
  { id: 'CAP-28', domain: 'Operations', complexity: 'beginner', title: 'Visitor Management System', brief: 'Manage visitor check-in/out with QR pass generation.', actors: ['Visitor', 'Host', 'Security Admin'], masters: ['Visit Purpose', 'Location', 'Host Department'], transactionEntity: 'Visitor Request', workflow: ['Requested', 'Approved', 'Checked-In', 'Checked-Out', 'Closed'], trainerExtension: 'QR Pass' },
  { id: 'CAP-29', domain: 'Operations', complexity: 'intermediate', title: 'Meeting Action Tracker', brief: 'Capture meeting action items and track to completion with reminders.', actors: ['Owner', 'Assignee', 'Admin'], masters: ['Meeting Type', 'Priority', 'Department'], transactionEntity: 'Action Item', workflow: ['Created', 'Assigned', 'In Progress', 'Completed', 'Verified'], trainerExtension: 'Reminder Engine' },
  { id: 'CAP-30', domain: 'Operations', complexity: 'advanced', title: 'Internal Audit Finding Tracker', brief: 'Track audit findings through investigation, resolution, and compliance closure.', actors: ['Auditor', 'Process Owner', 'Admin'], masters: ['Audit Type', 'Risk Category', 'Business Unit'], transactionEntity: 'Audit Finding', workflow: ['Open', 'Assigned', 'Investigating', 'Resolved', 'Closed'], trainerExtension: 'Compliance Dashboard' }
];

export const DOMAINS: CapstoneDomain[] = ['Education', 'HR', 'IT Operations', 'Agriculture', 'Healthcare', 'Operations'];
export const COMPLEXITIES: CapstoneComplexity[] = ['beginner', 'intermediate', 'advanced'];

export const DOMAIN_COLORS: Record<CapstoneDomain, { bg: string; border: string; text: string; icon: string }> = {
  'Education':     { bg: 'bg-indigo-500/10',   border: 'border-indigo-500/25',  text: 'text-indigo-400',  icon: 'GraduationCap' },
  'HR':            { bg: 'bg-purple-500/10',   border: 'border-purple-500/25',  text: 'text-purple-400',  icon: 'Users' },
  'IT Operations': { bg: 'bg-cyan-500/10',     border: 'border-cyan-500/25',    text: 'text-cyan-400',    icon: 'ServerCog' },
  'Agriculture':   { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25', text: 'text-emerald-400', icon: 'Sprout' },
  'Healthcare':    { bg: 'bg-rose-500/10',     border: 'border-rose-500/25',    text: 'text-rose-400',    icon: 'HeartPulse' },
  'Operations':    { bg: 'bg-amber-500/10',    border: 'border-amber-500/25',   text: 'text-amber-400',   icon: 'Briefcase' }
};

export const COMPLEXITY_COLORS: Record<CapstoneComplexity, { bg: string; text: string; label: string }> = {
  'beginner':     { bg: 'bg-emerald-500/10 border border-emerald-500/25', text: 'text-emerald-400', label: 'Beginner' },
  'intermediate': { bg: 'bg-amber-500/10 border border-amber-500/25',     text: 'text-amber-400',   label: 'Intermediate' },
  'advanced':     { bg: 'bg-rose-500/10 border border-rose-500/25',       text: 'text-rose-400',    label: 'Advanced' }
};
