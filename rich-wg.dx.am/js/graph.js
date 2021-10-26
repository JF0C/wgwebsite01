function showKarmaGraph(){
    setPage('2.4');
    $('#title-bar-right').html("");
    $('#title-bar-left').html("");
    $('#title-bar-center').html('Karma');
    addBackNavigator(showKarmaDetails);
    whitenIfDark();
    $('#main-frame').html('<svg class="graph-container" id="karma-graph"></svg>');

    karmaHistory.sort((a, b) => parseFloat(a['Date']) - parseFloat(b['Date']));
    let userGraphData = [];
    for(let u of getKarmaUsers()){
        userGraphData.push(
            karmaHistory.filter(e => e['UserId'] == u['Id'])
            .map(e => {
                if(e['KarmaTaskId'] != "-1"){
                    return {
                        'time': e['Date'],
                        'value': karmaTasks.find(t => t['Id'] == e['KarmaTaskId'])['Karma']
                    }
                }
                else return{
                    'time': e['Date'],
                    'value': e['Amount']
                }
            })
        );
    }

    let maxval = 0;
    let mintime = parseFloat(userGraphData[0][0]['time']);
    let maxtime = new Date().valueOf();
    for(let k in userGraphData){
        let list = userGraphData[k];
        let last = 0;
        for(let l in list){
            let num = parseFloat(list[l]['value']);
            last = num + last;
            list[l]['value'] = last;
            let time = parseFloat(list[l]['time']);
            if(last > maxval) maxval = last;
            if(time < mintime) mintime = time;
        }
        userGraphData[k] = list;
    }
    for(let k in userGraphData){
        let list = userGraphData[k];
        list.unshift({'time': ""+mintime, 'value': 0});
        let last = list[list.length-1];
        let final = {'time': ""+maxtime, 'value': last['value']};
        list.push(final);
        userGraphData[k] = list;
    }
    let colors = ['blue', 'red', 'lightgreen', 'cyan', 'cornsilk', 'deeppink', 'rosybrown'];

    let svg = d3.select('#karma-graph');
    let h = parseInt(svg.style('height'));
    let w = parseInt(svg.style('width'));
    let yscale = d3.scaleLinear().domain([maxval, 0]).range([0, 0.85*h]);
    let xscale = d3.scaleLinear().domain([mintime, maxtime]).range([0, 0.85*w]);
    let strokeNormal = 2;
    let strokeHighlight = 4;
    userGraphData.forEach((list, index) =>{
        let line = d3.line()
            .x(d => xscale(d['time']))
            .y(d => yscale(d['value']));
            //.curve(d3.curveCatmullRom.alpha(0.5));
        
        svg.append('path')
            .datum(list)
            .attr('fill', 'none')
            .attr('stroke', colors[index])
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', strokeNormal)
            .attr('transform', 'translate(' + (0.1*w) + ', ' + (0.05*h) + ')')
            .attr('d', line)
            .attr('id', 'usergraph-' + index)
            .attr('class', 'usergraph');

        $('#main-frame').append('<div class="list-element legend-element" user="' + index + '">'+
                '<div class="group-title legend-title" style="width:60%">' + getKarmaUsers()[index]['Name'] + '</div>' +
                '<div class="legend-line" style="background:' + colors[index] + '; float:right; width:10%; height:22px; border-radius:10px;"></div>' +
                '<div class="list-element-toggle" style="margin-right:5px;"><div class="list-element-toggle-indicator active"></div></div>' +
            '</div>');
    });
    $('.list-element-toggle').click((e) =>{
        let t = $(e.target);
        while(!t.hasClass('list-element-toggle')) t = $(t.parent());
        let indi = $(t.find('.list-element-toggle-indicator'));
        let le = $(t).parent();
        while(!le.hasClass('legend-element')) le = $(le.parent());
        if(indi.hasClass('active')){
            indi.removeClass('active');
            $('#usergraph-'+le.attr('user')).css('display', 'none');
        }
        else{
            indi.addClass('active');
            $('#usergraph-'+le.attr('user')).css('display', '');
        }
    });
    $('.legend-element').click((e) => {
        let t = $(e.target);
        while(!t.hasClass('legend-element')) t = $(t.parent());
        let u = t.attr('user');
        d3.selectAll('.usergraph').attr('stroke-width', strokeNormal);
        let graph = d3.select('#usergraph-' + u)
            .attr('stroke-width', strokeHighlight);
        graph._groups[0][0].parentNode.appendChild(graph._groups[0][0]);
        setTimeout(() => {graph.attr('stroke-width', 1.5)}, 5000);
    });

    var timeFormat = d3.timeFormat("%d.%m");
    let xaxis = d3.axisBottom().scale(xscale).tickFormat(timeFormat);
    let yaxis = d3.axisLeft().scale(yscale);
    svg.append('g').attr("transform", "translate(" +  (0.1*w) + ", " + (0.05*h) + ")").call(yaxis);
    svg.append('g').attr("transform", "translate(" + (0.1*w) + ", " + (0.9*h) + ")").call(xaxis);
    
}

function maxValueGraphData(data, entry){
    let maxval = data[0][entry];
    for(d of data){
        if(d[entry] > maxval) maxval = d[entry];
    }
    return maxval;
}

function minValueGraphData(data, entry){
    let minval = data[0][entry];;
    for(d of data){
        if(d[entry] < minval) minval = d[entry];
    }
    return minval;
}