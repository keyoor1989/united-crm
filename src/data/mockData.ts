
import { Customer, Machine, Engineer, ServiceCall } from "@/types/service";
import { addHours, subHours, subDays } from "date-fns";

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "cust1",
    name: "Govt. Medical College",
    phone: "+91 9876543210",
    email: "admin@gmc.edu.in",
    location: "Indore",
    type: "Government",
    contractType: "AMC",
    status: "Active",
  },
  {
    id: "cust2",
    name: "ABC Enterprises",
    phone: "+91 9876543211",
    email: "contact@abcent.com",
    location: "Bhopal",
    type: "Corporate",
    contractType: "Warranty",
    status: "Active",
  },
  {
    id: "cust3",
    name: "City Hospital",
    phone: "+91 9876543212",
    email: "info@cityhospital.com",
    location: "Indore",
    type: "Corporate",
    contractType: "AMC",
    status: "Active",
  },
  {
    id: "cust4",
    name: "Global Tech Solutions",
    phone: "+91 9876543213",
    email: "support@globaltech.com",
    location: "Jabalpur",
    type: "Corporate",
    contractType: "Rental",
    status: "Active",
  },
  {
    id: "cust5",
    name: "Sunshine School",
    phone: "+91 9876543214",
    email: "office@sunshine.edu",
    location: "Bhopal",
    type: "Government",
    contractType: "AMC",
    status: "Active",
  },
];

// Mock Machines
export const mockMachines: Machine[] = [
  {
    id: "mach1",
    customerId: "cust1",
    model: "Kyocera 2554ci",
    serialNumber: "KYC-78923-X",
    installDate: subDays(new Date(), 180).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 30).toISOString(),
    contractType: "AMC",
  },
  {
    id: "mach2",
    customerId: "cust1",
    model: "Kyocera 4054ci",
    serialNumber: "KYC-82345-X",
    installDate: subDays(new Date(), 90).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 15).toISOString(),
    contractType: "AMC",
  },
  {
    id: "mach3",
    customerId: "cust2",
    model: "Ricoh MP2014",
    serialNumber: "RCH-12345-A",
    installDate: subDays(new Date(), 240).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 60).toISOString(),
    contractType: "Warranty",
  },
  {
    id: "mach4",
    customerId: "cust3",
    model: "Xerox 7845",
    serialNumber: "XRX-45678-B",
    installDate: subDays(new Date(), 120).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 45).toISOString(),
    contractType: "AMC",
  },
  {
    id: "mach5",
    customerId: "cust4",
    model: "Canon iR2625",
    serialNumber: "CAN-23456-C",
    installDate: subDays(new Date(), 75).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 20).toISOString(),
    contractType: "Rental",
  },
  {
    id: "mach6",
    customerId: "cust5",
    model: "Sharp MX-3071",
    serialNumber: "SHP-34567-D",
    installDate: subDays(new Date(), 150).toISOString(),
    status: "Active",
    lastService: subDays(new Date(), 30).toISOString(),
    contractType: "AMC",
  },
];

// Mock Engineers
export const mockEngineers: Engineer[] = [
  {
    id: "eng1",
    name: "Rajesh Kumar",
    phone: "+91 9876543220",
    email: "rajesh@service.com",
    location: "Indore",
    status: "Available",
    skillLevel: "Expert",
    currentJob: null,
    currentLocation: "Indore Office",
  },
  {
    id: "eng2",
    name: "Vikram Singh",
    phone: "+91 9876543221",
    email: "vikram@service.com",
    location: "Indore",
    status: "On Call",
    skillLevel: "Senior",
    currentJob: "City Hospital",
    currentLocation: "Indore - City Hospital",
  },
  {
    id: "eng3",
    name: "Sunil Sharma",
    phone: "+91 9876543222",
    email: "sunil@service.com",
    location: "Bhopal",
    status: "Break",
    skillLevel: "Intermediate",
    currentJob: null,
    currentLocation: "Bhopal Office",
  },
  {
    id: "eng4",
    name: "Amit Patel",
    phone: "+91 9876543223",
    email: "amit@service.com",
    location: "Jabalpur",
    status: "Off Duty",
    skillLevel: "Senior",
    currentJob: null,
    currentLocation: "Jabalpur Office",
  },
];

