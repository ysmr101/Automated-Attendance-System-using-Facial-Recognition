import os
import requests
from dotenv import load_dotenv
from api import apiUrl
load_dotenv()
session = requests.Session()

def login():
    global session
    try:
        login_url = str(apiUrl)+'/login/Device'
        payload = {
            'DeviceId': os.getenv('DEVICE_ID'),
            'password': os.getenv('PASSWORD')
        }

        login_response = session.post(login_url, json=payload)

        if login_response.status_code == 200:
            json_response = login_response.json()
            access_token = json_response.get('accessToken', '')
            os.environ['REFRESH_TOKEN'] = login_response.cookies.get('jwt')
            session.headers.update({'Authorization': f'Bearer {access_token}'})
            return True
        else:
            print(f'Failed to login. Status Code: {login_response.status_code}')
            return False
    except Exception as e:
        print(f'An error occurred during login: {e}')
        return False


def refresh_access_token():
    global session
    try:
        refresh_url = str(apiUrl)+'/refresh/Device'
        refresh_response = session.get(refresh_url, cookies={'jwt': os.getenv('REFRESH_TOKEN')})

        if refresh_response.status_code == 200:
            json_response = refresh_response.json()
            new_access_token = json_response.get('accessToken', '')
            session.headers.update({'Authorization': f'Bearer {new_access_token}'})
        else:
            print(f'Failed to refresh the token. Status code: {refresh_response.status_code}')
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while trying to refresh the token: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
