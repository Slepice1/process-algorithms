var $ = function (selector, el) {
   if (!el) {el = document;}
   return el.querySelector(selector);
};

var $$ = function (selector, el) {
     if (!el) {el = document;}
     return Array.prototype.slice.call(el.querySelectorAll(selector));
};

var insertAfter = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

var TABLE = "<table id='table'><thead><th>P</th><th>AT</th><th>BT</th><th>CT</th><th>TAT</th><th>WT</th></thead><tbody></tbody></table>";

ALGORITHMS = {FCFS: "First Come First Serve",
              SJF: "Shortest Job First",
              PPA: "Priority Planing Algorithm",
              RR: "Round Robin"};

algorithm = "FCFS";
info_shown = true;

var isRunning = function () {
    return step > -1;
};

var changeAlgorithmVersion = function (name) {
  $(".algorithm_info h2").innerHTML = ALGORITHMS[name];
  $( "#preemptive" ).disabled = false;
  if ( preemptive ) {
      $(".algorithm_info h2").innerHTML += " Preemptive";
      $( "#preemptive" ).style.backgroundColor = "var(--accent-color, #00BCD4)";
  } else {
      $( "#preemptive" ).style.backgroundColor = "var(--dark-primary-color, #0097A7)";
  }
};

var changeAlgorithm = function (name) {
    if ( isRunning() ) {
        //Warning
    } else if ( algorithm === name ) {

    } else {
        if ( algorithm === "PPA" ) {
            removePriorityInputs();
        }
        if ( name === "PPA" ) {
            addPriorityInputs();
        }
        $(".algorithm_info h2").innerHTML = ALGORITHMS[name];
        $( "#preemptive" ).disabled = false;
        $( "#" + name + "-info").style.display = "block";
        $( "#" + algorithm + "-info").style.display = "none";
        $("nav #" + algorithm).style.backgroundColor = 'inherit';
        $("nav #" + name).style.backgroundColor = "var(--primary-color, #8BC34A)";
        if ( preemptive && name !== "FCFS" && name !== "RR" ) {
            $(".algorithm_info h2").innerHTML += " Preemptive";
            $( "#preemptive" ).style.backgroundColor = "var(--accent-color, #00BCD4)";
        } else if (name !== "FCFS" && name !== "RR") {
            $( "#preemptive" ).style.backgroundColor = "var(--dark-primary-color, #689F38)";
        } else {
            $( "#preemptive" ).style.backgroundColor = "var(--disabled-color, #689F38)";
            $( "#preemptive" ).disabled = true;
        }

        algorithm = name;
    }
};

var createProces = function (p) {
    $$( ".proc_container" ).forEach(function( container ) {
        proces_html = '<div class="proces" id="p' + p + '"><h3>P' + p + '</h3>' +
                      '<div><label for="at">AT:</label><input id="at" type="number"></div>' +
                      '<div><label for="bt">BT:</label><input id="bt" type="number"></div>';
        if (algorithm === "PPA") {
            proces_html += '<div><label for="pr">PR:</label><input id="pr" type="number"></div></div>';
        }
        proces_html += '</div>';
        var template = document.createElement('template');
        template.innerHTML = proces_html;
        container.insertBefore(template.content.firstChild, $(".proces-buttons", container));
        $("#p" + p, container).style.visibility = "hidden";
        $("#ready #p" + p).style.visibility = "visible";
    });
};

var createTable = function (data) {
    template = $('#table-template');
    if ( template ) {
      $( "#table-holder" ).innerHTML = template.innerHTML;
    } else {
      $( "#table tbody" ).innerHTML = "";
    }
    var keys = ["N", "AT", "BT", "CT", "TAT", "WT"];
    var table = $( "#table tbody" )
    for ( var i in data ) {
        var row = table.insertRow(i)
        for ( var j in keys ) {
            row.insertCell(j).innerHTML = data[i][keys[j]];
        }
    }
    table.style.display = '';
};

var changeProceses = function (s) {
    var previousSteps = steps[s];
    for ( var i in previousSteps.ready ) {
        changeState(previousSteps.ready[i].N, "ready");
    }

    for ( var i in previousSteps.front ) {
        changeState(previousSteps.front[i].N, "front");
    }

    for ( var i in previousSteps.completed ) {
        changeState(previousSteps.completed[i].N, "completed");
    }

    if ( previousSteps.running !== undefined ) {
        changeState(previousSteps.running.N, "running");
    }
};

