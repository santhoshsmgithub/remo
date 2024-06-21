module.exports = {
  routes: [
    // {
    //  method: 'GET',
    //  path: '/dashboard',
    //  handler: 'dashboard.exampleAction',
    //  config: {
    //    policies: [],
    //    middlewares: [],
    //  },
    // },
	{
		method: "GET",
		path: "/dashboard",
		handler: "dashboard.privStats",
		config: {
			policies: [],
			middlewares: [],
		},
	},
  ],
};
