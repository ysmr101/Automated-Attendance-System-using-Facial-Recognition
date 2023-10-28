import face_recognition
import cv2
import json
import sys
import traceback
from PIL import Image, ExifTags

def correct_image_orientation(img_path):
    image = Image.open(img_path)
    for orientation in ExifTags.TAGS.keys():
        if ExifTags.TAGS[orientation] == 'Orientation':
            break
    exif = image._getexif()
    if exif is not None and orientation in exif:
        if exif[orientation] == 2:
            image = image.transpose(Image.FLIP_LEFT_RIGHT)
        elif exif[orientation] == 3:
            image = image.rotate(180)
        elif exif[orientation] == 4:
            image = image.rotate(180).transpose(Image.FLIP_LEFT_RIGHT)
        elif exif[orientation] == 5:
            image = image.rotate(-90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
        elif exif[orientation] == 6:
            image = image.rotate(-90, expand=True)
        elif exif[orientation] == 7:
            image = image.rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
        elif exif[orientation] == 8:
            image = image.rotate(90, expand=True)
    image.save(img_path, 'JPEG')

def encode_face(image_path):
    try:
        correct_image_orientation('src/StudentsPic/' + str(image_path))
        
        image = face_recognition.load_image_file('src/StudentsPic/' + str(image_path))
        
        sframe = cv2.imread('src/StudentsPic/' + str(image_path))
        
        face_locations = face_recognition.face_locations(sframe, model="hog")
        
        if len(face_locations) == 0:
            print(json.dumps([]))  # No faces found, return empty array
            return

        face_encodings = face_recognition.face_encodings(sframe, face_locations)
        
        top, right, bottom, left = face_locations[0]
        
        face_height = bottom - top
        face_width = right - left

        center_x, center_y = (right + left) // 2, (top + bottom) // 2

        padding = int(max(face_height, face_width) * 2)  

        additional_top_padding = int(face_height * 0.4)  

        new_top = max(center_y - (padding // 2) - additional_top_padding, 0)
        new_bottom = min(center_y + (padding // 2), sframe.shape[0])
        new_left = max(center_x - (padding // 2), 0)
        new_right = min(center_x + (padding // 2), sframe.shape[1])

        cropped_img = sframe[new_top:new_bottom, new_left:new_right]
        cv2.imwrite('src/StudentsPic/' + str(image_path), cropped_img)

        if len(face_encodings) > 0:
            print(json.dumps(face_encodings[0].tolist()))
        else:
            print(json.dumps([]))  # No faces found, return empty array

    except Exception as e:
        traceback.print_exc()

if __name__ == '__main__':
    encode_face(sys.argv[1])
