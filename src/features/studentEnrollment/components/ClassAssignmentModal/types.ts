export interface ClassDisplayItem {
  scheduleId: string;
  displayLabel: string;
  joinDate?: string;
  branchName?: string;
}

export interface ClassAssignmentStudent {
  studentCode: string;
  fullName: string;
  branchName: string;
  studentStatus: string;
}

export interface ClassAssignmentPrefillStudent {
  studentCode: string;
  fullName: string;
  branchName: string;
  studentStatus: string;
}

export interface EnrolledClassItem extends ClassDisplayItem {
  enrollmentId: string;
}
