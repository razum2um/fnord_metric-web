FnordMetric.widgets.timeseriesWidget = function(){

    /*
      options:
        height: 430
        default_cardinal: true/false
        default_style: line/area/stack/flow
        series
    */

    var widget_uid = "fnord-" + parseInt(Math.random()*99990000);
    var width, height, opts, graph, gconfig, legend, hoverDetail, shelving, highlighter, resolution;

    var cardinal = true;
    var xticks   = 30;

    function render(_opts){
      opts = _opts;

      if(opts.default_style == "areaspline"){ opts.default_style = 'area'; }
      if(!opts.default_style){ opts.default_style = 'line'; }
      if(!opts.default_cardinal){ opts.default_cardinal = false; }
      if(opts.xticks){ xticks = opts.xticks; }

      draw_layout();

      gconfig = {
        element: $('.container', opts.elem)[0],
        interpolation: (opts.default_cardinal ? 'cardinal' : 'linear'),
        stroke: true,
        series: opts.series,
        padding: { top: 0.1, bottom: 0 }
      }

      $(opts.elem)
        .addClass('resize_listener')
        .bind('fm_resize', renderChart);

      apply_style(opts.default_style);

      if(opts.async_chart){
        updateChart();
      } else {
        renderChart();
      }
    }

    function toggle_cardinal(){
      if($(this).hasClass('active')){ return false; }
      $(this).addClass('active').siblings().removeClass('active');

      if(cardinal === true){
        cardinal = false;
        gconfig.interpolation = 'linear';
      } else {
        cardinal = true;
        gconfig.interpolation = 'cardinal';
      }

      graph.configure(gconfig);
      graph.render();
    }

    function change_style(){
      $(this).addClass('active').siblings().removeClass('active');

      apply_style($(this).attr('data'));
      //graph.configure(gconfig);
      //graph.render();

      renderChart();
    }

    function apply_style(style){
       if(style == 'line'){
        gconfig.renderer = 'line';
        gconfig.offset = 'zero';
      }

      if(style == 'area'){
        gconfig.renderer = 'area';
        gconfig.offset = 'zero';
      }

      if(style == 'flow'){
        gconfig.renderer = 'stack';
        gconfig.offset = 'silhouette';
      }
    }

    function apply_resolution(){
      if(!resolution){ 
        var trgt_resolution = 50;
        var best_resolution = false;

        for(ind in opts.series_resolutions){
          var _diff = Math.abs(
            trgt_resolution - 
            (opts.timespan /  opts.series_resolutions[ind])
          );

          if((!best_resolution) || (_diff < best_resolution)){
            best_resolution = opts.series_resolutions[ind];
          }
        }

        resolution = best_resolution;
      }

      for(ind in gconfig.series){
        gconfig.series[ind].data = gconfig.series[ind]["data"+resolution];
      }

      $('.button.tick', opts.elem)
        .removeClass('active')
        .filter('[data-tick="'+resolution+'"]')
        .addClass('active');
    }

    function draw_layout(){
     if(!opts.ext && !opts.no_headbar){
        $(opts.elem).append(
          $('<div></div>')
            .addClass('headbar')
            .append($('<h2></h2>').html(opts.title))
            .append(
              $('<div class="btn_group mr"></div>')
              .append(
                $('<div></div>')
                  .addClass('button')
                  .append($('<span>').html('Flow'))
                  .attr('data', 'flow')
                  .click(change_style)
              )
              .append(
                $('<div></div>')
                  .addClass('button')
                  .append($('<span>').html('Area'))
                  .attr('data', 'area')
                  .click(change_style)
              )
              .append(
                $('<div></div>')
                  .addClass('button')
                  .append($('<span>').html('Line'))
                  .attr('data', 'line')
                  .click(change_style)
              )
            )
            .append(
              $('<div class="btn_group mr"></div>')
              .append(
                $('<div></div>')
                  .addClass('button mr')
                  .addClass(opts.default_cardinal ? '' : 'active')
                  .append($('<span>').html('Off'))
                  .attr('data', 'cardinal-off')
                  .click(toggle_cardinal)
              )
              .append(
                $('<div></div>')
                  .addClass('button ml')
                  .addClass(opts.default_cardinal ? 'active' : '')
                  .append($('<span>').html('On'))
                  .attr('data', 'cardinal-on')
                  .click(toggle_cardinal)
              )
            )
        )
      }

      $(opts.elem)
        .append(
          $('<div></div>')
            .addClass('legend')
            .css({
              margin: '10px 30px 0 30px',
            })
        )
        .append(
          $('<div></div>')
            .addClass('container')
            .css({
              height: opts.height,
              margin: '0 23px 25px 23px',
            })
        );

      if(!opts.ext && opts.async_chart && !opts.no_datepicker){
        $('.headbar', opts.elem).prepend(
          $('<div></div>')
            .addClass('button ml')
            .append($('<span></span>').html('&larr;'))
            .click(function(){ moveRange(-1); })
        ).prepend(
          $('<div></div>')
            .addClass('datepicker')
        ).prepend(
          $('<div></div>')
            .addClass('button')
            .append($('<span></span>').html('&rarr;'))
            .click(function(){ moveRange(1); })
        ).prepend(
          $('<div class="refresh_btn"></div>')
            .addClass('button ml')
            .append($('<span></span>').html('refresh'))
            .click(function(){ requestValuesAsync(); })
        );
      }

      if(opts.series_resolutions){
        $('.headbar', opts.elem).append('<div class="tick_btns btn_group"></div>');
        for(ind in opts.series_resolutions){
          var _tick = opts.series_resolutions[ind];
          $('.tick_btns', opts.elem).append(
            $('<div></div>').attr('class', 'button tick').append($('<span></span>')
              .html(FnordMetric.util.formatTimeRange(_tick)))
              .attr('data-tick', _tick)
              .click(function(){ 
                resolution = $(this).attr('data-tick'); 
                renderChart();
              })  
          );
        }
      }

      if((opts.autoupdate) && (opts.async_chart)){
        var secs = parseInt(opts.autoupdate);
        if(secs > 0){
          var autoupdate_interval = window.setInterval(function(){
             updateChart(false, true);
          }, secs*1000);

          $('body').bind('fm_dashboard_close', function(){
            window.clearInterval(autoupdate_interval);
          });
        }
      }
    }

    function renderChart(){
      width = opts.elem.width() - 50;
      height = opts.height || 240;

      gconfig.width = width;
      gconfig.height = height;

      $(gconfig.element).html("");
      $(".fnordmetric_legend", opts.elem).html("");

      if(opts.series_resolutions){
        apply_resolution();
      }

      graph = new FnordMetric.rickshaw.Graph(gconfig);

      legend = new FnordMetric.rickshaw.Graph.Legend({
        graph: graph,
        element: $('.legend', opts.elem)[0]
      });

      hoverDetail = new FnordMetric.rickshaw.Graph.HoverDetail( {
        graph: graph
      });

      shelving = new FnordMetric.rickshaw.Graph.Behavior.Series.Toggle({
        graph: graph,
        legend: legend
      });

      highlighter = new FnordMetric.rickshaw.Graph.Behavior.Series.Highlight({
        graph: graph,
        legend: legend
      });

      new FnordMetric.rickshaw.Graph.Axis.Time({
        graph: graph,
      }).render();

      new FnordMetric.rickshaw.Graph.Axis.Y({
        graph: graph,
      }).render();

      if(!gconfig.renderer){
        gconfig.renderer = "line";
      }

      graph.configure(gconfig);
      graph.render();
    }


    function announce(evt){
      if(evt.widget_key == opts.widget_key){
        if((evt.type == "widget_response") && (evt.cmd == "values_at")){
          running_request = false;
          $(opts.elem).css('opacity', 1);
          updateSeriesData(evt.gauges);
        }
      }
    }

    function requestValuesAsync(){
      FnordMetric.publish({
        "type": "widget_request",
        "klass": "generic",
        "gauges": opts.gauges,
        "cmd": "values_at",
        "tick": opts.tick, 
        "since": opts.start_timestamp,
        "until": opts.end_timestamp,
        "widget_key": opts.widget_key
      });
    }

    function updateSeriesData(dgauges){
      gconfig.series = [];

      for(var ind = 0; ind < dgauges.length; ind++){

        gconfig.series.push({
          name: dgauges[ind].title,
          color: opts.series[ind].color,
          data: []
        });

        for(_time in dgauges[ind].vals){
          gconfig.series[ind].data.push(
            { x: parseInt(_time), y: parseInt(dgauges[ind].vals[_time] || 0) }
          );
        }

      }

      renderChart();
    }

    function updateChart(first_time, silent){
      if(!silent){ $(opts.elem).css('opacity', 0.7); }
      updateRange();
      redrawDatepicker();
      requestValuesAsync();
    }

    function redrawDatepicker(){
      $('.datepicker', opts.elem).html(
        FnordMetric.util.dateFormat(opts.start_timestamp) +
        '&nbsp;&dash;&nbsp;' +
        FnordMetric.util.dateFormat(opts.end_timestamp)
      );
    }

    function updateRange(force){
      var _now = parseInt(new Date().getTime() / 1000);

      if (opts.no_update_range)
        return;

      if (opts.ext) {
        opts.end_timestamp = _now;
        opts.start_timestamp = _now - opts.trange;
        return;
      }

      if(!opts.tick){
        opts.tick = opts.ticks[0];
      }

      if((opts.autoupdate) && 
        ((_now - opts.end_timestamp) < ((opts.tick*(opts.autoupdate+1)) + 5))){
        force = true;
      }

      if(!opts.start_timestamp || !opts.end_timestamp || !!force){
        opts.end_timestamp = _now + opts.tick;
        opts.start_timestamp = opts.end_timestamp - (opts.tick * xticks);
      }
    }

    function moveRange(direction){
      v = opts.tick*direction*8;

      if(((opts.end_timestamp + v)*1000) < new Date().getTime()){
        opts.start_timestamp += v;
        opts.end_timestamp += v;  
      }

      redrawDatepicker();
      requestValuesAsync();
    }

    function set_timerange(s, e){
      opts.start_timestamp = s;
      opts.end_timestamp = e;
      redrawDatepicker();
      requestValuesAsync();
    }

    return {
      render: render,
      announce: announce,
      set_timerange: set_timerange
    }

};
