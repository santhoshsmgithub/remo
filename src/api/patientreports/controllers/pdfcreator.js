var pdf = require("pdf-creator-node");
var fs = require("fs");

// Read HTML Template
var html = fs.readFileSync("./reportTemplate.html", "utf8");

var rowheadings = ['Date', 'BC1/20mm', 'BC2/30mm', 'BC3/20mm', 'BC4/20mm', 'BC5/20mm']
var beltdata = [
    {
        data: ['20/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['21/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['22/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['23/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['24/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['25/09/2022', 45465, 63634, 56456, 4654, 4654]
    },
    {
        data: ['Total', 45465, 63634, 56456, 4654, 4654]
    }
]
var plantInfo = {
    name: "",
    startDate: "20/09/2022",
    endDate: "25/09/2022"
}

var options = {
    format: "A3",
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

async function generatePatientReport({ data }) {
    const document = {
        html: html,
        data: {
            rowheadings: data.rowheadings,

            patientInfo: data.patientInfo,
        },
        path: `${data.filename}`,
        type: "",
    };
    return new Promise((resolve, reject) => {
        options.footer.contents.last = `<span style="color: #444;">${data.plantInfo.beltId}</span>`
        pdf.create(document, options)
            .then((res) => {
                console.log(res);
                resolve(res);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

module.exports = {
    generatePatientReport
}