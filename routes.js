const adminRouter = require('./modules/admin/route/adminRoute');

// Primary Routes
exports.routes=[
    {
   
        path : "/api/admin",
        handler : adminRouter,
        schema : 'Admin'
    },
   

]

