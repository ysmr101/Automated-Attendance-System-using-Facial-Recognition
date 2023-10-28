# from test import test
import face_recognition
import sys
import cv2
import numpy as np
import math
import easygui
from PyQt5.QtWidgets import QApplication, QLabel, QWidget, QHBoxLayout
from PyQt5.QtCore import QTimer, Qt
from PyQt5.QtGui import QFont, QPixmap, QColor
from auth_helper import refresh_access_token
import requests
from datetime import datetime
from api import apiUrl
from faceRecognition.testFake import test


#--------------------------------------------------------------------------------------------------------
class FaceRecognition:
    
    def __init__(self,  ref_code, date, startTime, late, absent, session):
        self.ref_code = ref_code
        self.date = date
        self.startTime = startTime
        self.late = late
        self.absent = absent
        self.should_run_flag = True
        self.session = session
        self.Attendance_list = set()
        self.face_locations = []
        self.face_encodings = []
        self.face_names = []
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_SID =[]
        self.process_current_frame = True
        self.unattended_students = []
        
    #----------------------------------------------------
    def get_students_encodings(self):
        try:
           
            url = str(apiUrl) + '/api/getStudentEncodings'
            payload = {'refCode': self.ref_code}
            
            c = 0
            while c < 4:
                response = self.session.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    self.known_face_encodings = data['known_face_encodings']
                    self.known_face_names = data['known_face_names']
                    self.known_face_SID = data['known_face_SID']
                    return True
                elif response.status_code == 403:
                    print('Access token expired. Refreshing...')
                    refresh_access_token()
                    c += 1
                else:
                    c += 1
                    print(f'Failed to get Student encodings. Status Code: {response.status_code}')
            return False
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while trying to get Student encodings: {e}")
            
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return False


    #----------------------------------------------------
    # Helper
    def saveStudentEncodings(self):
       
        try:
            url = str(apiUrl)+'/api/saveStudentEncodings'
            
            payload = {'known_face_encodings': self.known_face_encodings, 'known_face_names': self.known_face_names, 'known_face_SID': self.known_face_SID}
            
            c = 0
            while c < 4:
                response = self.session.post(url, json=payload)
                if response.status_code == 200:
                    print('loaded')
                    c += 4
                    break
                elif response.status_code == 403:
                    print('Access token expired. Refreshing...')
                    refresh_access_token()
                    c += 1
                
                else:
                    c += 1
                    print(f'Failed to get save student encodings. Status Code: {response.status_code}')
        except requests.exceptions.RequestException as e:
            print(f"An error occurred while trying to save student encodings: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    #----------------------------------------------------
    # Helper
    def face_confidence(self, face_distance, face_match_threshold=0.6):

        range = (1.0 - face_match_threshold)
        linear_val = (1.0 - face_distance) / (range * 2.0)

        if face_distance > face_match_threshold:
            return round(linear_val * 100, 2) 
        else:
            value = (linear_val + ((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
            return round(value, 2) 
    

    #----------------------------------------------------
    def read_from_list_and_attend(self):
        new_unattended_students = []  
        
        for student in self.unattended_students:
            payload = student  
            
            if str(payload['sid']) not in self.Attendance_list:
            
                try:
                    url = str(apiUrl)+'/api/AttendStudent'
                    
                    c = 0
                    while c < 4:
                        response = self.session.post(url, json=payload)
                        if response.status_code == 200:
                            self.Attendance_list.add(str(payload['sid']))
                            c += 4
                            break
                        elif response.status_code == 403:
                            print('Access token expired. Refreshing...')
                            refresh_access_token()
                            c += 1
                        
                        else:
                            c += 1
                            print(f'Failed to Attend student. Status Code: {response.status_code}')
                except requests.exceptions.RequestException as e:
                    print(f"An error occurred while trying to Attend student: {e}")
                except Exception as e:
                    print(f"An unexpected error occurred: {e}")
            
        self.unattended_students = new_unattended_students  

    #----------------------------------------------------
    def save_to_list(self, data):
        self.unattended_students.append(data) 

    #----------------------------------------------------
    def Attend_students(self, name, sid):
        if str(sid) not in self.Attendance_list:

            current_time = datetime.now().strftime('%H:%M:%S')
            start_time = datetime.strptime(self.startTime, '%H:%M:%S').time()
            current_time_obj = datetime.strptime(current_time, '%H:%M:%S').time()

            # Calculating the difference in minutes
            time_diff = datetime.combine(datetime.today(), current_time_obj) - datetime.combine(datetime.today(), start_time)
            time_diff_in_minutes = time_diff.total_seconds() // 60

            
            default_late_time = 45
            default_absent_time = 50  

           
            try:
                late_time_int = int(self.late) if self.late else default_late_time
                absent_time_int = int(self.absent) if self.absent else default_absent_time
            except ValueError:
                print("Invalid values for late or absent time. Using default values.")
                late_time_int = default_late_time
                absent_time_int = default_absent_time

            # Check if the student is late or absent
            status = 'Present'
            if time_diff_in_minutes >= absent_time_int:
                status = 'Absent'
            elif time_diff_in_minutes >= late_time_int:
                status = 'Late'


            payload = {
                'time': current_time,
                'status': status,
                'sid': sid,
                'date': self.date,
                'refCode': self.ref_code,
                'startTime': self.startTime
            }

            try:
                url = str(apiUrl) + '/api/AttendStudent'
                c = 0
                while c < 4:
                    response = self.session.post(url, json=payload)
                    if response.status_code == 200:
                        self.show_confirmation(name, status)
                        self.Attendance_list.add(str(sid))
                        self.read_from_list_and_attend()
                        c += 4
                        break
                    elif response.status_code == 403:
                        print('Access token expired. Refreshing...')
                        refresh_access_token()
                        c += 1
                    else:
                        c += 1
                        self.save_to_list(payload)
                        print(f'Failed to Attend student. Status Code: {response.status_code}')
            except requests.exceptions.RequestException as e:
                self.save_to_list(payload)
                print(f"An error occurred while trying to Attend student: {e}")
            except Exception as e:
                self.save_to_list(payload)
                print(f"An unexpected error occurred: {e}")


    #----------------------------------------------------
    def show_confirmation(self, name, status):
        app = QApplication([])

        widget = QWidget()
        layout = QHBoxLayout()
        widget.setLayout(layout)

        label = QLabel(name)
        label.setFont(QFont('Arial', 16))
        label.setAlignment(Qt.AlignCenter)
        label.setStyleSheet("""
        color: #4a8df8;
        padding: 15px;
        font-size: 60px;
        """)

        status_colors = {
            "Present": QColor(0 ,255, 0),
            "Late": QColor(255, 165, 0),
            "Absent": QColor(255, 0, 0)
        }

        marked_icon = QLabel()
        pixmap = QPixmap(100, 100)  # Create a blank 100x100 pixmap
        pixmap.fill(status_colors.get(status, QColor(Qt.white)))  # Fill with the color based on status
        marked_icon.setPixmap(pixmap)

        layout.addWidget(label)
        layout.addWidget(marked_icon)

        widget.adjustSize()
        widget.move(app.desktop().screen().rect().center() - widget.rect().center())

        widget.show()

       
        QTimer.singleShot(1500, app.quit)

        app.exec_()

    
    #----------------------------------------------------
    def stop_recognition(self):
        self.read_from_list_and_attend()
        self.saveStudentEncodings()
        self.Attendance_list = set()
        self.should_run_flag = False

    #----------------------------------------------------
    def save_recognized_encoding(self, name, sid, encoding):
        max_encodings_per_person = 6

        # If the attributes aren't already initialized, do so
        if not hasattr(self, "known_face_encodings"):
            self.known_face_encodings = []
        if not hasattr(self, "known_face_names"):
            self.known_face_names = []
        if not hasattr(self, "known_face_SID"):
            self.known_face_SID = []

        encodings_count = self.known_face_names.count(name)

        # If the max number of encodings for this person has been reached, remove an old one
        if encodings_count >= max_encodings_per_person:
            indices = [i for i, x in enumerate(self.known_face_names) if x == name]
            # If there is more than one encoding, remove the second one
            if len(indices) > 1:
                self.known_face_names.pop(indices[1])
                self.known_face_encodings.pop(indices[1])
                self.known_face_SID.pop(indices[1])

        # Save the new encoding
        self.known_face_names.append(name)
        self.known_face_encodings.append(encoding.tolist())  
        self.known_face_SID.append(sid)


    #----------------------------------------------------        
    def ask_user(self, name):
       
        msg = f"Are you {name}?"
        choices = ["Yes", "No"]
        reply = easygui.buttonbox(msg, choices=choices)
        return reply == "Yes"
        
    
    #----------------------------------------------------
    def run_recognition(self):
        try:
            loaded = self.get_students_encodings()
            if not loaded:
                self.stop_recognition()


            video_capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)

            if not video_capture.isOpened():
                sys.exit('Video source not found...')

            
            while self and self.should_run_flag:


               
                ret, frame = video_capture.read()

                # Only process every other frame of video to save time
                if ret and self.process_current_frame:
            
                    rectangle_color = (0, 0, 255)
                    sframe = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

                    self.face_locations = face_recognition.face_locations(sframe)
                    self.face_encodings = face_recognition.face_encodings(sframe, self.face_locations)

                    self.face_names = []
                    for face_encoding, (top, right, bottom, left) in zip(self.face_encodings, self.face_locations):
                        
                       
                        matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                        name = "Unknown"
                        

                        face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)

                        best_match_index = np.argmin(face_distances)
                        if matches[best_match_index]:
                            confid = self.face_confidence(face_distances[best_match_index])
                            if confid >= 90:

                                
                                if(self.known_face_SID.count(self.known_face_SID[best_match_index]) == 1):
                                     
                                    
                                    #label = self.testWithAntiSpoofing(frame)
                                    label = 1

                                    if label == 1:
                                         user_confirmed = self.ask_user(self.known_face_names[best_match_index])
                                         if user_confirmed:
                                             name = self.known_face_names[best_match_index]
                                             sid = self.known_face_SID[best_match_index]
                                             rectangle_color = (0, 255, 0)
                                             self.Attend_students(name,sid)
                                             self.save_recognized_encoding(name,sid, face_encoding)
                                         else:
                                             print(f"User {self.known_face_names[best_match_index]} denied their identity.")
                                             
                                    else:
                                        name = 'Fake'
                                        
                                elif confid >= 98:
                                    
                                    
                                    #label = self.testWithAntiSpoofing(frame)
                                    label = 1
                                    
                                    if label == 1:
                                        name = self.known_face_names[best_match_index]
                                        sid = self.known_face_SID[best_match_index]
                                        rectangle_color = (0, 255, 0)
                                        self.Attend_students(name,sid)
                                        self.save_recognized_encoding(name,sid, face_encoding)
                                    else:
                                        name = 'Fake'
                                
                        self.face_names.append((f'{name}', (top, right, bottom, left)))
                            
                self.process_current_frame = not self.process_current_frame

                # Display the results
                for name, (top, right, bottom, left) in self.face_names:
                    top *= 4
                    right *= 4
                    bottom *= 4
                    left *= 4

                    
                    
                    
                    cv2.rectangle(frame, (left, top), (right, bottom), rectangle_color, 2)
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), rectangle_color, cv2.FILLED)
                    cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)
                
                # cv2.namedWindow('Face Recognition', cv2.WINDOW_NORMAL)
                # cv2.setWindowProperty('Face Recognition', cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
                # End timing the face recognition process after the loop

                
                if ret:
                    cv2.imshow('Face Recognition', frame)

                if cv2.waitKey(1) == ord('q'):
                    break

            video_capture.release()
            cv2.destroyAllWindows()
            
        except Exception as e:
            print(f"An unexpected error occurred: {e}")



    def testWithAntiSpoofing(self, frame):
        label = test(
            image=frame,
            model_dir=r'faceRecognition\resources\anti_spoof_models',
            device_id=0,
            )
        return label
        