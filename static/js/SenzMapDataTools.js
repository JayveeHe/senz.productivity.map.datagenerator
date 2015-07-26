//init part

startMarker = null;
endMarker = null;
waypointMarkers = [];
pointType = -1;

var seq_context;
var init_context = function () {
    $.ajax({
        url: '/context',
        success: function (result) {
            var context_obj = JSON.parse(result);
            $("#select-context").empty();
            for (var i = 0; i < context_obj.length; i++) {
                var option_text = '<option value="' + context_obj[i] + '">' + context_obj[i] + '</option>';
                //console.log(option_text);
                $("#select-context").append(option_text);
            }
        }
    })
};
var init_feature = function () {
    $.ajax({
        url: '/feature',
        success: function (result) {
            var feature_obj = JSON.parse(result);
            $("#select-time").empty();
            for (var i = 0; i < feature_obj['time'].length; i++) {
                var option_text = '<option value="' + feature_obj['time'][i] + '">' + feature_obj['time'][i] + '</option>';
                //console.log(option_text);
                $("#select-time").append(option_text);
            }
            $("#select-day").empty();
            for (var i = 0; i < feature_obj.day.length; i++) {
                var option_text = '<option value="' + feature_obj.day[i] + '">' + feature_obj.day[i] + '</option>';
                //console.log(option_text);
                $("#select-day").append(option_text);
            }
        }
    })
};
init_context();
init_feature();

// generate point mode init
var isPoint = false;
var genPoints = [];


mapResult = null;
// 百度地图API功能
var map = new BMap.Map("allmap");
map.centerAndZoom("北京", 12);
map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
//单击获取点击的经纬度
map.addEventListener("click", function (e) {
    var epoint = e.point;
    switch (pointType) {
        case 0:
            setStartPoint(epoint);
            break;
        case 1:
            setEndPoint(epoint);
            break;
        case 2:
            setWayPoint(map, epoint);
            break;
        case 3:
            setGenPoints(map, epoint);
            break;
        default :
            break;
    }
});


$("#isPointGenerate").click(function (e) {
    isPoint = $("#isPointGenerate")[0].checked;
    console.log(isPoint);
    map.clearOverlays();
    mapResult = null;
    if (isPoint) {
        pointType = 3;
    } else {
        pointType = -1;
    }
});
// init buttons
$("#btn_start").click(function () {
    //console.log("start = " + startMarker);
    //console.log("end = " + endMarker);
    pointType = 0;
    genPoints = [];
    isPoint = false;
    $("#isPointGenerate")[0].checked = false;
});
$("#btn_end").click(function () {
    //console.log("start = " + startMarker);
    //console.log("end = " + endMarker);
    pointType = 1;
    genPoints = [];
    isPoint = false;
    $("#isPointGenerate")[0].checked = false;
});

$("#btn_waypoint").click(function () {
    //console.log("start = " + startMarker);
    //console.log("end = " + endMarker);
    pointType = 2;
    genPoints = [];
    isPoint = false;
    $("#isPointGenerate")[0].checked = false;
});

$("#btn_driving_router").click(function () {
    genPoints = [];
    isPoint = false;
    $("#isPointGenerate")[0].checked = false;
    makeDrivingRoute(map);
});

$("#btn_walking_router").click(function () {
    genPoints = [];
    isPoint = false;
    $("#isPointGenerate")[0].checked = false;
    makeWalkingRoute(map);
});

$("#btn_reset").click(function () {
    map.clearOverlays();
    startMarker = null;
    endMarker = null;
    waypointMarkers = [];
    pointType = -1;
    mapResult = null;
    genPoints = [];
    $("#isPointGenerate")[0].checked = false;
    isPoint = false;
});

$("#btn_getdata").click(function () {
    getRouteData(mapResult);
});

// operations part

