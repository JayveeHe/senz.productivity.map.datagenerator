import json
import requests
import time

__author__ = 'Jayvee'


def get_poi(lng, lat):
    # req_json = {
    #     "locations": [{"timestamp": int(time.time() * 1000),
    #                    "location":
    #                        {"latitude": lat,
    #                         "longtitude": lng,
    #                         "__type": "GeoPoint"}}],
    #     "userId": "5593ef24e4b0001a928fa39a"
    # }
    req_text = '''{
    "locations":[
                    {
                        "timestamp": %s,
                        "location": {
                            "latitude": %s,
                            "__type": "GeoPoint",
                            "longitude": %s
                        }
                    }],
    "userId": "5593ef24e4b0001a928fa39a"

    }''' % (int(time.time() * 1000), lat, lng)

    poi_resp = requests.post('http://senz-parserhub.avosapps.com/pois', data=req_text)
    poiresult = poi_resp.json()
    return json.dumps(poiresult, ensure_ascii=False)


def get_poi_by_point(geo_point):
    lng = geo_point['lng']
    lat = geo_point['lat']
    poi_obj = json.loads(get_poi(lng, lat))
    try:
        pois = poi_obj['results']['parse_poi'][0]['pois']
        if len(pois) == 0:
            geo_point['poi_types'] = [{'mapping_type': 'unknown', 'title': 'null'}]
            return geo_point
        poi_types = []
        pois.sort(lambda x, y: cmp(x['_distance'], y['_distance']))
        for poi in pois:
            poi_types.append({'mapping_type': poi['type']['mapping_type'], 'title': poi['title']})
            geo_point['poi_types'] = poi_types
    except KeyError, ke:
        geo_point['poi_types'] = [{'mapping_type': 'unknown', 'title': 'null'}]
    return geo_point


if __name__ == '__main__':
    print get_poi(116.339054, 39.964789)
