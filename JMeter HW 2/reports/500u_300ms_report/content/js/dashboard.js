/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 71.2183066361556, "KoPercent": 28.781693363844393};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7119267734553776, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.718128547040096, 500, 1500, "DELETE Character"], "isController": false}, {"data": [0.703552655428675, 500, 1500, "GET All Characters"], "isController": false}, {"data": [0.713094474479978, 500, 1500, "POST Create Character"], "isController": false}, {"data": [0.7154217421282464, 500, 1500, "PUT Update Character"], "isController": false}, {"data": [0.7095950383071872, 500, 1500, "GET Character by ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 109250, 31444, 28.781693363844393, 37.194233409610696, 0, 621, 72.0, 97.0, 104.0, 121.0, 1214.415135447583, 2641.719148176015, 155.7559491057236], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE Character", 21673, 6109, 28.1871452959904, 27.734139251603278, 1, 135, 13.0, 82.0, 91.0, 105.0, 244.81519971082596, 220.84151033077103, 37.42955309690154], "isController": false}, {"data": ["GET All Characters", 22068, 6514, 29.517853906108392, 71.72620989668276, 0, 621, 67.0, 150.0, 212.0, 348.0, 245.3062993964051, 1769.9424416379043, 21.780987907259814], "isController": false}, {"data": ["POST Create Character", 21826, 6262, 28.6905525520022, 28.661962796664486, 1, 134, 14.0, 82.0, 91.0, 107.0, 244.61479837715464, 220.65044758184274, 37.64628408479591], "isController": false}, {"data": ["PUT Update Character", 21755, 6191, 28.457825787175363, 28.778028039531083, 0, 152, 13.0, 84.0, 94.0, 109.0, 244.87843313822603, 218.77838230948896, 38.32215262339599], "isController": false}, {"data": ["GET Character by ID", 21928, 6368, 29.040496169281283, 28.63425757022979, 1, 135, 13.0, 84.0, 93.95000000000073, 108.0, 244.86331963551902, 220.55586419063783, 22.058587468733247], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 31441, 99.99045922910571, 28.778947368421054], "isController": false}, {"data": ["404/Not Found", 1, 0.003180256964762753, 9.153318077803204E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 2, 0.006360513929525506, 0.0018306636155606408], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 109250, 31444, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 31441, "Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 2, "404/Not Found", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["DELETE Character", 21673, 6109, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6108, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET All Characters", 22068, 6514, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6512, "Non HTTP response code: java.net.SocketException/Non HTTP response message: No buffer space available (maximum connections reached?): connect", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["POST Create Character", 21826, 6262, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6262, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT Update Character", 21755, 6191, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6191, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Character by ID", 21928, 6368, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 6368, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
