module.exports = {
  routes: [
  {
    method: 'GET',
    path: '/patientreports',
      handler: 'patientreports.getReports',
      config: {
			policies: [],
			middlewares: [],
		},
      
      
    },

],
}
