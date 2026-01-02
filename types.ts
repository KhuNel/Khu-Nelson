export enum ActivityStatus {
  COMPLETED = 'Completed',
  ON_PROCESS = 'On process',
  NOT_STARTED = 'Not started'
}

export interface ActivityData {
  no: string;                 // Column A
  activityCode: string;       // Column B
  domainName: string;         // Column C
  activityName: string;       // Column D
  operation: string;          // Column E
  timeline: string;           // Column F
  targetParticipants: string; // Column G
  participants: string;       // Column H
  plannedTimes: number | null;// Column I
  completedTime: number | null;// Column J
  status: ActivityStatus;     // Column K
  allocationBudget: number;   // Column L
  expenditure: number;        // Column N
  balance: number;            // Column M
  budgetProgress: number;     // Column O
}

export interface DashboardMetrics {
  totalActivities: number;
  completed: number;
  onProcess: number;
  notStarted: number;
  totalBudget: number;
  totalExpenditure: number;
  totalBalance: number;
  budgetUtilization: number;
  balancePercentage: number;
  totalOverspent: number;
  totalUnderspent: number;
}
