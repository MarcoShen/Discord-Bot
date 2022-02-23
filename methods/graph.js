const QuickChart = require('quickchart-js');
const axios = require ('axios');
const { Colour } = require('osu-bpdpc');

let methods = {};


methods.getOsuRank = function(rankData) {
    const chart = new QuickChart();

    chart.setWidth(500)
    chart.setHeight(150);
    chart.setBackgroundColor('rgb(47, 49, 54)')


    chart.setConfig({
    type: 'line',
    data: {
        labels: ['89d','','','','','','','','','','','','','','','','','','','','','','','','','','','','','60','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','30','','','','','','','','','','','','','','','','','','','','','','','','','','','','','Today'],
        datasets: [
        {
            backgroundColor: 'rgb(255, 255, 132)',
            height: 100,
            borderColor: 'rgb(255, 255, 132)',
            borderWidth: 2,
            pointRadius: 0,
            data: rankData,
            fill: false,
        },
        ],
    },
    options: {
        title: {
            display: false,
        },
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false,
                },
                ticks: {
                    fontSize: 10,
                    fontColor: "rgba(255, 255, 255, 0.8)"
                },
            }],
            yAxes: [{
                gridLines: {
                  display: true,
                  color: "rgba(255, 255, 255, 0.1)"
                },
                ticks: {
                    beginAtZero: false,
                    reverse: true,
                },
                position: 'right',
              }]
        
        },
    }
    });

    // Print the chart URL]

    return axios.post('https://quickchart.io/chart/create',chart).then(data => data.data.url)
}


exports.methods = methods