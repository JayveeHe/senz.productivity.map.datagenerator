import json
import os

__author__ = 'Jayvee'
f_path = os.path.dirname(__file__)
config_json = json.loads(open('%s/conf.json' % f_path, 'r').read())
# redis_config = config_json['redis']
filedir = os.path.dirname(__file__)
leancloud_config = config_json['leancloud']
# print token_config
# LOGENTRIES_TOKEN = leancloud_config['LOGENTRIES_TOKEN']
LOG_TAG = leancloud_config['LOG_TAG']
# ROLLBAR_TOKEN = ""
APP_ENV = leancloud_config['APP_ENV']
LEANCLOUD_APP_ID = leancloud_config['LEANCLOUD_APP_ID']
LEANCLOUD_APP_KEY = leancloud_config['LEANCLOUD_APP_KEY']
LEANCLOUD_APP_MASTER_KEY = leancloud_config['LEANCLOUD_APP_MASTER_KEY']
APP_PORT = leancloud_config['APP_PORT']
# BUGSNAG_KEY = leancloud_config['BUGSNAG_KEY']
