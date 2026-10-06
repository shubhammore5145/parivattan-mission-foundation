export interface StudentUser {
  id: string;
  prn: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  city?: string;
  state?: string;
  avatar?: string;
  registeredAt: string;
}

export type CourseCategory = 'all' | 'technology' | 'languages' | 'overseas' | 'vocational';

export interface Course {
  id: string;
  code: string;
  title: string;
  marathiTitle: string;
  school: string;
  category: 'technology' | 'languages' | 'overseas' | 'vocational';
  duration: string;
  mode: 'Hybrid Classroom' | 'Live Online' | 'Campus Regular' | 'Live Online + Lab' | 'Live Interactive Online' | 'Campus Regular / Weekend' | string;
  eligibility: string;
  batchStart: string;
  seatsAvailable: number;
  totalFee: number;
  admissionFee: number;
  scholarshipSubsidy: number;
  finalPayable: number;
  rating: number;
  studentsEnrolled: number;
  badge: string;
  shortDesc: string;
  marathiDesc: string;
  highlights: string[];
  syllabus: string[];
  careerProspects: string[];
  icon: string;
}

export interface StudentAdmissionRecord {
  id: string;
  applicationNo: string;
  prn: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  school: string;
  batchPreference: string;
  learningMode: string;
  
  // Personal Details
  dob: string;
  gender: string;
  category: string;
  bloodGroup: string;
  fatherName: string;
  motherName: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  
  // Academic Qualification
  qualification: string;
  collegeName: string;
  passingYear: string;
  percentage: string;
  
  // Documents
  photoUrl?: string;
  identityProofUrl?: string;
  marksheetUrl?: string;
  casteCertUrl?: string;
  
  // Payment info
  amount: number;
  paymentId: string;
  orderId?: string;
  paymentMethod: 'razorpay' | 'upi_qr' | 'test_sandbox';
  paymentDate: string;
  status: 'completed' | 'pending' | 'verified';
  createdAt: string;
}
