import { ServiceCall, Customer, Engineer, EngineerStatus, EngineerSkillLevel, Feedback, Machine, Part } from "@/types/service";

// Sample service calls data
export const serviceCalls: ServiceCall[] = [
  {
    id: "1",
    customerId: "cust-001",
    customerName: "ABC Technologies",
    phone: "+91-9876543210",
    machineId: "mach-001",
    machineModel: "HP LaserJet Pro M404dn",
    serialNumber: "VNB3C12345",
    location: "Chennai",
    issueType: "Paper Jam",
    issueDescription: "Paper getting stuck in the tray",
    callType: "Breakdown",
    priority: "High",
    status: "Pending",
    engineerId: "eng-001",
    engineerName: "Raj Kumar",
    createdAt: "2023-06-15T08:30:00",
    slaDeadline: "2023-06-15T14:30:00",
    startTime: null,
    completionTime: null,
    partsUsed: [],
    feedback: null,
    serviceCharge: 800,
    isPaid: false,
    partsReconciled: false,
    paymentDate: null,
    paymentMethod: null
  },
  {
    id: "2",
    customerId: "cust-002",
    customerName: "XYZ Corporation",
    phone: "+91-8765432109",
    machineId: "mach-002",
    machineModel: "Canon imageRUNNER 2425",
    serialNumber: "CNM2425789",
    location: "Bangalore",
    issueType: "Print Quality",
    issueDescription: "Prints are coming out faded",
    callType: "Service",
    priority: "Medium",
    status: "In Progress",
    engineerId: "eng-002",
    engineerName: "Priya Singh",
    createdAt: "2023-06-14T10:15:00",
    slaDeadline: "2023-06-15T10:15:00",
    startTime: "2023-06-14T13:20:00",
    completionTime: null,
    partsUsed: [
      {
        id: "part-001",
        name: "Toner Cartridge",
        partNumber: "CRG-057",
        quantity: 1,
        price: 2500,
        isReconciled: false
      }
    ],
    feedback: null,
    serviceCharge: 1200,
    isPaid: false,
    partsReconciled: false,
    paymentDate: null,
    paymentMethod: null
  },
  {
    id: "3",
    customerId: "cust-003",
    customerName: "Global Solutions",
    phone: "+91-7654321098",
    machineId: "mach-003",
    machineModel: "Epson WorkForce Pro WF-C579R",
    serialNumber: "EPWFC12345",
    location: "Mumbai",
    issueType: "Network Connectivity",
    issueDescription: "Printer not connecting to office network",
    callType: "Installation",
    priority: "Standard",
    status: "Completed",
    engineerId: "eng-003",
    engineerName: "Amit Patel",
    createdAt: "2023-06-13T09:00:00",
    slaDeadline: "2023-06-14T09:00:00",
    startTime: "2023-06-13T11:30:00",
    completionTime: "2023-06-13T14:45:00",
    partsUsed: [],
    feedback: {
      rating: 4,
      comment: "Good service, fixed the issue quickly",
      date: "2023-06-13T15:00:00"
    },
    serviceCharge: 1500,
    isPaid: true,
    paymentDate: "2023-06-13T15:10:00",
    paymentMethod: "Cash",
    partsReconciled: true
  },
  {
    id: "4",
    customerId: "cust-004",
    customerName: "Tech Innovators",
    phone: "+91-6543210987",
    machineId: "mach-004",
    machineModel: "Brother MFC-L8900CDW",
    serialNumber: "BRMFC98765",
    location: "Hyderabad",
    issueType: "Scanner Issue",
    issueDescription: "ADF not feeding documents properly",
    callType: "Breakdown",
    priority: "Critical",
    status: "Pending",
    engineerId: null,
    engineerName: "",
    createdAt: "2023-06-15T07:45:00",
    slaDeadline: "2023-06-15T11:45:00",
    startTime: null,
    completionTime: null,
    partsUsed: [],
    feedback: null,
    serviceCharge: 0,
    isPaid: false,
    partsReconciled: false,
    paymentDate: null,
    paymentMethod: null
  },
  {
    id: "5",
    customerId: "cust-005",
    customerName: "Sunrise Hospital",
    phone: "+91-5432109876",
    machineId: "mach-005",
    machineModel: "Xerox WorkCentre 6515",
    serialNumber: "XRX6515321",
    location: "Delhi",
    issueType: "Firmware Update",
    issueDescription: "Need to update firmware to latest version",
    callType: "Maintenance",
    priority: "Low",
    status: "Completed",
    engineerId: "eng-001",
    engineerName: "Raj Kumar",
    createdAt: "2023-06-12T14:30:00",
    slaDeadline: "2023-06-14T14:30:00",
    startTime: "2023-06-13T09:15:00",
    completionTime: "2023-06-13T10:30:00",
    partsUsed: [],
    feedback: {
      rating: 5,
      comment: "Excellent service, very professional",
      date: "2023-06-13T11:00:00"
    },
    serviceCharge: 800,
    isPaid: true,
    paymentDate: "2023-06-13T11:15:00",
    paymentMethod: "UPI",
    partsReconciled: true
  }
];