var changeState = function (proces_n, to) {
    $$( ".proc_container #p" + proces_n ).forEach( function ( proces ) {
        proces.style.visibility = "hidden";
    });
    $( "#" + to + " #p" + proces_n ).style.visibility = "visible";
};

var changePreemptiveSettings = function () {
    if (algorithm !== "FCFS" && algorithm !== "RR")  {
        preemptive = !preemptive;
        changeAlgorithmVersion(algorithm);
    }
};

var addPriorityInputs = function () {
    $$( ".proces" ).forEach( function( proces ) {
        template = document.createElement('template');
        template.innerHTML = '<div><label for="pr">PR:</label><input id="pr" type="number"></div>';
        insertAfter(template.content.firstChild, $("div:last-child", proces));
    });
};

var removePriorityInputs = function () {
    $$( ".proces" ).forEach(function( proces ) {
        $("div:last-child", proces).remove();
    });
};

var resetProceses = function () {
    var data = proceses.completed;
    createTable(data);
    changeProceses(0);
    step = -1;
    $("#step-counter").innerHTML = "0";
    $$("input").forEach( function (input) {input.removeAttribute('disabled');});
    $(".proces-buttons").style.display = '';
};

var sortProcesses = function(a, b) {
    if ( algorithm === "FCFS" ) {
        if ( "PA" in a && "PA" in b ) {
            return a.PA - b.PA;
        } else if ( "PA" in a ) {
            return 1;
        } else if ( "PA" in b ) {
            return -1;
        } else {
            return 0;
        }
    } else if ( algorithm === "SJF" ) {
        if ( "PA" in a && "PA" in b ) {
          if ( a.BT === b.BT ) {
              return a.PA - b.PA;
          } else {
              return a.BT - b.BT;
          }
        } else if ( "PA" in a ) {
            return 1;
        } else if ( "PA" in b ) {
            return -1;
        } else {
            return 0;
        }
    } else if ( algorithm === "PPA") {
        if ( "PA" in a && "PA" in b ) {
          if ( a.PR === b.PR ) {
              return a.PA - b.PA;
          } else {
              return b.PR - a.PR;
          }
        } else if ( "PA" in a ) {
            return 1;
        } else if ( "PA" in b ) {
            return -1;
        } else {
            return 0;
        }
    }
};

var getInputs = function ( proces, filled ) {
      var bt = $( "div > #bt", proces ).value;
      var at = $( "div > #at", proces ).value;
      if ( algorithm === "PPA" ) {
          var pr = $( "div > #pr", proces ).value;
          return [pr && bt && at && filled, {'PR': pr, 'BT': bt, 'AT': at}];
      } else {
          var pr = false;
          return [bt && at && filled, {'BT': bt, 'AT': at}];
      }
  };

var table;
var n = 0;
var steps = [];
var p = 1;
var step = -1;
var pa = 0;
var preemptive = false;
var constant = 2;
var proceses;