// point setter
var setStartPoint = function (e_point) {
    console.log("startMarker=" + startMarker);
    if (startMarker == null) {
        startMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
        startMarker.setLabel(new BMap.Label("起点", {offset: new BMap.Size(20, -10)}));
        startMarker.enableDragging();
        startMarker.addEventListener("dragend", function (event) {
            var point = event.point;
            //console.log(point);
            console.log("start marker的位置是" + point.lng + "," + point.lat);
        });
        map.addOverlay(startMarker);
    } else {
        startMarker.setPosition(new BMap.Point(e_point.lng, e_point.lat));
    }

    pointType = -1;//reset pointType
};

var setEndPoint = function (e_point) {
    if (endMarker == null) {
        endMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
        endMarker.setLabel(new BMap.Label("终点", {offset: new BMap.Size(20, -10)}));
        endMarker.enableDragging();
        endMarker.addEventListener("dragend", function (event) {
            var point = event.point;
            console.log("end marker的位置是" + point.lng + "," + point.lat)
        });
        map.addOverlay(endMarker);
    } else {
        endMarker.setPosition(new BMap.Point(e_point.lng, e_point.lat));
    }
    pointType = -1;//reset pointType
};

var setWayPoint = function (bmap, e_point) {
    var waypointMark = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
    waypointMark.setLabel(new BMap.Label("途经点-" + waypointMarkers.length, {offset: new BMap.Size(20, -10)}));
    waypointMark.enableDragging();
    waypointMark.addEventListener("dragend", function (event) {
        var point = event.point;
        console.log(waypointMark.getLabel().content + "的位置是" + point.lng + "," + point.lat)
    });
    map.addOverlay(waypointMark);
    waypointMarkers.push(waypointMark);
    pointType = -1;//reset pointType
};

function setGenPoints(bmap, e_point) {
    var genPointMarker = new BMap.Marker(new BMap.Point(e_point.lng, e_point.lat));
    genPointMarker.setLabel(new BMap.Label("生成点-" + genPoints.length, {offset: new BMap.Size(20, -10)}));
    genPointMarker.enableDragging();
    genPointMarker.addEventListener("dragend", function (event) {
        var point = event.point;
        console.log(genPointMarker.getLabel().content + "的位置是" + point.lng + "," + point.lat)
    });
    console.log(genPointMarker.point.lng + "-" + genPointMarker.point.lat);
    genPoints.push(genPointMarker.point);
    bmap.addOverlay(genPointMarker);
    //pointType = -1;//reset pointType
}

// Map router
var makeDrivingRoute = function (renderMap) {
    renderMap.clearOverlays();
    var transit = new BMap.DrivingRoute(renderMap, {
        renderOptions: {
            map: renderMap,
            //panel: "r-result",
            enableDragging: true //起终点可进行拖拽
        }
    });
    var wayPoints = [];
    for (var i = 0; i < waypointMarkers.length; i++) {
        wayPoints.push(waypointMarkers[i].getPosition())
    }
    transit.setSearchCompleteCallback(function () {
        mapResult = transit.getResults();
    });
    transit.search(startMarker.getPosition(), endMarker.getPosition(), {waypoints: wayPoints});
};

var makeWalkingRoute = function (renderMap) {
    renderMap.clearOverlays();
    var transit = new BMap.WalkingRoute(renderMap, {
        renderOptions: {
            map: renderMap,
            //panel: "r-result",
            enableDragging: true //起终点可进行拖拽
        }
    });
    transit.setSearchCompleteCallback(function () {
        mapResult = transit.getResults();
    });
    transit.search(startMarker.getPosition(), endMarker.getPosition());
};

