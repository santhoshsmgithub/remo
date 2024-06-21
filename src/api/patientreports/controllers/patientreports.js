// module.exports = {
//   async find(ctx) {
  //   const { project, hospitals, startDate, endDate, patientNeed } = ctx.query;
  //   let filters = {};
  //   if (startDate && endDate) {
  //     filters.createdAt = {
  //       $gte: new Date(startDate),
  //       $lte: new Date(endDate)
  //     };
  //   }
  //   const patients = await strapi.entityService.findMany("api::patient.patient", { where: filters });
  //   try {
  //     let patientsWithDetails = await Promise.all(
  //   patients.map(async (patient) => {
  //   const populatedPatient = await strapi.entityService.findOne("api::patient.patient", patient.id, {
  //     populate: ["Photo","diagnoses",
  //     "diagnoses.UVADetails",
  //     "diagnoses.RightEye",
  //     "diagnoses.LeftEye"
  //   ],
  //   });
  //   // return patients who has a diagnosis
  //     if (!populatedPatient) return {};
      
  //     if (!populatedPatient.diagnoses || populatedPatient.diagnoses.length == 0) return {};
      

  //   return {
  //     patient: populatedPatient,

      
  //   };
  //   })
  
  //     );
  //   // remove empty objects from patientsWithDetails
  //     patientsWithDetails = patientsWithDetails.filter(function (el) {
  //       return el != null && el != '' && el != undefined && Object.keys(el).length != 0;
  //     });
    
      

  //   // if populatedPatient.diagnoses.length == 0 then return
  //   // check in treatements for the patient Name
  //   // if treatments.length == 0 then return
  //     if (patientsWithDetails.length == 0) {
  //       ctx.status = 404;
  //       ctx.body = { error: "No patient reports found" };
  //       return;
  //     }
  //     try {
  //       const treatements = await strapi.entityService.findMany("api::treatment.treatment");
  //       // match name with patient name
  //       // if match found then push to patientWithDetails
  //       // if not found then return
  //       if (treatements.length == 0) {
  //         ctx.status = 404;
  //         ctx.body = { error: "No patient reports found" };
  //         return;
  //       }
  //       for (const patient of patientsWithDetails) {
          
  //         for (const treatment of treatements) {
            
  //           if (patient.patient.Name == treatment.Name) {
             
          

  //             patient.treatment = treatment;
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       ctx.status = 500;
  //       ctx.body = { error: "An error occurred while fetching patient reports" };
  //     }
  //     //console.log("patientsWithDetails", patientsWithDetails);
  //     //ctx.body = patientsWithDetails;
  //     console.log("patientsWithDetails", patientsWithDetails);

  //     // Generate the PDF report or perform other operations
  //     // ...

  //     // Return the response
  //     //ctx.body = patientsWithDetails;
  //     const patientsData = await generatePDFContent(patientsWithDetails);
      
  //     ctx.body = patientsData.data;
  //     for (const key in patientsData.headers) {
  //     ctx.set(key, patientsData.headers[key]);
  //   }
      
  //     // ctx.body = await generatePDFContent(patientsWithDetails);
  //   } catch (error) {
  //     console.error(error);
  //     ctx.status = 500;
  //     ctx.body = { error: "An error occurred while fetching patient reports" };
  //   }
  // },

  // Define other actions as needed
   module.exports = {
  async getReports(ctx,next) {
       let { project, hospitals, startDate, endDate, patientNeed } = ctx.query;
       hospitals = JSON.parse(hospitals);
       let hospitalInfo = {};
    let filters = {
      'diagnoses': { id: { $null: false } } // patients must have diagnoses
    };

    // Access control logic
    if (ctx.state.auth.credentials.role.name !== 'Manager') {
      try {
        const userEmail = ctx.state.auth.credentials.email;
        console.log('Fetching patients as', userEmail, 'with a role of [', ctx.state.auth.credentials.role.name, ']');
        const adminHospital = await strapi.entityService.findMany(
          'api::hospital.hospital',
          {
            filters: {
              AdminContactInfo: {
                Email: {
                  $eq: userEmail,
                },
              },
            }
          }
        );

        if (adminHospital && adminHospital.length > 0) {
          filters.hospital = adminHospital[0].id;
        } else {
          // If the user is not an admin of any hospital, return an empty array
          filters.id = {
            $eq: null
          };
          const patientsData = await generatePDFContent([]); // Empty array, as we are returning no data
          ctx.body = patientsData.data;
          for (const key in patientsData.headers) {
            ctx.set(key, patientsData.headers[key]);
          }
          return;
        }
      } catch (error) {
        console.log('Error:', error);
      }
    }

    // Remaining logic to apply filters based on the user's query
       if (startDate && endDate) {
      // // convert date strings to Date objects
      // // start date and end date will be in the form of YYYY-MM-DD
      // // e.g. 2021-07-01
      //    let startDateParts = startDate.split('-');
      //    let endDateParts = endDate.split('-');
      //    startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
         //    endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]);
      //    filters.createdAt = {
      //   $gte: new Date(startDate),
      //   $lte: new Date(endDate)
      // };
         let [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    let startDateObj = new Date(startYear, startMonth - 1, startDay);

    // Convert end date string to Date object at the end of the day
    let [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    let endDateObj = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    filters.createdAt = {
        $gte: startDateObj,
        $lte: endDateObj
    };
         
         
      
    }

    
       
    if (hospitals && !Array.isArray(hospitals)) {
      const hospital = await strapi.entityService.findOne("api::hospital.hospital", hospitals );


      if (hospital) {
        filters.hospital = hospital.id;
      } else {
        ctx.status = 404;
        ctx.body = { error: "No hospital found with the given name" };
        return;
      }
      hospitalInfo = hospital;
    }

    if (patientNeed) {
      filters.Need = patientNeed;
    }
   
    console.log(filters);
      
       const conditions = Object.keys(filters).map(key => ({ [key]: filters[key] }));
       const finalFilters = {
        $and: conditions
      };
       console.log(finalFilters);

    let patients = await strapi.entityService.findMany("api::patient.patient", { 
      filters:  finalFilters  , 
      populate: [
        // "Photo",
        "diagnoses",
        "diagnoses.UVADetails",
        "diagnoses.RightEye",
        "diagnoses.LeftEye",
        "treatments",
        "treatments.Photo",
        "hospital",
      ] 
    });
       console.log("patients", patients.length);
       console.log("patients", JSON.stringify(patients));
       if(Array.isArray(hospitals)) {
        const hospitalIDs = hospitals.map(hospital => hospital.value);
          patients = patients.filter(patient => {
            return patient?.hospital?.id && hospitalIDs.includes(patient.hospital.id)
          });
       }

    const treatments = await strapi.entityService.findMany("api::treatment.treatment");

    // Loop through each patient and find matching treatments by name
    const patientsWithDetails = patients.filter(patient => {
      if (!(patient.diagnoses && patient.diagnoses.length > 0)) return false;

      const matchingTreatment = treatments.find(treatment => treatment.Name === patient.Name);

      if (matchingTreatment) {
        patient.treatment = matchingTreatment;
        return true;
      }
      
      return false;
    });

    if (patientsWithDetails.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "No patient reports found" };
      return;
    }
       console.log("patientDetails", JSON.stringify(patientsWithDetails));
       console.log("hospitalInfo", JSON.stringify(hospitalInfo));

    const patientsData = await generatePDFContent(patientsWithDetails,hospitalInfo);
    ctx.body = patientsData.data;
    for (const key in patientsData.headers) {
      ctx.set(key, patientsData.headers[key]);
    }
  },
};




// Function to generate the PDF content

// Function to generate the PDF content

// var rowheadings = ['SI No', 'Date of Admission', 'Date of Surgery', 'Date of Discharge', 'Patient Name', 'Gender', 'Age', 'Id No.', 'Address', 'PreOperation (VA)RE:EYE', 'PreOperation (VA)LE:EYE', 'Diagnosis', 'Type of Surgery', 'Operated Eye', 'Post Operation', 'Photo']
var rowheadings = ['SI No', 'Date of Admission', 'Date of Surgery', 'Patient Name', 'Gender', 'Age', 'Id No.', 'Address', 'PreOperation (VA)RE:EYE', 'PreOperation (VA)LE:EYE', 'Diagnosis', 'Type of Surgery', 'Operated Eye', 'Hospital Name', 'Photo']
var patientsData = [
    {
        "patient": {
            "id": 21,
            "Title": null,
            "Name": "Geeta Devi",
            "DateOfBirth": null,
            "Gender": "F",
            "Address": "Hebbal, Bangalore",
            "Age": 72,
            "Notes": null,
            "JoinedOn": null,
            "createdAt": "2023-03-01T10:52:36.474Z",
            "updatedAt": "2023-06-25T07:41:04.633Z",
            "publishedAt": "2023-03-01T10:52:36.424Z",
            "Need": "Cataract",
            "photo": 'https://imgtr.ee/images/2023/07/10/3290b06ae5d22a1aff04ed458b282fcb.jpeg',
            "diagnoses": [{
                "id": 10,
                "Date": "2023-07-10",
                "Symptom": "Blurred Vision",
                "PrelimNotes": "Surgery",
                "UAVRight": '6/36 ph 6/18 p',
                "UAVLeft": '6/24 ph nil',
                "Advice": "Surgery",
                "Outcome": "Surgery recommended",
                "MaterialProvided": null,
                "ExistingFactors": "Diabetes",
                "createdAt": "2023-07-09T23:59:02.960Z",
                "updatedAt": "2023-07-09T23:59:02.960Z",
                "publishedAt": "2023-07-09T23:59:02.946Z"
            }]
        },
        "treatment": {
            "id": 4,
            "Name": "SHIVAKUMAR",
            "Description": "PRP LASER",
            "Cost": 800,
            "TreatmentDate": "2023-03-02",
            "HospitalReference": "95440",
            "createdAt": "2023-03-02T04:02:20.351Z",
            "updatedAt": "2023-03-02T04:02:20.351Z",
            "publishedAt": "2023-03-02T04:02:20.349Z"
        }
    }, {
        "patient": {
            "id": 24,
            "Title": null,
            "Name": "RAJALAKSHMI",
            "DateOfBirth": null,
            "Gender": "F",
            "Address": "Jakkur, Bangalore",
            "Age": 81,
            "Notes": null,
            "JoinedOn": null,
            "createdAt": "2023-03-01T10:55:22.117Z",
            "updatedAt": "2023-03-03T09:15:20.092Z",
            "publishedAt": "2023-03-01T10:55:22.074Z",
            "Need": "Cataract",
            "photo": 'https://imgtr.ee/images/2023/07/10/caec9a2c51d809d20cec7ced4b035bd5.jpeg',
            "diagnoses": [{
                "id": 11,
                "Date": "2023-07-10",
                "Symptom": "blurred vision",
                "PrelimNotes": "Cataract",
                "UAVRight": '6/36 ph 6/18 p',
                "UAVLeft": '6/24 ph nil',
                "Advice": "Surgery after three months",
                "Outcome": "Medicines provided",
                "MaterialProvided": null,
                "ExistingFactors": "Renal disease",
                "createdAt": "2023-07-10T00:08:32.862Z",
                "updatedAt": "2023-07-10T00:08:32.862Z",
                "publishedAt": "2023-07-10T00:08:32.854Z"
            }]
        },
        "treatment": {
            "id": 7,
            "Name": "RAJALAKSHMI",
            "Description": "Anti-VEGF",
            "Cost": 5000,
            "TreatmentDate": "2023-03-02",
            "HospitalReference": "95526",
            "createdAt": "2023-03-02T04:06:22.115Z",
            "updatedAt": "2023-03-02T04:06:22.115Z",
            "publishedAt": "2023-03-02T04:06:22.113Z"
        }
    }, {
        "patient": {
            "id": 28,
            "Title": null,
            "Name": "RAJKUMAR",
            "DateOfBirth": null,
            "Gender": "M",
            "Address": "Yehalanka, Bangalore",
            "Age": 78,
            "Notes": null,
            "JoinedOn": null,
            "createdAt": "2023-03-01T10:55:22.117Z",
            "updatedAt": "2023-03-03T09:15:20.092Z",
            "publishedAt": "2023-03-01T10:55:22.074Z",
            "Need": "Cataract",
            "photo": 'https://imgtr.ee/images/2023/07/10/76f2b3f8b393944833a49770928d9725.jpeg',
            "diagnoses": [{
                "id": 11,
                "Date": "2023-07-10",
                "Symptom": "blurred vision",
                "PrelimNotes": "Cataract",
                "UAVRight": '6/36 ph 6/18 p',
                "UAVLeft": '6/24 ph nil',
                "Advice": "Surgery after three months",
                "Outcome": "Medicines provided",
                "MaterialProvided": null,
                "ExistingFactors": "Renal disease",
                "createdAt": "2023-07-10T00:08:32.862Z",
                "updatedAt": "2023-07-10T00:08:32.862Z",
                "publishedAt": "2023-07-10T00:08:32.854Z"
            }]
        },
        "treatment": {
            "id": 31,
            "Name": "RAJALAKSHMI",
            "Description": "Anti-VEGF",
            "Cost": 5000,
            "TreatmentDate": "2023-03-02",
            "HospitalReference": "95526",
            "createdAt": "2023-03-02T04:06:22.115Z",
            "updatedAt": "2023-03-02T04:06:22.115Z",
            "publishedAt": "2023-03-02T04:06:22.113Z"
        }
    }, {
        "patient": {
            "id": 31,
            "Title": null,
            "Name": "ANTAMMA",
            "DateOfBirth": null,
            "Gender": "F",
            "Address": "Yehalanka New Town, Bangalore",
            "Age": 81,
            "Notes": null,
            "JoinedOn": null,
            "createdAt": "2023-03-01T10:55:22.117Z",
            "updatedAt": "2023-03-03T09:15:20.092Z",
            "publishedAt": "2023-03-01T10:55:22.074Z",
            "Need": "Cataract",
            "photo": 'https://imgtr.ee/images/2023/07/10/96bd0e46c49496959c42de9409fe8074.jpeg',
            "diagnoses": [{
                "id": 11,
                "Date": "2023-07-10",
                "Symptom": "blurred vision",
                "PrelimNotes": "Cataract",
                "UAVRight": '6/36 ph 6/18 p',
                "UAVLeft": '6/24 ph nil',
                "Advice": "Surgery after three months",
                "Outcome": "Medicines provided",
                "MaterialProvided": null,
                "ExistingFactors": "Renal disease",
                "createdAt": "2023-07-10T00:08:32.862Z",
                "updatedAt": "2023-07-10T00:08:32.862Z",
                "publishedAt": "2023-07-10T00:08:32.854Z"
            }]
        },
        "treatment": {
            "id": 7,
            "Name": "RAJALAKSHMI",
            "Description": "Anti-VEGF",
            "Cost": 5000,
            "TreatmentDate": "2023-03-02",
            "HospitalReference": "95526",
            "createdAt": "2023-03-02T04:06:22.115Z",
            "updatedAt": "2023-03-02T04:06:22.115Z",
            "publishedAt": "2023-03-02T04:06:22.113Z"
        }
    }, {
        "patient": {
            "id": 33,
            "Title": null,
            "Name": "BABU KUMAR",
            "DateOfBirth": null,
            "Gender": "M",
            "Address": "Shivaji Nagar, Bangalore",
            "Age": 83,
            "Notes": null,
            "JoinedOn": null,
            "createdAt": "2023-03-01T10:55:22.117Z",
            "updatedAt": "2023-03-03T09:15:20.092Z",
            "publishedAt": "2023-03-01T10:55:22.074Z",
            "Need": "Cataract",
            "photo": 'https://imgtr.ee/images/2023/07/10/9dd3294e122c98fc0811c386991f7581.jpeg',
            "diagnoses": [{
                "id": 11,
                "Date": "2023-07-10",
                "Symptom": "blurred vision",
                "PrelimNotes": "Cataract",
                "UAVRight": '6/36 ph 6/18 p',
                "UAVLeft": '6/24 ph nil',
                "Advice": "Surgery after three months",
                "Outcome": "Medicines provided",
                "MaterialProvided": null,
                "ExistingFactors": "Renal disease",
                "createdAt": "2023-07-10T00:08:32.862Z",
                "updatedAt": "2023-07-10T00:08:32.862Z",
                "publishedAt": "2023-07-10T00:08:32.854Z"
            }]
        },
        "treatment": {
            "id": 7,
            "Name": "RAJALAKSHMI",
            "Description": "Anti-VEGF",
            "Cost": 5000,
            "TreatmentDate": "2023-03-02",
            "HospitalReference": "95526",
            "createdAt": "2023-03-02T04:06:22.115Z",
            "updatedAt": "2023-03-02T04:06:22.115Z",
            "publishedAt": "2023-03-02T04:06:22.113Z"
        }
    }
]





var options = {
  childProcessOptions: {
    env: {
      OPENSSL_CONF: '/dev/null',
    }
  },
    format: "A1",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "5mm",
        contents: '<div style="text-align: center;"></div>'
    },
    footer: {
        height: "5mm",
        contents: {
            first: '',
            2: 'Second page', // Any page number is working. 1-based index
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: 'Last Page'
        }
    }
};

