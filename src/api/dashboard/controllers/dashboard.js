'use strict';

/**
 * A set of functions called "actions" for `dashboard`
 */

//module.exports = {
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }
//};

module.exports = {
		async privStats(ctx, next) {
		// console.log("In controller");
		//console.log(ctx);
		try {
			let filters = {};

    // If the user role is not 'Manager', apply specific filters
			if(ctx.state.auth.credentials.role.name !== 'Manager') {
				const userEmail = ctx.state.auth.credentials.email;

				// Fetch the hospital name that the user administers
				const adminHospital = await strapi.entityService.findMany(
					'api::hospital.hospital',
					{
						filters: {
              AdminContactInfo: {
                Email: {
                  $eq: userEmail,
                },
              },
            },
					}
				);

				// Filter patients by the hospital name that the user administers
				if (adminHospital && adminHospital.length > 0) {
					filters = {
						hospital :{
							Name: {
							$eq: adminHospital[0].Name,
					},
				}
					};
				} else {
					// If the user is not an admin of any hospital, return no patients
					filters = {
						id: {
							$eq: null,
						},
					};
				}
			}
			

			console.log(filters);
		const entries = await strapi.entityService.findMany(
		"api::patient.patient",
			{
			filters,
		  fields: ["id", "Name", ],
		  populate: {
			hospital: {
			  fields: ["Name"],
			},
			surgery_fund: {
			  fields: ["Name"],
			},
			treatments: {
				fields: ['*']
			},
		  },
		}
		);

		console.log("entries:", entries.length);

		let hospitalStats = {}
		let projectStats = {}
		// let hCount = 0;
		// let fCount = 0;

		entries.forEach( (patient) => {

			let hospital  = patient.hospital?.Name || "unassigned";
			hospitalStats[hospital] = hospitalStats[hospital]?hospitalStats[hospital]+1:1;
			
			let project  = patient.surgery_fund?.Name || "unassigned";
			projectStats[project] = projectStats[project]?projectStats[project]+1:1;

		});

		let hospitalList = [];
		Object.entries(hospitalStats).map( ([key, value]) => {
			hospitalList.push ({
				name: key,
				count: value
			});
			}
		);
		
		let projectList = [];
		Object.entries(projectStats).map( ([key, value]) => {
			projectList.push ({
				name: key,
				count: value
			});
			}
		);

		let dashdata = {
			patientCount: entries.length,
			hospitalCount: Object.keys(hospitalStats).length,
			fundCount: Object.keys(projectStats).length,
			hospitalList: hospitalList,
			projectList: projectList,
		}


		ctx.body = dashdata;
		} catch (err) {
		  console.log("Err in controller", err);
		  ctx.badRequest("Dashboad privStats controller error", { moreDetails: err });
		}
		},
};

