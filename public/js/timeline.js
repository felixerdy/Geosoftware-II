"use strict"

var plot = $("#flotplaceholder").plot( [ [[0, 0], [1, 1]] ],
    { yaxis: { max: 1 },
        zoom: {
            interactive: true},
        pan: {
            interactive: true
        },series: {
        lines: {
            show: true
        },
        points: {
            show: true
        }
    } }).data("plot");