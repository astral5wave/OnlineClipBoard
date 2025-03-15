import { useState } from "react";
import axios from "axios";
import { FaRegClipboard } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
function App() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [responseKey, setResponseKey] = useState("");
  const [error, setError] = useState("");
  const [retrievedValue, setRetrievedValue] = useState("");

  const copyToClipboard = async () => {
    try {
       await navigator.clipboard.writeText(retrievedValue);
       toast.success("Copied to clipboard!");
    } catch (err) {
       toast.error("Failed to copy.");
    }
 };
 
  const saveData = async () => {
    if(value.trim() === ""){
      setError("Text cannot be empty");
      setValue("");
      return;
    }
    try {
      const combinedPromise = new Promise(async (resolve, reject) => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save`, { value });
          if (response && response.data && response.data.key) {
            resolve(response.data.key);
          }else{
            throw new Error("Failed to save data");
          }
        }catch(error){
          reject(error);
        } 
      })

      const key = await toast.promise(combinedPromise, {
        pending: "Saving...",
        success: "Saved successfully",
        error: "Failed to save",
      });
      setResponseKey(key);
      setError("")

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        setResponseKey("");
      }
      console.log("Error while saving data:", err);
    }
  };


  const getData = async () => {
    if(key.trim() === ""){
      setError("Key cannot be empty, Please enter a key");
      setKey("");
      return;
    }
    try {
      const combinedPromise = new Promise(async (resolve, reject) => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get/${key}`);
          if (response && response.data && response.data.data) {
            resolve(response.data.data);
          }else{
            throw new Error("Failed to retrieve data");
          }
        }catch(error){
          reject(error);
        } 
      })

      const data = await toast.promise(combinedPromise, {
        pending: "Retrieving...",
        success: "Retrieved successfully",
        error: "Failed to retrieve",
      });
      setRetrievedValue(data);
      setError("");
      setResponseKey("");

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      }
      console.log("Error while retrieving data:", err);
    }
  };

  return (
    <div className="flex items-center min-h-screen flex-col relative">
      <h2 className="text-3xl text-slate-700 my-4 font-bold">Online Clipboard</h2>
      <textarea name="myText" placeholder="Enter your text" value={value} onChange={(e) => setValue(e.target.value)}
        className="outline-none border text-slate-600 w-[80%] min-h-[200px] border-slate-300 text-sm overflow-y-auto px-2 py-1 rounded-md text-wrap resize-none shadow-md shadow-slate-200/20" ></textarea>
      {
        error && (
          <p className="text-red-500 text-sm">
            *{error}
          </p>
        )
      }
      {
        responseKey && (
          <p className="text-black text-lg">
            Your key: {responseKey}
          </p>
        )
      }

      <button onClick={saveData} className="text-xl text-white my-5 bg-blue-500 py-1 px-10 flex items-center rounded-md justify-center w-[10%] shadow-md shadow-blue-200/50  hover:bg-blue-600 hover:cursor-pointer hover:text-slate-50">Send</button>

      <input placeholder="Key to retrieve" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={({key}) => {
        if(key === "Enter") getData();
      }
    }
        className="outline-none border shadow-md shadow-slate-200/20 text-slate-600 w-[30%] min-h-[40px] border-slate-300 text-sm px-2 py-1 rounded-md"
      />
      <button onClick={getData}
        className="text-xl text-white my-5 bg-blue-500 py-1 px-10 flex items-center rounded-md justify-center w-[10%] shadow-md shadow-blue-200/50  hover:bg-blue-600 hover:cursor-pointer hover:text-slate-50"
      >Retrieve</button>
      {
        retrievedValue && (
          <div className="flex flex-col relative border w-[80%] h-[200px] border-slate-200/50 shadow-slate-200/50 shadow-md rounded-md bg-slate-50/50 p-2">
            <button onClick={copyToClipboard}>
              <FaRegClipboard className="h-12 w-12 p-2 rounded-lg hover:text-blue-600 hover:cursor-pointer hover:bg-white shadow shadow-slate-400 text-white bg-blue-500 absolute top-1 right-1 " />
            </button>
            <textarea name="myText" value={retrievedValue}
              className=" text-slate-600 outline-none scrollbar text-sm h-full pr-10 w-full text-wrap resize-none" ></textarea>
          </div>
        )
      }
      <ToastContainer />
    </div>
  );
}

export default App;