// Sample customers data
export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "ABC Technologies",
    phone: "+91-9876543210",
    email: "contact@abctech.com",
    location: "Chennai",
    type: "Corporate",
    contractType: "AMC",
    status: "Active"
  },
  {
    id: "cust-002",
    name: "XYZ Corporation",
    phone: "+91-8765432109",
    email: "info@xyzcorp.com",
    location: "Bangalore",
    type: "Corporate",
    contractType: "Per-Call",
    status: "Active"
  },
  {
    id: "cust-003",
    name: "Global Solutions",
    phone: "+91-7654321098",
    email: "support@globalsolutions.com",
    location: "Mumbai",
    type: "SMB",
    contractType: "AMC",
    status: "Active"
  },
  {
    id: "cust-004",
    name: "Tech Innovators",
    phone: "+91-6543210987",
    email: "help@techinnovators.com",
    location: "Hyderabad",
    type: "Startup",
    contractType: "Per-Call",
    status: "Active"
  },
  {
    id: "cust-005",
    name: "Sunrise Hospital",
    phone: "+91-5432109876",
    email: "admin@sunrisehospital.com",
    location: "Delhi",
    type: "Healthcare",
    contractType: "AMC",
    status: "Active"
  }
];

// Sample engineers data
export const engineers: Engineer[] = [
  {
    id: "eng-001",
    name: "Raj Kumar",
    phone: "+91-9988776655",
    email: "raj.kumar@company.com",
    location: "Chennai",
    status: "Available",
    skillLevel: "Expert",
    currentJob: null,
    currentLocation: "Office"
  },
  {
    id: "eng-002",
    name: "Priya Singh",
    phone: "+91-9977665544",
    email: "priya.singh@company.com",
    location: "Bangalore",
    status: "On Call",
    skillLevel: "Advanced",
    currentJob: "2",
    currentLocation: "XYZ Corporation, Bangalore"
  },
  {
    id: "eng-003",
    name: "Amit Patel",
    phone: "+91-9966554433",
    email: "amit.patel@company.com",
    location: "Mumbai",
    status: "Available",
    skillLevel: "Intermediate",
    currentJob: null,
    currentLocation: "Warehouse"
  },
  {
    id: "eng-004",
    name: "Deepa Sharma",
    phone: "+91-9955443322",
    email: "deepa.sharma@company.com",
    location: "Delhi",
    status: "On Leave",
    skillLevel: "Advanced",
    currentJob: null,
    currentLocation: "Home",
    leaveEndDate: "2023-06-20T00:00:00"
  },
  {
    id: "eng-005",
    name: "Vikram Reddy",
    phone: "+91-9944332211",
    email: "vikram.reddy@company.com",
    location: "Hyderabad",
    status: "Available",
    skillLevel: "Expert",
    currentJob: null,
    currentLocation: "Office"
  }
];

// Sample machines data
export const mockMachines: Machine[] = [
  {
    id: "mach-001",
    customerId: "cust-001",
    model: "HP LaserJet Pro M404dn",
    serialNumber: "VNB3C12345",
    installDate: "2022-10-15T00:00:00",
    status: "Active",
    lastService: "2023-05-10",
    contractType: "AMC"
  },
  {
    id: "mach-002",
    customerId: "cust-002",
    model: "Canon imageRUNNER 2425",
    serialNumber: "CNM2425789",
    installDate: "2022-08-23T00:00:00",
    status: "Active",
    lastService: "2023-04-18",
    contractType: "Per-Call"
  },
  {
    id: "mach-003",
    customerId: "cust-003",
    model: "Epson WorkForce Pro WF-C579R",
    serialNumber: "EPWFC12345",
    installDate: "2023-01-05T00:00:00",
    status: "Active",
    lastService: "2023-06-13",
    contractType: "AMC"
  },
  {
    id: "mach-004",
    customerId: "cust-004",
    model: "Brother MFC-L8900CDW",
    serialNumber: "BRMFC98765",
    installDate: "2022-11-20T00:00:00",
    status: "Active",
    lastService: "None",
    contractType: "Per-Call"
  },
  {
    id: "mach-005",
    customerId: "cust-005",
    model: "Xerox WorkCentre 6515",
    serialNumber: "XRX6515321",
    installDate: "2022-09-10T00:00:00",
    status: "Active",
    lastService: "2023-06-13",
    contractType: "AMC"
  }
];
