let stops = [];
let stopsTimes = [];
let primaryColor;
let secondaryColor;

let displayData = () => {
    console.log(stopsTimes);
    let nextDepartureContainer = document.getElementById("nextDeparture");
    while (nextDepartureContainer.firstChild) {
        nextDepartureContainer.removeChild(nextDepartureContainer.firstChild);
    }

    var tab=document.getElementById("tab");

    while(tab.firstChild){
        tab.removeChild(tab.firstChild);
    }

    rowAdd(tab, "ROUTE", "ARRIVAL TIME","DEPARTURE TIME");

    stops.forEach((stopId) => {
        let nextStop = stopsTimes[stopId];
        if(nextStop != null) nextStop.routes.forEach(route => {
            if(route.times.length !== 0) {
                let nextContainer = document.createElement("div");
                nextContainer.setAttribute("class", "container nextDepartureItem");
                if (route.times[0].departureTime - new Date().getTime() < 120000) {
                    nextContainer.classList.add("departureAlert")
                }

                let stopName = document.createElement("label");
                stopName.setAttribute("class", "stopName");
                stopName.innerText = nextStop.name;

                let routeName = document.createElement("label");
                routeName.setAttribute("class", "routeName");
                routeName.innerText = route.name;

                let bigTime = document.createElement("label");
                bigTime.setAttribute("class", "bigTime");
                bigTime.innerText = formatTime(route.times[0].departureTime);

                nextContainer.appendChild(stopName);
                nextContainer.appendChild(routeName);
                nextContainer.appendChild(bigTime);
                nextDepartureContainer.appendChild(nextContainer);

                
                var tbl=document.getElementById("tab");
                
                for(var i=0; i<6 && i< route.times.length ;i++)
                {   
                rowAdd(tbl,route.name,formatTime(route.times[i].arrivalTime),formatTime(route.times[i].departureTime));
                console.log(tbl);
                }
    
            }
        });
    });  //stops
}//display data

let formatTime = (milliTime) => {
    let hours = new Date(milliTime).getHours();
    let minutes = new Date(milliTime).getMinutes();
    let ampm;
    if (hours >= 12) {
        ampm = "pm"
    } else {
        ampm = "am"
    }
    hours = hours % 12;
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    return hours + ":" + minutes + " " + ampm;
};

let updateDate = () => {
    for (let stop of stops) {
        let url = "https://cors-anywhere.herokuapp.com/52.88.188.196:8080/api/api/where/schedule-for-stop/" + stop + ".json?key=TEST";
        fetch(url, {
            mode: "cors",
            headers: {
                'Content-Type': 'application/jsonp'
            }
        }).then((response) => {
            response.json().then((json) => {
                let stop = {
                    id: json.data.references.stops[0].id,
                    name: json.data.references.stops[0].name,
                    routes: []
                };
                stopsTimes[stop.id] = stop;

                for (let route of json.data.entry.stopRouteSchedules) {
                    let routeName = "";
                    let routeNumber = "";
                    for (let refRoute of json.data.references.routes) {
                        if (refRoute.id === route.routeId) {
                            routeName = refRoute.longName + " - " + refRoute.shortName;
                            routeNumber = refRoute.shortName;
                        }
                    }
                    let currentRoute = {
                        id: route.routeId,
                        name: routeName,
                        number: routeNumber,
                        times: []
                    };
                    for (let schedules of route.stopRouteDirectionSchedules) {
                        let currentDate = new Date().getTime();
                        for (let time of schedules.scheduleStopTimes) {
                            if (time.departureTime >= currentDate) {
                                currentRoute.times.push(time)
                            }
                        }
                    }
                    currentRoute.times.sort((a, b) => {
                        return a.departureTime - b.departureTime
                    });
                    stopsTimes[stop.id].routes.push(currentRoute);
                }
                displayData()
            });
        })
    }
};

let getTime = () => {
    document.getElementById("currentTime").innerText = formatTime(new Date().getTime());
};

let start = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stopsParam = urlParams.get('data');
    stops = stopsParam.split(",");
    primaryColor = urlParams.get('primary');
    secondaryColor = urlParams.get('secondary');
    document.getElementById("tableHeader").style.background = primaryColor;
    updateDate();
    getTime();
    window.setInterval(updateDate, 60000);
    window.setInterval(getTime, 4000);

    var title= document.getElementById("titleBar").style.background=primaryColor;
    console.log(primaryColor);

    //title.style.background=primaryColor; 
};
function cellAdd(tr, val) {
    var td = document.createElement('td');

    td.innerHTML = val;

    tr.appendChild(td);
  }

function rowAdd(tab, val_1, val_2, val_3) {
    var tr = document.createElement('tr');

    cellAdd(tr, val_1);
    cellAdd(tr, val_2);
    cellAdd(tr, val_3);

    tab.appendChild(tr);


  }
document.addEventListener("DOMContentLoaded", function () {
    start()
});