// /**
//  * Mock sellers data for development and testing
//  * Features sellers from Kenya, other African countries, and international contexts
//  */

// export const mockSellers = [
//   {
//     id: "1",
//     businessName: "Kilimani Beauty Supplies",
//     contactName: "Wangari Maathai",
//     email: "wangari@kilimanisupplies.co.ke",
//     phone: "+254 712 345 678",
//     location: "Nairobi, Kenya",
//     registrationDate: "2025-01-15T08:30:00.000Z",
//     status: "approved",
//     verificationDate: "2025-01-20T10:15:00.000Z",
//     productCategories: ["Skincare", "Haircare"],
//     rating: 4.8,
//     salesCount: 156
//   },
//   {
//     id: "2",
//     businessName: "Lagos Glow Cosmetics",
//     contactName: "Chinua Achebe",
//     email: "chinua@lagosglow.ng",
//     phone: "+234 801 234 5678",
//     location: "Lagos, Nigeria",
//     registrationDate: "2025-02-03T12:45:00.000Z",
//     status: "approved",
//     verificationDate: "2025-02-10T09:20:00.000Z",
//     productCategories: ["Makeup", "Fragrance"],
//     rating: 4.5,
//     salesCount: 132
//   },
//   {
//     id: "3",
//     businessName: "Maasai Beads & Beauty",
//     contactName: "Lekishon Metito",
//     email: "lekishon@maasaibeads.com",
//     phone: "+254 723 456 789",
//     location: "Narok, Kenya",
//     registrationDate: "2025-02-18T14:30:00.000Z",
//     status: "approved",
//     verificationDate: "2025-02-22T11:05:00.000Z",
//     productCategories: ["Jewelry", "Organic Skincare"],
//     rating: 4.9,
//     salesCount: 98
//   },
//   {
//     id: "4",
//     businessName: "Cairo Essence",
//     contactName: "Nefertari Hassan",
//     email: "nefertari@cairoessence.eg",
//     phone: "+20 100 123 4567",
//     location: "Cairo, Egypt",
//     registrationDate: "2025-03-05T10:15:00.000Z",
//     status: "approved",
//     verificationDate: "2025-03-12T13:45:00.000Z",
//     productCategories: ["Fragrance", "Oils", "Traditional Cosmetics"],
//     rating: 4.7,
//     salesCount: 115
//   },
//   {
//     id: "5",
//     businessName: "Nairobi Natural Hair",
//     contactName: "Otieno Nyong'o",
//     email: "otieno@nairobihair.co.ke",
//     phone: "+254 733 987 654",
//     location: "Nairobi, Kenya",
//     registrationDate: "2025-03-20T09:00:00.000Z",
//     status: "pending",
//     productCategories: ["Haircare", "Natural Products"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "6",
//     businessName: "Marrakech Argan Beauty",
//     contactName: "Aisha El Mansouri",
//     email: "aisha@marrakechbeauty.ma",
//     phone: "+212 661 234 567",
//     location: "Marrakech, Morocco",
//     registrationDate: "2025-03-25T15:20:00.000Z",
//     status: "approved",
//     verificationDate: "2025-04-02T10:30:00.000Z",
//     productCategories: ["Argan Oil", "Skincare"],
//     rating: 4.6,
//     salesCount: 87
//   },
//   {
//     id: "7",
//     businessName: "Johannesburg Luxury Spa Supplies",
//     contactName: "Thabo Mbeki",
//     email: "thabo@jburgspa.za",
//     phone: "+27 82 123 4567",
//     location: "Johannesburg, South Africa",
//     registrationDate: "2025-04-08T11:10:00.000Z",
//     status: "approved",
//     verificationDate: "2025-04-15T13:25:00.000Z",
//     productCategories: ["Spa", "Professional", "Luxury"],
//     rating: 4.4,
//     salesCount: 76
//   },
//   {
//     id: "8",
//     businessName: "Thai Botanical Extracts",
//     contactName: "Sunisa Chakri",
//     email: "sunisa@thaibotanical.th",
//     phone: "+66 89 123 4567",
//     location: "Bangkok, Thailand",
//     registrationDate: "2025-04-16T10:00:00.000Z",
//     status: "approved",
//     verificationDate: "2025-04-24T09:15:00.000Z",
//     productCategories: ["Botanical", "Natural", "Organic"],
//     rating: 4.7,
//     salesCount: 92
//   },
//   {
//     id: "9",
//     businessName: "Paris Elegance Cosmetics",
//     contactName: "Camille Dubois",
//     email: "camille@pariselegance.fr",
//     phone: "+33 6 12 34 56 78",
//     location: "Paris, France",
//     registrationDate: "2025-05-02T08:45:00.000Z",
//     status: "approved",
//     verificationDate: "2025-05-10T14:20:00.000Z",
//     productCategories: ["Luxury", "Makeup", "Skincare"],
//     rating: 4.8,
//     salesCount: 104
//   },
//   {
//     id: "10",
//     businessName: "Accra Shea Butter Co.",
//     contactName: "Kwame Nkrumah",
//     email: "kwame@accrashea.gh",
//     phone: "+233 24 123 4567",
//     location: "Accra, Ghana",
//     registrationDate: "2025-05-14T13:30:00.000Z",
//     status: "approved",
//     verificationDate: "2025-05-20T10:15:00.000Z",
//     productCategories: ["Shea Butter", "Body Care"],
//     rating: 4.9,
//     salesCount: 68
//   },
//   {
//     id: "11",
//     businessName: "Mumbai Ayurvedic Treasures",
//     contactName: "Amara Patel",
//     email: "amara@mumbaiayurvedic.in",
//     phone: "+91 99 8765 4321",
//     location: "Mumbai, India",
//     registrationDate: "2025-05-26T11:45:00.000Z",
//     status: "approved",
//     verificationDate: "2025-06-03T09:10:00.000Z",
//     productCategories: ["Ayurvedic", "Natural", "Herbal"],
//     rating: 4.6,
//     salesCount: 81
//   },
//   {
//     id: "12",
//     businessName: "Seoul K-Beauty Exports",
//     contactName: "Ji-Young Kim",
//     email: "jiyoung@seoulkbeauty.kr",
//     phone: "+82 10 1234 5678",
//     location: "Seoul, South Korea",
//     registrationDate: "2025-06-05T09:30:00.000Z",
//     status: "approved",
//     verificationDate: "2025-06-12T08:45:00.000Z",
//     productCategories: ["K-Beauty", "Skincare", "Sheet Masks"],
//     rating: 4.8,
//     salesCount: 150
//   },
//   {
//     id: "13",
//     businessName: "Mombasa Ocean Extracts",
//     contactName: "Fatuma Ali",
//     email: "fatuma@mombasaocean.co.ke",
//     phone: "+254 742 123 456",
//     location: "Mombasa, Kenya",
//     registrationDate: "2025-06-18T14:15:00.000Z",
//     status: "pending",
//     productCategories: ["Marine", "Skincare", "Natural"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "14",
//     businessName: "Zanzibar Spice Beauty",
//     contactName: "Salim Omar",
//     email: "salim@zanzibarspice.tz",
//     phone: "+255 778 123 456",
//     location: "Zanzibar, Tanzania",
//     registrationDate: "2025-06-29T10:20:00.000Z",
//     status: "pending",
//     productCategories: ["Spice Extracts", "Natural", "Fragrance"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "15",
//     businessName: "Oslo Nordic Skincare",
//     contactName: "Astrid Nilsen",
//     email: "astrid@nordiccare.no",
//     phone: "+47 912 34 567",
//     location: "Oslo, Norway",
//     registrationDate: "2025-07-10T09:15:00.000Z",
//     status: "rejected",
//     rejectionReason: "Incomplete documentation",
//     productCategories: ["Nordic", "Cold Climate", "Skincare"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "16",
//     businessName: "Kampala Shea & Cocoa",
//     contactName: "Esther Mukasa",
//     email: "esther@kampalashea.ug",
//     phone: "+256 752 123 456",
//     location: "Kampala, Uganda",
//     registrationDate: "2025-07-22T11:30:00.000Z",
//     status: "approved",
//     verificationDate: "2025-07-30T13:40:00.000Z",
//     productCategories: ["Shea", "Cocoa Butter", "Body Care"],
//     rating: 4.5,
//     salesCount: 37
//   },
//   {
//     id: "17",
//     businessName: "Amazon Rainforest Botanicals",
//     contactName: "Carlos Santos",
//     email: "carlos@amazonbotanicals.br",
//     phone: "+55 11 91234 5678",
//     location: "Manaus, Brazil",
//     registrationDate: "2025-08-03T16:45:00.000Z",
//     status: "approved",
//     verificationDate: "2025-08-10T10:20:00.000Z",
//     productCategories: ["Amazonian", "Natural", "Botanical"],
//     rating: 4.7,
//     salesCount: 25
//   },
//   {
//     id: "18",
//     businessName: "Addis Natural Cosmetics",
//     contactName: "Abebe Bekele",
//     email: "abebe@addisnatural.et",
//     phone: "+251 91 123 4567",
//     location: "Addis Ababa, Ethiopia",
//     registrationDate: "2025-08-15T09:30:00.000Z",
//     status: "pending",
//     productCategories: ["Natural", "Organic", "Traditional"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "19",
//     businessName: "Naivasha Aloe Products",
//     contactName: "Njeri Kamande",
//     email: "njeri@naivashaaloevera.ke",
//     phone: "+254 712 987 654",
//     location: "Naivasha, Kenya",
//     registrationDate: "2025-08-25T13:20:00.000Z",
//     status: "rejected",
//     rejectionReason: "Failed quality standards",
//     productCategories: ["Aloe Vera", "Skincare"],
//     rating: null,
//     salesCount: 0
//   },
//   {
//     id: "20",
//     businessName: "Sydney Eucalyptus Essentials",
//     contactName: "Emma Cooper",
//     email: "emma@eucalyptusessentials.au",
//     phone: "+61 4 1234 5678",
//     location: "Sydney, Australia",
//     registrationDate: "2025-09-05T08:15:00.000Z",
//     status: "pending",
//     productCategories: ["Eucalyptus", "Essential Oils", "Natural"],
//     rating: null,
//     salesCount: 0
//   }
// ];

// // Get pending verification requests
// export const getPendingVerificationRequests = () => {
//   return mockSellers.filter(seller => seller.status === 'pending');
// };

// export default mockSellers;
