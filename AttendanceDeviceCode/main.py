import json
import schedule
import time
import threading
from datetime import datetime
from faceRecognition.FaceRecognition import FaceRecognition
from dotenv import load_dotenv
from auth_helper import login, refresh_access_token, session
from api import apiUrl


class App:

    def __init__(self):
        self.face_recognition_thread = None
        self.session = session
        self.current_lecture_ref_code = ''
        self.current_lecture_date = ''
        self.current_lecture_start_time = ''
        self.current_lecture_end_time = ''
        self.current_lecture_late_time = ''
        self.current_lecture_absent_time = ''

    #----------------------------------------------------
    def get_current_class(self):
        
        if self.face_recognition_thread is not None:
            return

        url = str(apiUrl)+'/api/getCurrentClass'
        current_time = datetime.now().strftime('%H:%M:%S')
        current_date = datetime.now().strftime('%Y-%m-%d')
        payload = {'currentTime': current_time, 'currentDate': current_date}

        c = 0
        while c < 2:
            response = self.session.post(url, json=payload)
            if response.status_code == 200:
                class_data = response.json()
                c += 2
                if class_data['currentClass']:
                    self.current_lecture_ref_code = class_data['lecture']['refCode']
                    self.current_lecture_start_time = class_data['lecture']['startTime']
                    self.current_lecture_end_time = class_data['lecture']['endTime']
                    self.current_lecture_date = class_data['lecture']['date']
                    self.current_lecture_late_time = class_data['lecture']['late']
                    self.current_lecture_absent_time = class_data['lecture']['absent']
                
                    schedule.clear('face_recognition')
                    schedule.every().day.at(self.current_lecture_end_time).do(self.stop_face_recognition).tag('face_recognition')

                    self.start_face_recognition()
                    print("Scheduled face recognition tasks.")

                else:
                    print('No class')
            elif response.status_code == 403:
                refresh_access_token()
                c += 1
            else:
                c += 1
                print(f'Failed to get current class. Status Code: {response.status_code}')

    #----------------------------------------------------
    
    def stop_face_recognition(self):
        try:
            print('stop')
            if self.face_recognition_thread:
                self.current_lecture_start_time = ''
                self.current_lecture_end_time = ''
                self.current_lecture_date = ''
                self.face_recognition_thread.should_run_flag = False
                self.face_recognition_thread.stop_recognition()
                self.face_recognition_thread = None
        except Exception as e:
            print(f"An error occurred while stopping face recognition: {e}")
    #----------------------------------------------------
    def start_face_recognition(self):
        try:
            print('start')
            threading.Thread(target=self.run_face_recognition).start()
        except Exception as e:
            print(f"An error occurred while starting face recognition: {e}")

    #----------------------------------------------------
    def run_face_recognition(self):
        try:
            if self.face_recognition_thread is not None:
                return 

            self.face_recognition_thread = FaceRecognition(self.current_lecture_ref_code, self.current_lecture_date, self.current_lecture_start_time, self.current_lecture_late_time, self.current_lecture_absent_time, self.session)
            self.face_recognition_thread.run_recognition()
        except Exception as e:
            print(f"An error occurred while starting face recognition: {e}")
            

#----------------------------------------------------

MAX_LOGIN_ATTEMPTS = 5
DELAY_BETWEEN_ATTEMPTS = 20

if __name__ == "__main__":
    app_instance = App()
    login_success = False
    attempt = 0

    
    while attempt < MAX_LOGIN_ATTEMPTS and not login_success:
        try:
            if login():
                login_success = True
                print("Logged in successfully.")
                schedule.every(0.3).minutes.do(app_instance.get_current_class)
                print("Scheduled Lectures.")
            else:
                attempt += 1
                print(f"Failed to login. Attempt {attempt} of {MAX_LOGIN_ATTEMPTS}")
                if attempt < MAX_LOGIN_ATTEMPTS:
                    print(f"Retrying in {DELAY_BETWEEN_ATTEMPTS} seconds...")
                    time.sleep(DELAY_BETWEEN_ATTEMPTS)  
        except Exception as e:
            attempt += 1
            print(f'An error occurred during login: {e}')
            if attempt < MAX_LOGIN_ATTEMPTS:
                print(f"Retrying in {DELAY_BETWEEN_ATTEMPTS} seconds...")
                time.sleep(DELAY_BETWEEN_ATTEMPTS)  

    
    if not login_success:
        print("Failed to login, exiting.")
        exit()

   
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            print(f'An error occurred while running scheduled tasks: {e}')