//data collector
var postRouteData = function (routeDatas) {
    console.log('isSaved=' + $("#isSaved")[0].checked);
    $.ajax({
            url: "/data",
            data: JSON.stringify({
                "isSaved": $("#isSaved")[0].checked,
                "routeDatas": routeDatas
            }),
            type: "POST",
            contentType: "application/json",
            success: function (result) {
                function openInfo(content, e) {
                    var p = e.target;
                    var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                    var opts = {
                        width: 250,     // 信息窗口宽度
                        height: 400,     // 信息窗口高度
                        title: "信息窗口", // 信息窗口标题
                        enableMessage: true//设置允许信息窗发送短息
                    };
                    var infoWindow = new BMap.InfoWindow(content, opts);  // 创建信息窗口对象
                    map.openInfoWindow(infoWindow, point); //开启信息窗口
                }

                function addClickHandler(content, marker) {
                    marker.addEventListener("click", function (e) {
                            openInfo(content, e)
                        }
                    );
                }

                new_points = JSON.parse(result);
                //console.log("point=" + new_points);
                //console.log(new_points);
                var t_point_list = [];
                for (var i = 0; i < new_points.length; i++) {
                    var t_point = new BMap.Point(new_points[i].lng, new_points[i].lat);
                    t_point_list.push(t_point);
                    var t_marker = new BMap.Marker(t_point);
                    var poi_text = "GPS:<br>lng=" + new_points[i].lng + "<br>lat=" + new_points[i].lat + "<br>";
                    poi_text += '<br>Context:' + new_points[i].context + '<br>';
                    poi_text += 'Location:' + new_points[i].location + '<br>';
                    poi_text += 'Sound:' + new_points[i].sound + '<br>';
                    poi_text += 'Motion:' + new_points[i].motion + '<br>';
                    poi_text += 'Speed:' + new_points[i].speed + '<br>';
                    poi_text += 'Time:' + new_points[i].time + '<br>';
                    poi_text += 'Day:' + new_points[i].day + '<br>';
                    poi_text += '<br>RealPOIs:<br>';
                    for (var j = 0; j < new_points[i].poi_types.length; j++) {
                        poi_text += new_points[i].poi_types[j].title + ":" + new_points[i].poi_types[j].mapping_type + "<br>";
                    }
                    //console.log(poi_text);
                    addClickHandler(poi_text, t_marker);
                    map.addOverlay(t_marker);
                }
                var polyline = new BMap.Polyline(t_point_list, {
                    strokeColor: "blue",
                    strokeWeight: 3,
                    strokeOpacity: 1
                });   //创建折线
                map.addOverlay(polyline);   //增加折线

                alert("ok");
            }
        }
    );
    alert("正在读取，请稍候");
};
var getRouteData = function (routeResult) {
    //map.clearOverlays();
    //isPoint = $("#isPointGenerate")[0].checked;
    console.log(isPoint);
    pointType = -1;
    if (isPoint) {
        if (genPoints.length > 0) {
            var routeDatas = [];
            for (var i = 0; i < genPoints.length; i++) {
                routeDatas.push({
                    "context": $("#select-context").val(),
                    "day": $("#select-day").val(),
                    "time": $("#select-time").val(),
                    "index": i,
                    "lng": genPoints[i].lng,
                    "lat": genPoints[i].lat
                });
            }
            console.log(routeDatas);
            map.clearOverlays();
            postRouteData(routeDatas);
            $("#isPointGenerate")[0].checked = false;
            genPoints = [];
            console.log(isPoint);
        } else {
            alert("请先点击地图生成数据点！");
            $("#isPointGenerate")[0].checked = false;
            console.log(isPoint);
        }

    } else {
        if (null == routeResult) {
            alert("请先设定一个出行计划！");
        } else {
            var t = 0;
            //console.log(routeResult);
            var route = routeResult.getPlan(0).getRoute(0);
            var routePath = routeResult.getPlan(0).getRoute(0).getPath();
            var routeDatas = [];
            do {
                routePath = route.getPath();
                //console.log(routePath);
                for (var i = 0; i < routePath.length; i++) {
                    routeDatas.push({
                        "context": $("#select-context").val(),
                        "day": $("#select-day").val(),
                        "time": $("#select-time").val(),
                        "index": i,
                        "lng": routePath[i].lng,
                        "lat": routePath[i].lat
                    });
                }
                t++;
                route = routeResult.getPlan(0).getRoute(t);
            } while (route != null);
            //}
            //console.log("t=======" + t);
            postRouteData(routeDatas);
        }
    }

};

