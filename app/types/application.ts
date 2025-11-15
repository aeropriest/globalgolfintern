export interface InternshipApplication {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationDate: string;
  resume: string; // URL to resume
  coverLetter?: string;
  position: string;
  availability: string;
  createdAt: number;
}