var initEvents = function () {

    $( "button#add" ).addEventListener( "click", function() {
        if (p < 10) {
            createProces(++p);
        }
    });
    $( "button#sub" ).addEventListener( "click", function() {
        if (p > 1) {
            $$( ".proc_container" ).forEach(function( container ) {
                container.removeChild($("#p" + p , container));
            });
            p--;
        }
    });
    $( "button#step-up" ).addEventListener( "click", function( event ) {
        var filled = true;
        if ( step === -1 ) {
          proceses = {ready:[], front:[], running:undefined, completed:[]};
          steps = [];
          $$( "#ready > .proces" ).forEach( function( proces ) {
              inputs_info = getInputs( proces, filled );
              filled = inputs_info[0];
              inputs = inputs_info[1];
              if ( filled ) {
                  proceses.ready.push({'N':proceses.ready.length+1,
                                       'BT':parseInt( inputs.BT ),
                                       'AT':parseInt( inputs.AT ),
                                       'PR':parseInt( inputs.PR ),
                                       'BTa':parseInt( inputs.BT )});
                  var l = proceses.ready.length-1;
                  $$( ".proc_container #p" + (l+1)).forEach( function( proces ) {
                      $("#bt", proces).value = proceses.ready[l].BT;
                      $("#at", proces).value = proceses.ready[l].AT;
                      if ( inputs.PR ) {
                          $("#pr", proces).value = proceses.ready[l].PR;
                      }
                  });
              }
          });
          n = proceses.ready.length;
          steps.push( JSON.parse( JSON.stringify( proceses )));
        }
        if ( filled ) {
            $( "button#reset" ).disabled = false;
            $( "button#step-down" ).disabled = false;
            $( ".proces-buttons" ).style.display = 'none';
            $$( "input" ).forEach( function (input) {input.setAttribute('disabled', true);});
            $( "#step-counter" ).innerHTML = ++step;

            if ( step < steps.length-1 ) {
                changeProceses(step+1);
            } else {
                var i = 0;
                while ( i < proceses.ready.length ) {
                    proc = proceses.ready[i];
                    if ( proc.AT == step ) {
                        proc.PA = pa++;
                        proceses.ready.splice(i,1);
                        proceses.front.push(proc);
                        changeState(proc.N, "front");
                    } else {
                        i++;
                    }
                  }

                if ( proceses.running !== undefined ) {
                  var proc = proceses.running;
                  proc.BTa--;
                  runtime = proc.BT - proc.BTa;
                  if ( proc.BTa === 0) {
                    proc.CT = step;
                    proc.TAT = proc.CT - proc.AT;
                    proc.WT = proc.TAT - proc.BT;
                    proceses.completed.push(proc);
                    proceses.running = undefined;
                    changeState(proc.N, "completed");
                  } else if ( algorithm === "RR" && runtime%constant === 0 ) {
                    proc.PA = pa++;
                    proceses.front.push(proc);
                    changeState(proc.N, "front");
                    proceses.running = undefined;
                  }
                }

                proceses.front.sort(sortProcesses);

                var i = 0;
                while ( i < proceses.front.length ) {
                    proc = proceses.front[i];
                    if ( proceses.running === undefined ) {
                        if ( proc.BT === proc.BTa ) {
                            proc.VT = step;
                        }
                        proceses.front.splice(i,1);
                        proceses.running = proc;
                        changeState(proc.N, "running");
                    } else {
                        if ( preemptive ) {
                            if ( algorithm === "SJF" ) {
                                if ( proceses.running.BTa > proc.BTa) {
                                    changeState(proceses.running.N, "front");
                                    proceses.running.PA = pa++;
                                    proceses.front.push(proceses.running);
                                    proceses.front.splice(i,1);
                                    proceses.running = proc;
                                    changeState(proc.N, "running");
                                }
                            }
                            if ( algorithm === "PPA" ) {
                                if ( proceses.running.PR < proc.PR) {
                                    changeState(proceses.running.N, "front");
                                    proceses.running.PA = pa++;
                                    proceses.front.push(proceses.running);
                                    proceses.front.splice(i,1);
                                    proceses.running = proc;
                                    changeState(proc.N, "running");
                                }
                            }
                        }
                        i++;
                    }
                }
                steps.push( JSON.parse( JSON.stringify( proceses )));
            }
            if (proceses.completed.length == n) {
                createTable(proceses.completed);
                $( "button#step-up" ).disabled = true;
            }
        } else {
          //Warning
        }
    });

    $( "button#step-down" ).addEventListener( "click", function( event ) {
        if ( step == 0 ) {
            resetProceses();
        } else if ( step > 0 ) {
            $( "span#step-counter" ).innerHTML = --step;
            changeProceses(step+1);
        }
        $( "button#step-up" ).disabled = false;
    });

    $( "button#reset" ).addEventListener( "click", function( event ) {
        resetProceses();
        $( "button#step-up" ).disabled = false;
    });

    $( "#preemptive" ).addEventListener( "click", function( event ) {
        changePreemptiveSettings();
    });

    $("#hide-info").addEventListener( "click", function( event ) {
        if ( info_shown ) {
            $("#hide-info button").innerHTML = "▶";
            document.getElementById("algorithm-info").style.display = 'none';
        } else {
            $("#hide-info button").innerHTML = "▼";
            $("#algorithm-info").style.display = 'flex';
        }
        info_shown = !info_shown;
    });
};
