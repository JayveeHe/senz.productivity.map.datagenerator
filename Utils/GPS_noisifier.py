import random

__author__ = 'Jayvee'


def addGaussNoise(gps_point, sigma):
    new_lat = random.gauss(gps_point['lat'], sigma)
    new_lng = random.gauss(gps_point['lng'], sigma)
    return {'lat': new_lat, 'lng': new_lng, 'index': gps_point['index'], 'context': gps_point['context']}
