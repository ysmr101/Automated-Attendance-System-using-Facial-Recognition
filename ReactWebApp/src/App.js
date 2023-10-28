import Register from "./containers/Register";
import Login from "./containers/Login";
import Student from "./containers/Student";
import Faculty from "./containers/Faculty";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "./containers/Layout";
import RequireAuth from "./context/RequireAuth";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import PersistLogin from "./context/PersistLogin";
import StudentAttendance from "./components/student/StudentAttendance";
import PasswordResetPage from "./containers/PasswordResetPage";
import Admin from "./containers/Admin";
import CourseSection from "./components/admin/CourseSection";
import SetLectures from "./components/admin/SetLectures";
import SectionStudents from "./components/admin/SectionStudents";
import FacultySectionPage from "./components/faculty/FacultySectionPage";
import FacultyLectureAttendance from "./components/faculty/FacultyLectureAttendance";
import ManageFaculty from "./components/admin/ManageFaculty";
import FDA from "./components/faculty/FDA";

const ROLES = {
  student: "student",
  faculty: "faculty",
  admin: "admin",
};

const App = () => {
  const { auth } = useAuth();
  return (
    <main className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              auth?.userId ? (
                <Navigate to={"/" + auth.role} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* public routes */}
          <Route
            path="login"
            element={
              auth?.accessToken ? <Navigate to={"/" + auth.role} /> : <Login />
            }
          />
          <Route path="register" element={<Register />} />
          <Route path="passwordResetPage" element={<PasswordResetPage />} />

          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
              <Route path="admin" element={<Admin />} />
              <Route path="/section" element={<CourseSection />} />
              <Route path="/FDA" element={<FDA />} />
              <Route path="/SetLectures" element={<SetLectures />} />
              <Route path="/ManageStudent" element={<SectionStudents />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.admin, ROLES.faculty]} />}>
              <Route
                path="/LectureAttendance"
                element={<FacultyLectureAttendance />}
              />
              <Route path="/ManageFaculty" element={<ManageFaculty />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={[ROLES.faculty]} />}>
              <Route path="faculty" element={<Faculty />} />
              <Route path="/SectionPage" element={<FacultySectionPage />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.student]} />}>
              <Route path="student" element={<Student />} />
              <Route path="/attendance" element={<StudentAttendance />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </main>
  );
};

export default App;
