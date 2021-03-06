import React, {useContext, useState} from "react";
import firebase from "../firebase";
import { Redirect } from "react-router-dom";
import { UserContext } from "./context/user1Context";
import { allServices1 } from "./context/allServices";
import TimePicker from 'react-time-picker';
import axios from "axios";
import Loader from "./global/loader";
import './addServiceProviders.css'



function AddServiceProviders() {

  const [isLoading, setisLoading] = useState(false)
  const [message, setmessage] = useState('Loading...')

  const { user, userLoading, setresults } = useContext(UserContext);

  const [name, setname] = useState('')
  const [phoneNumber, setphoneNumber] = useState('')
  const [photoUrl, setphotoUrl] = useState('')
  const [address, setAddress] = useState('')
  const [longitude, setlongitude] = useState('')
  const [latitude, setlatitude] = useState('')
  const [bio, setbio] = useState('')

  const [selectedService, setselectedService] = useState({})
  const [selectedServiceSubTypesArray, setselectedServiceSubTypesArray] = useState([])
  const [selectedSubType, setselectedSubType] = useState({})
  const [selectedSubTypeIndex, setselectedSubTypeIndex] = useState(0)

  ////days
  const [value1, setvalue1] = useState(false);
  const [value2, setvalue2] = useState(false);
  const [value3, setvalue3] = useState(false);
  const [value4, setvalue4] = useState(false);
  const [value5, setvalue5] = useState(false);
  const [value6, setvalue6] = useState(false);
  const [value7, setvalue7] = useState(false);

  const daysAvailableArray = [
    {
      name: 'sunday',
      value: value1,
      setvalue: setvalue1,
    },
    {
      name: 'monday',
      value: value2,
      setvalue: setvalue2,
    },
    {
      name: 'tuesday',
      value: value3,
      setvalue: setvalue3,
    },
    {
      name: 'wednesday',
      value: value4,
      setvalue: setvalue4,
    },
    {
      name: 'thursday',
      value: value5,
      setvalue: setvalue5,
    },
    {
      name: 'friday',
      value: value6,
      setvalue: setvalue6,
    },
    {
      name: 'saturday',
      value: value7,
      setvalue: setvalue7,
    },
  ];

  

   const [selectedTimeFrom, setselectedTimeFrom] = useState('12:00')
   const [selectedTimeTo, setselectedTimeTo] = useState('12:00')
   const [selectedTimeFrom1, setselectedTimeFrom1] = useState(new Date(2021, 6, 13, 24, 0))
   const [selectedTimeTo1, setselectedTimeTo1] = useState(new Date(2021, 6, 13, 24, 0))

   function toTimestamp(val){
    // let time = 1626739201;
    // console.log(time.toUTCString())
    if(val && val!=='' && val !== null) {
      const hourInt = parseInt(val.substr(0,2))
    const minuteInt = parseInt(val.substr(3,5))
    // console.log(hourInt)
    // console.log(minuteInt)
    // console.log(new Date(2021, 6, 13, hourInt, minuteInt))
    var datum = new Date(Date.UTC(2021,6,20,hourInt,minuteInt,1));
    return new Date(2021, 6, 13, hourInt, minuteInt)
    }
   }

   const [gettingAddress, setgettingAddress] = useState(false)
   function getAddress(addNew1) {
     
     if(latitude !== '' && longitude !== '') {
      if(addNew1) {
        setisLoading(true)
       }
       setmessage('getting address')
      setgettingAddress(true)
      const lat1 = parseFloat(latitude)
      const long1 = parseFloat(longitude)
     //function to get address using current lat and lng
     fetch(
       `https://nominatim.openstreetmap.org/reverse?lat=${lat1}&lon=${long1}&format=json`,
     )
       .then(response => response.json())
       .then(responseJson => {
         setgettingAddress(false)
 
         console.log(responseJson.display_name);
         setAddress(responseJson.display_name);
         if(addNew1) {
           addNew1(responseJson.display_name)
         }
        
       })
       .catch(err => {
         console.log(err)
         alert(err)
         setgettingAddress(false)
         setisLoading(false)

       });
     } else {
       alert('Enter latitude and longitude')
     }
  }

   function addNew(address1) {
    setisLoading(true)
    setmessage('adding to database')

    var daysAvailable1 = daysAvailableArray.filter(function (el) {
      return el.value === true;
    });
    const daysAvailableNames = () => {
      if(daysAvailable1.length < 1) {
        return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      } else {
        return daysAvailable1.map(val => {
          return val.name;
        })
      }
    }

     let updateObj= {
       name,
       phoneNumber,
       bio,
       contactInfo: {
         whatsapp: phoneNumber
       },
       photoUrl,
       address: address1,
       isDummy: true,
       addedBy: user.id,
       loc: {
         type: "Point",
         coordinates: [longitude, latitude]
       },
       servicesDetails: [{
        serviceName: selectedService.name,
        serviceId: selectedService.id,
        subTypeName: selectedSubType.name,
        subTypeId: selectedSubType.id,
        isActive: true,
        daysAvailable: daysAvailableNames(),
        preferredTime: {
          from: selectedTimeFrom1,
          to: selectedTimeTo1
        }
       }]
     }

    
     
     console.log(updateObj)

     axios.post(`https://bownapp.com/api/service-providers/`, updateObj)
     .then(res => {
      console.log(res.data.dummyServiceProvider._id)
      if(image) {
        uploadToFirebase(res.data.dummyServiceProvider._id)
      
      } else {
        setisLoading(false)
        alert('Service provider added')
        resetInputs()
      }
      setresults(prev => [...prev, res.data.dummyServiceProvider])
    })
     .catch(err => {
       alert(err)
       setisLoading(false)
     })
   }

   const [image, setImage] = useState(null);

   const extension = () => {
    if(image.name.includes('.png')) {
      return '.png'
    } else if (image.name.includes('.jpg')) {
      return '.jpg'
    } else if (image.name.includes('.jpeg')) {
      return '.jpg'
    }
  }
   
   const onImageChange = (e) => {
    const reader = new FileReader();
    let file = e.target.files[0]; // get the supplied file
    // if there is a file, set image to that file
    if (file) {
      reader.onload = () => {
        if (reader.readyState === 2) {
          console.log(file);
          setImage(file);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    // if there is no file, set image back to null
    } else {
      setImage(null);
    }
  };

  const uploadToFirebase = (newId) => {
    //1.
    setmessage('uploading profile image to database...')
    if (image && newId) {
      //2.
      const storageRef = firebase.storage().ref();
      //3.
      const fileRef = `profilePics/${newId}${extension()}`;

      const imageRef = storageRef.child(fileRef);
      //4.
      imageRef.put(image)
     //5.
     .then(() => {
        setmessage('updating database...')
        axios.patch(`https://bownapp.com/api/service-providers/${newId}`,{photoUrl: `profilePics/${newId}${extension()}`})
      .then(res1 => {
        console.log(res1)
        setisLoading(false)
        alert('New service provider added')
        resetInputs()
      })
      .catch(err1 => {
        setisLoading(false)
        alert(err1)
      })
    })
    .catch(err => alert(err))
    } else {
      alert("Please upload an image first.");
    }
  };

  function resetInputs() {
    setImage(null)
    setname('')
    setphotoUrl('')
    setphoneNumber('')
    setAddress('')
    setlongitude('')
    setlatitude('')
    setbio('')
    setselectedService({})
    setselectedSubType({})
    setselectedSubTypeIndex(-1)
    setvalue1(false)
    setvalue2(false)
    setvalue3(false)
    setvalue4(false)
    setvalue5(false)
    setvalue6(false)
    setvalue6(false)
    setselectedTimeFrom('12:00')
    setselectedTimeTo('12:00')
    setselectedTimeFrom1('12:00')
    setselectedTimeTo1('12:00')
  }

  if (user && !user.loggedIn) return <Redirect to="/admin" />;

  if (true) {
    return (
      <div className="footerDiv">
        <div className="footerContain2 wahniColor">
          <div className="body">
          
        <div className="cardOne flexCenter cardOneAdd fontMontserrat">
       
      {!isLoading ? 
      <>
          <div className='singleDataEntry'>
        Click Below
      <label class="custom-file-upload">
      <input type="file" accept="image/x-png,image/jpeg" onChange={(e) => {onImageChange(e); }}/>
    <i class="fa fa-cloud-upload"></i> 
    {
      image ? image.name : 'Select Image'
    }
</label>
</div>
        
        {/* <button onClick={() => uploadToFirebase('1111')}>Upload to Firebase</button> */}
        <div className='singleDataEntry selectCustom'>
          
          <div class="select">
    <select id="standard-select"
              // value={selectedService.name} 
          // defaultValue={5}
          onChange={(e) => {
            if(e.target.value>-1) {
              let selected1 = {
                name: allServices1[e.target.value].name,
                id: allServices1[e.target.value].serviceId,
              }
              setselectedService(selected1)
              setselectedServiceSubTypesArray(allServices1[e.target.value].subTypes)
              console.log(allServices1[e.target.value].subTypes)
              console.log(selected1)
              setselectedSubType({})
              setselectedSubTypeIndex(-1)
            }
          }} 
        >
          <option value={-1}>Select a Service</option>
         {
           allServices1.map((obj, idx) => {
            return <option value={idx}>{obj.name}</option>
           })
         }
        </select>
        </div>
        </div>
        <div className='singleDataEntry selectCustom'>
  
        <div class="select">
    <select id="standard-select"
          
          value={selectedSubTypeIndex}
          onChange={(e) => {
            if(e.target.value > -1) {
              let selected1 = {
                name: selectedServiceSubTypesArray[e.target.value].name,
                id: selectedServiceSubTypesArray[e.target.value].subTypeId,
              }
              setselectedSubType(selected1)
              setselectedSubTypeIndex(e.target.value)
              // setselectedServiceSubTypesArray(allServices1[e.target.value].subTypes)
              // console.log(allServices1[e.target.value].subTypes)
              console.log(selected1)
            }
          }} 
        >
                  <option value={-1}>Select subTypeId</option>
         {
           selectedServiceSubTypesArray.map((obj, idx) => {
            return <option value={idx}>{obj.name}</option>
           })
         }
        </select>
        </div>
        </div>
        <div className='singleDataEntry'>
        <p>display name</p>
        <input
          type="text"
          value={name}
          onChange={e => setname(e.target.value)}
          className='fontMontserrat textInputStyleOne'
        />
        </div>
        
        <div className='singleDataEntry'>
        <p>phone number</p>
        <input
          type="text"
          value={phoneNumber}
          onChange={e => setphoneNumber(e.target.value)}
          className='fontMontserrat textInputStyleOne'

        />
        </div>

        <div className='latNlong'>
        <div className='singleDataEntry'>
        <p>latitude</p>
        <input
          type="text"
          value={latitude}
          onChange={e => setlatitude(e.target.value)}
          className='fontMontserrat textInputStyleOne'

        />
        </div>
        <div className='singleDataEntry'>
        <p>longitude</p>
        <input
          type="text"
          value={longitude}
          onChange={e => setlongitude(e.target.value)}
          className='fontMontserrat textInputStyleOne'

        />
        </div>
        </div>
        <div className='singleDataEntry'>
          <p>address</p>
        <div className='addressArea flexCenter'>
        {
          gettingAddress ? 
          <Loader width={30} borderWidth={3} />
          :
          <p>{address}</p>
        }
        </div>
        <button onClick={() => getAddress()}>Get address</button>
        </div>
        <div className='singleDataEntry'>
        <p>Enter bio</p>
        <textarea
          type="text"
          value={bio}
          onChange={e => setbio(e.target.value)}
          className='fontMontserrat textInputStyleOne'
          style={{height: 80, flexWrap: 'wrap'}}
        />
        </div>
        
      <div className='singleDataEntry'>

      <div className="daysDiv">
      
      {
        daysAvailableArray.map((obj, idx) => {
          return  <div style={{marginLeft:5, marginRight: 5, marginTop:5}} className='flexCenter'>
          <input type="checkbox" id="saturday" name={obj.name} checked={obj.value} onChange={(e) => {obj.setvalue(prev => !prev)}}/>{obj.name}
          </div>
        })
      }
  </div>
  </div>
  <div className='singleDataEntry'>
      <div>FROM</div>
  <TimePicker
        onChange={(val) => {
          setselectedTimeFrom(val)
          // console.log(val.substr(0,2))
          // console.log(val.substr(3,5))
          setselectedTimeFrom1(toTimestamp(val))
        }}
        value={selectedTimeFrom}
      />
      <div>TO</div>
      <TimePicker
        onChange={(val) => {
          setselectedTimeTo(val)
          // console.log(val.substr(0,2))
          // console.log(val.substr(3,5))
          console.log(selectedTimeTo1)
          setselectedTimeTo1(toTimestamp(val))
        }}
        value={selectedTimeTo}
      />
      </div>
      <div onClick={() => getAddress(addNew)} className='buttonTwo flexCenter buttonAdd'>ADD</div>
      </>
        :
        <>
        <Loader width={10} borderWidth={2} />
      <div>{message}</div>
        </>
      }
      
        </div>
        </div>
        </div>
      </div>
    );
  }
}

export default AddServiceProviders;
