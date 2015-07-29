import json
import os
from flask import Flask, request, render_template, make_response
import math
import sys
from Utils import POI_tagger, LeancloudUtils, DataGenerator

app = Flask(__name__)
project_path = os.path.dirname(__file__)
sys.path.append(project_path)
crf_event_prob_map = LeancloudUtils.get_crf_event_probmap()


@app.route('/data', methods=['POST'])
def handle_data():
    req_data = json.loads(request.data)
    result = []
    routeDatas = req_data['routeDatas']
    isSaved = req_data['isSaved']
    req_count = len(routeDatas)
    print 'req_count =', req_count
    i = 0
    j = 0
    for gps_point in routeDatas:
        if i % math.ceil(req_count * 0.1) == 0:
            noise_point = DataGenerator.addGaussNoise(gps_point, 0.0002)
            poi_point = POI_tagger.get_poi_by_point(noise_point)
            feature_point = DataGenerator.generate_feature(poi_point, crf_event_prob_map['value'])
            result.append(feature_point)
            j += 1
            # print j
        i += 1
    # print 'done'
    objid = 'null'
    if isSaved:
        objid = LeancloudUtils.save_to_leancloud(result)
    return json.dumps({'trace_id': objid, 'result': result})


@app.route('/context', methods=['GET'])
def get_context_menu():
    return json.dumps(LeancloudUtils.get_context_menus())


@app.route('/feature', methods=['GET'])
def get_newfeature():
    return json.dumps(LeancloudUtils.get_crf_newfeature())


@app.route('/trace-ids', methods=['POST'])
def get_recentlist():
    req_data = json.loads(request.data)
    limit = req_data.get('limit')
    if limit:
        query_result = LeancloudUtils.get_recent_tracelist(limit)
    else:
        query_result = LeancloudUtils.get_recent_tracelist()
    ids = []
    for item in query_result:
        ids.append(item.id)
    return json.dumps(ids)


@app.route('/trace', methods=['POST'])
def get_single_trace():
    req_data = json.loads(request.data)
    trace_id = req_data['trace_id']
    query_result = LeancloudUtils.get_trace_by_id(trace_id)
    if query_result:
        trace = query_result[0].attributes['senz_data']
        return json.dumps(trace)
    else:
        resp = make_response(json.dumps({"code": 1, 'msg': 'trace_id not matched!'}), 400)
        return resp


@app.route('/', methods=['GET'])
def show_map():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(port=2333, debug=True)