// Mock Service Calls
export const mockServiceCalls: ServiceCall[] = [
  {
    id: "SC-00001",
    customerId: "cust1",
    customerName: "Govt. Medical College",
    phone: "+91 9876543210",
    machineId: "mach1",
    machineModel: "Kyocera 2554ci",
    serialNumber: "KYC-78923-X",
    location: "Indore",
    issueType: "Paper Jam",
    issueDescription: "Paper jam error, unable to print",
    callType: "AMC",
    priority: "High",
    status: "Pending",
    engineerId: "eng1",
    engineerName: "Rajesh Kumar",
    createdAt: subHours(new Date(), 2).toISOString(),
    slaDeadline: addHours(new Date(), 10).toISOString(), // 12 hours SLA for Government
    startTime: null,
    completionTime: null,
    partsUsed: [],
    feedback: null,
  },
  {
    id: "SC-00002",
    customerId: "cust2",
    customerName: "ABC Enterprises",
    phone: "+91 9876543211",
    machineId: "mach3",
    machineModel: "Ricoh MP2014",
    serialNumber: "RCH-12345-A",
    location: "Bhopal",
    issueType: "Toner Issue",
    issueDescription: "Toner needs replacement",
    callType: "Warranty",
    priority: "Medium",
    status: "Pending",
    engineerId: null,
    engineerName: "",
    createdAt: subHours(new Date(), 5).toISOString(),
    slaDeadline: addHours(new Date(), 19).toISOString(), // 24 hours SLA for Corporate
    startTime: null,
    completionTime: null,
    partsUsed: [],
    feedback: null,
  },
  {
    id: "SC-00003",
    customerId: "cust3",
    customerName: "City Hospital",
    phone: "+91 9876543212",
    machineId: "mach4",
    machineModel: "Xerox 7845",
    serialNumber: "XRX-45678-B",
    location: "Indore",
    issueType: "Scanner Issue",
    issueDescription: "Scanning not working",
    callType: "AMC",
    priority: "Medium-High",
    status: "In Progress",
    engineerId: "eng2",
    engineerName: "Vikram Singh",
    createdAt: subHours(new Date(), 8).toISOString(),
    slaDeadline: addHours(new Date(), 16).toISOString(), // 24 hours SLA for Corporate
    startTime: subHours(new Date(), 2).toISOString(),
    completionTime: null,
    partsUsed: [],
    feedback: null,
  },
  {
    id: "SC-00004",
    customerId: "cust4",
    customerName: "Global Tech Solutions",
    phone: "+91 9876543213",
    machineId: "mach5",
    machineModel: "Canon iR2625",
    serialNumber: "CAN-23456-C",
    location: "Jabalpur",
    issueType: "Network Issue",
    issueDescription: "Unable to connect to network",
    callType: "Rental",
    priority: "Medium",
    status: "Completed",
    engineerId: "eng4",
    engineerName: "Amit Patel",
    createdAt: subDays(new Date(), 1).toISOString(),
    slaDeadline: subDays(new Date(), 1).toISOString(),
    startTime: subDays(new Date(), 1).toISOString(),
    completionTime: subHours(new Date(), 18).toISOString(),
    partsUsed: [
      {
        id: "part1",
        name: "Network Card",
        partNumber: "NC-12345",
        quantity: 1,
        price: 2500,
      }
    ],
    feedback: {
      rating: 5,
      comment: "Quick and effective service.",
      date: subHours(new Date(), 17).toISOString(),
    },
  },
  {
    id: "SC-00005",
    customerId: "cust5",
    customerName: "Sunshine School",
    phone: "+91 9876543214",
    machineId: "mach6",
    machineModel: "Sharp MX-3071",
    serialNumber: "SHP-34567-D",
    location: "Bhopal",
    issueType: "Error Code",
    issueDescription: "Shows error E-225",
    callType: "AMC",
    priority: "High",
    status: "Pending",
    engineerId: "eng3",
    engineerName: "Sunil Sharma",
    createdAt: subHours(new Date(), 10).toISOString(),
    slaDeadline: addHours(new Date(), 2).toISOString(), // 12 hours SLA for Government
    startTime: null,
    completionTime: null,
    partsUsed: [],
    feedback: null,
  },
];
