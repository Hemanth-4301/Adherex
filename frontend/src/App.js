import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-bootstrap';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import UserDashBoard from './Components/UserDashBoard';
import ManageMedication from './Components/ManageMedication';
import ConsumedChart from './Components/ConsumedChart';
import ConsumedCount from './Components/ConsumedCount';
import Profile from './Components/Profile';
import MentalSupport from './Components/MentalSupport';




 export const baseUrl = "http://localhost:8080"; 



function App() {
  return (
    <div className="App">
      
        <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/forgotPassword" element={<ForgotPassword />} /> */}


         {/* <Route path="/adminDashboard" element={<AdminDashboard />}>
         <Route index element={<ManageUser />} />
          <Route path="manage-user" element={<ManageUser />} />
          <Route path="generate-bill" element={<GenerateBill />} />
          <Route path="set-rates" element={<SetRates />} />
          <Route path="view-meter" element={<ViewMeter />} />
        </Route> */}



          <Route path="/userDashboard" element={<UserDashBoard />}>
  <Route index element={<ManageMedication />} />  
  <Route path="manageMedication" element={<ManageMedication />} />
  <Route path="consumedChart" element={<ConsumedChart />} />
  <Route path="consumedCount" element={<ConsumedCount />} />
   <Route path="profile" element={<Profile />} />
      <Route path="mentalSupport" element={<MentalSupport />} />
</Route>



        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
