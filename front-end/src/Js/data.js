import Thumbnail1 from '../assets/flag1.jpg'
import Thumbnail2 from '../assets/flag2.jpg'
import Thumbnail3 from '../assets/flag3.png'
import Candidate1 from '../assets/candidate1.jpg'
import Candidate2 from '../assets/candidate2.jpg'
import Candidate3 from '../assets/candidate3.jpg'
import Candidate4 from '../assets/candidate4.jpg'
import Candidate5 from '../assets/candidate5.jpg'
import Candidate6 from '../assets/candidate6.jpg'
import Candidate7 from '../assets/candidate7.jpg'

export const elections = [
  {
    "name": "Arba Minch University",
    "code": "AMU",
    "email": "admin@amu.edu.et",
    "phone": "+251912345678",
    "address": "Arba Minch, Ethiopia",
    "about": "Arba Minch University is a premier higher education institution in Ethiopia, known for its excellence in engineering, computing, and natural sciences. Established to provide quality education and research opportunities."
  }
  ,
  {
    "name": "Addis Ababa University",
    "code": "AAU",
    "email": "admin@aau.edu.et",
    "phone": "+251911223344",
    "address": "Addis Ababa, Ethiopia",
    "about": "Addis Ababa University is the oldest and largest higher learning institution in Ethiopia, offering diverse programs across multiple campuses."
  }
  
  ,
  //++++++++ELECTION+++++++++++++++++
  {
    "title": "Student Council Election 2025",
    "description": "Annual student council election to select student representatives for the 2025 academic year. All registered students are eligible to vote.",
    "registrationStart": "2025-01-15T00:00:00",
    "registrationEnd": "2025-02-15T23:59:59",
    "nominationStart": "2025-02-16T00:00:00",
    "nominationEnd": "2025-02-28T23:59:59",
    "votingStart": "2025-03-10T00:00:00",
    "votingEnd": "2025-03-15T23:59:59",
    "resultPublicationDate": "2025-03-20",
    "positions": [
      {
        "positionName": "Student Council President",
        "positionDescription": "Lead the student council, represent student interests to university administration",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 5
      },
      {
        "positionName": "Vice President",
        "positionDescription": "Assist the president and oversee academic affairs committee",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 5
      },
      {
        "positionName": "Academic Affairs Representative",
        "positionDescription": "Represent students on academic matters and curriculum issues",
        "electionType": "multiple_winners",
        "totalSeats": 3,
        "maxCandidates": 10,
        "maxSelections": 3
      }
    ]
  },
  {
    "title": "Faculty of Computing Department Election 2025",
    "description": "Election for department-level student representatives in the Faculty of Computing.",
    "registrationStart": "2025-02-01T00:00:00",
    "registrationEnd": "2025-02-20T23:59:59",
    "nominationStart": "2025-02-21T00:00:00",
    "nominationEnd": "2025-03-05T23:59:59",
    "votingStart": "2025-03-20T00:00:00",
    "votingEnd": "2025-03-25T23:59:59",
    "resultPublicationDate": "2025-03-30",
    "positions": [
      {
        "positionName": "Department Head Representative",
        "positionDescription": "Liaison between students and department head",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 4
      },
      {
        "positionName": "Year Representatives",
        "positionDescription": "Represent each academic year",
        "electionType": "ranked",
        "totalSeats": 4,
        "maxRankings": 4,
        "roleAllocations": [
          { "rank": 1, "roleName": "1st Year Representative" },
          { "rank": 2, "roleName": "2nd Year Representative" },
          { "rank": 3, "roleName": "3rd Year Representative" },
          { "rank": 4, "roleName": "4th Year Representative" }
        ]
      }
    ]
  },
  
  {
    "title": "Staff Association Executive Committee Election",
    "description": "Election for staff association executive committee members. All permanent staff members are eligible.",
    "registrationStart": "2025-03-01T00:00:00",
    "registrationEnd": "2025-03-15T23:59:59",
    "nominationStart": "2025-03-16T00:00:00",
    "nominationEnd": "2025-03-25T23:59:59",
    "votingStart": "2025-04-05T00:00:00",
    "votingEnd": "2025-04-10T23:59:59",
    "resultPublicationDate": "2025-04-15",
    "positions": [
      {
        "positionName": "Chairperson",
        "positionDescription": "Lead staff association meetings and represent staff interests",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 3
      },
      {
        "positionName": "Secretary",
        "positionDescription": "Manage association records and communications",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 3
      },
      {
        "positionName": "Treasurer",
        "positionDescription": "Manage association finances",
        "electionType": "single_winner",
        "totalSeats": 1,
        "maxCandidates": 3
      }
    ]
  }
  ,
  //+++++++++++ NOMINATION++++++++++++++
  {
    "electionId": "ELECTION_ID_1",
    "positionId": "POS-12345-1",
    "candidateInfo": {
      "firstName": "Alemu",
      "lastName": "Tadesse",
      "email": "alemu.tadesse@amu.edu.et",
      "phone": "+251912345679",
      "studentId": "AMU/001/22"
    },
    "campaignDetails": {
      "manifesto": "My vision for the student council focuses on three key areas: academic excellence through peer tutoring programs, student welfare through improved cafeteria services, and campus development through green initiatives. I will create a platform where every student's voice is heard. I have served as class representative for two years and led multiple successful student initiatives. Together we can make our university better.",
      "biography": "I am a 3rd year Computer Science student with a passion for leadership. I have organized tech workshops, led study groups, and served as class representative. My experience includes coordinating with administration on student issues and managing student projects.",
      "slogan": "Your Voice, Our Action!",
      "campaignColor": "#D23A01"
    },
    "declarations": {
      "codeOfConduct": true,
      "spendingLimit": true,
      "truthfulness": true
    },
    "campaignPhoto": "alemu-profile.jpg",
    "supportingDocuments": [
      "student-id-scan.pdf",
      "letter-of-intent.pdf",
      "gpa-certificate.pdf"
    ]
  }
  ,
  {
    "electionId": "ELECTION_ID_1",
    "positionId": "POS-12345-2",
    "candidateInfo": {
      "firstName": "Meron",
      "lastName": "Assefa",
      "email": "meron.assefa@amu.edu.et",
      "phone": "+251913456789",
      "studentId": "AMU/089/23"
    },
    "campaignDetails": {
      "manifesto": "My priority is academic support and student mental health. I will establish peer mentoring programs, create mental health awareness campaigns, and ensure smooth communication between students and faculty. I have experience in student leadership having led the IT club successfully.",
      "biography": "2nd year Software Engineering student. Currently IT club president. Organized university's first hackathon. Passionate about student welfare and innovative solutions to campus challenges.",
      "slogan": "Empowering Students, Building Futures!",
      "campaignColor": "#2563EB"
    },
    "declarations": {
      "codeOfConduct": true,
      "spendingLimit": true,
      "truthfulness": true
    },
    "campaignPhoto": "meron-profile.jpg",
    "supportingDocuments": [
      "student-id.pdf",
      "club-leadership-certificate.pdf"
    ]
  }
  ,
  {
    "electionId": "ELECTION_ID_1",
    "positionId": "POS-12345-3",
    "candidateInfo": {
      "firstName": "Dawit",
      "lastName": "Mekonnen",
      "email": "dawit.mekonnen@amu.edu.et",
      "phone": "+251922334455",
      "studentId": "AMU/045/22"
    },
    "campaignDetails": {
      "manifesto": "I am committed to improving academic resources, establishing study groups, and creating a feedback system for course evaluation. My plan includes digital resource sharing platforms and regular academic workshops. I believe in data-driven decision making for academic improvements.",
      "biography": "4th year Computer Science student with academic excellence record (GPA 3.8/4.0). Teaching assistant for programming courses. Academic peer tutor. Believes in collaborative learning and student success.",
      "slogan": "Academic Excellence for All!",
      "campaignColor": "#10B981"
    },
    "declarations": {
      "codeOfConduct": true,
      "spendingLimit": true,
      "truthfulness": true
    },
    "campaignPhoto": "dawit-profile.jpg",
    "supportingDocuments": [
      "transcript.pdf",
      "recommendation-letter.pdf"
    ]
  }
  ,
  {
    "electionId": "ELECTION_ID_2",
    "positionId": "POS-67890-2",
    "candidateInfo": {
      "firstName": "Hanna",
      "lastName": "Gebremariam",
      "email": "hanna.gebre@amu.edu.et",
      "phone": "+251934567890",
      "studentId": "AMU/123/24"
    },
    "campaignDetails": {
      "manifesto": "As a 2nd year student, I understand the challenges we face. My focus is on creating better lab access hours, organizing department events, and bridging communication gaps between students and professors. I will start a weekly feedback session and create a department newsletter.",
      "biography": "2nd year Computer Science student. Class representative for 2 semesters. Organized department social events. Strong communication and organizational skills.",
      "slogan": "Your Voice in Every Decision!",
      "campaignColor": "#8B5CF6"
    },
    "declarations": {
      "codeOfConduct": true,
      "spendingLimit": true,
      "truthfulness": true
    },
    "campaignPhoto": "hanna-profile.jpg",
    "supportingDocuments": [
      "student-id.pdf",
      "recommendation.pdf"
    ]
  }
  
  
  
  
]

