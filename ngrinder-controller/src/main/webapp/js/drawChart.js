var formatAmount = function(format, value) {
	if (value < 1024) {
		return value.toFixed(1) + " ";
	} else if (value < 1048576) {
		return (value/1024).toFixed(1) + "K ";
	} else if (value < 1073741824) {
		return (value/1048576).toFixed(1) + "M ";
	} else {
		return (value/1073741824).toFixed(1) + "G ";
	}	
};

var formatPercentage = function(format, value) {
	if (value < 10) {
		return value.toFixed(1) + "% ";
	} else {
		return value.toFixed(0) + "% ";
	}
};

function drawChart(title, containerId, data, formatYaxis, yLabel, startTime, interval) {
	//title, containerId and data is necessary.
	//formatYaxis is the formatter function for y-axis, can be set undefined means don't format.
	//startTime is a Date object.
	//interval is second amount.
	//startTime and interval are optional.
	var values = [ eval(data) ];
	var ymax = 0;
	for (var i = 0;  i < values.length; i++) {
		for (var j = 0;  j < values[i].length; j++) {
			if (values[i][j] > ymax) {
				ymax = values[i][j]; 
			}
		}
	}
	
	if (ymax < 5) {
		ymax = 5;
	}
	
	ymax = parseInt((ymax / 5) + 0.5) * 6;
	
	
	if (formatYaxis === undefined) {
		formatYaxis = function(format, value) {
			return value.toFixed(0);
		};
	}
	
	var plotObj = $.jqplot(containerId, values, {

        gridPadding: {top:15, right:15, bottom:25, left:60},
	
		seriesDefaults : {
			markerRenderer : $.jqplot.MarkerRenderer,
			markerOptions : {
				size : 2.0,
				color : '#555555'
			},
			lineWidth : 1.0
		},
		axes : {
			xaxis : {
				min : 0,
				pad : 0,
				numberTicks : 5,
				tickRenderer : $.jqplot.AxisTickRenderer,
				tickOptions : {
					show : true,
					formatter : function(format, value) {
						if (startTime) {
							if (interval) {
								return new Date(startTime.getTime() + value * interval * 1000).toLocaleString();
							} else {
								return new Date(startTime.getTime() + value * 1000).toLocaleString();
							}
						} else {
							return value.toFixed(0);
						}
					}
				}
			},
			yaxis : {
				tickRenderer : $.jqplot.CanvasAxisTickRenderer,
				labelRenderer : $.jqplot.CanvasAxisLabelRenderer,
				label : yLabel,
				labelOptions : {
					fontFamily : 'Helvetica',
					fontSize : '10pt'
				}, 
				tickOptions : {
					formatter : formatYaxis
				},
				max : ymax,
				min : 0,
				numberTicks : 7,
				pad : 3,
				show : true
			},

		},
		highlighter : {
			show : true,
			sizeAdjust : 3,
			tooltipAxes: 'y',
			formatString: '<table class="jqplot-highlighter"><tr><td>%s</td></tr></table>'
		},
		cursor : {
			showTooltip : false,
			show : true,
			zoom : true
		}
	});

	return plotObj;
}

//data is an array object.
function replotChart(plotObj, data, ymax) {
	var cache = [];
	var i;
	for (i = 0; i < data.length; i++) {
		cache.push([i + 1, data[i]]);
	}

	plotObj.series[0].data = cache;
	var prevFormatter = plotObj.axes.yaxis.tickOptions.formatter;
	plotObj.resetAxesScale(); 
	
	if (ymax < 5) {
		ymax = 5;
	}
	if (cache.length > 10) {
		plotObj.axes.xaxis.numberTicks = 10;
	} else {
		plotObj.axes.xaxis.numberTicks = cache.length;
	}
	ymax = parseInt((ymax / 5) + 0.5) * 6;
	
	plotObj.axes.yaxis.numberTicks = 7;
	plotObj.axes.yaxis.max = ymax;
	
	plotObj.axes.yaxis.min = 0; 
	plotObj.axes.yaxis.tickOptions = {
		show : true,
		formatter : prevFormatter
	};
	plotObj.replot();
}