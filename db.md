# Information Structure

## Adminstratiors - who can manage users
- Superadmin
- OpAdmin
- Camp manager
- Volunteer

## Actors - in general
Types of users

### Doctors
- Title
- Name *
- Qualification
- Specialization *
- Affiliation *> (Hospitals)
- Status *
- Joined *
- Activity >
- Contact info *

### Technicians
- Title
- Name *
- Qualification
- Specialization *
- Affiliation *>
- Status
- Joined
- Activity >
- Contact info *

### Hospitals
- Name
- Location
- Administration name *
- - Administrator info *
- Operational contact *
- - Operational info *
- Facilities available *
- Doctors <*
- Technicians <*

### Organizations
- Name
- Location
- Administration name *
- - Administrator info *
- Operational contact *
- - Operational info *
- Facilities available *
- Volunteers <*

### Volunteers
- Title
- Name *
- Qualification
- Interests *
- Affiliation *>
- Status
- Joined
- Activity >
- Contact info *
- Location


### Donors
- Title
- Type (Org/Ind)
- Name *
- Contact info *
- DonationFor *
- Affiliation *>
- PAN
- Status
- Joined
- Donations >
- Location


### Rotary Clubs
- Name
- Location of meeting place
- RIDistrict
- Administration name *
- - Administrator info *
- Alt contact *
- - Alt info *
- Facilities available *
- Volunteers <*
- Donations >

## Patients
- Title
- Name *
- DOB *
- Category
- Interests *
- Affiliation *>
- Status
- Joined
- Activity >
- Contact info *
- Location *

## Record of activities
### Donation
- Amount 
- Currency
- INRAmount *
- Date *
- Instrument *
- Receipt# *
- Notes 

## Pledges
- Title *
- Name *
- Contact info *
- Location *
- Pledge date *
- Kin name *
- Kin contact *

## Outreach
- Camptype * (eyecare camp, webinar, stall, awareness campaign,...)
- Location
- Doctors <
- Technicians <*
- Volunteers
- Host <Organizations
- Sponsors <Organizations
- CampName
- CampDate
- CampTime
- ServicesAvailable
- Beneficiaries (closed, open)

## FirstDiagnosis
- Camp <*
- DiagnosisDate
- Patient <*
- Complaint
- SymptomNotes
- PreFactors
- UAVRight
- UAVLeft
- Distance
- Sph/Cyl/Axis/V
- Add
- Advice
- MaterialGiven

## Components
### Location
- Address
- Pincode
- LL
- District
- State

### Contact
- Emailid
- Mobile
- WhatsApp


## Seed data

### Specializations
- Cataract Surgery
- Eye replacement
- Cornea
- Lasik

### PatientCategory
- BPL
- Student
- FactoryWorker
- FarmWorker
- OtherProfessional


### Status
- Created
- Active
- Blocked
- Dormant
- Closed

### Facilities available
- Mobile Eyecare Bus
- Mobile Eyecare Equipment
- Cataract operations
- LASIK
- Retinopathy
- Spectacles


### Interests
- OnfieldSupport
- TechSupport
- BuildingAwareness
- FundRaising


## Actions
- Register (each actor)
- Assign (actor to other actors)
- Create (activity record)
- Update / Delete as usual