const filename = 'report.pdf';

async function generateReport(patientdata, rowheadings, hospitalInfo, filename) {
  var pdf = require("pdf-creator-node");
  const fs = require("fs");
  const path = require("path");
  const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace(/[-:T]/g, "");
    const pdfFilePath = path.join("reports", `report_${formattedDate}.pdf`);

   var html = fs.readFileSync("reportTemplate.html", "utf8");
    const document = {
        html: html,
        data: {
            rowheadings: rowheadings,
            patientdata: patientdata,
            hospitalData: hospitalInfo
        },
        path: pdfFilePath,
        type: "",
    };
    
    return new Promise((resolve, reject) => {
        options.footer.contents.last = `<span style="color: #444;">Report</span>`
        pdf.create(document, options)
            .then((res) => {
                console.log(res);
                resolve(pdfFilePath);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

async function generatePDFContent(patientsWithDetails,hospitalInfo) {
  const fs = require("fs");
  const path = require("path");
  // {
  //       "patient": {
  //           "id": 33,
  //           "Title": null,
  //           "Name": "BABU KUMAR",
  //           "DateOfBirth": null,
  //           "Gender": "M",
  //           "Address": "Shivaji Nagar, Bangalore",
  //           "Age": 83,
  //           "Notes": null,
  //           "JoinedOn": null,
  //           "createdAt": "2023-03-01T10:55:22.117Z",
  //           "updatedAt": "2023-03-03T09:15:20.092Z",
  //           "publishedAt": "2023-03-01T10:55:22.074Z",
  //           "Need": "Cataract",
  //           "photo": 'https://imgtr.ee/images/2023/07/10/9dd3294e122c98fc0811c386991f7581.jpeg',
  //           "diagnoses": [{
  //               "id": 11,
  //               "Date": "2023-07-10",
  //               "Symptom": "blurred vision",
  //               "PrelimNotes": "Cataract",
  //               "UAVRight": '6/36 ph 6/18 p',
  //               "UAVLeft": '6/24 ph nil',
  //               "Advice": "Surgery after three months",
  //               "Outcome": "Medicines provided",
  //               "MaterialProvided": null,
  //               "ExistingFactors": "Renal disease",
  //               "createdAt": "2023-07-10T00:08:32.862Z",
  //               "updatedAt": "2023-07-10T00:08:32.862Z",
  //               "publishedAt": "2023-07-10T00:08:32.854Z"
  //           }]
  //       },
  //       "treatment": {
  //           "id": 7,
  //           "Name": "RAJALAKSHMI",
  //           "Description": "Anti-VEGF",
  //           "Cost": 5000,
  //           "TreatmentDate": "2023-03-02",
  //           "HospitalReference": "95526",
  //           "createdAt": "2023-03-02T04:06:22.115Z",
  //           "updatedAt": "2023-03-02T04:06:22.115Z",
  //           "publishedAt": "2023-03-02T04:06:22.113Z"
  //       }
  //   }
  
  const content = [];
  let index = 1

  for (const patientDetails of patientsWithDetails) {
    // const { patient, treatment } = patientDetails;
    const { treatment } = patientDetails;
    const patient = patientDetails;
    let patientInfo = {};
    let patientData = {};
    console.log(JSON.stringify(patientDetails),JSON.stringify(patient.diagnoses[0]));
    patientInfo.slno = index++;
    patientInfo.date = patient.diagnoses[0].Date;
    patientInfo.surgeryDate = treatment.TreatmentDate;
    patientInfo.name = patient.Name;
    patientInfo.gender = patient.Gender;
    if (!patient.Age) {
      // calculate age from date of birth
      if (!patient.DateOfBirth) {
        patientInfo.age = 0;
      }
      else {
      const today = new Date();
      const birthDate = new Date(patient.DateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      patientInfo.age = age;
      }
    }
    else {
      patientInfo.age = patient.Age;
    }
    

    patientInfo.id = patient.id;
    patientInfo.address = patient.Address;
    if (patient.diagnoses[0].RightEye && patient.diagnoses[0].RightEye.VA) {
      patientInfo.preopre = patient.diagnoses[0].RightEye.VA;
    }
    else {
      patientInfo.preopre = '';
    }
    if (patient.diagnoses[0].LeftEye && patient.diagnoses[0].LeftEye.VA) {
      patientInfo.preople = patient.diagnoses[0].LeftEye.VA;
    }
    else {
      patientInfo.preople = '';
    }
    if (patient.diagnoses[0].Advice) {
      patientInfo.advice = patient.diagnoses[0].Advice;
    }
    else {
      patientInfo.advice = '';
    }
    if (patient.diagnoses[0].Outcome) {
      patientInfo.outcome = patient.diagnoses[0].Outcome;
    }
    else {
      patientInfo.outcome = '';
    }
    patientInfo.need = patient.Need;
    
    patientInfo.hospital = patient?.hospital?.Name ?? '';
    // if (patient.Photo && patient.Photo.url) {
    //   // patientData.photo = strapi.config.get('server.url') + patient.Photo.url;
    //   patientData.photo = strapi.config.get('server.strapilocalurl') + patient.Photo.url;
      
    // }
    // take from treatments
    let photo = null;
    if (patient.treatments[0] && patient.treatments[0].Photo) {
      photo = patient.treatments[0].Photo;
    }

    console.log("photo", photo);

    
    // check for photo.url or phot.formats.thumbnail
    if (photo && photo.url) {
      patientData.photo = strapi.config.get('server.strapilocalurl') + photo.url;
    }
    else if (photo && photo.formats && photo.formats.thumbnail && photo.formats.thumbnail.url) {
    patientData.photo = strapi.config.get('server.strapilocalurl') + photo.formats.thumbnail.url;
    } 
    patientData.data = patientInfo;
    
    
    content.push(patientData);
  }
  
 
  console.log("content", JSON.stringify(content));
  console.log("hospital info", JSON.stringify(hospitalInfo));
  const pdfFilePath = await generateReport(content, rowheadings, hospitalInfo, filename); 
  
  const pdfContentBuffer = fs.readFileSync(pdfFilePath);
  
  // Convert the buffer to a blob
  // const pdfContentBlob = new Blob([pdfContentBuffer], { type: "application/pdf" });
  
  
  const actualFilename = path.basename(pdfFilePath);

  return {
    data: pdfContentBuffer,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${actualFilename}"`,
    },
  };
  
}
