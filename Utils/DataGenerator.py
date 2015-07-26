import random

__author__ = 'Jayvee'


def addGaussNoise(gps_point, sigma):
    new_lat = random.gauss(gps_point['lat'], sigma)
    new_lng = random.gauss(gps_point['lng'], sigma)
    gps_point['lat'] = new_lat
    gps_point['lng'] = new_lng
    return gps_point


def generate_feature(geo_point, crf_prob_map):
    '''
    generate more feature by prob map
    :param geo_point:
    :param crf_prob_map:
    :return:
    '''
    rank_rates = {'0': 31, '1': 18, '2': 10, '3': 6, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1}
    context = geo_point['context']
    # time = random_choice_dict(crf_prob_map[context]['time'])
    # day = random_choice_dict(crf_prob_map[context]['day'])
    speed = random_choice_dict(crf_prob_map[context]['speed'])
    motion = random_choice_dict(crf_prob_map[context]['motion'])
    sound = random_choice_dict(crf_prob_map[context]['sound'])
    # location
    location_dict = {}
    poi_len = len(geo_point['poi_types'])
    if poi_len > 9:
        poi_len = 9
    for i in range(poi_len):
        location_type = geo_point['poi_types'][i]['mapping_type']
        if location_type in location_dict:
            if location_type=='unknown':
                location_dict[location_type] += rank_rates[str(i)]*0.5
            else:
                location_dict[location_type] += rank_rates[str(i)]
        else:
            if location_type == 'unknown':
                location_dict[location_type] = rank_rates[str(i)]*0.5
            else:
                location_dict[location_type] = rank_rates[str(i)]
    location = 'unknown'
    max_rate = 0
    for key in location_dict.keys():
        if location_dict[key] > max_rate:
            location = key
            max_rate = location_dict[key]
    # output result
    # geo_point['time'] = time
    # geo_point['day'] = day
    geo_point['motion'] = motion
    geo_point['speed'] = speed
    geo_point['sound'] = sound
    geo_point['location'] = location
    return geo_point


def random_choice_dict(prob_dict):
    '''
    random pick item in prob dict
    :param prob_dict: example:{'label1':0.2,'label2':0.5,'label3':0.3}
    :return:
    '''
    rand_num = random.random()
    for key in prob_dict.keys():
        prob = prob_dict[key]
        rand_num -= prob
        if rand_num < 0:
            return key
